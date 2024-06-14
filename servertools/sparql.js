const fetch = require('node-fetch')

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

module.exports = { SPARQLRequest: SPARQLRequest }