class Query{
    constructor(){
        // this.params = params

        // this.txtHistory = new window.UndoRedojs(5)


        this.pages = {
            home: '/ldviz/editor',
            edit: '/ldviz/editor/edit?queryId=',
            view: '/ldviz/editor/view?queryId=',
            clone: '/ldviz/editor/clone?queryId=',
            newquery: '/ldviz/editor/newQuery',
            exporer: '/ldviz', // this will change according to the visualization tool
        }

        this.routes = {
            delete: '/ldviz/delete/queries',
            save: "/ldviz/writedata/queries",
            edit: "/ldviz/editdata/queries",
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

    async editOnServer(data) {
        let response = await fetch(this.routes.edit, {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(response => {
            if (data.editType == 'content')
                location.href = this.pages.home
            else {
                //this.updateQueries(data.id, data.editType, data[data.editType])
                return true
            }
        }).catch(error => {
            alert(error)
            // console.log(error);
        })
        return response
    }

    /**
     * Deletes a query from the query list
     * Asks for the user confirmation before sending the request
     * Reload the page when successful
     */
    deleteQuery(query) {
        // if (query.isLocked) {
        //     alert('The query is locked. You cannot delete it!')
        //     return;
        // }
        // else 
        if (confirm("You are about to delete the query from the list (and the main page if published)!\nDo you want to proceed?")) {

            // Send request
            fetch(this.routes.delete, {
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id: query.id })
            }).then(response => {
                location.href = this.pages.home
            }).catch(error => {
                alert(error)
                // console.log(error);
            });
        }
    }

    saveQuery(data, route) {
        // Send request
        let response = fetch(route || this.routes.save, {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(response => {
            if (route) return true
            else location.href = this.pages.home
        }).catch(error => {
            // console.log(error);
            alert(error)
        })

        return response
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

        let res = await fetch(this.routes.sparql, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(values)
        }).then(async (response) => {
            return await response.text();
        }).catch(error => {
            // console.log(error)
            alert(error);
        });

        return res
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
        location.href = this.pages[page] + (query ? query.id : '')
    }
    
} // end of Query class













