function testGetQueryData() {
    document.querySelector('#form_queryTitle').value = "Test new query"
    document.querySelector('#form_sparqlEndpoint').value = "https://dbpedia.org/sparql"
    LDViz.editor.sparqlCodeMirror.setValue("$beginYear $endYear $lab1 $lab2 $country")
}

function getVizFormTestData() {
    let data = new DataViz()

    data.name = "MGExplorer"
    data.description = "MGExplorer is an information visualisation tool aimed at supporting the exploration of multivariate graphs through multiple chained and complementary views. MGExplorer allows users to choose and combine the information visualisation techniques creating a graph that describes the exploratory path of dataset. It is an application based on the D3.JS library, which is executable in a web browser."
    data.url = "https://dataviz.i3s.unice.fr/ldviz"
    data.params = {query: null, url: null}
    data.variables = [
        {name: "?label", description: "This variable serve to name the link between two nodes.", mandatory: "No"},
        {name: "?p", description: "It describes the link between two nodes", mandatory: "Yes"}
    ]
    data.queryTemplate = "select ?s ?p ?o ?label ?type ?date where { }"

    return data
}