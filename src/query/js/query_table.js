class QueryTable{
    constructor(queries, existingQuery){
        this.queriesList = queries;
        this.existingQuery = existingQuery;
        this.filters = {}
        
        this.setQueryIcons()
    }

    setQueryIcons() {
        this.queryIcons = [{'label': 'Visualize SPARQL Query Results', 'class': 'far fa-play-circle', 'value': 'visualize', 
            'action': d => this.processQuickPreview(d) },
            {'label': 'View SPARQL Query Results', 'class': 'fas fa-file-export', 'value': 'sparql_results', 
                'action': d => LDViz.results.open('sparql', d) },
            {'label': 'View Query', 'class': 'far fa-file-code', 'value': 'view', 
                'action': d => this.loadViewPage(d), auth: true },
            {'label': 'Edit Query', 'class': 'far fa-edit', 'value': 'edit',
                'action': d => this.loadEditPage(d), auth: true },
            {'label': 'Clone Query', 'class': 'far fa-clone', 'value': 'clone', 
                'action': d => this.loadClonePage(d), auth: true },
            {'label': d => d.isLocked ? 'Unlock Query' : 'Lock Query', 'class': d => d.isLocked ? 'fas fa-lock' : 'fas fa-unlock', 'value': 'lock',
                'action': (d) => this.lockQuery(d.id, !d.idLocked), auth: true},
            {'label': d => d.isPublished ? 'Unpublish Query' : 'Publish Query', 'class':  d => d.isPublished ? 'far fa-eye' : 'far fa-eye-slash', 'value': 'publish',
                'action': (d) => this.publishQuery(d.id, !d.isPublished), auth: true },
            {'label': 'Delete Query', 'class': 'far fa-trash-alt', 'value': 'delete',
                'action': d => this.deleteQuery(d), auth: true },
            {'label': 'Clear Query Cache', 'class': 'fas fa-broom', 'value': 'clear',
            'action': d => this.clearQueryCache(d) }]
    }

    loadViewPage(query) {
        location.href = LDViz.viewPage + query.id
    }

    loadEditPage(query) {
        location.href = LDViz.editPage + query.id
    }

    loadClonePage(query) {
        location.href = LDViz.clonePage + query.id
    }

    /// setters and getters
    getQueryValue(queryId, attribute) {
        const query = this.queriesList.filter(d => d.id == queryId)[0];
        return query[attribute]
    }

    updateQueries(queryId, attribute, value) {
        this.queriesList.forEach(d => {
            if (d.id == queryId) {
                d[attribute] = value;
            }
        })
        this.setQueryList()
    }

    /// --------------------------------------------------
    // methods to manage the visual aspect of the table

    setQueryList(search){


        let selectedEndpoints = this.filters.endpoints.filter(e => e.selected).map(e => e.label)
        let displayedQueries = this.queriesList.filter(d => selectedEndpoints.includes(d.uri))

        if (this.filters.published && !this.filters.unpublished)
            displayedQueries = displayedQueries.filter(d => d.isPublished)
        else if (!this.filters.published && this.filters.unpublished)
            displayedQueries = displayedQueries.filter(d => !d.isPublished)
        else if (!this.filters.published && !this.filters.unpublished)
            displayedQueries = []

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
        
        const itemOnMouseOver = function() { d3.select(this).style('background', '#e8f4f8') }
        const itemOnMouseOut = function() { d3.select(this).style('background', 'transparent') }

        ul.selectAll('li')
            .data(displayedQueries)
            .join(
                enter => enter.append('li')
                    .on('mouseover', itemOnMouseOver)
                    .on('mouseout', itemOnMouseOut)
                    .call(li => li.append('tspan')
                        .styles({
                            'display': 'inline-block',
                            'width': '78%',
                            'font-weight': d => this.existingQuery && this.existingQuery.id === d.id ? 'bold' : 'auto' })
                        .text(d => d.name)),
                update => update.call(li => li.select('tspan').text(d => d.name)),
                exit => exit.remove()
            )

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
                    LDViz.auth.login()
                    return
                }
            d.action(query)
        }

        ul.selectAll('li').selectAll('i')
            .data(this.queryIcons)
            .join(
                enter => enter.append('i')
                    .attr('class', iconClass)
                    .attr('data-tippy-content', iconTooltip)
                    .on('click', iconOnClick),
                update => update
                    .attr('class', iconClass)
                    .attr('data-tippy-content', iconTooltip)
                    .on('click', iconOnClick),
                exit => exit.remove()
            )
            
        
        // set a tooltip to each icon using tippy
        setIconsTooltip('.query-icon')
    }

    saveFilters() {
        window.sessionStorage.setItem('filters', JSON.stringify(this.filters))
    }

    setFilters(){

        let savedFilters = window.sessionStorage.filters ? JSON.parse(window.sessionStorage.filters) : null

        let endpoints = this.queriesList.map(d => d.uri)
        endpoints = endpoints.filter((d,i) => endpoints.indexOf(d) === i)

        const isSelected = d => {
            if (!savedFilters) return true
            let endpointInfo = savedFilters.endpoints.find(e => e.label === d)
            if (endpointInfo) return endpointInfo.selected
            return true
        }

        this.filters.endpoints = endpoints.map(d => ({ label: d, selected: isSelected(d)  }) )
        
        this.filters.published = savedFilters ? savedFilters.published : true
        this.filters.unpublished = savedFilters ? savedFilters.unpublished : true

        
        const self = this
        d3.select('#checkboxes')
            .selectAll('div')
            .data(this.filters.endpoints)
            .join(
                enter => enter.append('div')
                    .style('padding', '2px')
                    .call(div => div.append('input')
                        .attr('type', 'checkbox')
                        .style('float', 'left')
                        .style('margin-left', '3.5%')
                        .style('transform', 'scale(1.2)')
                        .property('checked', d => d.selected)
                        .on('change', function(d) {
                            self.filters.endpoints.forEach(e => { if (e.label === d.label) e.selected = this.checked })
                            self.setQueryList()
                            // LDViz.saveConfig('filters', self.filters)
                            self.saveFilters()
                        }) )
                    .call(div => div.append('label')
                        .style('position', 'relative')
                        .style('left', '30px')
                        .text(d => d.label)),
                update => update,
                exit => exit.remove()
            )

        // d3.select('input#checkbox_published')
        //     .property('checked', this.filters.published)
        //     .on('change', function() {
        //         self.filters.published = this.checked
        //         self.setQueryList()
        //         self.saveFilters()
        //     })
        // d3.select('input#checkbox_published_no')
        //     .property('checked', this.filters.unpublished)
        //     .on('change', function() {
        //         self.filters.unpublished = this.checked
        //         self.setQueryList()
        //         self.saveFilters()
        //     })
    }

    clearEndpointSelection() {
        d3.select('#checkboxes').selectAll('input').property('checked', false)

        this.filters.endpoints.forEach(e => e.selected = false )
        this.setQueryList()
        // LDViz.saveConfig('filters', self.filters)
        this.saveFilters()
    }

    selectAllEndpoints() {
        d3.select('#checkboxes').selectAll('input').property('checked', true)

        this.filters.endpoints.forEach(e => e.selected = true )
        this.setQueryList()
        // LDViz.saveConfig('filters', self.filters)
        this.saveFilters()
    }

    // ----------------------------------------------
    // methods to manage queries in the table

    newQuery(){
        if (LDViz.auth.isConnected()) 
            location.href = LDViz.newQueryPage;
        else {
            if ( confirm("Please login before proceeding!") ) LDViz.auth.login()
        }
    }


    processQuickPreview(queryObject) {
        console.log("queryObject = ", queryObject)
        // let url = LDViz.explorerPage +
        //     '?query=' + encodeURIComponent(queryObject.query) +
        //     '&url=' + queryObject.uri +
        //     '&name=' + (queryObject.name.length ? queryObject.name : 'No name provided') +
        //     '&email=' + LDViz.auth.user.email +
        //     '&password=' + LDViz.auth.user.password;

        // window.open(url)

        window.open(`${LDViz.explorerPage}?id=${queryObject.id}`)
        
        
        // LDViz.vis.showLoading(queryObject)
        // LDViz.query.tune(queryObject);
        // LDViz.query.sendRequest(queryObject);
    }

    /**
     * Publish a new query of type 'n'
     */
    saveQuery(form) {

        // Get form values
        const values = {
            'query': LDViz.query.getQueryData(form)
        }

        values.query.id = new Date().getTime();
        values.query.isLocked = true;
        values.query.isPublished = false;

        // Send request
        fetch(LDViz.saveRoute, {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(values)
        }).then(response => {
            location.href = LDViz.homePage;
        }).catch(error => {
            // console.log(error);
            alert(error)
        });
    }

    /**
     * Clear the cache of a query
     */
    clearQueryCache(query) {

        fetch(LDViz.cacheRoute, {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ query: query })
        }).then(response => {
            toast("Cache cleared!")
        }).catch(error => {
            // console.log(error);
            alert(error)
        });
    }

    publishQuery(queryId, value) {
        if (confirm(`Are you sure you want to ${(value ? 'PUBLISH' : 'UNPUBLISH')} the query ?`)) {
            let data = {
                isPublished: value,
                editType: 'isPublished',
                id: queryId
            }
            this.editOnServer(data)
        }
    }

    lockQuery(queryId, value){
        if (confirm(`Are you sure you want to ${(value ? 'LOCK' : 'UNLOCK')} the query ?`)) {
            let data = {
                isPublished: value,
                editType: 'isLocked',
                id: queryId
            }
            this.editOnServer(data)
        }
    }

    /**
     * Edit a query in the server
     * Asks for the user confirmation before making the request (edit published and locked status, or query content)
     * Redirect to the index when successful
     */
    editQuery(elem, query) { 

        if (confirm('Are you sure you want to SAVE your changes?')) {
            let values = {}
            values = LDViz.query.getQueryData(elem)
            values.isPublished = query.isPublished;
            values.isLocked = query.isLocked;
            values.editType = 'content';

            values.id = query.id || query;

            this.editOnServer(values)
        }
    }

    editOnServer(data) {
        fetch(LDViz.editRoute, {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(response => {
            if (data.editType == 'content')
                location.href = LDViz.homePage;
            else {
                this.updateQueries(data.id, data.editType, data[data.editType])
            }
        }).catch(error => {
            alert(error)
            // console.log(error);
        });
    }

    /**
     * Deletes a query from the query list
     * Asks for the user confirmation before sending the request
     * Reload the page when successful
     */
    deleteQuery(query) {
        if (query.isLocked) {
            alert('The query is locked. You cannot delete it!')
            return;
        }
        else if (confirm("You are about to delete the query from the list (and the main page if published)!\nDo you want to proceed?")) {

            // Send request
            fetch(LDViz.deleteRoute, {
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ id: query.id })
            }).then(response => {
                location.href = LDViz.homePage;
            }).catch(error => {
                alert(error)
                // console.log(error);
            });
        }
    }


}