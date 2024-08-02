class QueryTable{
    constructor(queries, existingQuery, dataviz){
        this.queriesList = queries;
        this.existingQuery = existingQuery;
        this.dataviz = dataviz
        this.filters = []

        this.queryTools = new Query()
    }

    set() {
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
        document.querySelector("#filter-name").addEventListener("input", function() { _this.setQueryList(this.value) })

        this.restoreFilters()
        this.setFilters()
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
          
            console.log("data = ", data)
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

    setQueryList(search){
        
        let filterValues = this.filters.map(d => d.value)
        let displayedQueries = this.queriesList.filter(d => filterValues.includes(d.endpoint) || filterValues.includes(d.dataviz))

        if (search) {
            displayedQueries = displayedQueries.filter(d => d.name.toLowerCase().includes(search))
        } else {
            search = document.getElementById('filter-name').value
            if (search.length) 
                displayedQueries = displayedQueries.filter(d => d.name.toLowerCase().includes(search))
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

    saveFilters() {
        window.sessionStorage.setItem('filters', JSON.stringify(this.filters))
    }

    getDatavizObj(id) {
        return new DataViz(this.dataviz.find(d => d.id.toString() === id))
    }

    setFilters(){
        let endpoints = this.queriesList.map(d => d.endpoint)
        endpoints = endpoints.filter((d,i) => endpoints.indexOf(d) === i)
        endpoints = endpoints.map(d => ({ value: d, label: d }))

        this.setSelect('#filter-endpoints', endpoints)

        let dataviz = this.queriesList.map(d => d.dataviz)
        dataviz = dataviz.filter((d,i) => d && dataviz.indexOf(d) === i)
        dataviz = dataviz.map(d => ( { value: d, label: this.getDatavizObj(d).getName() } ))

        this.setSelect("#filter-dataviz", dataviz)
    }

    setSelect(selector, data) {
        d3.select(selector)
            .selectAll('li')
            .data(data)
            .enter()
                .append('li')
                .style('cursor', 'pointer')
                .text(d => d.label)
                .on('click', d => this.addFilter(d))
    }  

    addFilter(data) {
        const _this = this;

        document.querySelector("#selectedFiltersSection").style.display = "block" // display the appropriate section

        let valuesContainer = document.querySelector("#selectedFilters")

        const valueElement = document.createElement('div')
        valueElement.classList.add('selected-filter')
        valueElement.classList.add("selected")
        
        valueElement.innerHTML = `${data.label} 
            <i class="fas fa-times query-icon" data-toggle="tooltip" data-placement="top" title="Delete" style="margin-left:5px;"></i>`

        valueElement.querySelector('.fa-times').addEventListener('click', function() { 
            _this.removeFilter(data)
            this.parentNode.remove()
            document.querySelector('.tooltip').remove()
        })

        valuesContainer.appendChild(valueElement)

        this.filters.push(data)

        this.saveFilters()
        this.setQueryList()

        // activate the tooltips
        $(function () { $('[data-toggle="tooltip"]').tooltip() })
        
    }

    removeFilter(value) {
        this.filters = this.filters.filter(d => d !== value)

        this.saveFilters()
        this.setQueryList()

        if (!this.filters.length)
            document.querySelector("#selectedFiltersSection").style.display = 'none'
    }

    restoreFilters() {
        let savedFilters = window.sessionStorage.filters ? JSON.parse(window.sessionStorage.filters) : null

        if (savedFilters) savedFilters.forEach(d => this.addFilter(d))
    }

    // ----------------------------------------------
    // methods to manage queries in the table

    

   
    

    


}