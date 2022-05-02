class ResultsPage {

    constructor(params) {
        this.params = params
    }

    open(type) { // query parameter is optional
        let queryData = arguments.length > 1 ? arguments[1] : undefined;  
        if (queryData === undefined) {
            queryData = LDViz.query.getQuery(document.getElementById('query_form'))
        }

        const args = "id=" + queryData.id +
            "&query=" + encodeURIComponent(queryData.query) + 
            "&uri=" + queryData.uri + 
            "&params=" + encodeURIComponent(queryData.params) +
            "&name=" + queryData.name;

        window.open(`${LDViz.resultsPage + args}&resultsType=${type}`)
    }

    async handleResults(data) {
        
        let result = null;
        if (this.params.type === 'transformed') { // transform results to MGExplorer if needed
            result = await transformData(data.results.bindings, 1, null)
        }
        
        this.params.resultData = this.params.type == 'sparql' ? data : result.mge;
        if (data.length == 1 && this.params.type != 'sparql') {
            d3.selectAll('.loading').remove()
            window.alert(`The result set could not be transformed to be visualized with MGExplorer. There is nothing to export!`)
        } else {
            this.writeResults(data[1] === 'html')
        }
    }

    writeResults(html){
        d3.selectAll('.loading').remove()
        if (html) {
            document.getElementById('json-renderer').style.display = 'none';
            const htmlRenderer = document.getElementById('html-renderer')
            htmlRenderer.innerHTML = this.params.resultData;
            let child = htmlRenderer.firstChild;
            while (child) {
                let sibling = child.nextSibling;
                if (child.nodeName != 'TABLE') child.remove()
                child = sibling;
            }
            document.getElementById('results-download').onclick = () => exportTableToCSV(this.params.type + '_results.csv')
        }
        else {
            $('#json-renderer').jsonViewer(this.params.resultData)
            document.getElementById('results-download').onclick = () => this.exportResults()
        }
    }

    exportSparqlQuery(){
        let data = LDViz.query.getQuery(document.getElementById('query_form'));
        download(data.query, 'sparql_query.rq')
    }

    exportResults(){
        download(JSON.stringify(this.params.resultData, undefined, 4), this.params.type + '_results.json')
    }

    exportStylesheetContent(){
        download(document.getElementById('stylesheet').value, 'stylesheet.json')
    }
}