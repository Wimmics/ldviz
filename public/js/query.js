class Query{
    constructor(){

        this.pages = {
            home: '/ldviz/editor',
            edit: '/ldviz/editor/edit?queryId=',
            view: '/ldviz/editor/view?queryId=',
            clone: '/ldviz/editor/clone?queryId=',
            newquery: '/ldviz/editor/newQuery',
            exporer: '/ldviz', // this will change according to the visualization tool
        }

        this.routes = {
            //delete: '/ldviz/delete/queries',
            save: "/ldviz/:action/queries",
            //edit: "/ldviz/editdata/queries",
            sparql: "/ldviz/sparql"
        }

       // this.results = new Results()
    }

    /*
    * complete SPARQL query with data from HTML form such as year, lab, country
    */
    async tune(data) {
       
        let params = data.params;

        Object.keys(params).forEach(function(p) {

            if (!params[p]) return

            // Replace metadata by selected value of corresponding list
            if (p == 'country') {
                // Parse country for Virtuoso
                data.query = data.query.replaceAll('$country', params[p])
                data.query = data.query.replace(/countrye/, params[p].replace(/ /, "_"));
                data.query = data.query.replace(/countryf/, getFrenchName(params[p]));
            } else if (p == 'period') {
                data.query = data.query.replaceAll('$beginYear', params[p][0])
                data.query = data.query.replaceAll('$endYear', params[p][1])
            } else if (p == 'lab' && params.type == 2) {
                data.query = data.query.replaceAll('$lab1', params[p][0])
                data.query = data.query.replaceAll('$lab2', params[p][1])
            } else if (p == 'lab') {
                data.query = data.query.replaceAll('$lab1', params[p][0])
            } else if (p == 'value') {
                params[p].forEach((v,i) => {
                    data.query = data.query.replaceAll('$value'+(i+1), v)
                })

                if (data.stylesheet) {
                   
                    let string = JSON.stringify(data.stylesheet)
                    params[p].forEach((v,i) => {
                        string = string.replaceAll('$value'+(i+1), v)
                    })
                    data.stylesheet = JSON.parse(string)
                }
            } else if (p == 'prefixes'){
                params[p].forEach(pre => {
                    data.query = pre + '\n' + data.query;
                })
            } else if (p == 'list_authors') {
                data.query = data.query.replaceAll('$authorsList', params[p])
            }

            
        });
    }

    newQuery(){
        if (LDViz.auth.isConnected()) 
            location.href = this.pages.newquery
        else {
            if ( confirm("Please login before proceeding!") ) LDViz.auth.login('editor', 'newQuery')
        }
    }


    async goToVisualization(data, dataviz) {
        
        if (!dataviz) {
            alert(`Please associate the query to a valid visualization tool.`)
            return
        }

        dataviz = new DataViz(dataviz) // transform the data into a dataviz object

        if (dataviz.getTune()) await this.tune(data)

        
        let params = dataviz.getParamKeys()
        params.forEach(p => {
            if (p === 'stylesheet' && !data.stylesheetActive)
                return

            if (Object.keys(data).includes(p))
                dataviz.setParamValue(p, data[p])

            if(Object.keys(data.params).includes(p)) 
                dataviz.setParamValue(p, data.params[p])
        })


        
        window.open(dataviz.getPopulatedUrl())
    }  

    async sendToServer(data, action, route) {
        
        let url = route || this.routes.save.replace(/:action/g, action)
        
        // Send request
        try {
            let response = await fetch(url, {
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data) })
        
            if (response.ok) {
                return true
            } else {
                alert(`Request failed with status: ${response.statusText}.\nPlease try again later.`);
                return false
            }
        } catch(error) {
            alert(error)
            return false
        }
    }

 
    async prepare(query) {
        query = encodeURIComponent(query);
        query = query.replace(/\%20/g, "+");
        query = query.replace(/\(/g, "%28");
        query = query.replace(/\)/g, "%29");
        return query;
    }

    // /**
    //  * executed in the server
    //  * send endpoint URI and SPARQL query to node server.js
    //  * get JSON result from transformation
    //  * apply graphic display
    // **/
    async sendRequest(values) {
        await this.tune(values)

        let response = await fetch(this.routes.sparql, {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(values)
            })

        let data = await response.json()

        if (data.message) {
            alert(data.message)
            return
        }
        
        return data
    }

    displayResults(data) {
        this.results.open(data)
    }

    getResult(text, values) { // what is this for?

        try{
            let res = JSON.parse(text);
            this.results.handleResults(res)
        } catch (error) {
        
            if (error.toString().includes("launch is not defined")) {
                alert('The visualization cannot be loaded automatically, please click on "Visualize SPARQL Query Results" at the bottom of the form.') 
            } else alert(error)
        
        }
    }


    loadPage(page, query) {
        console.log(page, query, this.pages[page] + (query ? query.id : ''))
        location.href = this.pages[page] + (query ? query.id : '')
    }
    
} // end of Query class













