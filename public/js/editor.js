class Editor{
    constructor(gss, params, query, dataviz) {
        this.gss = gss // default stylesheet (for new queries)
        this.params = params // default values for the query fields, such as institution
        this.query = query // existing query, when on mode edit, view or clone
        this.dataviz = dataviz // list of visualization tools registered in the application (server side)

        this.queryTools = new Query()
        this.results = new Results()

    }

    set() {
        const _this = this;

        // Syntax highlight on the textareas using CodeMirror
        this.sparqlCodeMirror = CodeMirror.fromTextArea(document.querySelector("#form_sparqlQuery"), {mode: "sparql", lineNumbers: true})
        this.sparqlCodeMirror.setSize(null, 700)

        this.jsonCodeMirror = CodeMirror.fromTextArea(document.querySelector("#stylesheet"), {mode: "json"})
        this.jsonCodeMirror.setSize(null, 500)
        
        this.setSelect("#select_country", this.params.countries)
        this.setSelect("select[id*='select_lab']", this.params.laboratories)
        this.setSelect("#data_vis", this.dataviz)
        this.setTimePeriodsList()


        document.querySelector("#preview_button").addEventListener('click', () => this.openVisualization())
        document.querySelector("#preview-results").addEventListener("click", () => this.displayResults())
        document.querySelector("#hide-results").addEventListener("click", () => this.toggleResults())
        document.querySelector("#export_sparqlquery").addEventListener("click", () => this.exportQuery())
        document.querySelector("#add-value-button").addEventListener("click", () => this.addValue())
        document.querySelector("#data_vis").addEventListener("change", function() { _this.toggleStylesheet(this.value) })

        document.querySelector(".newQueryButton").addEventListener("click", () => this.queryTools.newQuery())

        d3.selectAll(".clipboard").on('click', function() { copyToClipboard(this.id) })
    }

    toggleStylesheet(selectedDataviz) {
        let dataviz = new DataViz(this.dataviz.find(d => d.id.toString() === selectedDataviz))

        if (dataviz.getParamKeys().includes('stylesheet')) { // the visualization supports stylesheet
            document.querySelector("#stylesheetContainer").style.display = "block" // display before including the data
            this.jsonCodeMirror.setValue(dataviz.getStylesheetTemplate())

            this.updateFormHeight()
        } else {
            document.querySelector("#stylesheetContainer").style.display = "none" // display before including the data
        }
    }

    async displayResults() {

        let loading = document.querySelector("#loading-results")
        loading.style.display = "block"

        let data = await this.getQuery()
        let response = await this.queryTools.sendRequest(data)
        let results;
        try {
            results = JSON.parse(response)
            document.querySelector("#query-results").style.display = 'block'
            document.querySelector("#hide-results").style.display = 'block'

            this.results.writeResults(results, results[1] === 'html')

            this.updateFormHeight()
        } catch(e) {
            console.log("error = ", e)
            alert(response)
        }

        loading.style.display = "none"
    }

    toggleResults() {
        let resultsContainer = document.querySelector("#query-results")
        let button = document.querySelector("#hide-results")

        if (resultsContainer.style.display === "block") {
            resultsContainer.style.display = 'none'
            button.textContent = 'Show Results'
        } else {
            resultsContainer.style.display = 'block'
            button.textContent = 'Hide Results'
        }
    }

    async exportQuery() {
        let data = await this.getQuery()
        this.results.exportSparqlQuery(data.query)
    }

    // display the editor window with information regarding the selected query
    displayQuery(action) {
        let data = this.query;

        if (action != 'newQuery') {

            document.querySelector('#form_queryTitle').value = data.name
            document.querySelector('#form_sparqlEndpoint').value = data.endpoint

            if (data.dataviz) {
                d3.select("#data_vis").selectAll('option').property('selected', function() { return this.value === data.dataviz })
            }

            this.sparqlCodeMirror.setValue(data.query)

            if (data.stylesheet) {
                document.querySelector("#stylesheetContainer").style.display = "block" // display before including the data
                document.querySelector("#withStylesheet").checked = data.stylesheetActive;
                this.jsonCodeMirror.setValue(JSON.stringify(data.stylesheet, undefined, 4))
            } else {
                this.jsonCodeMirror.setValue(JSON.stringify(this.gss, undefined, 4))
            }

            const params = data.params;
            if (params) {
                if (params.lab && params.lab[0]) 
                    d3.select("#select_lab1").selectAll('option').property('selected', d => d.name === params.lab[0])

                if (params.lab && params.lab.length > 1 && params.lab[1]) 
                    d3.select("#select_lab2").selectAll('option').property('selected', d => d.name === params.lab[1])

                if (params.country) 
                    d3.select("#select_country").selectAll('option').property('selected', d => d.name === params.country)

                if (params && params.period) {
                    d3.select('#select_from_year').selectAll('option').property('selected', d => d.name === params.period[0])
                    d3.select('#select_to_year').selectAll('option').property('selected', d => d.name === params.period[1])
                }

                if (params.value) {
                    params.value.forEach(d => this.addValueElement(d))
                }
            }
        }

        if (action != 'edit') {
            document.querySelector('#cancel_button').addEventListener('click', () =>  this.queryTools.loadPage('home'))
        }
        
        if (['newQuery', 'clone'].includes(action)) {
            document.getElementById('save_button').addEventListener('click', () => this.saveQuery())
        }

        if (action == 'clone') {
            document.getElementById('form_queryTitle').value = 'Copy of ' + data.name;
        } else if (action == 'edit') {
            document.querySelector('#save_button').addEventListener('click', () => this.editQuery(data))
            document.querySelector('#cancel_button').addEventListener('click', () => {
                if (confirm("Are you sure? Your changes will be lost!")) {
                    this.queryTools.loadPage('home')
                }
            } )
        } else if (action == 'view') {
            // document.querySelector('#cancel_button').addEventListener('click', () =>  this.queryTools.loadPage('home'))
            document.querySelector('#save_button').style.display = 'none';
            
            // when in view mode, disable all text fields
            let inputs = document.querySelectorAll(".query-input")
            inputs.forEach(element => element.readOnly = true )

            this.sparqlCodeMirror.options.readOnly = true
            this.jsonCodeMirror.options.readOnly = true
        } else if (action === "newQuery") {
            //testGetQueryData()
            // default stylesheet for new queries
            this.jsonCodeMirror.setValue(JSON.stringify(this.gss, undefined, 4))
        }

        this.updateFormHeight()
    }

    setTimePeriodsList(){
        const currentYear = new Date().getFullYear()
        const data =  d3.range(currentYear, 1900, -1)

        d3.selectAll('.time-select')
            .selectAll('option')
            .data(data)
            .enter()
                .append('option')
                .attr('value', d => d)
                .text(d => d)
                .property('selected', d => d === currentYear)
    }

    setSelect(selector, data){
        let options = [{name: "Select your option"}].concat(data)

        d3.selectAll(selector)
            .selectAll('option')
            .data(options)
            .enter()
                .append('option')
                .attr('value', d => d.id || d.name)
                .text(d => d.name)
                .property("disabled", (_,i) => i === 0)
                .property("selected", (_,i) => i === 0)
    }

    updateFormHeight(){
        const formDiv = document.getElementById('tab');
        formDiv.style.maxHeight = formDiv.scrollHeight + "px";
    }

    /**
     * Cancels changes and redirect on the index
     * Asks for the user confirmation before making the redirection
     */
    cancelChanges() {
        if (confirm("Are you sure that you want to DISCARD all changes?")) {
            location.href = this.queryTools.loadPage('home')
        }
    }

    async saveQuery() {

        // Get form values
        const values = await this.getQueryData()
        values.id = new Date().getTime();

        // values.isLocked = true;
        values.isPublished = false;

        this.queryTools.saveQuery(values)
    }

    /**
     * Edit a query in the server
     * Asks for the user confirmation before making the request (edit published and locked status, or query content)
     * Redirect to the index when successful
     */
    async editQuery(data) { 

        if (confirm('Are you sure you want to SAVE your changes?')) {
            let values = {}
            values = await this.getQueryData()
            values.isPublished = data.isPublished;
            values.isLocked = data.isLocked;
            values.editType = 'content';

            values.id = data.id || data;

            this.queryTools.editOnServer(values)
        }
    }

    addValue() {
        let value = document.querySelector("#input_value").value
        if (value.length) {
            this.addValueElement(value)
            document.querySelector("#input_value").value = ""
        }
    }

    addValueElement(value) {
        let valuesContainer = document.querySelector("#selectedValues")

        let children = valuesContainer.querySelectorAll('.selected-value')
        let id = `$value${children.length+1}`

        const valueElement = document.createElement('div')
        valueElement.classList.add('selected-value')
        valueElement.classList.add("selected")
        
        valueElement.innerHTML = `${value} 
            <i class="far fa-copy clipboard query-icon" id=${id} data-toggle="tooltip" data-placement="top" title="Copy ${id} to clipboard"></i>
            <i class="fas fa-times query-icon" data-toggle="tooltip" data-placement="top" title="Delete" style="margin-left:5px;"></i>`

        valueElement.querySelector('.fa-times').addEventListener('click', function() { 
            this.parentNode.remove()
            document.querySelector('.tooltip').remove()
        })
        valueElement.querySelector('.clipboard').addEventListener('click', function() { copyToClipboard(this.id) })

        valuesContainer.appendChild(valueElement)
        
        this.updateFormHeight()

        // activate the tooltips
        $(function () { $('[data-toggle="tooltip"]').tooltip() })
    }



    ////// query actions //////

    async openVisualization() {
        let data = await this.getQueryData()

        let dataviz = this.dataviz.find(d => d.id.toString() === data.dataviz)

        this.queryTools.goToVisualization(data, dataviz)
    }

    async getQuery() {
        let queryData = await this.getQueryData()
        await this.queryTools.tune(queryData)
        return queryData
    }

    async getQueryData(){
        let form = document.querySelector('#query_form')
        let content = this.sparqlCodeMirror.getValue() // get content from textarea

        let stylesheetActive = document.querySelector("#withStylesheet").checked

        const values = {
            query: content,
            name: form['query_name'].value,
            dataviz: form['data_vis'].selectedIndex !== 0 ? form['data_vis'].value : null,
            endpoint: form['query_endpoint'].value.trim(),
            params: {
                period: [ content.includes("$beginYear") ? +form['from_year'].value : '', 
                        content.includes("$endYear") ? +form['to_year'].value : '' ],
                lab: [ content.includes("$lab1") ? form['query_lab1'].value : '', 
                    content.includes("$lab2") ? form['query_lab2'].value : '' ],
                country: content.includes("$country") ? form['query_country'].value : '',
                value: await this.getVariables() // custom variables/values ($value1, $value2, etc)
            },
            stylesheetActive: stylesheetActive,
            stylesheet: stylesheetActive ? JSON.parse(this.jsonCodeMirror.getValue()) : null
        }
                
        return values;
    }

    async getVariables(){
        const elt = d3.selectAll(".selected-value")
        if (elt.empty()) return;

        let values = []
        elt.each(function() {
            if (this.textContent.length) {
                values.push(this.textContent.trim());
            }
        })
       
        return values
    }
}