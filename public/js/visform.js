class VisRegistration {
    constructor() {
        this.params = {}
        this.form = document.querySelector("#vis-registration-form")

        this.routes = {
            writedata: "/ldviz/writedata/dataviz",
            editdata: "/ldviz/editdata/dataviz",
            images: "/ldviz/upload"
        }

        this.data;

        this.auth = new Auth()
    }

    async set() {

        // only authentified people can register new visualizations
        if (!await this.auth.isConnected()) 
            document.querySelector('#collapseVisButton').style.display = 'none'

        $('#collapseVisForm').on('shown.bs.collapse', function () {
            this.scrollIntoView({ behavior: "smooth" })
          })

        

        document.querySelector("#cancel").addEventListener("click", (e) => window.location.reload())

        document.querySelector("#save-server").addEventListener('click', (e) => {

            if (!this.form.checkValidity()) {
                e.preventDefault()
                e.stopPropagation()
            } else {
                this.write()
            }

            this.form.classList.add('was-validated')

        } )
        document.querySelector("#add-variable-button").addEventListener('click', (e) => this.addVariable())

        this.sparqlCodeMirror = CodeMirror.fromTextArea(document.querySelector("#viz-query-template"), {mode: "sparql"})

        this.setParametersList()
    }

    setParametersList() {
        let options = [
            {value: 'query', label: 'SPARQL Query'},
            {value: 'endpoint', label: 'SPARQL endpoint'},
            {value: 'value', label: "Starting value to launch the visualization. It uses the custom variables from the form."},
            {value: 'stylesheet', label: 'Visual mapping from SPARQL query to the visualization'}
        ]

        let item = d3.select("#query-param-list")
            .selectAll('div')
            .data(options)
            .enter()
                .append('div')
                .classed('dropdown-item', true)
                .style('width', '350px')

        item.append('a')
            .attr('href', '#')
            .text(d => d.value)
            .on('click', d => this.addParameterElement(d.value))
                    
        item.append('i')
            .classed("fas fa-info-circle", true)
            .attrs({
                'data-toggle': 'tooltip',
                'data-placement': 'right',
                'title': d => d.label
            })
            .style('margin-left', '10px')

        $(function () { $('[data-toggle="tooltip"]').tooltip({boundary : 'viewport'}) })
    }

    addParameter() {

        let value = document.querySelector("#input-query-param").value
        if (value.length) {
            this.addParameterElement(value)
            document.querySelector("#input-query-param").value = ""
        }
    }

    addParameterElement(value) {
        const _this = this;
        let valuesContainer = document.querySelector("#queryParameters") // div form-group

        const formRow = document.createElement("div")
        formRow.classList.add('form-row')
        formRow.classList.add('query-parameter')
        formRow.style.marginBottom = "10px"
        formRow.id = value

        const valueElement = document.createElement('div')
        valueElement.classList.add("selected")

        valueElement.innerHTML = `${value}
            <i class="fas fa-times query-icon" data-toggle="tooltip" data-placement="top" title="Delete" style="margin-left:5px;"></i>`

        valueElement.querySelector('.fa-times').addEventListener('click', function() {
            this.parentNode.remove()
            _this.removeParameter(value)
        })

        const inputContainer = document.createElement('div')
        inputContainer.classList.add('col-sm-2')
        inputContainer.innerHTML = `<input class="form-control" type="text" placeholder="Alternative name" />`

        formRow.appendChild(valueElement)
        formRow.appendChild(inputContainer)

        valuesContainer.appendChild(formRow)

        this.params[value] = null // creates a new key on the parameters object

        // activate the tooltips
        $(function () { $('[data-toggle="tooltip"]').tooltip() })

        this.updateUrlPreview()
    }

    removeParameter(value) {
        delete this.params[value]
        document.querySelector('.tooltip').remove()
        this.updateUrlPreview()
    }

    updateUrlPreview() {
        // update preview
        let queryString = this.form.querySelector("#viz-url").value
        Object.keys(this.params).forEach((key,i) => {
            queryString += i === 0 ? '?' : '&'
            queryString += `${key}=<value>`
        })

        document.querySelector("#url-preview").textContent = "URL Preview: " + queryString
    }

    addVariable() {

        let form = document.querySelector("#query-variables-form")

        const nameElement = form.querySelector('#variable-name')
        const descElement = form.querySelector('#variable-desc')
        const mandatoryCheck = form.querySelector("#mandatory-variable")

        let data = {
            name: nameElement.value,
            description: descElement.value,
            mandatory: mandatoryCheck.checked ? "Yes" : "No"
        }

        this.addTableRow(data)

        // reset form
        nameElement.value = ''
        descElement.value = ''
        mandatoryCheck.checked = false

    }

    addTableRow(data) {
        document.querySelector('#table-placeholder').style.display = 'none'

        let tbody = document.querySelector("#tbody-variables")
        const tr = document.createElement('tr')

        Object.keys(data).forEach(key => {
            const td = document.createElement('td')
            td.setAttribute("id", key)
            td.textContent = data[key]
            tr.appendChild(td)
        })

        const td = document.createElement('td')
        const button = document.createElement('button')
        button.classList.add('btn')
        button.classList.add('btn-danger')
        button.textContent = "Delete"

        button.addEventListener('click', function() {
            this.parentNode.parentNode.remove()

            if (tbody.querySelectorAll('tr').length === 1)
                document.querySelector('#table-placeholder').style.display = 'table-row'
        })

        td.appendChild(button)
        tr.appendChild(td)

        tbody.appendChild(tr)
    }

    editContent(dataviz) {
        $('#collapseVisForm').collapse('toggle')

        this.form.querySelector("#viz-name").value = dataviz.getName()
        this.form.querySelector("#viz-desc").value = dataviz.getDescription()
        this.form.querySelector("#viz-url").value = dataviz.getUrl()
        this.form.querySelector("#tune-url").checked = dataviz.getTune()
        this.form.querySelector("#api-route").value = dataviz.getPublishRoute()
        this.form.querySelector("#viz-stylesheet-template").value = dataviz.getStylesheetTemplate()
        this.form.querySelector("#viz-stylesheet-doc").value = dataviz.getStylesheetDescription()

        this.sparqlCodeMirror.setValue(dataviz.getQueryTemplate())

        let keys = dataviz.getParamKeys()
        if (keys)
            keys.forEach(key => {
                this.addParameterElement(key)
                let value = dataviz.getParamValue(key)

                if (!value) return

                // if there is an alternative name, add it to the input field
                let container = document.querySelector(`#${key}`)
                container.querySelector('input').value = value.alt

            })

        let variables = dataviz.getVariables()
        if (variables)
            variables.forEach(variable => {
                this.addTableRow(variable)
            })

        this.data = dataviz

    }


    async getData() {
        let data = new DataViz()

        data.setUrl(this.form['viz-url'].value)
        data.setName(this.form['viz-name'].value)
        data.setImage(this.getImagePath())
        data.setDescription(this.form["viz-desc"].value)
        data.setQueryTemplate(this.sparqlCodeMirror.getValue())
        data.setVariables(this.getQueryVariables())
        data.setStylesheet(this.getStylesheet())
        data.setTune(this.form['tune-url'].checked)
        data.setPublishRoute(this.form['api-route'].value)

        await this.checkParameters()
        data.setParameters(this.params)


        return data
    }

    getStylesheet() {
        return {
            template: this.form["viz-stylesheet-template"].value,
            description: this.form["viz-stylesheet-doc"].value
        }
    }

    async checkParameters() {
        let paramsContainer = document.querySelector("#queryParameters")

        Object.keys(this.params).forEach(p => {
            let div = paramsContainer.querySelector(`#${p}`)

            let alt = div.querySelector('input').value

            if (alt && alt.length)
                this.params[p] = { alt: alt }

        })
    }

    getQueryVariables() {
        let variables = []
        const tbody = document.querySelector("#tbody-variables")

        tbody.querySelectorAll("tr").forEach(tr => {

            if (tr.id === "table-placeholder") return
            let variable = {}

            for (let i = 0; i < 3; i++) {
                let td = tr.childNodes[i]
                variable[td.id] = td.textContent
            }

            variables.push(variable)
        })

        return variables
    }

    getImagePath() {
        const files = Array.from(document.querySelector("#viz-image").files)
        const fileArray = files.map(file => `/ldviz/images/dataviz/${file.name}`)
        return fileArray.length ? fileArray[0] : (this.data ? this.data.getImage() : null)
    }

    clear() {
        this.form.reset()

        this.sparqlCodeMirror.setValue('')
        this.data = null
        this.params = {}
    }

    async write() {
        // send information to the server


        await this.uploadImage()
        await this.uploadData()
    }

    async uploadData() {
        let data = await this.getData()

        if (!this.data)
            data.setID(stringToHash(`${data.getName()} ${data.getUrl()}`))
        else {
            data.editType = 'content' // for the sake of sharing methods with the query editor
            data.setID(this.data.getID())
        }

        let route = this.data ? this.routes.editdata : this.routes.writedata

        // Send request
        fetch(route, {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        }).then(response => {
            this.clear()
        }).catch(error => {
            // console.log(error);
            alert(error)
        });
    }

    async uploadImage() {
        let fileInput = document.querySelector("#viz-image")
        let image = fileInput.files[0]

        if (!image) return

        var formdata = new FormData();

        formdata.append('image', image)

        fetch(this.routes.images, {
            method:'POST',
            // headers: {'Content-Type': 'multipart/form-data'},
            body: formdata,
        }).then(response => {

        }).catch(error => {
            // console.log(error);
            alert(error)
        });
    }


}