class QueryTable{
    constructor(queries, existingQuery, dataviz){
        this.queriesList = queries;
        this.existingQuery = existingQuery;
        this.dataviz = dataviz
        this.filters = {}

        this.queryTools = new Query()
    }

    async set() {
        this.queryIcons = [{'label': (d) => {
          if (d.dataviz) {
            let obj = this.getDatavizObj(d.dataviz)
            return `Visualize results with ${obj.name}`
          }  
          return `No Visualization Associated`
        }, 'class': 'far fa-play-circle', 'value': 'visualize', 
            'action': d => this.handleVisualizeQuery(d) },

            {'label': 'View Query', 'class': 'far fa-file-code', 'value': 'view', 
                'action': d => this.queryTools.loadPage('view', d), auth: false },
            
            {'label': 'Edit Query', 'class': 'far fa-edit', 'value': 'edit',
                'action': d => this.queryTools.loadPage('edit', d), auth: true },
            
            {'label': 'Clone Query', 'class': 'far fa-clone', 'value': 'clone', 
                'action': d => this.queryTools.loadPage('clone', d), auth: true },
            // {'label': 'Lock/Unlock query', 'class': d => d.isLocked ? 'fas fa-lock' : 'fas fa-unlock', 'value': 'lock',
            //     'action': (d) => this.toggleQueryAttribute(d.id, 'isLocked', !d.isLocked), auth: true},
            {'label': (d) => {
                if (!d.dataviz) return 'Not Applicable'

                let obj = this.getDatavizObj(d.dataviz)
                if (obj.getPublishRoute()) 
                    return `${d.isPublished ? 'Remove from' : 'Publish on'} ${obj.getName()}.`
                
                return 'Not Applicable'
            }, 'class':  d => d.isPublished ? 'far fa-eye' : 'far fa-eye-slash', 'value': 'publish',
                'action': (d) => this.toggleQueryAttribute(d, 'isPublished', !d.isPublished), auth: true },

            {'label': 'Delete Query', 'class': 'far fa-trash-alt', 'value': 'delete',
                'action': d => this.queryTools.deleteQuery(d), auth: true }
        ]

        const _this = this
       

        await this.setFilters()
        await this.restoreFilters()
        this.setQueryList()
    }


    handleVisualizeQuery(data) {
        let dataviz = this.dataviz.find(d => d.id.toString() === data.dataviz)

        this.queryTools.goToVisualization(data, dataviz)
    }
    

    /// setters and getters
    getQueryValue(queryId, attribute) {
        const query = this.queriesList.filter(d => d.id == queryId)[0];
        return query[attribute]
    }

    async toggleQueryAttribute(d, attribute, value) {
        if (!d.dataviz) return

        let dataviz = this.getDatavizObj(d.dataviz)
        if (!dataviz.getPublishRoute())
            return

        let message = `Are you sure you want to `
        switch(attribute) {
            case 'isPublished':
                message += (value ? 'PUBLISH' : 'UNPUBLISH')
                break;
            case 'isLocked':
                message += (value ? 'LOCK' : 'UNLOCK')
                break
        }
        message += ' this query?'

        if (confirm(message)) {
            let data = { ...d }
            data[attribute] = value
          
            let res = await this.queryTools.saveQuery(data, dataviz.getPublishRoute())
            
            if (!res) return

            data = { editType: attribute, id: d.id }
            data[attribute] = value

            res = await this.queryTools.editOnServer(data)

            if (!res) return
    
            this.queriesList.forEach(e => {
                if (e.id == d.id) {
                    e[attribute] = value;
                }
            })

            this.setQueryList()
        }
    }

    /// --------------------------------------------------
    // methods to manage the visual aspect of the table

    setQueryList(){
        
        //let filterValues = this.filters.map(d => d.value)
        //let displayedQueries = this.queriesList.filter(d => filterValues.includes(d.endpoint) && filterValues.includes(d.dataviz))
        let displayedQueries = this.queriesList.filter(d => d.endpoint.length) // in case there are empty endpoints
        console.log(displayedQueries)
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

        this.setSelect('endpoint', endpoints)

        let dataviz = this.queriesList.map(d => d.dataviz)
        dataviz = dataviz.filter((d,i) => d && dataviz.indexOf(d) === i)
        dataviz = dataviz.map(d => ( { filter: 'dataviz', value: d, label: this.getDatavizObj(d).getName() } ))

        this.setSelect("dataviz", dataviz)

        document.querySelector("#filter-name").addEventListener("input", function() { 
            _this.filters.search = this.value
            _this.saveFilters()
            _this.setQueryList() 
        })

        document.querySelector("#clear-filters").addEventListener('click', () => this.clearFilters())
    }

    setSelect(selector, data) {
        const _this = this

        d3.select(`#${selector}-datalist`)
            .selectAll('option')
            .data(data)
            .enter()
                .append('option')
                .style('cursor', 'pointer')
                .text(d => d.label)
                .property('selected', d => this.filters[d.filter] ? d.value === this.filters[d.filter] : false)
                
                
        d3.select(`#input-${selector}`).on('input', function(d) { // TODO: continue from here
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

    // ----------------------------------------------
    // methods to manage queries in the table

    

   
    

    


}