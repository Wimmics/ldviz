class Results {

    constructor() {
        this.params = {}

        this.url = '/ldviz/results?'

        this.query = new Query()
    }

    async set(data) {
        let response = await this.query.sendRequest(data)
        let results = JSON.parse(response);
        this.writeResults(results, results[1] === 'html')
    }

    openPage(data) { 
        const url = this.url + "id=" + data.id +
            "&query=" + encodeURIComponent(data.query) + 
            "&params=" + encodeURIComponent(JSON.stringify(data.params)) +
            "&uri=" + data.uri 

        window.open(url)
    }

    writeResults(data, html){
        d3.selectAll('.loading').remove()
        if (html) {
            document.getElementById('json-renderer').style.display = 'none';
            const htmlRenderer = document.getElementById('html-renderer')
            htmlRenderer.innerHTML = data;
            let child = htmlRenderer.firstChild;
            while (child) {
                let sibling = child.nextSibling;
                if (child.nodeName != 'TABLE') child.remove()
                child = sibling;
            }
            document.querySelector('#export-results').onclick = () => exportTableToCSV('results.csv')
        }
        else {
            $('#json-renderer').jsonViewer(data)
            document.querySelector('#export-results').onclick = () => this.exportResults(data)
        }
    }

    exportSparqlQuery(query){
        download(query, 'sparql_query.rq')
    }

    exportResults(data){
        download(JSON.stringify(data, undefined, 4), 'results.json')
    }

    exportStylesheetContent(){
        download(document.getElementById('stylesheet').value, 'stylesheet.json')
    }
}