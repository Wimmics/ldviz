/**
 * LinkedDataViz  
 * Node proxy server
 * Receive query from HTML page, send query to SPARQL endpoint, apply transformation,
 *
 * Yun Tian - Olivier Corby - Marco Winckler (2019-2020)
 * Aline Menin - Maroua Tikat (2020-2022)
 * Aline Menin (2023-present)
**/


const fs = require('fs');
const fileUpload = require('express-fileupload');

const express = require('express');
const back = require('express-back');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');
const https = require('https')

//// Data tools ////
const { Users, Data, SPARQLRequest } = require('./servertools');

const users = new Users()
const data = new Data()
const sparql = new SPARQLRequest()

const prefix = '/ldviz'

const app = express()

// Pour accepter les connexions cross-domain (CORS)
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use(express.json({limit: '50mb'}));

//add other middleware
app.use(cors());
app.use(morgan('dev'));

app.use(fileUpload());

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(prefix, express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(session({
    secret: "Your secret key",
    resave: false, // Do not save session if unmodified
    saveUninitialized: true, // Save uninitialized sessions
    cookie: { 
        maxAge: 30 * 60 * 1000, // 30 minutes
        secure: false // Set to true if using HTTPS
    }
}));

app.set('trust proxy', 1); // Trust the first proxy

app.use(back());

////////////// login routes ///////////////////////////

app.get(prefix + '/login', function (req, res) {
    res.render('login');
})

app.post(prefix + '/login', async (req, res) => {
    const { email, password} = req.body
    let user = await users.get(email, password);
    if(user){
        req.session.user = user;
        if (req.query.action && req.query.queryId) { // edit
            res.redirect(prefix + '/editor/' + req.query.action + '?queryId=' + req.query.queryId)
        } else if (req.query.action) { // new query
            res.redirect(prefix + '/editor/' + req.query.action )
        } else if (req.query.origin) 
            res.redirect(prefix + '/' + req.query.origin)
        else res.redirect(prefix + '/')
    }
    else {
        res.render('login', { message: "Incorrect email or password" });
    }  
})

app.get(prefix + '/logout', (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }
   
    res.redirect('/ldviz');  
})

// Assuming you're using Express.js
app.get(prefix + '/is-connected', (req, res) => {
    if (req.session.user)
        res.status(200).send('User is connected')
    else res.status(404).send("User is not connected")
})


/////////// end login routes //////////////////////////


////// Pages /////////

// home page
app.get(prefix + '/', async function (req, res) {

    let endpoints = fs.readFileSync('data/analysis/endpoints.json')
    endpoints = JSON.parse(endpoints)

    let result = fs.readFileSync('data/analysis/results.json')
    result = JSON.parse(result)


    let pagedata = await data.load(req)
    pagedata.endpoints = endpoints
    pagedata.result = result
    pagedata.sessionID = req.session.user ? req.sessionID : null
    
    res.render("about", pagedata)
})

// LDViz about page 
app.get(prefix + '/editor', async function (req, res) {
    //await users.checkConnection(req)
    let pagedata = await data.load(req)
    pagedata.sessionID = req.session.user ? req.sessionID : null
    
    res.render("index", pagedata)
})

app.get(prefix + '/dataviz', async function (req, res) {
    //await users.checkConnection(req)
    let pagedata = await data.load(req)
    pagedata.sessionID = req.session.user ? req.sessionID : null

    res.render("dataviz", pagedata)
})

// generic page which url is set when changing the href of the page
// :page = covid, hal, ldviz
// :action = newQuery, edit, clone
app.get(prefix + '/editor/:action/', async function(req, res){
    const params = req.params;
    const queryId = req.query.queryId;

    let result = await data.load(req)
    result.existingQuery = result.queries.filter(d => d.id == queryId)[0] || {}
    result.action = params.action
    result.sessionID = req.session.user ? req.sessionID : null

    res.render("index", result)
})


/// Display results of a query in SPARQL json format /////
// INFO: not being used anymore
app.get(prefix + '/results/', async function(req, res){

    let existingQuery = req.query.id ? await data.getQuery(req.query.id) : null
    let querydata = existingQuery || req.query

    res.render("results", { queryData: querydata })
})




//////// POST routes //////////////

app.post(prefix + '/upload', (req, res) => {
    
    // Get the file that was set to our field named "image"
    const { image } = req.files;

    // If no image submitted, exit
    if (!image) return res.sendStatus(400);

    // Move the uploaded image to our upload folder
    image.mv(__dirname + '/public/images/dataviz/' + image.name);

    res.sendStatus(200);
});

/**
 * Manages queries or dataviz on disk
 * @param action The action to be performed : "add" new data, "edit" existing data, or "delete" a data record
 * @param file The json file to be modified: queries or dataviz
 */
app.post(prefix + '/:action/:file', async function (req, res) {
   
    console.log(req.params.action, req.params.file)
    let response;
    switch(req.params.action) {
        case 'add':
            response = await data.addToFile(req.body, req.params.file)
            break;
        case 'edit':
            response = await data.update(req.body, req.params.file)
            break;
        case 'delete':
            response = await data.delete(req.body.id, req.params.file)
            break;
    }

    if (response && response.message) {
        res.sendStatus(response.code)
        return;
    }
    res.sendStatus(200);
})

// SPARQL request
app.post(prefix + '/sparql', async function (req, res) { 
    res.send(await sparql.sendRequest(req.body.query, req.body.endpoint))
})


const port = 8040 // verify the availability of this port on the server
const portHTTPS = 8043

app.listen(port, async () => { console.log(`HTTP Server started at port ${port}.`) })

try {
    var privateKey = fs.readFileSync( '/etc/httpd/certificate/exp_20240906/dataviz_i3s_unice_fr.key' );
    var certificate = fs.readFileSync( '/etc/httpd/certificate/exp_20240906/dataviz_i3s_unice_fr_cert.crt' );
    var ca = fs.readFileSync( '/etc/httpd/certificate/exp_20240906/dataviz_i3s_unice_fr_AC.cer' );
    var options = {key: privateKey, cert: certificate, ca: ca};
    https.createServer( options, function(req,res)
    {
        app.handle( req, res );
    } ).listen( portHTTPS, async () => { console.log(`HTTPS Server started at port ${portHTTPS}.`) } );
} catch(e) {
    console.log("Could not start HTTPS server")
}