const fs = require('fs');
const path = require('path');

class Data{
    constructor() {
        this.folder = '../data/'

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
        let queries = await this.getQueries()        
        let paramdata = await this.getParameters()
        let stylesheet = await this.getGSS()

        return { queryParams: queryParams, 
            params: paramdata, 
            queries: queries, 
            stylesheet: stylesheet, 
            user: req.session.user || null
        }
    }
}



module.exports = { Data: Data }