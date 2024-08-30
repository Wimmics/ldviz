class Editor{
    constructor(locals) {
        console.log(locals)
        this.gss = locals.stylesheet // default stylesheet (for new queries)
        this.params = locals.params // default values for the query fields, such as institution
        this.query = locals.existingQuery // existing query, when on mode edit, view or clone
        this.dataviz = locals.dataviz // list of visualization tools registered in the application (server side)
        this.queriesList = locals.queries // list of queries registered in the application (server side)
        this.action = locals.action

        this.queryTools = new Query()
        this.results = new Results()

        this.filters = {}

        this.auth = new Auth()
        this.auth.setLoginButton()

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
        document.querySelector('#cancel_button').addEventListener('click', () =>  this.queryTools.loadPage('home'))

        document.querySelector(".newQueryButton").addEventListener("click", () => this.newQuery())

        d3.selectAll(".clipboard").on('click', function() { copyToClipboard(this.id) })

        this.datavizIcons = [
            {'label': d => {
                if (!d.dataviz) return 'No Associated Dataviz'

                let obj = this.getDatavizObj(d.dataviz)     
                return `${d.isPublished ? 'Available' : 'Not available'} on ${obj.name}`
            }, 
            'class': d => d.isPublished ? 'far fa-eye' : 'far fa-eye-slash', 'value': 'upload-status'} ,
            
            {'label': (d) => {

                if (d.dataviz) {
                    let obj = this.getDatavizObj(d.dataviz)
                    if (obj.getPublishRoute()) 
                        return `Upload to ${obj.getName()}.`
                    else return 'Not Applicable'
                } 
                
                return 'No Associated Dataviz'
            }, 'class':  'fas fa-upload', 'value': 'publish',
                'action': (d) => this.publishQuery(d.id, 'isPublished', true), auth: true },

            {'label': (d) => {
                if (d.dataviz) {
                    let obj = this.getDatavizObj(d.dataviz)
                    if (obj.getPublishRoute()) 
                        return d.isPublished ? `Remove from ${obj.getName()}` : 'Nothing to remove'
                    else return 'Not Applicable'
                }
                
                return 'No Associated Dataviz'
            }, 'class': 'fas fa-eraser', 'value': 'delete-dataviz',
                    'action': d =>this.publishQuery(d.id, 'isPublished', false), auth: true }
            ]
            
            
        this.queryIcons = [
            

            {'label': (d) => {
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
                'action': d => this.cloneQuery(d.id), auth: true },

              {'label': 'Delete Query', 'class': 'far fa-trash-alt', 'value': 'delete',
                'action': d => this.deleteQuery(d.id), auth: true },
            
          ]

          // pagination settings
          this.rowsPerPage = 10
          this.currentPage = 1
  
          await this.setFilters()
          await this.restoreFilters()
          this.setQueryList()
    }

    /// --------------------------------------------------
    // methods to manage the visual aspect of the table

    displayTable(data) {

        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        const paginatedData = data.slice(start, end);

        const table = d3.select('table.queries-table')
        
        const _this = this;
        const iconClass = function(d){
            const query = d3.select(this.parentNode).datum()
            return 'query-icon ' + (typeof d.class === 'string' ? d.class : d.class(query))
        }

        const iconTooltip = function(d) {
            const query = d3.select(this.parentNode).datum()
            return typeof d.label === 'string' ? d.label : d.label(query)
        }

        const iconOnClick = async function(d) {
            if (!d.action) return;

            const query = d3.select(this.parentNode).datum()
            if (d.auth) {
                if (!_this.auth.isConnected()) {
                    if ( confirm("Please login before proceeding!") )  {
                        _this.auth.login('editor', d.value, query)
                        return
                    }
                } else d.action(query)
            } else if (!d.auth) 
                d.action(query)

            
        }

        let attrs = {
            'class': iconClass,
            'data-toggle': 'tooltip',
            'data-placement': 'top',
            'data-original-title': iconTooltip,
            'title': iconTooltip
        }

    
        let tr = table.select('#table-body')
            .selectAll('tr')
            .data(paginatedData)
            .join(
                enter => enter.append('tr')
                    .call(tr => tr.append('td').classed('query-title', true))
                    .call(tr => tr.append("td").classed('query-actions query', true))
                    .call(tr => tr.append('td').classed('query-actions dataviz', true)),
                update => update,
                exit => exit.remove()
            )

        tr.call(tr => tr.select('.query-title')
            .text(d => d.name) 
            .style('font-weight', d => this.query && this.query.id === d.id ? 'bold' : 'normal')
        )

        tr.call(tr => tr.select(".query")
            .selectAll('i')
            .data(this.queryIcons)
            .join(
                enter => enter.append('i'),
                update => update,
                exit => exit.remove()
            )
            .attrs(attrs)
            .on('click', iconOnClick)
            .style('cursor', 'pointer')
        )

        tr.call(tr => tr.select('.dataviz')
            .selectAll('i')
            .data(this.datavizIcons)
            .join(
                enter => enter.append('i'),
                update => update,
                exit => exit.remove()
            )
            .attrs(attrs)
            .on('click', iconOnClick)
            .style('cursor', d => d.value === "upload-status" ? 'normal' : 'pointer')
        )

        this.updatePagination(data)
    }

    // Function to update pagination controls
    updatePagination(data) {
        const totalPages = Math.ceil(data.length / this.rowsPerPage);

        const paginationControls = document.getElementById('pagination-controls');
        paginationControls.innerHTML = '';

        // Previous button
        const prevButton = document.createElement('li');
        prevButton.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = '<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>';
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage > 1) {
                this.currentPage--;
                this.displayTable(data)
            }
        });
        paginationControls.appendChild(prevButton);

        // Page number buttons
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = i
                this.displayTable(data)
            });
            paginationControls.appendChild(li);
        }

        // Next button
        const nextButton = document.createElement('li');
        nextButton.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        nextButton.innerHTML = '<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>';
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage < totalPages) {
                this.currentPage++
                this.displayTable(data)
            }
        });
        paginationControls.appendChild(nextButton);
    }

    setQueryList(){
        
        // recover valid queries based on current filters ////

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

        //////

        // Function to display the data in the table  
        this.displayTable(displayedQueries)
    }

    

    getDatavizObj(id) {
        return new DataViz(this.dataviz.find(d => d.id.toString() === id))
    }

    async setFilters(){
        const _this = this;

        let endpoints = this.queriesList.map(d => d.endpoint)

        endpoints = endpoints.filter((d,i) => endpoints.indexOf(d) === i && d.length)
        endpoints = endpoints.map(d => ({ filter: 'endpoint', value: d, label: d, comparable: d.split('//')[1] || d }))
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

    async checkConnection() {
        if (this.action === "view") return;

        if (this.action) {
            if (!this.auth.isConnected())
                if (confirm('Please login to continue') ) 
                    this.auth.login('editor', this.action, this.query)
        } 
    }

    // display the editor window with information regarding the selected query
    async displayQuery() {
        let data = this.query;     
        
        if (!this.query) return
        
        await this.checkConnection()

        if (this.action != 'newQuery') {

            document.querySelector('#form_queryTitle').value = data.name
            document.querySelector('#form_sparqlEndpoint').value = data.endpoint

            if (data.dataviz) {
                d3.select("#data_vis").selectAll('option').property('selected', function() { return this.value === data.dataviz })
            }

            this.sparqlCodeMirror.setValue(data.query)

            document.querySelector("#stylesheetContainer").style.display = "block" // display before including the data
            if (data.stylesheet) {
                document.querySelector("#withStylesheet").checked = data.stylesheetActive;
                this.jsonCodeMirror.setValue(JSON.stringify(data.stylesheet, undefined, 4))
            } else { // display a default stylesheet
                document.querySelector("#withStylesheet").checked = false
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

        
        if (['newQuery', 'clone'].includes(this.action)) {
            document.getElementById('save_button').addEventListener('click', () => this.saveQuery())
        }

        if (this.action == 'clone') {
            document.getElementById('form_queryTitle').value = 'Copy of ' + data.name;
        } else if (this.action == 'edit') {
            document.querySelector('#save_button').addEventListener('click', () => this.editQuery(data))
        } else if (this.action == 'view') {
            document.querySelector('#save_button').style.display = 'none';
            
            // when in view mode, disable all text fields
            let inputs = document.querySelectorAll(".query-input")
            inputs.forEach(element => element.readOnly = true )

            this.sparqlCodeMirror.options.readOnly = true
            this.jsonCodeMirror.options.readOnly = true
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

        if (!data) return

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
        if (!values) return
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
        if (!values) return;

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

    async deleteQuery(id) {
        let data = this.queriesList.find(e => e.id === id)
        if (!data) return

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

    async cloneQuery(id) {
        let d = this.queriesList.find(e => e.id === id)
        console.log("d = ", d)
        let clone = { ...d }
        clone.name = `Copy of ${d.name}`
        clone.id = new Date().getTime();
        clone.isPublished = false

        let res = await this.queryTools.sendToServer(clone, 'add')

        if (res) {
            this.queriesList.push(clone) // add the new query to the list on the client side
            this.setQueryList()
            LDViz.displayNotification(`The query "${clone.name}" was cloned.`)
        }


    }

    async publishQuery(id, attribute, value) {
        let d = this.queriesList.find(e => e.id === id)

        if (!d || !d.dataviz) return

        let dataviz = this.getDatavizObj(d.dataviz)
        console.log(dataviz)
        
        if (!dataviz.getPublishRoute())
            return

        d[attribute] = value
        console.log("data = ", d)

        // save the query on the visualization's server
        let res = await this.queryTools.sendToServer(d, null, dataviz.getPublishRoute())
        
        if (!res) return

        // update query on the server
        res = await this.queryTools.sendToServer(d, 'edit')

        if (!res) return

        // this.queriesList.forEach(e => {
        //     if (e.id == id) {
        //         e[attribute] = value;
        //     }
        // })

        LDViz.displayNotification(`The query "${d.name}" was ${value ? 'uploaded to' : 'removed from'} ${dataviz.getName()}.`)

        this.setQueryList()
    
    }

    newQuery(){
        if (this.auth.isConnected()) 
            location.href = this.queryTools.loadPage('newquery')
        else {
            if ( confirm("Please login before proceeding!") ) this.auth.login('editor', 'newQuery')
        }
    }

    visualizeQueryResults(data) {
        let dataviz = this.dataviz.find(d => d.id.toString() === data.dataviz)

        this.queryTools.goToVisualization(data, dataviz)
    }

    toggleStylesheet(selectedDataviz) {
        let dataviz = new DataViz(this.dataviz.find(d => d.id.toString() === selectedDataviz))
       
        document.querySelector("#stylesheetContainer").style.display = "block" // display before including the data
        let template = dataviz.getStylesheetTemplate()
        this.jsonCodeMirror.setValue(template || "")

        this.updateFormHeight()
       
    }

    async displayResults() {

        let loading = document.querySelector("#loading-results")
        loading.style.display = "block"

        let data = await this.getQuery()
        let results = await this.queryTools.sendRequest(data)
        
        if (results) {

            document.querySelector("#query-results").style.display = 'block'
            document.querySelector("#hide-results").style.display = 'block'

            this.results.writeResults(results, results[1] === 'html')

            this.updateFormHeight()
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
        if (!queryData) return

        await this.queryTools.tune(queryData)
        return queryData
    }

    async getQueryData(){
        let form = document.querySelector('#query_form')
        let content = this.sparqlCodeMirror.getValue() // get content from textarea

        try {

            let stylesheet = this.jsonCodeMirror.getValue()

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
                stylesheetActive:  document.querySelector("#withStylesheet").checked,
                stylesheet: stylesheet.length ? JSON.parse(stylesheet) : stylesheet
            }

            return values
        } catch(error) {
            alert(`Failed to process the action: ${error.message}.`)
            return
        }
                
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