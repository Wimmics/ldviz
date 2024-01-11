import { Component, Element, Host, Prop, h, Method, Watch} from '@stencil/core';
import  { select, selectAll } from 'd3-selection'
import {range} from "d3"
import state from "../../../store"

import { processQuery, clearQueryCache, requestFile } from '../../../../lib/query-helper.js'


@Component({
  tag: 'mge-query',
  styleUrl: 'mge-query.css',
  shadow: false,
})
export class MgeQuery {

@Element() element: HTMLElement;
  @Prop() width: number = 350;
  @Prop() height: number = 350;

  // @Prop() data: any;

  @Prop() data=[];
  /** List of predifined queries */
  @Prop({ mutable: true }) queriesList=null;
  /** Represents the panel associated with the graphic */
  @Prop({ mutable: true }) globalParams = null;
  @Prop({ mutable: true }) form=null
  
  @Prop({ mutable: true }) cloneStatus= {isClone: false, isFirstTime: false};
  private isInitial: boolean = false;

  /** represents the current dashboard */
  @Prop({ mutable: true }) _dashboard;
  /** represents the view includes this follow-up query*/
  @Prop({ mutable: true }) _view;
  private dataset;
  /** represents the current selected query */
  @Prop({ mutable: true }) query;

  private _indexDataset;

  constructor(){
    this._dashboard = document.querySelector("mge-dashboard")
    
    this._indexDataset = 0
  }
  /**
   * Set box size for the chart includes the content
   * input is a object includes height and width
   */
  @Method()
    async setBox (box) {
      select(this.element.querySelector(".query")).style("width", box.width + "px")
                                                  .style("height", box.height + "px");
      select(this.element).attr("height", box.height).attr("width", box.width)
    };

  /**
   * With clone follow-up query, this function will be clone all of data from parent element
   * variable isFirstTime of cloneStatus of this element will be changed to false after cloning data
   */
  @Method()
  async setCloneData(query){
    this.query = query;
    (this.element.querySelector('#form_sparqlEndpoint')as HTMLInputElement).value = this.query.uri;
    (this.element.querySelector('#form_sparqlEndpoint') as HTMLInputElement).dispatchEvent(new Event('change'));
    this.displayQuery(query);
    this.cloneStatus.isFirstTime = false
  }

  /**
   * Set type of follow-up query to clone follow-up query
   * It will update value in cloneStatus of element
   */
  @Method()
  async setClone(){
    this.cloneStatus.isClone = true
    this.cloneStatus.isFirstTime = true
  }

  /**
   * With initial query, this function will be set variable isInitial to true
   * This way will help to distinguish the initial point or a follow-up query
   */
  @Method()
  async setInitial(){
    this.isInitial = true
  }

  //---------------------
    /** This function is to set the data to the selected data from parent 
    * If no arguments, It will return the value of data
    */
  @Method()
  async setData(_, oldData){
    if (!arguments.length)
            return this.data;
    this.data = _
  }


  /**
   * Clone function will be call to create a new clone component
   * This function will be run after click clone button
   */
  @Method()
  async  cloneQuery(){
    let cloneView = await this._view._showChart(this.data, this.element.id, state.views.query)
    cloneView.node().componentOnReady().then(async () => {
          let chartNode = await cloneView.node().getChart();
          await chartNode.setClone();
          await chartNode.setCloneData(this.query);})

  }

  /**
   * display the form with information regarding the selected query
   */
  displayQuery(query) {
    
      if (query){
        this.enableButton();
        (this.element.querySelector('#form_sparqlQuery')as HTMLInputElement).value = query.query.replace(/\\n/g, "\n").replace(/\\"/g, '\"');
        (this.element.querySelector('#form_sparqlEndpoint')as HTMLInputElement).value = query.uri;
        (this.element.querySelector('#form_query')as HTMLInputElement).value = query.id;
        (this.element.querySelector('#select_query_type') as HTMLInputElement).value = query.params.type;

        if (query.stylesheet) {
          select(this.element.querySelector('#stylesheet_form')).node().style.display = 'table-row';
          (this.element.querySelector('#input_stylesheet') as HTMLInputElement).checked = query.stylesheetActive;
          (this.element.querySelector('#value_stylesheet') as HTMLInputElement).value = JSON.stringify(query.stylesheet);
        }

        let params = query.params;
        if (params.period && (query.query.includes('$beginYear') || query.query.includes('$endYear'))) {
          select(this.element.querySelector('#period_form')).node().style.display = 'table-row';
          if (query.query.includes('$beginYear')) 
            (this.element.querySelector('#select_from_year') as HTMLInputElement).value = params.period[0];
          if (query.query.includes('$endYear'))
            (this.element.querySelector('#select_to_year') as HTMLInputElement).value = params.period[1];
        }
        else
        {
          select(this.element.querySelector('#period_form')).node().style.display = 'none';
        }

        if (params.lab && params.lab[0] && params.lab[0] !== '' && query.query.includes('$lab1')) {
          select(this.element.querySelector('#lab1_form')).node().style.display = 'table-row';
          (this.element.querySelector('#input_lab1') as HTMLInputElement).value = params.lab[0]
        }
        else select(this.element.querySelector('#lab1_form')).node().style.display = 'none';

        if (params.lab && params.lab[1] && params.lab[1] !== '' && query.query.includes('$lab2')) {
          select(this.element.querySelector('#lab2_form')).node().style.display = 'table-row';
          (this.element.querySelector('#input_lab2') as HTMLInputElement).value = params.lab[1]
        }
        else select(this.element.querySelector('#lab2_form')).node().style.display = 'none';

        if (params.country && params.country !== '' && query.query.includes('$country')) {
          select(this.element.querySelector('#country_form')).node().style.display = 'table-row';
          (this.element.querySelector('#input_country') as HTMLInputElement).value = params.country;
        }
        else
        {
          select(this.element.querySelector('#country_form')).node().style.display = 'none';
        }

        if (params.variables && params.variables.length && query.query.includes('$term')) {
          
          select(this.element.querySelector('#custom_value1')).node().style.display = 'table-row'
          select(this.element.querySelector('#input_value1')).node().value = params.variables[0]
          
          if (params.variables.length > 1) {
            select(this.element.querySelector('#custom_value2')).node().style.display = 'table-row'
            select(this.element.querySelector('#input_value2')).node().value = params.variables[1]
          } else if (params.variables.length === 1) {
            select(this.element.querySelector('#custom_value2')).node().style.display = 'none'
          }
        } else {
          select(this.element.querySelector('#custom_value1')).node().style.display = 'none'
          select(this.element.querySelector('#custom_value2')).node().style.display = 'none'
        }

      } else {
          this.disableButton()
          select(this.element.querySelector('#type_form')).node().style.display = 'none';
          select(this.element.querySelector('#custom_value1')).node().style.display = 'none'
          select(this.element.querySelector('#custom_value2')).node().style.display = 'none'                                                                                                                                                      
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

      
      select(this.element.querySelector('#form_query'))
        .property('disabled', false)
        .selectAll('option').remove()

      select(this.element.querySelector('#form_query'))
        .selectAll('option')
        .data(state.queriesList.filter(d => d.uri == value))
        .enter()
            .append('option')
            .attr('value', d => d.id)
            .text((d, i) => { return 'Query ' + (i+1) + '. ' + d.name})

      if (!this.cloneStatus.isFirstTime){
        select(this.element.querySelector('#form_query'))
          .append('option')
          .attr('value', "")
          .attr("disabled", true)
          .attr("hidden", true)
          .attr("selected", true)
          .text("Select a query")
      }
      
      select(this.element.querySelector('#select_query_type')).selectAll('option').remove()
      
      if (!this.cloneStatus.isFirstTime)
        (this.element.querySelector('#form_query') as HTMLInputElement).dispatchEvent(new Event('change'));
  }

  changeQuery() {
    let sel = select(this.element.querySelector('#form_query')).node()
    let value = sel.options[sel.selectedIndex].value
    this.query = value.length ?  state.queriesList.find(x => String(x.id) == value) : null;
    this.displayQuery(this.query)
  }

  changeDataset(){
    let value = select(this.element.querySelector('#form_datasets')).node().value
    this.query = select(this.element.querySelector("#list_datasets")).selectAll('option').filter(function() { return this.text === value }).datum()
    this.enableButton();
  }

  /**
   * Import list input of laboratory fields by laboratories data from defined input params.
   */
  initLabList(){
    if (state.globalParams !== null){
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
          .text("Select an institution");


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
          .text("Select an institution")

    }
  }
  /**
   * Import list input of country field by countries data from defined input params. 
   */
  initCountryList(){
    if (state.globalParams !== null){
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
          .text("Select a country");
    }
  }

  defaultOption(id, text) {
    select(this.element.querySelector(id))
      .append('option')
      .attr('value', "")
      .attr("disabled", true)
      .attr("hidden", true)
      .attr("selected", true)
      .text(text)
  }

  /**
   * Import list input of endpoint field by Endpoints data from defined input params that set in the begin 
   */
  initEndpointsList(){
    if (state.globalParams !== null){
      let endpoints = state.queriesList.map(d => d.uri)
      endpoints = endpoints.filter((d,i) => endpoints.indexOf(d) === i)

      select(this.element.querySelector('#list_endpoints'))
      .selectAll('option')
      .data(endpoints)
      .enter()
          .append('option')
          .attr('value', d => d)
          .text(d => d)

      let globalThis = this;
      
      // Set onchange event to endpoint input
      select(this.element.querySelector('#form_sparqlEndpoint'))
        .on("change", function(event) { globalThis.changeEndpoint(event, this.value)})

      // // Set onchange event to query input
      // select(this.element.querySelector('#form_query'))
      //     .on("change", function(event) { globalThis.changeQuery(event, this.value); })

   } 
  }

  initVisList() {
    select(this.element.querySelector('#vis_query'))
      .selectAll('option')
      .data(Object.keys(state.views).filter(d => !['query', 'history', 'annotation'].includes(d) ).map(key => state.views[key].title))
      .enter()
          .append('option')
          .attr('value', d => d)
          .text(d => d)
  }

  async initDatasetsList() {
    let data = await fetch(`/ldviz/apps/${state._app}/filenames`, { method: 'GET' })
      .then(async function(response){
          if(response.status >= 200 && response.status < 300){
              return await response.text().then(text => {
                  return JSON.parse(text);
              })}
          else return response
      })

    data.sort( (a,b) => a.name.localeCompare(b.name));

    select(this.element.querySelector("#list_datasets"))
      .selectAll('option')
      .data(data)
      .enter()
      .append('option')
      .text(d => {
        let value = d.filename.split('.')[0].replace(new RegExp(d.idHal, "g"), '').replace(/-/g, ' ')
        value.charAt(0).toUpperCase() + value.slice(1);
        return d.name + ': ' + value;
      })

    select(this.element.querySelector("#form_datasets"))
      .on("change", () => this.changeDataset())
  }

  /**
   * Update list input of period field
   */
  initPeriodList(){
    const currentYear = new Date().getFullYear();
    select(this.element.querySelector('#select_from_year'))
        .selectAll('option')
        .data(range(currentYear, 1900, -1))
        .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d)

    select(this.element.querySelector('#select_to_year'))
        .selectAll('option')
        .data(range(currentYear, 1900, -1))
        .enter()
            .append('option')
            .attr('value', d => d)
            .text(d => d)
  }

  setDatalistInteraction(id) {
    select(this.element.querySelector(id))
      .on('click', function() {
        select(this).attr('placeholder', this.value)
        this.value = '';
      })
      .on('mouseleave', function() {
        if (!this.value.length) {
          this.value = this.placeholder;
        }
      })
  }

  /**
    * This function will disable all of input fields after clicking run button
    * 
  */
  blockContent(){
    select(this.element.querySelector("#run")).node().style.display = "none";
    select(this.element.querySelector("#clear-cache")).node().style.display = "none";
    select(this.element.querySelector("#clone")).node().style.display = "inline-block";
    selectAll(this.element.querySelectorAll("input")).attr("readonly", true);
    selectAll(this.element.querySelectorAll("select")).attr("disabled", true);
  }

  /**
    * This function to disable Run and clone button after get result from server
    * 
  */
  disableButton(){
    select(this.element.querySelector("#run")).attr('disabled', true);
    select(this.element.querySelector("#clear-cache")).attr('disabled', true);
    
  }

  /**
    * This function to enable Run and clone button
    * 
  */
  enableButton(){
    select(this.element.querySelector("#run")).attr('disabled', null);
    select(this.element.querySelector("#clear-cache")).attr('disabled', null);
  }

  showLoading(){
    select(this.element.querySelector('.loading')).node().style.display = "inline-block"
  }

  hideLoading(){
    select(this.element.querySelector('.loading')).node().style.display = "none"
  }

  /**
   * An offline version was created to visualize data that do not come from a SPARQL endpoint
   * For now, it is applied to HAL data, which was used in the HCERES evaluation 2023
   * to-do: generalize this functionality to use with any kind of data
   */
  async setOfflineMode() {
      select(this.element.querySelector("#filename")).style('display', 'block')
      select(this.element.querySelector("#sparql_endpoint")).style('display', 'none')
      select(this.element.querySelector("#sparql_query")).style('display', 'none')
  }

  /**
    * Build function to the form for interacting on the form
    * 
  */
  buildForm(){

    if (state._static) this.setOfflineMode()

    this._view = this._dashboard.shadowRoot.querySelector("[id-view='" + this.element.id + "']")
    select(this.element.querySelector("#clone")).on("click", () => this.cloneQuery() )

    select(this.element.querySelector("#clear-cache")).on("click", () => clearQueryCache(this.form, this.query) )

    select(this.element.querySelector("#run")).on("click", () => {
      this.disableButton();
      this.showLoading();
      if (this.isInitial){
          let chartElements = this._dashboard.shadowRoot.querySelectorAll("[id-view^='chart']")
          if (chartElements.length > 2) {
            if (confirm('This action will delete all views. Are you sure you want to proceed?')) {
              this._dashboard.resetDashboard();
            }
          }
          
      }
      
      this._indexDataset = Object.keys(state._data).length

      if (state._static) {
        requestFile(this.query, this._indexDataset)
      } else {
        state._queries["data-"+this._indexDataset] = this.query
      
        processQuery(this.form, this.query, this._indexDataset) // sending the query to recover prefixes 
      }
      this.displayGraphics()  
    })
  }

  @Method()
  async displayGraphics(){
    let key = 'data-' + this._indexDataset;
    let data = state._data[key]
    if (typeof data !== "undefined") {
        
        this.hideLoading()
        if (data.message) { 
          alert(data.response || data.message)
        } else {
          // to-do: change the datasetName in the view
          await this._view.setDatasetName(key)
          await this._view._showChart(data, this.element.id, state.views.nodelink, false, null, false, false)
        }

        this.enableButton()
        if (!this.isInitial)
            this.blockContent()
    }
    else{
        setTimeout(d => this.displayGraphics(), 250);
    }
  }

  componentDidLoad(){
      select(this.element.querySelectorAll(".query")[0])
                .style("width", this.width + "px")
                .style("height", this.height + "px")
                .style("overflow", "auto");
      this.form = this.element.querySelector("#query_form");
      this.defaultOption('#form_query', 'Select a query')
      this.setDatalistInteraction('#form_sparqlEndpoint')
      this.setDatalistInteraction("#form_datasets")

      this.initPeriodList();
      this.initLabList();
      this.initCountryList();
      this.initEndpointsList();
      if (state._app) this.initDatasetsList();
      this.buildForm();
  }

  render() {
    return (
      <Host>
        <div class="query">
        <form name='query_form' id='query_form' class="content">
            <section id='query_parameters'>
            <table class="form_section table" id='query-head'>
                <tr id="sparql_endpoint" >
                    <td >SPARQL Endpoint * </td>
                    <td>
                        <input class="table_cell" id="form_sparqlEndpoint" list="list_endpoints" name="query_endpoint" style={{width: this.width * 0.65 + "px", "margin-left": "5px"}} placeholder="Select a SPARQL Endpoint"></input>
                        <datalist id="list_endpoints"></datalist> 
                  
                    </td>
                </tr>
                <tr id="sparql_query">
                    <td > Query * </td>
                    <td >
                        <select class="table_cell" id="form_query" name="query_list" disabled 
                          style={{width: this.width * 0.65 + "px"}} 
                          onChange={(event) => this.changeQuery()} />
                    </td>
                </tr>

                <tr id="filename" style={{display: "none"}}>
                    <td > Dataset * </td>
                    <td >
                        <input class="table_cell" id="form_datasets" list="list_datasets" name="datasets" style={{width: this.width * 0.65 + "px", "margin-left": "5px"}} placeholder="Select a Dataset"></input>
                        <datalist id="list_datasets"></datalist> 
                    </td>
                </tr>

                <tr id='custom_value1' style={{display: "none"}}>
                    <td>Concept 1</td>
                    <input id='input_value1' name='custom_value1' style={{width: this.width * 0.65 + "px", left: "6px"}}></input>
                </tr>

                <tr id='custom_value2' style={{display: "none"}}>
                    <td>Concept 2</td>
                    <input id='input_value2' name='custom_value2' style={{width: this.width * 0.65 + "px", left: "6px"}}></input>
                </tr>

                <tr id="type_form" style={{display:"none"}}>
                    <td>Query Type</td><td >
                        <input id='select_query_type' name='query_type'style={{width: "100%"}}></input>
                    </td>
                </tr>

                <tr id='period_form' style={{"display":"none"}}>
                    <td>Period</td>
                    <td>From
                        <select id='select_from_year' name='from_year'></select>
                    </td>
                    <td>To
                        <select id='select_to_year' name='to_year'></select>
                    </td>
                </tr>
                <tr id='lab1_form' style={{"display":"none"}}>
                    <td id='lab1_title'>Institution</td><td>
                        {/*<input id='input_lab1' name='query_lab1' list='select_laboratory1'/>*/}
                        <select id='input_lab1' name='query_lab1' style={{width: this.width * 0.65 + "px"}}/>
                        <datalist id='select_laboratory1'></datalist>
                    </td>
                </tr>
                <tr id='lab2_form' style={{"display":"none"}}>
                    <td>Institution 2 </td><td>
                        {/*<input id='input_lab2' name='query_lab2' list='select_laboratory2'/>*/}
                        <select id='input_lab2' name='query_lab2' style={{width: this.width * 0.65 + "px"}}/>
                        <datalist id='select_laboratory2'></datalist>
                    </td>
                </tr>
                <tr id='country_form' style={{"display":"none"}}>
                    <td>Country </td><td>
                        <select id='input_country' name='query_country' style={{width: this.width * 0.65 + "px"}}/>
                        {/*<datalist id='select_country' ></datalist>*/}
                    </td>
                </tr>

                <tr id='stylesheet_form' style={{"display":"none"}}>
                  <td>Use Stylesheet </td>
                  <input type='checkbox' id='input_stylesheet' name='check_stylesheet'></input>
                  <textarea id='value_stylesheet' name='stylesheet_content' style={{"display":"none"}}></textarea>
                </tr>

                <tr id='prefixes' style={{"display":"none"}}>
                    <datalist id='prefixes_list'></datalist>
                </tr>

                {/* <tr> // to-do: include it when the visual mapping is ready
                    <td > Visualization technique * </td>
                    <td >
                        <select class="table_cell" id="vis_query" name="vis_list" style={{width: this.width * 0.65 + "px"}} />
                    </td>
                </tr> */}
            </table>
        </section>
            <section class="form_section" >
                <textarea id="form_sparqlQuery"  rows={30} cols={120} name="query_content"
                    style={{"display":"none"}} >         
                </textarea>
            </section>
        </form>
        <div style={{"position":"absolute", "bottom":"10px", "width": "100%"}}>
                <table class='query_buttons' style={{"width": "100%"}}>
                    <tr style={{"width": "100%", "text-align":"right"}}>
                        <td>
                        <i class="fas fa-spinner fa-spin fa-2x loading" style={{display: "none"}}></i>
                        <button type='button' class="btn btn-outline-secondary" id='clone' style={{"display":"none"}}>Clone</button>
                        <button type='button' class="btn btn-outline-secondary" id='clear-cache' disabled>Clear cache</button>
                        <button type='button' class="btn btn-outline-primary" id='run' disabled>Run</button>
                        </td>

                    </tr>
                </table>
            </div>
        </div>
      </Host>
    );
  }

}