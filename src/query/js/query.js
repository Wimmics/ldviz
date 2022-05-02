class Query{
    constructor(params){
        this.params = params

        this.txtHistory = new window.UndoRedojs(5)
    }

    /*
    * complete SPARQL query with data from HTML form such as year, lab, country
    */
    tune(data) {
        let params = data.params;

        Object.keys(params).forEach(function(p) {
            // Replace metadata by selected value of corresponding list
            if (p == 'country' && params[p]) {
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
            } else if (p == 'variables') {
                params[p].forEach((v,i) => {
                    data.query = data.query.replaceAll('$term'+(i+1), v)
                })
            } else if (p == 'prefixes' && params[p]){
                params[p].forEach(pre => {
                    data.query = pre + '\n' + data.query;
                })
            } else if (p == 'list_authors') {
                data.query = data.query.replaceAll('$authorsList', params[p])
            }
        });
    }

    /**
     * Creates JS data from HTML form.
     */
    getFormData(form) {
        const type = form['query_type'].value || 1
        
        const values = {
            query: form['query_content'].value,
            name: form['query_name'].value,
            uri: form['query_endpoint'].value.trim(),
            params: {
                type: type,
                period: [ +form['from_year'].value, +form['to_year'].value ],
                lab: [ form['query_lab1'].value, form['query_lab2'].value ],
                country: form['query_country'].value,
                list_authors: form['query_list_authors'].value.split(',').map(d => `"${d.trim()}"`)
            }
        };

        this.getVariables(values.params)

        values.params.prefixes = this.getPrefixes()
        
        return values;
    }

    getPrefixes(){
        const eltPrefix = d3.selectAll("input.prefix")
        if (eltPrefix.empty()) return;

        let prefixes = [];
        eltPrefix.each(function(d,i) {
            if (this.value) {
                prefixes.push(this.value);
            }
        })
        return prefixes
    }

    getVariables(params){
        const elt = d3.selectAll("input.named_entity")
        if (elt.empty()) return;

        params.variables = [];
        elt.each(function() {
            if (this.value) {
                params.variables.push(LDViz.editor.getVariableCode(this.value) || this.value);
            }
        })
    }

    // get the stylesheet code from the textarea
    getStyleSheet(form, value) {
        const content = document.getElementById("stylesheet");
        const active = document.getElementById("withStylesheet").checked;

        value.stylesheetActive = active; // set stylesheetActive property of query

        if (content && content.value.trim().length > 0) {
            try {
                value.stylesheet = JSON.parse(content.value); // set content of stylesheet
            } catch(e) {
                return e;
            }

            if (typeof(value.stylesheet.predefined_request_list) !== "undefined") // not touching this, no idea what predefined_request_list is about -- Aline
                value.stylesheet.predefined_request_list.forEach((elt, i) => {
                    var _uri = null;
                    document.querySelectorAll("input").forEach(_input => {
                    if (_input.name === "uri_" + elt)
                        _uri = _input.value
                    });
                    var temp = {
                        "title": elt,
                        "uri": _uri,
                        "query": document.getElementById(elt).value
                    };
                    value.stylesheet.predefined_request_list[i] = temp;
                });
        }
    }

    // /**
    //  * executed in browser
    //  * send endpoint URI and SPARQL query to node server.js
    //  * get JSON result from transformation
    //  * apply graphic display
    // **/
    sendRequest(values) {
        
        fetch(LDViz.sparqlRoute, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(values)
        }).then(response => {
            return response.text();
        }).then(text => {
            this.getResult(text, values);
        }).catch(error => {
            // console.log(error)
            alert(error);
        });
    }

    getResult(text, values) {

        try{
            let res = JSON.parse(text);
            LDViz.results.handleResults(res)
        } catch (error) {
        
            if (error.toString().includes("launch is not defined")) {
                alert('The visualization cannot be loaded automatically, please click on "Visualize SPARQL Query Results" at the bottom of the form.') 
            } else alert(error)
        
        }
    }

    /**
     * Main function
     */
    processQuery(form) {
        let data = this.getQueryData(form);

        if (data.uri.length == 0) {
            alert('You must provide a SPARQL Endpoint!')
            return
        } 
        
        if (data.query.trim().length == 0) {
            alert('You must provide a query!')
            return
        }

        if (!isURI(data.uri)) {
            alert('The SPARQL enpoint URL is not valid!')
            return
        }

        if (data.query.includes('$beginYear') && data.query.includes('$endYear')) {
            if (data.params.period[0] > data.params.period[1]) {
                alert('The selected time period is invalid. Please choose a different one and try again.')
                return
            }
        }

        this.tune(data)

        let url = LDViz.explorerPage +
            '?query=' + encodeURIComponent(data.query) +
            '&url=' + data.uri +
            '&name=' + (data.name.length ? data.name : 'No name provided') +
            '&email=' + LDViz.auth.user.email +
            '&password=' + LDViz.auth.user.password;

        if (data.stylesheetActive) 
            url += '&stylesheet=' + encodeURIComponent(JSON.stringify(data.stylesheet))

        window.open(url)
    }

    getQuery(form) {
        let queryData = this.getQueryData(form)
        this.tune(queryData)
        return queryData
    }

    getQueryData(form){
        let values = this.getFormData(form);

        if (document.getElementById("withStylesheet").checked){
            // catch errors that may happen when parsing the json content from the stylesheet textarea
            let res = this.getStyleSheet(form, values)
            if (res instanceof Error) {
                alert(res)
                return;
            }
        }

        return values;
    }
    
} // end of Query class













