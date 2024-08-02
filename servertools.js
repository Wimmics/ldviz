const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch')

class Users{
    constructor() {
        this.users = []
        this.filename = path.join(__dirname, '/data/users.json')

        if (fs.existsSync(this.filename)) {
            let rawdata = fs.readFileSync(this.filename);
            this.users = JSON.parse(rawdata)
        }
    }

    async checkConnection (req) {
        let queryData = req.query;
    
        if (queryData && Object.keys(queryData).length) {
            if (!queryData.email || !queryData.password) {
                queryData.message = `Please provide your credentials using "&email=" and "&password="`
                if (req.session.user)  delete req.session.user
            } else {
                let user = this.users.find(user => user.email === queryData.email && user.password === queryData.password);
                if (user)
                    req.session.user = user;
                else if (req.session.user) 
                    delete req.session.user
            }
        }
    }

    async get(email, password) {
        return this.users.find(user => user.email === email && user.password === password)
    }
}

class Data{
    constructor() {
        this.folder = 'data/'

        this.filename = {
            'queries': this.folder + 'queries.json',
            'params': this.folder + 'parameters.json',
            'gss': this.folder + 'gss_type.json',
            'dataviz': this.folder + 'dataviz.json'
        }
    }    

    set() {
        // verify the existence of files, create them if necessary
    }

    async readFile(filename) {
        let filepath = path.join(__dirname, filename)
        if (fs.existsSync(filepath)) {
            let rawdata = fs.readFileSync(filepath);
            return JSON.parse(rawdata).queries
        }
        return []
    }

    async writeFile(filename, json) {
        let filepath = path.join(__dirname, filename)
        fs.writeFile(filepath, JSON.stringify(json), function (err) {
            if (err) {
                return { message: "Error while writing file " + filepath + " - " + err, code: 500 }
            }
        })
    }

    async addToFile(data, file) {
        
        let json = { queries: await this.readFile(this.filename[file]) }
        json.queries.push(data)

        await this.writeFile(this.filename[file], json)
    }

    async getParameters() {
        let filename = path.join(__dirname, this.filename.params)
        if (fs.existsSync(filename)) {
            let rawdata = fs.readFileSync(filename);
            return JSON.parse(rawdata)
        }
        return {}
    }

    async getGSS() {
        let filename = path.join(__dirname, this.filename.gss)
        if (fs.existsSync(filename)) {
            let rawdata = fs.readFileSync(filename);
            return JSON.parse(rawdata)
        }
        return {}
    }

    async update(data, file) {

        let json = { queries: await this.readFile(this.filename[file]) }

        if (!json.queries.length) return;

        const index = json.queries.findIndex(d => d.id === data.id)

        if (index > -1) {
            if (data.editType === 'content') {
                delete data.editType;
                json.queries.splice(index, 1, data); 
            } else json.queries[index][data.editType] = data[data.editType];  // publish and locked attributes
        } else {
            return { message: "No query with id " + data.id + " found", code: 404}
        }

        let filename = path.join(__dirname, this.filename[file])
        fs.writeFile(filename, JSON.stringify(json), function (err) {
            if (err) {
                return { message: "Error while writing file " + filename + " - " + err, code: 500 }
            }
        });
        return;
    }

    async delete(id, file) {
        let json = {queries: await this.readFile(this.filename[file])}

        // Data file does not exist => nothing to do
        if (!json.queries.length) return;
        
        json.queries = json.queries.filter(d => d.id !== id)
        
        let filename = path.join(__dirname, this.filename[file])
        fs.writeFile(filename, JSON.stringify(json), function (err) {
            if (err) {
                return { message: "Error while writing file " + filename + " - " + err, code: 500 }
            }
        });
    }

    async getQuery(id) {
        let queries = await this.readFile(this.filename.queries)
        return queries.find(d => d.id === id)
    }

    async load(req) {
        let queryParams = req.query;    
        let queries = await this.readFile(this.filename.queries)  
        let dataviz = await this.readFile(this.filename.dataviz)
        let paramdata = await this.getParameters()
        let stylesheet = await this.getGSS()

        return { queryParams: queryParams, 
            params: paramdata, 
            queries: queries, 
            stylesheet: stylesheet, 
            user: req.session.user || null,
            dataviz: dataviz
        }
    }
}

class SPARQLRequest{
    constructor() {

    }

    prepare(query) {
        query = encodeURIComponent(query);
        query = query.replace(/\%20/g, "+");
        query = query.replace(/\(/g, "%28");
        query = query.replace(/\)/g, "%29");
        return query;
    }
    
    async sendRequest(query, uri){
        let url = uri + "?query=";
        url = url + this.prepare(query); 

        let headers = {
            accept: "application/sparql-results+json"
        }
        
        let result = await fetch(url, { method: 'GET', headers: headers}).then(async function(response){
         
          if(response.status >= 200 && response.status < 300){
            return await response.text().then(data => {
              return data
          })}
          else return response
        })
        return result
    }

}


module.exports = { 
    Users : Users, 
    Data: Data,
    SPARQLRequest: SPARQLRequest
}