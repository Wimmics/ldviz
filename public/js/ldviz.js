class LDViz{
    static init(locals){
        
        this.action = locals.action
        this.urlQuery = locals.queryParams

        this.locals = locals

        this.queryTable = new QueryTable(locals.queries, locals.existingQuery, locals.dataviz)
        this.query = new Query(locals.queryParams, locals.params)
        this.editor = new Editor(locals.stylesheet, locals.params, locals.existingQuery, locals.dataviz)
        
        this.auth = new Auth(locals.user)
        this.auth.setLoginButton()

        this.results = new Results()
    }

    static displayResults() {
        let data = this.locals.queryData;

        d3.select('#titleDiv').select('h1')
                .text(' Results of your query')

        data.query = data.query.replace(/\\n/g, "\n").replace(/\\"/g, '\"')

        this.results.set(data)
    }

    static displayEditor() {
        this.auth.setLoginButton()

        this.editor.set()

        setTabAction(document.getElementById('form_sparqlQuery')) // for using tabs inside textarea
        
        if (this.action) {
            if (this.auth.user || this.action === "view")
                this.editor.displayQuery(this.action)
            else if (confirm('Please login to continue') ) 
                this.auth.login('editor', this.action, this.queryTable.existingQuery)
        } 
        
        document.getElementById('query_listDiv').style.display = 'block';
        
        this.queryTable.set()
    }

}