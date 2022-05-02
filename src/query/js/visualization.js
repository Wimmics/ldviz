class Visualization{
    constructor(){

    }

    showLoading(query){
        
        let visDiv = d3.select('div#visualisation_div')
        if (visDiv.size()) {
            visDiv.style('display', 'block')
            let p = visDiv.selectAll('p')
            if (p.size()) p.html(null)
        }

        let loadingInfo = query ? `Loading query "${query.name}"` : '';

        document.getElementById("viewArea").innerHTML = `${loadingInfo} <br><i class="fas fa-spinner fa-spin fa-2x loading"></i>`;
    }

    hideLoading() {
        const viewArea = document.getElementById("viewArea")
        if (viewArea) viewArea.innerHTML = null;
    }

    /* Display statistical information about the data being visualized */
    setRes(values, times, mtime) {

        document.getElementById('query-title').innerHTML = "<b>Query title: </b>" + values.name;

        document.getElementById("time1").innerHTML = "Time to fetch data: " + times.query_time + "s"
        document.getElementById("time2").innerHTML = "Time to transform data: " + times.trans_time + "s"
        document.getElementById("time3").innerHTML = "Time to render the visualization: " + mtime + "s";

        document.getElementById("res1").innerHTML = "Number of SPARQL query results: " + times.res_number;
        document.getElementById("res2").innerHTML = "Number of nodes: " + times.node_number;
        document.getElementById("res3").innerHTML = "Number of links: " + times.edge_number;

        // legend(values);
    }

    displayVis(data, query, stats) {
        let t1 = new Date()
        this.updateVisualizationSpace('block')
        this.graphicDisplay(data, query)

        let t2 = new Date()
        let mtime = parseInt(t2 - t1) / 1000
        this.setRes(query, stats, mtime)
    }

    // data is JSON format resulting from transformation, input dor MGExplorer
    // graphic display in ./MG-Explorer/MGExplorer/js/MGExplorer.js
    graphicDisplay(data, values, followupQuery) {
        const params = values.params,
            stylesheet = values.stylesheetActive ? values.stylesheet : null,
            fq = followupQuery || null,
            country = params.country || null,
            lab1 = params.lab ? params.lab[0] : null,
            lab2 = params.lab && params.lab.length > 1 ? params.lab[1] : null;
        
        launch(data, 
            // params.type, // type of query
            values.name,
            lab1, 
            lab2 || country, // according to query type
            stylesheet, // the stylesheet
            fq, // whether it is a follow-up query (not working)
            document.getElementById('viewArea')); // element where to draw the visualization
        
    }

    /*
        Display and hide the visualization space
    */
    updateVisualizationSpace(display){
        let visDiv = d3.select('div#visualisation_div')
        if (visDiv.size()) visDiv.style('display', display)

        document.getElementById('viewArea').innerHTML = null;
    }
}