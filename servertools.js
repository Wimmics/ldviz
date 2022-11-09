const fetch = require('node-fetch')
const fs = require('fs');
const path = require('path');

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

class Cache{
    constructor() {
        this.datafiletimeout = 1296000000; /// keep files in cache for 15 days

        this.folder = 'data/cache/';
        if (!fs.existsSync(this.folder)){
            fs.mkdirSync(this.folder);
        }
    }

    getFileName(query) {
        let filename = query.id
        let params = query.params;

        if (params) {
            if (params.country && params.country.length) {
                filename += '_' + params.country
            } 

            if (params.lab) 
                params.lab.forEach(lab => {
                    if (lab.length) filename += '_' + lab
                })

            if (params.period)
                params.period.forEach(period => {
                    filename += '_' + period
                })

            if (params.variables)
                params.variables.forEach(term => {
                    if (term.length) filename += '_' + term
                })
        }

        return path.join(__dirname, this.folder + filename + '.json')
    }

    async getFile(query) {
        return new Promise( async (resolve, reject) => {
            let filename = this.getFileName(query)
            if (query.id && fs.existsSync(filename)) {
                // Check if cache exists for request (for published queries only - query with id)
                const stats = fs.statSync(filename);
                if ((new Date().getTime() - stats.mtimeMs) < this.datafiletimeout) {
                    // Data cache file is recent => load cache
                    fs.readFile(filename, function(e, data) {
                        if (e) {
                            console.log("error = ", e)
                            reject(e)
                        }
                        
                        resolve(data)
                    });
                } else resolve (null)
            } else resolve(null)
        })
    }

    async saveFile(result, query) {
        let filename = this.getFileName(query)
        fs.writeFileSync(filename, result, function (err) {
            if (err) {
                console.log("Error while writing file " + filename + " - " + err);
            }
        });
    }

    async deleteFile(query) {
        let filename = this.getFileName(query)

        if (fs.existsSync(filename)) {
            fs.unlink(filename, function (err) {
                if (err) {
                    return { message: "Error while deleting file " + cachefilename + " - " + err, code: 500 }
                } 
            })
        }
        return;
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
        // url = url + "&format=application%2Fsparql-results%2Bjson";

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

function update_file(path, data){
    var file = fs.readFileSync(path,"utf8");
    file = JSON.parse(file);
    
    file.push(data);
    fs.writeFileSync(path, JSON.stringify(file), (err) => {
        if (err)
          console.log(err);
        else {
          console.log("File written successfully\n");
          console.log("The written has the following contents:");
          console.log(fs.readFileSync(path, "utf8"));
        }
    })
}

class Data{
    constructor() {
        this.folder = 'data/'

        this.filename = {
            'queries': this.folder + 'queries.json',
            'params': this.folder + 'parameters.json',
            'gss': this.folder + 'gss_type.json'
        }
    }    

    async getQueries() {
        let filename = path.join(__dirname, this.filename.queries)
        if (fs.existsSync(filename)) {
            let rawdata = fs.readFileSync(filename);
            return JSON.parse(rawdata).queries
        }
        return []
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

    async saveQuery(query) {

        let json = { queries: await this.getQueries() }
        json.queries.push(query);

        let filename = path.join(__dirname, this.filename.queries)
        fs.writeFile(filename, JSON.stringify(json), function (err) {
            if (err) {
                return { message: "Error while writing file " + filename + " - " + err, code: 500 }
            }
        });
        
        return; 
    }

    async updateQuery(query) {

        let json = { queries: await this.getQueries() }

        if (!json.queries.length) return;

        const index = json.queries.findIndex(d => d.id === query.id)

        if (index > -1) {
            if (query.editType === 'content') {
                delete query.editType;
                json.queries.splice(index, 1, query); 
            } else json.queries[index][query.editType] = query[query.editType];  // publish and locked attributes
        } else {
            return { message: "No query with id " + query.id + " found", code: 404}
        }

        let filename = path.join(__dirname, this.filename.queries)
        fs.writeFile(filename, JSON.stringify(json), function (err) {
            if (err) {
                return { message: "Error while writing file " + filename + " - " + err, code: 500 }
            }
        });
        return;
    }

    async deleteQuery(id) {
        let json = {queries: await this.getQueries()}

        // Data file does not exist => nothing to do
        if (!json.queries.length) return;
        
        json.queries = json.queries.filter(d => d.id !== id)
        
        let filename = path.join(__dirname, this.filename.queries)
        fs.writeFile(filename, JSON.stringify(json), function (err) {
            if (err) {
                return { message: "Error while writing file " + filename + " - " + err, code: 500 }
            }
        });
    }

    async getQuery(id) {
        let queries = await this.getQueries()
        return queries.find(d => d.id === id)
    }

    async load(req) {
        let queryParams = req.query;
        // console.log(req.session)
        // let config = {}
        // if (req.session.user) {
        //     let userdir = configdir + req.session.user.id + '/'
        //     if (fs.existsSync(userdir)) {
        //         let filename = userdir + 'filters.json'
        //         if (fs.existsSync(filename)) {
        //             let rawdata = fs.readFileSync(filename);
        //             config.filters = JSON.parse(rawdata);
        //         }
        //     }
        // }
    
        let queries = await this.getQueries()        
        let paramdata = await this.getParameters()
        let stylesheet = await this.getGSS()
    
        return { queryParams: queryParams, 
            params: paramdata, 
            queries: queries, 
            stylesheet: stylesheet, 
            user: req.session.user || null
            // config: config
        }
    }
}


module.exports = { 
    Users : Users, 
    Cache: Cache, 
    SPARQLRequest: SPARQLRequest, 
    Data: Data,
    update_file }