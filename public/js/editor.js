class Editor{
    constructor(gss, params, query, dataviz, queries) {
        this.gss = gss // default stylesheet (for new queries)
        this.params = params // default values for the query fields, such as institution
        this.query = query // existing query, when on mode edit, view or clone
        this.dataviz = dataviz // list of visualization tools registered in the application (server side)
        this.queriesList = queries; // list of queries registered in the application (server side)

        this.queryTools = new Query()
        this.results = new Results()

        this.filters = {}

    }

    async set() {
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

        document.getElementById('query_listDiv').style.display = 'block'; // list of queries

        document.querySelector("#preview_button").addEventListener('click', () => this.openVisualization())
        document.querySelector("#preview-results").addEventListener("click", () => this.displayResults())
        document.querySelector("#hide-results").addEventListener("click", () => this.toggleResults())
        document.querySelector("#export_sparqlquery").addEventListener("click", () => this.exportQuery())
        document.querySelector("#add-value-button").addEventListener("click", () => this.addValue())
        document.querySelector("#data_vis").addEventListener("change", function() { _this.toggleStylesheet(this.value) })

        document.querySelector(".newQueryButton").addEventListener("click", () => this.queryTools.newQuery())

        d3.selectAll(".clipboard").on('click', function() { copyToClipboard(this.id) })

        this.queryIcons = [{'label': (d) => {
            if (d.dataviz) {
              let obj = this.getDatavizObj(d.dataviz)
              return `Visualize results with ${obj.name}`
            }  
            return `No Visualization Associated`
          }, 'class': 'far fa-play-circle', 'value': 'visualize', 
              'action': d => this.visualizeQueryResults(d) },
  
              {'label': 'View Query', 'class': 'far fa-file-code', 'value': 'view', 
                  'action': d => this.queryTools.loadPage('view', d), auth: false },
              
              {'label': 'Edit Query', 'class': 'far fa-edit', 'value': 'edit',
                  'action': d => this.queryTools.loadPage('edit', d), auth: true },
              
              {'label': 'Clone Query', 'class': 'far fa-clone', 'value': 'clone', 
                  'action': d => this.queryTools.loadPage('clone', d), auth: true },
              {'label': (d) => {
                  if (!d.dataviz) return 'Not Applicable'
  
                  let obj = this.getDatavizObj(d.dataviz)
                  if (obj.getPublishRoute()) 
                      return `${d.isPublished ? 'Remove from' : 'Publish on'} ${obj.getName()}.`
                  
                  return 'Not Applicable'
              }, 'class':  d => d.isPublished ? 'far fa-eye' : 'far fa-eye-slash', 'value': 'publish',
                  'action': (d) => this.publishQuery(d, 'isPublished', !d.isPublished), auth: true },
  
              {'label': 'Delete Query', 'class': 'far fa-trash-alt', 'value': 'delete',
                  'action': d => this.deleteQuery(d), auth: true }
          ]
  
          await this.setFilters()
          await this.restoreFilters()
          this.setQueryList()
    }

    /// --------------------------------------------------
    // methods to manage the visual aspect of the table

    setQueryList(){
        
        let displayedQueries = this.queriesList.filter(d => d.endpoint.length) // in case there are empty endpoints
        
        if (this.filters.endpoint) {
            displayedQueries = displayedQueries.filter(d => d.endpoint === this.filters.endpoint)
        } 
        if (this.filters.dataviz) {
            displayedQueries = displayedQueries.filter(d => d.dataviz === this.filters.dataviz)
        }


        if (this.filters.search) {
            displayedQueries = displayedQueries.filter(d => d.name.toLowerCase().includes(this.filters.search))
        } 

        const div = d3.select('div#queries-list')
            .style('height', displayedQueries.length == 0 ? '20px' : '260px')

        if (displayedQueries.length == 0) {
            div.select('#empty-queries-list').style('display', 'block')
            div.select('ul#queries-ul').style('display', 'none')
            return;
        }

        div.select('#empty-queries-list').style('display', 'none')
        
        const ul = div.select('ul#queries-ul')
            .style('display', 'block')
        
        const itemOnMouseOver = function() { d3.select(this).style('background', '#ccc') }
        const itemOnMouseOut = function() { d3.select(this).style('background', 'none') }

        let fontWeight = d => this.existingQuery && this.existingQuery.id === d.id ? 'bold' : 'normal';

        ul.selectAll('li')
            .data(displayedQueries)
            .join(
                enter => enter.append('li')
                    .call(li => li.append('tspan')
                        .style('display', 'inline-block')
                        .style('width', '85%')
                        .style('font-weight', fontWeight)
                        .text(d => d.name)),
                update => update.call(li => li.select('tspan')
                    .text(d => d.name)
                    .style('font-weight', fontWeight)),
                exit => exit.remove()
            )
            .on('mouseover', itemOnMouseOver)
            .on('mouseout', itemOnMouseOut)

        const iconClass = function(d){
            const query = d3.select(this.parentNode).datum()
            return 'query-icon ' + (typeof d.class === 'string' ? d.class : d.class(query))
        }

        const iconTooltip = function(d) {
            const query = d3.select(this.parentNode).datum()
            return typeof d.label === 'string' ? d.label : d.label(query)
        }

        const iconOnClick = function(d) {
            const query = d3.select(this.parentNode).datum()
            if (d.auth && !LDViz.auth.isConnected()) 
                if ( confirm("Please login before proceeding!") )  {
                    LDViz.auth.login('editor', d.value, query)
                    return
                }

            d.action(query)
        }

        let attrs = {
            'class': iconClass,
            'data-toggle': 'tooltip',
            'data-placement': 'top',
            'data-original-title': iconTooltip,
            'title': iconTooltip
        }

        ul.selectAll('li').selectAll('i')
            .data(this.queryIcons)
            .join(
                enter => enter.append('i'),
                update => update,
                exit => exit.remove()
            )
            .on('click', iconOnClick)
            .attrs(attrs)
    }

    

    getDatavizObj(id) {
        return new DataViz(this.dataviz.find(d => d.id.toString() === id))
    }

    async setFilters(){
        const _this = this;

        let endpoints = this.queriesList.map(d => d.endpoint)

        endpoints = endpoints.filter((d,i) => endpoints.indexOf(d) === i && d.length)
        endpoints = endpoints.map(d => ({ filter: 'endpoint', value: d, label: d, comparable: d.split('//')[1] }))
        endpoints = endpoints.sort( (a,b) => a.comparable.localeCompare(b.comparable) )

        this.setDatalist('endpoint', endpoints)

        let dataviz = this.queriesList.map(d => d.dataviz)
        dataviz = dataviz.filter((d,i) => d && dataviz.indexOf(d) === i)
        dataviz = dataviz.map(d => ( { filter: 'dataviz', value: d, label: this.getDatavizObj(d).getName() } ))

        this.setDatalist("dataviz", dataviz)

        document.querySelector("#filter-name").addEventListener("input", function() { 
            _this.filters.search = this.value
            _this.saveFilters()
            _this.setQueryList() 
        })

        document.querySelector("#clear-filters").addEventListener('click', () => this.clearFilters())
    }

    setDatalist(selector, data) {
        const _this = this

        d3.select(`#${selector}-datalist`)
            .selectAll('option')
            .data(data)
            .enter()
                .append('option')
                .style('cursor', 'pointer')
                .text(d => d.label)
                .property('selected', d => this.filters[d.filter] ? d.value === this.filters[d.filter] : false)
                
                
        d3.select(`#input-${selector}`).on('input', function(d) { 
            let value = this.value

            let selectedData = data.find(d => d.label === value)
            if (!selectedData) 
                _this.filters[selector] = null
            else 
                _this.filters[selector] = selectedData.value
            
            _this.saveFilters() // save to local storage
            _this.setQueryList() // refresh queries list
        })
    }  

    async restoreFilters() {
        console.log(window.sessionStorage)
        this.filters = window.sessionStorage.filters ? JSON.parse(window.sessionStorage.filters) : {}

        if (this.filters.endpoint)
            document.querySelector('#input-endpoint').value = this.filters.endpoint
    
        if (this.filters.dataviz)
            document.querySelector('#input-dataviz').value = this.getDatavizObj(this.filters.dataviz).getName()

        if (this.filters.search)
            document.querySelector('#filter-name').value = this.filters.search
        
    }

    saveFilters() {
        window.sessionStorage.setItem('filters', JSON.stringify(this.filters))
    }

    clearFilters() {
        Object.keys(this.filters).forEach(key => this.filters[key] = null)
        
        document.querySelector("#input-endpoint").value = null
        document.querySelector("#input-dataviz").value = null
        document.querySelector("#filter-name").value = null

        this.saveFilters()
        this.setQueryList()
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

    
    
    getQueryValue(queryId, attribute) {
        const query = this.queriesList.filter(d => d.id == queryId)[0];
        return query[attribute]
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

        values.isPublished = false;

        
        let res = await this.queryTools.sendToServer(values, 'add')

        if (res) {
            this.queriesList.push(values) // add the new query to the list on the client side
            this.setQueryList()
            LDViz.displayNotification(`The query "${values.name}" was registered.`)
        }
    }

    /**
     * Edit a query in the server
     * Asks for the user confirmation before making the request (edit published and locked status, or query content)
     * Redirect to the index when successful
     */
    async editQuery(data) { 

        let values = {}
        values = await this.getQueryData()
        values.isPublished = data.isPublished;
        values.isLocked = data.isLocked;
       
        values.id = data.id

        let res = this.queryTools.sendToServer(values, 'edit')
        if (res) {
            let index = this.queriesList.findIndex(d => d.id === values.id)
            this.queriesList.splice(index, 1, values) // replace the modified query on the client side
            this.setQueryList() // update the queries list
            
            LDViz.displayNotification(`Your modifications to query "${values.name}" were registered.`)
        }
    }

    async deleteQuery(data) {
        if (confirm("Are you sure you want to delete this query? It can still be used in the visualization tool, but further modifications won't be possible.")) {
            let res = await this.queryTools.sendToServer(data, 'delete')
            
            if (res) {
                this.queriesList = this.queriesList.filter(d => d.id !== data.id)
                let tooltip = document.querySelector('.tooltip')
                if (tooltip) tooltip.remove()
                this.setQueryList()
                
                LDViz.displayNotification(`The query "${data.name}" was deleted.`)
            }
        }
    }

    async publishQuery(d, attribute, value) {
        if (!d.dataviz) return

        let dataviz = this.getDatavizObj(d.dataviz)
        if (!dataviz.getPublishRoute())
            return

      
        let data = { ...d }
        data[attribute] = value
        
        let res = await this.queryTools.sendToServer(data, dataviz.getPublishRoute())
        
        if (!res) return

        res = await this.queryTools.sendToServer(data)

        if (!res) return

        this.queriesList.forEach(e => {
            if (e.id == d.id) {
                e[attribute] = value;
            }
        })

        this.setQueryList()
    
    }

    visualizeQueryResults(data) {
        let dataviz = this.dataviz.find(d => d.id.toString() === data.dataviz)

        this.queryTools.goToVisualization(data, dataviz)
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

    //////////////////////////// end of query actions //////////////

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