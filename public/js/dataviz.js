class DataViz {
    constructor(obj) {
        
        this.id // unique identifier (hash code)
        this.url // link to the visualization tool
        this.params// a JSON object containing the query parameters
        this.name // a name for the visualization tool
        this.queryTemplate // (if required) a template for the query to launch the visualization
        this.image // illustrative image
        this.description // a description of the visualization tool
        this.variables // input variables of the visualization
        this.stylesheet
        this.tune // should ldviz replace the special values or send them as it is ?
        this.publishRoute // (if applicable) for saving queries in the visualization page

        if (obj)
            Object.assign(this, obj)
    }

    setPublishRoute(route) {
        this.publishRoute = route
    }

    getPublishRoute() {
        return this.publishRoute
    }

    setTune(value) {
        this.tune = value;
    }

    getTune() {
        return this.tune;
    }

    setStylesheet(stylesheet) {
        this.stylesheet = stylesheet
    }

    getStylesheet() {
        return this.stylesheet
    }

    setStylesheetTemplate(value) {
        this.stylesheet.template = value
    }

    getStylesheetTemplate() {
        return this.stylesheet.template
    }

    setStylesheetDescription(value) {
        this.stylesheet.description = value
    }

    getStylesheetDescription() {
        return this.stylesheet.description
    }

    hasStylesheet() {
        return this.getParamKeys().includes("stylesheet")
    }


    setParameters(params) {
        this.params = params
    }

    getParameters() {
        return this.params
    }

    getParamKeys() {
        return Object.keys(this.params)
    }

    getParamValue(key) {
        return this.params[key]
    }

    setParamValue(key, value) {
        if (!this.params[key])
            this.params[key] = {}
        
        this.params[key]['value'] = value 
    }

    getPopulatedUrl(){
        let queryString = ''
  
        Object.keys(this.params).forEach((key,i) => {
            if (!this.params[key]) return

            let value = this.params[key].value

            if (!value) return

            if (key === 'stylesheet')
                value = JSON.stringify(value)

            
            
            let param = this.params[key].alt || key

            if (param === 'value') // it is a list, so we create a variable for each
                value.forEach(d => {
                    queryString += i === 0 ? '?' : '&'
                    queryString += `value=${d}`
                })
            else {
                if (key !== 'endpoint')
                    value = encodeURIComponent(value)
                
                queryString += i === 0 ? '?' : '&'
                queryString += `${param}=${value}`
            }
        })
        
        return this.url + queryString
    }

    setID(id) {
        this.id = id
    }

    getID() {
        return this.id
    }

    setUrl(url) {
        this.url = url
    }

    getUrl() {
        return this.url
    }

    setName(name) {
        this.name = name
    }

    getName() {
        return this.name
    }

    setQueryTemplate(query) {
        this.queryTemplate = query
    }

    getQueryTemplate() {
        return this.queryTemplate
    }

    setDescription(desc) {
        this.description = desc
    }

    getDescription() {
        return this.description
    }

    setImage(image) {
        this.image = image
    }

    getImage() {
        return this.image
    }

    setVariables(variables) {
        this.variables = variables
    }

    getVariables() {
        return this.variables
    }



    

}