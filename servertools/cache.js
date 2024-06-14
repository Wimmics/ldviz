const fs = require('fs');
const path = require('path');

class Cache{
    constructor() {
        this.datafiletimeout = 1296000000; /// keep files in cache for 15 days

        this.folder = path.join(__dirname, '../data/cache/');
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
                    if (lab && lab.length) filename += '_' + lab
                })

            if (params.period)
                params.period.forEach(period => {
                    filename += '_' + period
                })

            if (params.variables)
                params.variables.forEach(term => {
                    if (term && term.length) filename += '_' + term
                })
        }
        
        return this.folder + filename + '.json'
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
                    return { message: "Error while deleting file " + filename + " - " + err, code: 500 }
                } 
            })
        }
        return;
    }
}

module.exports = { Cache: Cache }