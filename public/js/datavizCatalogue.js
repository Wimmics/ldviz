class DatavizCatalogue {
    constructor(locals) {
        this.dataviz = locals.dataviz // list of existing visualizations

        this.visForm = new VisRegistration()

        this.home = "/ldviz/dataviz"

        this.auth = new Auth()
    }

    set() {
        this.visForm.set()
        this.displayVisualizations()

        // testing viz form
        // let data = getVizFormTestData()
        // this.visForm.editContent(data)
    }

    displayVisualizations() {
        const cardsContainer = document.querySelector("#viz-container")

        this.dataviz.forEach(async (d,i) => {
            const dataviz = new DataViz(d)

            const card = document.createElement('div')
            card.classList.add('card')
            card.style.width = "600px"
            card.style.padding = "10px"


            const img = document.createElement('img')
            img.classList.add("card-img-top")
            img.src = dataviz.getImage()
            img.alt = "Illustrative image of visualization tool"

            card.appendChild(img)

            const cardBody = document.createElement("div")
            cardBody.classList.add("card-body")

            cardBody.innerHTML = `<h5 class="card-title">${dataviz.getName()}</h5>
                                <p class="card-text">${dataviz.getDescription()}</p>
                                <p>Available at <a href="${dataviz.getUrl()}">${dataviz.getUrl()}</a></p>`

            card.appendChild(cardBody)

            const accordion = document.createElement("div")
            accordion.id = `accordion${i}`
            accordion.innerHTML = `<div class="card">
                <div class="card-header" id="headingOne">
                    <h5 class="mb-0">
                        <button class="btn btn-link" data-toggle="collapse" data-target="#collapseQueryTemplate${i}" aria-expanded="true" aria-controls="collapseQueryTemplate${i}">
                            Query Template
                        </button>
                    </h5>
                </div>

                <div id="collapseQueryTemplate${i}" class="collapse" aria-labelledby="headingOne" data-parent="#accordion${i}">
                    <div class="card-body" >
                    <textarea readonly style="height: 200px; width: 530px;">${dataviz.getQueryTemplate()}</textarea>
                    </div>
                </div>

                <div class="card-header" id="headingTwo">
                    <h5 class="mb-0">
                        <button class="btn btn-link" data-toggle="collapse" data-target="#collapseVariables${i}" aria-expanded="true" aria-controls="collapseVariables${i}">
                            Input Variables
                        </button>
                    </h5>
                </div>

                <div id="collapseVariables${i}" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion${i}">
                    <div class="card-body" id="collapseVariablesBody">
                        
                    </div>
                </div>

                <div class="card-header" id="headingThree" style="display: none;">
                    <h5 class="mb-0">
                        <button class="btn btn-link" data-toggle="collapse" data-target="#collapseStylesheet${i}" aria-expanded="true" aria-controls="collapseStylesheet${i}">
                            Custom Visual Mapping
                        </button>
                    </h5>
                </div>

                <div id="collapseStylesheet${i}" class="collapse" aria-labelledby="headingThree" data-parent="#accordion${i}">
                    <div class="card-body" id="collapseStylesheetBody">
                        
                    </div>
                </div>
            </div>`

            card.appendChild(accordion)

            // Display variables and their meaning
            const tableContainer = document.createElement('div')
            tableContainer.classList.add("table-responsive")

            const table = document.createElement("table")
            table.classList.add("table")

            const thead = document.createElement("thead")
            thead.innerHTML = `<tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Mandatory</th>
            </tr>`

            table.appendChild(thead)

            const tbody = document.createElement("tbody")

            let variables = dataviz.getVariables()
            if (variables)
                variables.forEach(variable => {
                    const tr = document.createElement('tr')

                    Object.keys(variable).forEach(key => {
                        const td = document.createElement('td') 
                        td.textContent = variable[key]
                        tr.appendChild(td)    
                    })

                    tbody.appendChild(tr)
                })

            table.appendChild(tbody)

            accordion.querySelector("#collapseVariablesBody").appendChild(table)

            if (dataviz.hasStylesheet()) { // display stylesheet info
                accordion.querySelector("#headingThree").style.display = "block"

                const stylesheetBody = accordion.querySelector("#collapseStylesheetBody")

                const template = document.createElement("div")
                template.innerHTML = `<h5>Stylesheet Template</h5>
                <p>You can use the following template to customize the visualization through the Query Editor.</p>
                <textarea style="height: 200px; width: 530px;" readonly>${dataviz.getStylesheetTemplate()}</textarea>`

                const description = document.createElement('div')
                description.innerHTML = `<hr><h5>Usage</h5>
                <div style="white-space: pre-wrap;">${dataviz.getStylesheetDescription()}</div>`

                stylesheetBody.appendChild(template)
                stylesheetBody.appendChild(description)

            }

            // Access restrain, if the person connected does not have the rights to modify the visualizations
            if (await this.auth.isConnected()) {
            
                const hr = document.createElement("hr")
                card.appendChild(hr)

                const buttonEdit = document.createElement("button")
                buttonEdit.classList.add("btn")
                buttonEdit.classList.add("btn-secondary")
                buttonEdit.textContent = "Edit Content"

                buttonEdit.addEventListener('click', () => this.visForm.editContent(dataviz))

                const buttonDelete = document.createElement("button")
                buttonDelete.classList.add("btn")
                buttonDelete.classList.add("btn-danger")
                buttonDelete.textContent = "Delete"

                buttonDelete.addEventListener("click", () => this.deleteViz(dataviz.getID()))

                const buttonGroup = document.createElement("div")
                buttonGroup.classList.add('btn-group')
                buttonGroup.setAttribute("role", "group")
                buttonGroup.style.gap = "10px"
                buttonGroup.appendChild(buttonEdit)
                buttonGroup.appendChild(buttonDelete)

                card.appendChild(buttonGroup)
            }

            cardsContainer.appendChild(card)
        })

        
        
    }

    deleteViz(id) {

        if (confirm("Are you sure you want to delete this visualization? This action is permanent and cannot be undone.")) {
            let data = { id: id } // send the visualization id to delete it

            // Send request
            fetch("/ldviz/delete/dataviz", {
                method:'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(response => {
                location.href = this.home
            }).catch(error => {
                // console.log(error);
                alert(error)
            });
        }
    }


}