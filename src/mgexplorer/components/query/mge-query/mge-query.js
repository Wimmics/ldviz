var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Element, Host, Prop, h, Method } from '@stencil/core';
import { select, selectAll } from 'd3-selection';
import { range } from "d3";
import state from "../../../store";
import Swal from 'sweetalert2';
let MgeQuery = class MgeQuery {
    constructor() {
        this.width = 350;
        this.height = 350;
        // @Prop() data: any;
        this.data = [];
        /** List of predifined queries */
        this.queriesList = null;
        /** Represents the panel associated with the graphic */
        this.globalParams = null;
        this.form = null;
        this.cloneStatus = { isClone: false, isFirstTime: false };
        this.isInitial = false;
        this.protocol = window.location.protocol + '//';
        this.hostname = window.location.host;
        this.href = location.href.split('/');
        this.page = this.href[3].split('?')[0];
        this._dashboard = document.querySelector("mge-dashboard");
    }
    /**
     * Set box size for the chart includes the content
     * input is a object includes height and width
     */
    async setBox(box) {
        select(this.element.querySelector(".query")).style("width", box.width + "px")
            .style("height", box.height + "px");
        select(this.element).attr("height", box.height).attr("width", box.width);
    }
    ;
    /**
     * With clone follow-up query, this function will be clone all of data from parent element
     * variable isFirstTime of cloneStatus of this element will be changed to false after cloning data
     */
    async setCloneData(query) {
        this.query = query;
        this.element.querySelector('#form_sparqlEndpoint').value = this.query.uri;
        this.element.querySelector('#form_sparqlEndpoint').dispatchEvent(new Event('change'));
        this.displayQuery(query);
        this.cloneStatus.isFirstTime = false;
    }
    /**
     * Set type of follow-up query to clone follow-up query
     * It will update value in cloneStatus of element
     */
    async setClone() {
        this.cloneStatus.isClone = true;
        this.cloneStatus.isFirstTime = true;
    }
    /**
     * With initial query, this function will be set variable isInitial to true
     * This way will help to distinguish the initial point or a follow-up query
     */
    async setInitial() {
        this.isInitial = true;
    }
    //---------------------
    /** This function is to set the data to the selected data from parent
    * If no arguments, It will return the value of data
    */
    async setData(_, oldData) {
        if (!arguments.length)
            return this.data;
        this.data = _;
    }
    /**
     * Create a toast notification to inform to users
     */
    async toast(message) {
        const options = {
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            type: "success",
            title: message
        };
        Swal.fire(options);
    }
    /**
     * Clone function will be call to create a new clone component
     * This function will be run after click clone button
     */
    async cloneQuery() {
        let cloneView = await this._view._showChart(this.data, this.element.id, state.typeChart.followupQuery);
        cloneView.node().componentOnReady().then(async () => {
            let chartNode = await cloneView.node().getChart();
            await chartNode.setClone();
            await chartNode.setCloneData(this.query);
        });
    }
    /**
     * Clear cache that stored from server
     */
    async clearQueryCache(queryid) {
        let values = {
            'id': queryid,
            'dataset': this.page
        };
        // Send request
        let url = this.protocol + this.hostname + "/clearcache";
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
        }).then(response => {
            this.toast("Cache cleared!");
        }).catch(error => {
            console.log(error);
        });
    }
    /**
     * Display a new visualization technique after get result from requested query
     * After convert format of recieved data, it will create a new component include chart to represent new data
     * New dataset will be stored to global variable
     */
    async graphicDisplay(data, values) {
        let selectedData = JSON.parse(data);
        selectedData.nodes.dataNodes.forEach(function (node) {
            node.idOrig = node.id;
        });
        state.indexQueryData += 1;
        state._data["data-" + state.indexQueryData] = selectedData;
        await this._view._showChart(selectedData, this.element.id, state.typeChart.nodeLinks, false, null, false, false, this.query);
    }
    /**
     * update query options (lab, country, etc) according to the query type
     */
    updateQueryOptions() {
        const queryType = +this.element.querySelector('#select_query_type').value;
        switch (queryType) {
            case 1:
                // document.getElementById('lab1_title').innerHTML = `Laboratory <i class="far fa-copy"></i>`;
                select(this.element.querySelector('#lab2_form')).style.display = 'none';
                select(this.element.querySelector('#country_form')).style.display = 'none';
                break;
            case 2:
                select(this.element.querySelector('#lab2_form')).style.display = 'table-row';
                select(this.element.querySelector('#country_form')).style.display = 'none';
                break;
            case 3:
                // select(this.element.querySelector('lab1_title')).innerHTML = `Laboratory <i class="far fa-copy"></i>`;
                select(this.element.querySelector('#lab2_form')).style.display = 'none';
                select(this.element.querySelector('#country_form')).style.display = 'table-row';
                break;
        }
        // this.updateFormMaxHeight()
    }
    /**
     * display the form with information regarding the selected query
     */
    displayQuery(query) {
        if (query) {
            this.enableButton();
            this.element.querySelector('#form_sparqlQuery').value = query.query.replace(/\\n/g, "\n").replace(/\\"/g, '\"');
            this.element.querySelector('#form_sparqlEndpoint').value = query.uri;
            this.element.querySelector('#form_query').value = query.id;
            this.element.querySelector('#select_query_type').value = query.params.type;
            let params = query.params;
            if (params.period) {
                select(this.element.querySelector('#period_form')).node().style.display = 'table-row';
                this.element.querySelector('#select_from_year').value = params.period[0];
                this.element.querySelector('#select_to_year').value = params.period[1];
            }
            else {
                select(this.element.querySelector('#period_form')).node().style.display = 'none';
            }
            if (params.lab && params.lab[0] && params.lab[0] !== '') {
                select(this.element.querySelector('#lab1_form')).node().style.display = 'table-row';
                this.element.querySelector('#input_lab1').value = params.lab[0];
            }
            else
                select(this.element.querySelector('#lab1_form')).node().style.display = 'none';
            if (params.lab && params.lab[1] && params.lab[1] !== '') {
                select(this.element.querySelector('#lab2_form')).node().style.display = 'table-row';
                this.element.querySelector('#input_lab2').value = params.lab[1];
            }
            else
                select(this.element.querySelector('#lab2_form')).node().style.display = 'none';
            if (params.country && params.country !== '') {
                select(this.element.querySelector('#country_form')).node().style.display = 'table-row';
                this.element.querySelector('#input_country').value = params.country;
            }
            else {
                select(this.element.querySelector('#country_form')).node().style.display = 'none';
            }
            this.updateQueryOptions();
        }
        else {
            this.disableButton();
            select(this.element.querySelector('#type_form')).node().style.display = 'none';
            select(this.element.querySelector('#params_title')).node().style.display = 'none';
            select(this.element.querySelector('#period_form')).node().style.display = 'none';
            select(this.element.querySelector('#lab1_form')).node().style.display = 'none';
            select(this.element.querySelector('#lab2_form')).node().style.display = 'none';
            select(this.element.querySelector('#country_form')).node().style.display = 'none';
        }
    }
    /**
     * Event function when change the endpoint from the endpoints list input
     * After change endpoint, the list of predefined query will be update follow the selected endpoint
     */
    changeEndpoint(event, value) {
        this.dataset = state.globalParams.endpoints.find(d => String(d.url) == value).id;
        select(this.element.querySelector('#form_query'))
            .selectAll('option').remove();
        select(this.element.querySelector('#form_query'))
            .selectAll('option')
            .data(state.queriesList.filter(d => d.uri == value))
            .enter()
            .append('option')
            .attr('value', d => d.id)
            .text((d, i) => { return 'Query ' + (i + 1) + '. ' + d.name; });
        if (!this.cloneStatus.isFirstTime) {
            select(this.element.querySelector('#form_query'))
                .append('option')
                .attr('value', "")
                .attr("disabled", true)
                .attr("hidden", true)
                .attr("selected", true)
                .text(" -- select a query -- ");
        }
        if (this.dataset == "hal") {
            select(this.element.querySelector('#select_query_type'))
                .selectAll('option').remove();
            select(this.element.querySelector('#select_query_type'))
                .selectAll('option')
                .data(state.globalParams.query_types)
                .enter()
                .append('option')
                .attr('value', d => d.value)
                .text(d => d.value + ' - ' + d.name);
        }
        else {
            select(this.element.querySelector('#select_query_type')).selectAll('option').remove();
        }
        if (!this.cloneStatus.isFirstTime)
            this.element.querySelector('#form_query').dispatchEvent(new Event('change'));
    }
    /**
     * Event function when change the predefined query from the predefined query list input
     * After changing query, the information regarding predefined query will be update on the form
     */
    changeQuery(event, value) {
        if (value == "")
            this.query = null;
        else
            this.query = state.queriesList.find(x => String(x.id) == value);
        this.displayQuery(this.query);
    }
    /**
     * Import list input of laboratory fields by laboratories data from defined input params.
     */
    initLabList() {
        if (state.globalParams !== null) {
            select(this.element.querySelector('#input_lab1'))
                .selectAll('option')
                .data(state.globalParams.laboratories)
                .enter()
                .append('option')
                .attr('value', d => d.name)
                .text(d => d.name + "(" + d.source + ")");
            select(this.element.querySelector('#input_lab1'))
                .append('option')
                .attr('value', '')
                .attr("disabled", true)
                .attr("hidden", true)
                .attr("selected", true)
                .text(" -- select a laboratory -- ");
            select(this.element.querySelector("#input_lab2"))
                .selectAll('option')
                .data(state.globalParams.laboratories)
                .enter()
                .append('option')
                .attr('value', d => d.name)
                .text(d => d.name + "(" + d.source + ")");
            select(this.element.querySelector('#input_lab2'))
                .append('option')
                .attr('value', '')
                .attr("disabled", true)
                .attr("hidden", true)
                .attr("selected", true)
                .text(" -- select a laboratory -- ");
        }
    }
    /**
     * Import list input of country field by countries data from defined input params.
     */
    initCountryList() {
        if (state.globalParams !== null) {
            select(this.element.querySelector('#input_country'))
                .selectAll('option')
                .data(state.globalParams.countries)
                .enter()
                .append('option')
                .attr('value', d => d.name)
                .text(d => d.name);
            // Add disabled option to endpoint input
            select(this.element.querySelector('#input_country'))
                .append('option')
                .attr('value', '')
                .attr("disabled", true)
                .attr("hidden", true)
                .attr("selected", true)
                .text(" -- select a country -- ");
        }
    }
    /**
     * Import list input of endpoint field by Endpoints data from defined input params that set in the begin
     */
    initEndpointsList() {
        if (state.globalParams !== null) {
            select(this.element.querySelector('#form_sparqlEndpoint'))
                .selectAll('option')
                .data(state.globalParams.endpoints)
                .enter(state.queriesList)
                .append('option')
                .attr('value', d => d.url)
                .text(d => d.name + "(" + d.url + ")");
            // Add disabled option to endpoint input
            select(this.element.querySelector('#form_sparqlEndpoint'))
                .append('option')
                .attr('value', "")
                .attr("disabled", true)
                .attr("hidden", true)
                .attr("selected", true)
                .text(" -- select an endpoint -- ");
            let globalThis = this;
            select(this.element.querySelector('#vis_query'))
                .selectAll('option')
                .data(Object.keys(state.typeChart))
                .enter()
                .append('option')
                .attr('value', d => d)
                .text(d => d);
            // Add disabled option to query input
            select(this.element.querySelector('#form_query'))
                .append('option')
                .attr('value', "")
                .attr("disabled", true)
                .attr("hidden", true)
                .attr("selected", true)
                .text(" -- select a query -- ");
            // Set onchange event to endpoint input
            select(this.element.querySelector('#form_sparqlEndpoint'))
                .on("change", function (event) { globalThis.changeEndpoint(event, this.value); });
            // Set onchange event to query input
            select(this.element.querySelector('#form_query'))
                .on("change", function (event) {
                globalThis.changeQuery(event, this.value);
            });
        }
    }
    /**
     * Update list input of period field
     */
    initPeriodList() {
        const currentYear = new Date().getFullYear();
        select(this.element.querySelector('#select_from_year'))
            .selectAll('option')
            .data(range(currentYear, 1900, -1))
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);
        select(this.element.querySelector('#select_to_year'))
            .selectAll('option')
            .data(range(currentYear, 1900, -1))
            .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d);
        //.property('selected', d => d == currentYear)
    }
    getMessage(values) {
        const params = values.params;
        let message = 'No results of co-publication found ';
        if (params.type == 2) {
            return message + " between " + params.lab[0] + " and " + params.lab[1] + " from " + params.period[0] + " to " + params.period[1] + ".";
        }
        else if (params.type == 3) {
            return message + " between " + params.lab[0] + " and " + params.country + " from " + params.period[0] + " to " + params.period[1] + ".";
        }
        else {
            if (params.lab)
                return message + " in " + params.lab[0] + " from " + params.period[0] + " to " + params.period[1] + ".";
            else
                return "No results found.";
        }
    }
    /**
      Receives the result from the query and proceed to visualization
    */
    getResult(text, values) {
        var result = null;
        try {
            result = JSON.parse(text);
            const sparqlResult = result[0];
            // the query returned html
            if (result[1] == 'html' || result.length == 1) {
                if (result[0].message)
                    window.alert(result[0].message);
                else if (result[0].results && result[0].results.bindings.length == 0)
                    window.alert("No results found for this query");
                else
                    window.alert(`Results cannot be visualized with MGExplorer.\nPlease check your query so that it contains the variables ?s ?p ?o.\nYou can also inspect the result set by clicking on "Export SPARQL Query Results"`);
            }
            else {
                var times = result[2];
                var t1 = new Date();
                if (sparqlResult.results.bindings.length > 0) {
                    this.graphicDisplay(JSON.stringify(result[1]), values);
                    if (!this.isInitial)
                        this.blockContent();
                }
                else {
                    window.alert(this.getMessage(values));
                }
            }
            this.hideLoading();
            this.enableButton();
        }
        catch (_a) {
            const vis_div = document.getElementById('visualisation_div');
            if (vis_div)
                vis_div.style.display = 'none';
            window.alert(text);
        }
    }
    /**
      *Get data from the form after user chose option for endpoint, query and custom variable
      *
    */
    getFormData(form) {
        const type = form['query_type'].value;
        const values = {
            'query': form['query_content'] ? form['query_content'].value : null,
            'name': form['query_name'] ? form['query_name'].value : null,
            'uri': form['query_endpoint'] ? form['query_endpoint'].value.trim() : null,
            'params': {
                "type": type,
                "prefixes": typeof this.query.params.prefixes !== "undefined" ? this.query.params.prefixes : null,
            }
        };
        values.params['period'] = [+form['from_year'].value, +form['to_year'].value];
        const lab1 = form['query_lab1'].value, lab2 = form['query_lab2'].value;
        if (type == 2 && lab1.length > 0 && lab2.length > 0) {
            values.params["lab"] = [lab1, lab2];
        }
        else if (lab1.length > 0) {
            values.params["lab"] = [lab1, null];
        }
        values.params["country"] = type == 3 && form['query_country'].value.length > 0 ? form['query_country'].value : null;
        if (!values.query) {
            alert("Please Fill the required fields");
            return null;
        }
        return values;
    }
    getFrenchName(country) {
        if (country == "France")
            return "France";
        if (country == "United Kingdom")
            return "Royaume-Uni";
        if (country == "United States")
            return "États-Unis";
        if (country == "Spain")
            return "Espagne";
        if (country == "Germany")
            return "Allemagne";
        if (country == "Italy")
            return "Italie";
        if (country == "Portugal")
            return "Portugal";
        if (country == "China")
            return "Chine";
        if (country == "Japan")
            return "Japon";
        if (country == "Vietnam")
            return "Vietnam";
        if (country == "Russia")
            return "Russie";
        if (country == "Brazil")
            return "Brésil";
        if (country == "Mexico")
            return "Mexique";
        if (country == "Morocco")
            return "Maroc";
        return "unknown";
    }
    /**
    * complete SPARQL query with data from HTML form such as year, lab, country
    */
    tune(data) {
        let params = data.params;
        const lab1Label = params.lab ? params.lab[0] : null;
        const lab2Label = params.lab && params.lab.length > 1 ? params.lab[1] : null;
        // const countryLabel = params.country ? params.country : null;
        Object.keys(params).forEach((p) => {
            // Replace metadata by selected value of corresponding list
            if (p == 'country' && params[p]) {
                // Parse country for Virtuoso
                data.query = data.query.replaceAll('$country', params[p]);
                data.query = data.query.replace(/countrye/, params[p].replace(/ /, "_"));
                data.query = data.query.replace(/countryf/, this.getFrenchName(params[p]));
            }
            else if (p == 'period') {
                data.query = data.query.replaceAll('$beginYear', params[p][0]);
                data.query = data.query.replaceAll('$endYear', params[p][1]);
            }
            else if (p == 'lab' && params.type == 2) {
                data.query = data.query.replaceAll('$lab1', params[p][0]);
                data.query = data.query.replaceAll('$lab2', params[p][1]);
            }
            else if (p == 'lab') {
                data.query = data.query.replaceAll('$lab1', params[p][0]);
            }
            else if (p == 'variables') {
                params[p].forEach((v, i) => {
                    data.query = data.query.replaceAll('$term' + (i + 1), v);
                });
            }
            else if (p == 'prefixes') {
                if (params[p] != null)
                    params[p].forEach(pre => {
                        data.query = pre + '\n' + data.query;
                    });
            }
        });
    }
    /**
     * Process the request query with selected query
     * The process includes complete SPARQL query path, send request to server and process result from server
     */
    processQuery(form) {
        let data;
        if (typeof form !== "undefined")
            data = this.getFormData(form);
        if (data.uri !== null && data.uri.length == 0) {
            alert('You must provide a SPARQL Endpoint!');
            return;
        }
        if (data.query !== null && data.query.trim().length == 0) {
            alert('You must provide a query!');
            return;
        }
        data["id"] = new Date().getTime();
        // selectedQuery = data.id;
        this.tune(data);
        this.sendRequest(data);
        this.query.params = data.params;
    }
    /**
      * This funtion will send the request to the server to get the data from completely SPARQL query
      *
    */
    async sendRequest(values) {
        const url = this.protocol + this.hostname + "/sparql"; // local server
        const data = {
            'query': values,
            'dataset': this.page
        };
        try {
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data)
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`${response.status}: ${response.statusText}`);
                }
                else {
                    return response.text();
                }
            }).then(text => {
                if (text.startsWith('Virtuoso')) {
                    // Syntax error message
                    window.alert(text);
                }
                else if (text.startsWith('<')) {
                    const html = new DOMParser().parseFromString(text, 'text/html').body.childNodes[0];
                    alert(html.textContent);
                }
                else {
                    this.getResult(text, values);
                }
            }).catch(error => {
                console.log(error);
                alert(error);
                this.hideLoading();
                this.enableButton();
            });
        }
        catch (_a) {
            error => console.log(error);
        }
    }
    /**
      * This function will disable all of input fields after clicking run button
      *
    */
    blockContent() {
        select(this.element.querySelector("#run")).node().style.display = "none";
        select(this.element.querySelector("#clear-cache")).node().style.display = "none";
        select(this.element.querySelector("#clone")).node().style.display = "block";
        selectAll(this.element.querySelectorAll("input")).attr("readonly", true);
        selectAll(this.element.querySelectorAll("select")).attr("disabled", true);
    }
    /**
      * This function to disable Run and clone button after get result from server
      *
    */
    disableButton() {
        select(this.element.querySelector("#run")).attr('disabled', true);
        select(this.element.querySelector("#clear-cache")).attr('disabled', true);
    }
    /**
      * This function to enable Run and clone button
      *
    */
    enableButton() {
        select(this.element.querySelector("#run")).attr('disabled', null);
        select(this.element.querySelector("#clear-cache")).attr('disabled', null);
    }
    showLoading() {
        select(this.element.querySelector('.loading')).node().style.display = "inline-block";
    }
    hideLoading() {
        select(this.element.querySelector('.loading')).node().style.display = "none";
    }
    /**
      * Build function to the form for interacting on the form
      *
    */
    buildForm() {
        this._view = this._dashboard.shadowRoot.querySelector("[id-view='" + this.element.id + "']");
        select(this.element.querySelector("#clone")).on("click", () => {
            this.cloneQuery();
        });
        select(this.element.querySelector("#clear-cache")).on("click", () => {
            this.clearQueryCache(this.query.id);
        });
        select(this.element.querySelector("#run")).on("click", () => {
            this.disableButton();
            this.showLoading();
            if (this.isInitial) {
                this._dashboard.resetDashboard();
            }
            this.processQuery(this.form);
        });
    }
    componentDidLoad() {
        let selectQuery = select(this.element.querySelectorAll(".query")[0])
            .style("width", this.width + "px")
            .style("height", this.height + "px")
            .style("overflow", "auto");
        this.form = this.element.querySelector("#query_form");
        this.initPeriodList();
        this.initLabList();
        this.initCountryList();
        this.initEndpointsList();
        this.buildForm();
    }
    render() {
        return (h(Host, null,
            h("div", { class: "query" },
                h("form", { name: 'query_form', id: 'query_form', class: "content" },
                    h("section", { id: 'query_parameters' },
                        h("table", { class: "form_section table", id: 'query-head' },
                            h("tr", null,
                                h("td", null, "SPARQL Endpoint * "),
                                h("td", null,
                                    h("select", { class: "table_cell", id: "form_sparqlEndpoint", name: "query_endpoint", style: { width: this.width * .6 + "px" } }))),
                            h("tr", null,
                                h("td", null, " Query * "),
                                h("td", null,
                                    h("select", { class: "table_cell", id: "form_query", name: "query_list", style: { width: this.width * .6 + "px" } }))),
                            h("tr", { id: 'params_title', style: { borderTop: "1px solid white !important", display: "none" } },
                                h("td", { colSpan: 3 }, "Custom query variables")),
                            h("tr", { id: "type_form", style: { display: "none" } },
                                h("td", null, "Query Type"),
                                h("td", null,
                                    h("input", { id: 'select_query_type', name: 'query_type', style: { width: "100%" } }))),
                            h("tr", { id: 'period_form', style: { "display": "none" } },
                                h("td", null, "Publication Period"),
                                h("td", null,
                                    "From",
                                    h("select", { id: 'select_from_year', name: 'from_year' })),
                                h("td", null,
                                    "To",
                                    h("select", { id: 'select_to_year', name: 'to_year' }))),
                            h("tr", { id: 'lab1_form', style: { "display": "none" } },
                                h("td", { id: 'lab1_title' }, "Institution"),
                                h("td", null,
                                    h("select", { id: 'input_lab1', name: 'query_lab1', style: { width: this.width * .6 + "px" } }),
                                    h("datalist", { id: 'select_laboratory1' }))),
                            h("tr", { id: 'lab2_form', style: { "display": "none" } },
                                h("td", null, "Institution 2 "),
                                h("td", null,
                                    h("select", { id: 'input_lab2', name: 'query_lab2', style: { width: this.width * .6 + "px" } }),
                                    h("datalist", { id: 'select_laboratory2' }))),
                            h("tr", { id: 'country_form', style: { "display": "none" } },
                                h("td", null, "Country "),
                                h("td", null,
                                    h("select", { id: 'input_country', name: 'query_country', style: { width: this.width * .6 + "px" } }))),
                            h("tr", { id: 'prefixes', style: { "display": "none" } },
                                h("datalist", { id: 'prefixes_list' })),
                            h("tr", null,
                                h("td", null, " Visualization technique * "),
                                h("td", null,
                                    h("select", { class: "table_cell", id: "vis_query", name: "vis_list", style: { width: this.width * .6 + "px" } }))))),
                    h("section", { class: "form_section" },
                        h("textarea", { id: "form_sparqlQuery", rows: 30, cols: 120, name: "query_content", style: { "display": "none" } }))),
                h("div", { style: { "position": "absolute", "bottom": "10px", "width": "100%" } },
                    h("table", { class: 'query_buttons', style: { "width": "100%" } },
                        h("tr", { style: { "width": "100%", "text-align": "right" } },
                            h("td", null,
                                h("i", { class: "fas fa-spinner fa-spin fa-2x loading", style: { display: "none" } }),
                                h("button", { type: 'button', class: "btn btn-outline-primary", id: 'run', disabled: true }, "Run"),
                                h("button", { type: 'button', class: "btn btn-outline-secondary", id: 'clone', style: { "display": "none" } }, "Clone"),
                                h("button", { type: 'button', class: "btn btn-outline-secondary", id: 'clear-cache', disabled: true }, "Clear cache"))))))));
    }
};
__decorate([
    Element()
], MgeQuery.prototype, "element", void 0);
__decorate([
    Prop()
], MgeQuery.prototype, "width", void 0);
__decorate([
    Prop()
], MgeQuery.prototype, "height", void 0);
__decorate([
    Prop()
], MgeQuery.prototype, "data", void 0);
__decorate([
    Prop({ mutable: true })
], MgeQuery.prototype, "queriesList", void 0);
__decorate([
    Prop({ mutable: true })
], MgeQuery.prototype, "globalParams", void 0);
__decorate([
    Prop({ mutable: true })
], MgeQuery.prototype, "form", void 0);
__decorate([
    Prop({ mutable: true })
], MgeQuery.prototype, "cloneStatus", void 0);
__decorate([
    Prop({ mutable: true })
], MgeQuery.prototype, "_dashboard", void 0);
__decorate([
    Prop({ mutable: true })
], MgeQuery.prototype, "_view", void 0);
__decorate([
    Prop({ mutable: true })
], MgeQuery.prototype, "query", void 0);
__decorate([
    Method()
], MgeQuery.prototype, "setBox", null);
__decorate([
    Method()
], MgeQuery.prototype, "setCloneData", null);
__decorate([
    Method()
], MgeQuery.prototype, "setClone", null);
__decorate([
    Method()
], MgeQuery.prototype, "setInitial", null);
__decorate([
    Method()
], MgeQuery.prototype, "setData", null);
__decorate([
    Method()
], MgeQuery.prototype, "toast", null);
__decorate([
    Method()
], MgeQuery.prototype, "cloneQuery", null);
MgeQuery = __decorate([
    Component({
        tag: 'mge-query',
        styleUrl: 'mge-query.css',
        shadow: false,
    })
], MgeQuery);
export { MgeQuery };
