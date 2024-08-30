class LDViz{
    static init(locals){

        this.action = locals.action
        this.urlQuery = locals.queryParams

        this.locals = locals

        this.editor = new Editor(locals)

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

        this.editor.set()
        this.editor.displayQuery()
    }

    static displayNotification(content) {

        let toast = document.createElement('div')
        toast.innerHTML = `<div class="toast notification" role="alert" aria-live="assertive" aria-atomic="true">
                <div>${content}</div>
                <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
            </div>`

        toast.querySelector("button").addEventListener('click', function() {
            this.parentNode.remove()
        })

        setTimeout(() => toast.remove(), 10000)

        let container = document.querySelector("#notification-container")
        container.appendChild(toast)    
    }

}