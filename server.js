/**
 * LinkedDataViz  
 * Node proxy server
 * Receive query from HTML page, send query to SPARQL endpoint, apply transformation,
 *
 * Yun Tian - Olivier Corby - Marco Winckler - 2019-2020
 * Minh nhat Do - Aline Menin - Maroua Tikat - 2020-2022
**/
const port = 8040

const fs = require('fs');
const express = require('express');
const back = require('express-back');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');
const { config } = require('process');

const csv = require('csvtojson');

const servertools = require('./servertools');
const { SPARQLRequest, Users, Cache, Data } = require('./servertools');
const sparql = new SPARQLRequest()
const users = new Users()
const cache = new Cache()
const data = new Data()

const prefix = '/ldviz'

const app = express()

app.use(express.json({limit: '50mb'}));

//add other middleware
app.use(cors());
app.use(morgan('dev'));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cookieParser());
app.use(session({
    secret: "Your secret key",
    resave: true,
    saveUninitialized: true
}));

app.use(back());

// index page 
app.use(prefix + '/mge/', express.static(path.join(__dirname, 'src/mgexplorer')))
app.use(prefix + '/lib/', express.static(path.join(__dirname, 'src/lib')))
app.use(prefix + '/images/', express.static(path.join(__dirname, 'src/images')))
app.use(prefix + '/js/', express.static(path.join(__dirname, 'src/query/js')))
app.use(prefix + '/css/', express.static(path.join(__dirname, 'src/query/css')))
app.use(prefix + '/build/', express.static(path.join(__dirname, 'www/build')));
app.use(prefix + '/assets/', express.static(path.join(__dirname, 'www/assets')));

////////////// login routes ///////////////////////////

app.get(prefix + '/login', function (req, res) {
    res.render('pages/login');
})

app.post(prefix + '/login', async (req, res) => {
    const { email, password} = req.body
    let user = await users.get(email, password);
    if(user){
        req.session.user = user;
        if (req.query.action) {
            res.redirect(prefix + '/query/' + req.query.action + '?queryId=' + req.query.queryId);
        } else res.redirect(prefix + '/query');
    }
    else {
        res.render('pages/login', { message: "Incorrect email or password" });
    }  
})

app.get(prefix + '/logout', (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }
    res.redirect('/ldviz/query');  
})

/////////// end login routes //////////////////////////

app.get(prefix + '/', async function (req, res){
    await users.checkConnection(req)
    let result = await data.load(req)
    res.render("pages/mgexplorer/index", result);
})

app.get(prefix + '/hceres', async function (req, res){
    await users.checkConnection(req)
    let result = await data.load(req)
    result.hceres = true;
    res.render("pages/mgexplorer/index", result);
})

app.get(prefix + "/hceres/filenames", async function(req, res) {
    let filenames = fs.readdirSync("data/hceres/")

    let result = []

    let people = await csv().fromFile("data/hceres/config/SPARKS_ID_HAL.csv")
    people.forEach(p => {
        if (!p.idHal.length) return;

        let files = filenames.filter(f => f.includes(p.idHal))
        
        files.forEach(f => {
            result.push({
                name: `${p.Nom} ${p.Prenom}`,
                idHal: p.idHal,
                orcid: p.ORCID,
                filename: f
            })
        })
    })

    let sparks = filenames.filter(f => f.includes("SPARKS-"))
    sparks.forEach(f => {
        result.push({
            name: "SPARKS",
            idHal: "",
            orcid: "",
            filename: f
        })
    })
       

    res.send(JSON.stringify(result))
})

app.get(prefix + "/hceres/data/:dataset", async function(req, res) {
    let result = {}
    result.data = JSON.parse(fs.readFileSync('data/hceres/' + req.params.dataset))
    result.stylesheet = JSON.parse(fs.readFileSync('data/hceres/config/stylesheet.json'))

    res.send(JSON.stringify(result))
})

// LDViz about page 
app.get(prefix + '/about', function (req, res) {
    res.render("pages/about");
})

// results of the coverage analysis
app.get(prefix + '/analysis', function (req, res) {
    let endpoints = fs.readFileSync('data/analysis/endpoints.json')
    endpoints = JSON.parse(endpoints)

    let result = fs.readFileSync('data/analysis/results.json')
    result = JSON.parse(result)
    res.render("pages/analysis", { endpoints: endpoints, result: result });
})

app.get(prefix + '/query', async function (req, res) {
    await users.checkConnection(req)
    res.render("pages/ldviz/index", await data.load(req));
})

app.get(prefix + '/results/', async function(req, res){

    let existingQuery = req.query.id ? await data.getQuery(req.query.id) : null

    res.render("pages/ldviz/results", { params: { queryData: existingQuery || req.query, type: req.query.resultsType} });
})

// generic page which url is set when changing the href of the page
// :page = covid, hal, ldviz
// :action = newQuery, edit, clone
app.get(prefix + '/query/:action/', async function(req, res){
    const params = req.params;
    const queryId = req.query.queryId;

    let result = await data.load(req)
    result.existingQuery = result.queries.filter(d => d.id == queryId)[0] || {}
    result.action = params.action
    res.render("pages/ldviz/index", result)
})

app.post(prefix + '/saveConfig', function (req, res){
    let body = req.body;
    
    if (req.session.user) {
        // let userdir = configdir + req.session.user.id + '/';
        // if (!fs.existsSync(userdir))
        //         fs.mkdirSync(userdir);

        let filename = userdir + body.type + '.json';

        fs.writeFile(filename, JSON.stringify(body.data), function (err) {
            if (err) {
                console.log("Error while writing file " + filename + " - " + err);
                res.sendStatus(500);
                return;
            }
        });
        res.sendStatus(200);
        return
    }
    res.sendStatus(500);
})

// Save a new query on disk
app.post(prefix + '/saveQuery', async function (req, res) {

    let response = await data.saveQuery(req.body.query)
    
    if (response && response.message) {
        console.log(response.message)
        res.sendStatus(500)
        return;
    }
    res.sendStatus(200);
})

/**
 * Edit an existing query
 * Find the edited query and REPLACE it in the file of query list
 * If the query is published, find the edited query and REPLACE it in the file of PUBLISHED query list
 **/
app.post(prefix + '/editQuery', async function (req, res) { 

    let response = await data.updateQuery(req.body)

    if (response && response.message) {
        console.log(response.message)
        res.sendStatus(response.code)
        return;
    }
    res.sendStatus(200);
})

/**
 * Delete an existing query 
 * Find the query and DELETE it from the file of query list
 **/
app.post(prefix + '/delete', async function (req, res) {
    let response = await data.deleteQuery(req.body.id)

    if (response && response.message) {
        console.log(response.message)
        res.sendStatus(response.code)
        return;
    }

    res.sendStatus(200);
})


// Clear the cache of a query
app.post(prefix + '/clearcache', async function (req, res) {
    let response = await cache.deleteFile(req.body.query)

    if (response && response.message) {
        console.log(response.message)
        res.sendStatus(response.code)
        return;
    }

    res.sendStatus(200);
})

//// end ldviz routes ///////////////////////

//// annotation routes ////////////////////
 
app.post(prefix + '/saveAnnotation', function (req, res) {
    var path = "data/annotations/test.json";
    var data = req.body; // query content
    servertools.update_file(path,data);
    res.sendStatus(200);
})

app.post(prefix + '/saveHistory', function (req, res) {
    var path = "data/history/history.json";
    var data = req.body; // query content
    servertools.update_file(path,data);
    res.sendStatus(200);
})

///////////////////////////////////////
// SPARQL request
app.post(prefix + '/sparql', async function (req, res) {
    
    let query = req.body;
    
    query.id = query.id === 'undefined' ? undefined : query.id;

    try {
        let result = await cache.getFile(query)

        try {
            if (!result) {
                result = await sparql.sendRequest(query.query, query.uri)
                // Save request result in cache (for predefined queries only - query with id)
                if (query.id) await cache.saveFile(result, query)             
            }

            // send result back to client: HTML + JS graphic specification
            res.send(result);
        } catch (e) {
            console.log('error = ', e)
            // send error back to client
            res.sendStatus(400)
        }

    } catch(e) {
        console.log('error = ', e)
        res.sendStatus(400)
    }
})


app.listen(port, () => { 
    console.log(`Server started at port ${port}.`)
});