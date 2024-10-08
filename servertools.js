const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch')

class Users{
    constructor() {
        this.users = []
        this.filename = path.join(__dirname, '/data/users.json')

        
    }

    async findUser(req) {
        try {
            if (!fs.existsSync(this.filename)) return

            let rawdata = fs.readFileSync(this.filename);
            const users = JSON.parse(rawdata)


            const { username, password } = req.body;
            return users.find(u => u.username === username && u.password === password)
            
        } catch(e) {
            return e
        }
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
            json.queries.splice(index, 1, data); 
        } else {
            return { message: "The query " + data.name + " could not be updated.", code: 404}
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
            dataviz: dataviz
        }
    }
}

class SPARQLRequest{ // not being used for now
    constructor() {

    }

    prepare(query) {
        query = encodeURIComponent(query);
        query = query.replace(/\%20/g, "+");
        query = query.replace(/\(/g, "%28");
        query = query.replace(/\)/g, "%29");
        return query;
    }
    
    async sendRequest(query, endpoint){
        let url = endpoint + "?query=" + this.prepare(query); 

        try {
            let response = await fetch(url, { 
                method: 'GET',  
                headers: { 'Accept': "application/sparql-results+json" } 
            })

            if (response.ok) {
                try {
                    return await response.json();
                } catch (e) {
                    return { message: "An error occurred while processing the response.\nPlease try again later." }
                }
            } else return { message: `Request failed with status: ${response.statusText}.\nPlease try again later.`}

        } catch(error) { // network error
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                return { message: 'Network error: Failed to fetch the resource.\nCheck the browser console for more information.' }
            } else {
                return { message: `An error occurred: ${error.message}` }
            }
        }
    }

}


module.exports = { 
    Users : Users, 
    Data: Data,
    SPARQLRequest: SPARQLRequest
}