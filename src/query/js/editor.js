class Editor{
    constructor(gss, params) {
        this.gss = gss;
        this.params = params;
    }

    setStylesheet() {
        d3.selectAll('#stylesheet')
            .text(JSON.stringify(this.gss, undefined, 4))
    }

    displayStylesheetInfo() {
        const helpText = document.getElementById('helpStylesheet')
        if (helpText.style.display == 'block')
            helpText.style.display = 'none';
        else helpText.style.display = 'block';
    }

    /**
     * Copies selected value of a list to the clipboard.

    * @param {element} selectTag   Tag 'select'.
    */
    copySelectValueToClipboard(selectTag) {
        copyToClipboard(selectTag.options[selectTag.selectedIndex].value);
    }

    copyPrefixesToClipboard() {
        let prefixes = getPrefixes()
        copyToClipboard(prefixes.join('\n'))
    }

    getVariableCode(label){
        const variable = this.params.sparqlKeywords.find(d => d.name == label)
        return variable ? variable.value : null;
    }

    getVariableLabel(code){
        const variable = this.params.sparqlKeywords.find(d => d.value == code)
        return variable ? variable.name : null;
    }

    // display the editor window with information regarding the selected query
    displayQuery(query, action) {
        const collapsibleButton = document.getElementById('query-button');
        collapsibleButton.style.display = 'block';

        if (action != 'newQuery') {

            document.getElementById('form_queryTitle').value = query.name;
            document.getElementById('form_sparqlQuery').value = query.query;
            document.getElementById('form_sparqlEndpoint').value = query.uri;

            if (query.stylesheet) {
                document.getElementById("withStylesheet").checked = query.stylesheetActive;
                document.getElementById('stylesheet').value = JSON.stringify(query.stylesheet, undefined, 4);
            } else {
                document.getElementById('stylesheet').value = JSON.stringify(this.gss, undefined, 4);
            }

            const params = query.params;

            document.getElementById('select_query_type').value = params ? params.type : 1;
            document.getElementById('input_lab1').value = params && params.lab ? params.lab[0] : "";
            document.getElementById('input_lab2').value = params && params.lab && params.lab.length > 1 ? params.lab[1] : "";
            document.getElementById('select_country').value = params ? params.country : "";
            document.getElementById('input_list').value = params && params.list_authors ? params.list_authors.map(d => d.replaceAll('"', '')).join(', ') : "";

            d3.selectAll("tr[id*='variable-']").remove()
            if (params && params.variables)
                params.variables.forEach(d => {
                    this.addVariable(this.getVariableLabel(d) || d)
                })

            if (params && params.prefixes)
                params.prefixes.forEach(d => {
                    this.addPrefix(d)
                })

            if (params && params.period) {
                document.getElementById('select_from_year').value = params.period[0];
                document.getElementById('select_to_year').value = params.period[1];
            }

            this.updateQueryOptions()
        }

        d3.selectAll('.edit_button').style('display', action == 'view' ? 'none' : 'block')

        const form = document.getElementById('query_form');
        if (['newQuery', 'clone'].includes(action)) {
            document.getElementById('save_button').value = 'Save Query'
            document.getElementById('save_button').onclick = () => LDViz.queryTable.saveQuery(form) 
        }

        if (action == 'clone') {
            document.getElementById('form_queryTitle').value = 'Copy of ' + query.name;
        } else if (action == 'edit') {
            document.getElementById('save_button').onclick = () => LDViz.queryTable.editQuery(form, query)
        } else if (action == 'newQuery') {
            d3.select('input#save_button').attr('value', 'Save Query');
        } else if (action == 'view') {
            const cancelButton = document.getElementById('cancel_button')
            cancelButton.style.display = 'block';
            cancelButton.value = 'Close Query View';
            cancelButton.onclick = () => location.href = LDViz.homePage
        }

        this.updateFormMaxHeight()
    }

    // update query options (lab, country, etc) according to the query type
    updateQueryOptions(){
        const queryType = +document.getElementById('select_query_type').value;
        switch(queryType) {
            case 1:
                document.getElementById('lab2_form').style.display = 'none';
                document.getElementById('country_form').style.display = 'none';
                document.getElementById('list_form').style.display = 'none';
                break;
            case 2:
                document.getElementById('lab2_form').style.display = 'table-row';
                document.getElementById('country_form').style.display = 'none';
                document.getElementById('list_form').style.display = 'none';
                break;
            case 3:
                document.getElementById('lab2_form').style.display = 'none';
                document.getElementById('country_form').style.display = 'table-row';
                document.getElementById('list_form').style.display = 'none';
                break;
            case 4:
                document.getElementById('lab1_form').style.display = 'table-row';
                document.getElementById('lab2_form').style.display = 'none';
                document.getElementById('country_form').style.display = 'none';
                document.getElementById('list_form').style.display = 'table-row';
                break;
        }
        this.updateFormMaxHeight()
    }

    setMetavariableCopy(){
        d3.select('#query_parameters').select('table').select('tbody').selectAll('i')
            .classed('query-icon', true)
            .attr('data-tippy-content', function() { 
                if (this.className.includes('plus') && this.className.includes('prefixes')) return 'Click here to include a new prefix to your query';
                else if (this.className.includes('copy-prefixes')) return 'Copy prefixes to clipboard';
                else if (this.className.includes('plus') && this.className.includes('entities')) return 'Click here to include a new Variable to your query' 
                else if (this.className.includes('info-circle'))
                    return `To use the custom variables below, include the corresponding metavariable in your query (get it by clicking on <i class="far fa-copy"></i> next to the variable name)` 
                else return 'Copy metavariable '+ getMetavariable(this) +' to clipboard'; 
            })
            .on('click', function() { copyToClipboard(getMetavariable(this)); }) // copy metavariable

        function getMetavariable(elt){
            const variable = elt.parentNode.firstChild.textContent;
            
            if (variable.includes('Institution 2')) {
                return '$lab2';
            }
            else if (variable.includes('Institution')) {
                return '$lab1'; // depends on the query type
            }else if (variable.includes('From')){
                return '$beginYear';
            }else if (variable.includes('To')){
                return '$endYear';
            }else if (variable.includes('Country')) {
                return '$country'
            } else if (variable.includes('List of Authors')) {
                return '$authorsList'
            }
        }
    }

    setEndpointsList(){
        d3.select('#list_endpoints')
            .selectAll('option')
            .data(this.params.endpoints)
            .enter()
                .append('option')
                .attr('value', d => d.url)
                .text(d => d.name)
    }

    setTimePeriodsList(){
        const currentYear = new Date().getFullYear();
        d3.select('#select_from_year')
            .selectAll('option')
            .data(d3.range(currentYear, 1900, -1))
            .enter()
                .append('option')
                .attr('value', d => d)
                .text(d => d)

        d3.select('#select_to_year')
            .selectAll('option')
            .data(d3.range(currentYear, 1900, -1))
            .enter()
                .append('option')
                .attr('value', d => d)
                .text(d => d)
                //.property('selected', d => d == currentYear)
    }

    setQueryTypesList() {
        d3.select('#select_query_type')
            .selectAll('option')
            .data(this.params.query_types)
            .enter()
                .append('option')
                .attr('value', d => d.value)
                .text(d => d.value + ' - ' + d.name)
    }

    setCountryList(){
        d3.select('#select_country')
            .selectAll('option')
            .data(this.params.countries)
            .enter()
                .append('option')
                .attr('value', d => d.name)
                .text(d => d.name)
    }

    setInstitutionList() {
        d3.selectAll("datalist[id*='laboratory']")
            .selectAll('option')
            .data(this.params.laboratories)
            .enter()
                .append('option')
                .attr('value', d => d.name)
                .text(d => d.name + ' (' + d.source + ')')
    }

    setVariablesList(){
        d3.select('#named_entities_list')
            .selectAll('option')
            .data(this.params.sparqlKeywords)
            .enter()
                .append('option')
                .attr('value', d => d.name)
                .text(d => d.name)
    }

    addVariable(value){
        const termId = d3.selectAll('input.named_entity').size() + 1;

        const table_tr = d3.select('tr#custom_variables')
            .append('tr')
            .attr('id', 'term'+termId)
            .append('td')

        table_tr.append('input')
            .style('width', '420px')
            .style('margin-top', '5px')
            .style('margin-left', '8px')
            .attr('list', "named_entities_list")
            .attr('class', 'named_entity')
            .attr('value', value || "")

        table_tr.append('i')
            .classed("fas fa-times", true)
            .style('margin-left', '5px')
            .on('click', function(){
                d3.select(this.parentNode.parentNode).remove()

                d3.select('tr#custom_variables')
                    .selectAll('tr')
                    .attr('id', (_, i) => 'term'+(i+1))
                    .selectAll('i.fa-copy')
                    .attr('data-tippy-content', function(d,i) {
                        const term = this.parentNode.parentNode.id;
                        return 'Copy Metavariable $' + term + ' to Clipboard'
                    })
                setIconsTooltip('.query-icon')
            })

        table_tr.append('i')
            .classed('far fa-copy query-icon', true)
            .style('margin-left', '5px')
            .attr('data-tippy-content', function(d,i) {
                const term = this.parentNode.parentNode.id;
                return 'Copy Metavariable $' + term + ' to Clipboard'
            })
            .on('click', function(){
                const term = this.parentNode.parentNode.id;
                copyToClipboard('$' + term)
            })
        
        setIconsTooltip('.query-icon')
        this.updateFormMaxHeight()
    }

    setPrefixesList(){
        d3.select('#prefixes_list')
            .selectAll('option')
            .data(this.params.prefixes)
            .enter()
                .append('option')
                .attr('value', d => d.value)
                .text(d => d.name + ' (' + d.id + ')')
    }

    addPrefix(value){
        const table_tr = d3.select('tr#prefixes')
            .append('tr')
            .append('td')

        table_tr.append('input')
            .style('width', '440px')
            .style('margin-top', '5px')
            .style('margin-left', '8px')
            .attr('list', "prefixes_list")
            .attr('class', 'prefix')
            .attr('value', value || "")

        table_tr.append('i')
            .classed("fas fa-times", true)
            .style('margin-left', '5px')
            .on('click', function(){
                d3.select(this.parentNode).remove()
            })

        this.updateFormMaxHeight()
    }

    updateFormMaxHeight(){
        const formDiv = document.getElementById('tab');
        formDiv.style.maxHeight = formDiv.scrollHeight + "px";
    }

    /**
     * Cancels changes and redirect on the index
     * Asks for the user confirmation before making the redirection
     */
    cancelChanges() {
        if (confirm("Are you sure that you want to DISCARD all changes?")) {
            location.href = LDViz.homePage;
        }
    }
}