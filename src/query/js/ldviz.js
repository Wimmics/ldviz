class LDViz{
    static init(locals){
        // this.protocol = window.location.protocol +'//';
        // this.hostname = window.location.host;
        this.action = locals.action
        this.urlQuery = locals.queryParams;

        this.homePage = '/ldviz/query'
        this.editPage = '/ldviz/query/edit?queryId='
        this.viewPage = '/ldviz/query/view?queryId='
        this.clonePage = '/ldviz/query/clone?queryId='
        this.resultsPage = '/ldviz/results?'
        this.newQueryPage = '/ldviz/query/newQuery'
        this.explorerPage = '/ldviz'

        this.deleteRoute = '/ldviz/delete'
        this.cacheRoute = "/ldviz/clearcache"
        this.saveRoute = "/ldviz/saveQuery"
        this.editRoute = "/ldviz/editQuery"
        this.sparqlRoute = "/ldviz/sparql"
        this.configRoute = '/ldviz/saveConfig'

        this.queryTable = new QueryTable(locals.queries, locals.existingQuery)
        this.query = new Query(locals.queryParams, locals.params)
        this.editor = new Editor(locals.stylesheet, locals.params)
        this.vis = new Visualization()
        this.results = new ResultsPage(locals.params)
        this.auth = new Auth(locals.user)
    }

    static setPage(){

        this.auth.setLoginButton()

        this.editor.setStylesheet()
        this.editor.setEndpointsList()
        this.editor.setCountryList()
        this.editor.setInstitutionList()
        this.editor.setTimePeriodsList()
        this.editor.setMetavariableCopy()
        this.editor.setPrefixesList()
        this.editor.setQueryTypesList()

        setTabAction(document.getElementById('form_sparqlQuery')) // for using tabs inside textarea
        
        if (this.action) {
            if (this.auth.user)
                this.editor.displayQuery(this.queryTable.existingQuery, this.action)
            else if (confirm('Please login to continue') ) 
                this.auth.login(this.action)
        } 
        
        if (this.urlQuery && this.urlQuery.query) {
            if (!this.auth.user && this.urlQuery.message) {
                alert(this.urlQuery.message)
            }

            if (this.auth.user) {
                const collapsibleButton = document.getElementById('query-button');
                collapsibleButton.style.display = 'block';

                document.forms['query_form'].query_content.value = this.urlQuery.query.replace(/\\n/g, "\n").replace(/\\"/g, '\"');
                if (this.urlQuery.url) document.getElementById('form_sparqlEndpoint').value = this.urlQuery.url;
                if (this.urlQuery.title) document.getElementById('form_queryTitle').value = this.urlQuery.title;

                this.query.processQuery(document.getElementById('query_form'))
                this.editor.updateFormMaxHeight()
            }
        } else {
            document.getElementById('query_listDiv').style.display = 'block';
            this.queryTable.setFilters()
            this.queryTable.setQueryList()
        }
    }

    /*
        Used to save config data of user, such as filters or queries
        ----- not being currently used ----------------------------
    */
    static saveConfig(type, data) { 
        if (!this.auth.user) {
            window.sessionStorage.setItem(type, JSON.stringify(data))
            return
        } 

        // Send request
        fetch(this.configRoute, {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ type: type, data: data })
        }).then(response => {
        }).catch(error => {
            console.log(error);
        });
    }
}