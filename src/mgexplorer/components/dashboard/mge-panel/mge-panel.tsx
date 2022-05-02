import { Component, Element, Host, Prop, h, Method, Watch} from '@stencil/core';
import {select, selectAll} from "d3-selection"
import {sliderHorizontal} from "d3-simple-slider"
// import autocomplete from 'autocompleter';
import state from "../../../store"
// import "jquery-ui/ui/widgets/slider";

@Component({
  tag: 'mge-panel',
  styleUrl: 'mge-panel.css',
  shadow: false,
})



export class MgePanel {
  @Element() element: HTMLElement;
  /** type of visualization technique that is displayed in the same view as the setting panel  */
  @Prop() typeVis;
  /** id of view includes the panel */
  @Prop() idView;
  /** ID of the panel that generated from id of view */
  @Prop({ mutable: true }) _idPanel;

  /** Represents the selection of the pre-defined template based on class name of template */
  @Prop({ mutable: true }) filterTemplate;
  /** Represents the select input for order of Iris(`mge-iris`) setting panel and  histogram(mge-barchart) setting panel */
  @Prop({ mutable: true }) _selectOrder = null;
  /** Represents the div includes cloned html from template */
  @Prop({ mutable: true }) _filter;
  /** Represents the visualization technique which have same view with this setting panel*/
  @Prop({ mutable: true }) _chart;
  
  /** Display the value of the attribute gravity (of `mge-nodelinks`)*/
  @Prop({ mutable: true }) _spanGravity = null;    // Display the value of the attribute gravity
  /** Display positive value of charge attribute (of `mge-nodelinks`)*/
  @Prop({ mutable: true }) _spanCharge = null;     // Display positive value of charge attribute
  /** Displays the value of the linkDistance attribute (of `mge-nodelinks`)*/
  @Prop({ mutable: true }) _spanLinkDistance = null;   // Displays the value of the linkDistance attribute
  /** Text span to show number of nodes (of `mge-nodelinks`)*/
  @Prop({ mutable: true }) _spanNodes = null;    // Quantity of nodes
  /** Text span to show number of edges (of `mge-nodelinks`)*/
  @Prop({ mutable: true }) _spanEdges = null;    // Quantity of edges
  /** Slider to adjust Gravity (of `mge-nodelinks`)*/
  @Prop({ mutable: true }) _sliderGravity = null;
  /** Slider to adjust linkDistance (of `mge-nodelinks`)*/
  @Prop({ mutable: true }) _sliderCharge = null;
  /** Slider to adjust linkDistance (of `mge-nodelinks`) */
  @Prop({ mutable: true }) _sliderLinkDistance = null;
  /** Text search input (of `mge-nodelinks`)*/
  @Prop({ mutable: true }) _searchAutocomplete = null;



  @Prop({ mutable: true }) _selectLegend = null;
  @Prop({ mutable: true }) _spanVisibleLines = null;  // number of visible rows/columns in the view
  @Prop({ mutable: true }) _divSlider = null;

  private _labelAttr = null;
  private _selectAttr = null;
  private _br1 = null;
  private _br2 = null;

  private _vAttrSizeSelecionaveis = [];

  @Method()
  async setChart(_){
    this._chart = _
  }

  constructor(){
    
  }

//------------------------
// IRIS and BARCHART

  _addItemsSelectOrderIrisBar() {
        let selOption;
        this._selectOrder = this.element.querySelector(".IC-selOrderBy");
        if (this._selectOrder !== null){
          let _that = this;

          this._selectOrder[0].selectedIndex = 0;
   
          this._selectOrder.addEventListener('change', async function () {
            
              switch(+this.value) {
                case 0:
                  await _that._chart.acSortExecText();
                  break;
                case 1:
                  await _that._chart.acSortExecAttribute(1);
                  break;
                case 2:
                  await _that._chart.acSortExecAttribute(-1);
                  break;
              }
          });
        }
        

    }

  //-------------------------
  //GLYPH MATRIX

  //-------------------------
 async _addSelectLegend() {
    this._selectLegend = select(this.element.querySelector(".MG-selLegend"))
    
  }
  async updateSelectLegend(){
    var selOption, sizeLabelTitle, i;
    let _chartData = await  this._chart.setData()
    if ( _chartData != null) {
      selOption = this._selectLegend.selectAll("option");
      if (!selOption.empty())
        selOption.remove();
      
      _chartData.nodes.labelTitle.forEach((d,i) => this._selectLegend.append("option").attr("value", i).text(d))

      this._selectLegend.selectedIndex = await this._chart.indexAttrLegend();
      let globalThis = this;
      this._selectLegend.on("change", async function() {
        await globalThis._chart.acChangeAttrLegend(parseInt(this.value));
      });
    }
  }

  //-------------------------
  async _addSelectOrderMatrix() {
   this._selectOrder = select(this.element.querySelector(".MG-selOrder"));
  }

  async updateSelectOrderMatrix(){
    var selOption, sizeLabelTitle, i, sizeValueTitle;
    let _chartData = await  this._chart.setData()
    if (_chartData != null) {
      selOption = select("#" + this._idPanel + " .MG-selOrder").selectAll("option");
      if (!selOption.empty())
        selOption.remove();

      sizeLabelTitle = _chartData.nodes.labelTitle.length;
      for (i = 0; i < sizeLabelTitle; i++)
        this._selectOrder.append("option").attr("value", i).text(_chartData.nodes.labelTitle[i]);

      sizeValueTitle = _chartData.nodes.valueTitle.length;
      for (i = 0; i < sizeValueTitle; i++)
        this._selectOrder.append("option").attr("value",i + 1000).text(_chartData.nodes.valueTitle[i]);  // 100 come�a �ndice num�ricos    
      // S� funciona quando todos os atributos forem incluidos no <select>         
      // Seta o item selecionado
      if (this._chart.indexAttrSort() < 1000)
        this._selectOrder.selectedIndex = await this._chart.indexAttrSort();
      else
        this._selectOrder.selectedIndex = await this._chart.indexAttrSort() - 1000 + sizeLabelTitle;
      let globalThis = this;
      this._selectOrder.on("change", function() {
        globalThis._chart.acSortExec(this.value);
      });
    }  
  }


//-------------------------
 _addSliderLines() {
  this._spanVisibleLines = select(this.element.querySelector(".spanVisibleLines"));
  //     $(idDivPanel).append( $("<label/>").append("&nbsp;Visible lines:").append(_spanVisibleLines));
  this._spanVisibleLines.text(2);
  let globalThis = this;
  let _divSlider = select(this.element.querySelector(".visibleLinesSlider"))
        .attr("min", 1)
        .attr("max", 3)
        .attr("value", 2)
        .attr("step", 1)
        .on("input", function (event){
          globalThis._spanVisibleLines.text(this.value);
        })
        .on("change", function(event, ui) {
          globalThis._chart.acChangeVisibleLines(this.value);
        });
  }
  async updateSliderMatrix () {
    let _divSlider = select(this.element.querySelector(".visibleLinesSlider"))
        .attr("min", await this._chart.getMinVisibleLines())
        .attr("max", await this._chart.getMaxVisibleLines())
        .attr("value", await this._chart.getVisibleLines());
      this._spanVisibleLines.text(await this._chart.getVisibleLines());
    }


  @Method()
  async updateGlyphMatrixPanel () {

      this.updateSelectLegend();
      this.updateSelectOrderMatrix();
      this.updateSliderMatrix();
  }

  //-------------------------
  // ClusterVis
  //-------------------------

  async _addSelectOrderCluster() {
    // this._selectOrder = select("#" + this._idPanel).append("select").attr("class", "CV-selOrder"); 
    this._selectOrder = select(this.element.querySelector(".CV-selOrder"));
    
  }

  async updateSelectCluster() {
    let selOption, sizeLabelTitle, i, sizeValueTitle,
        _chartData = await  this._chart.setData();
    if (_chartData != null) {
      selOption = this._selectOrder.selectAll("option");
      if (!selOption.empty())
        selOption.remove();
      sizeLabelTitle = _chartData.nodes.labelTitle.length;
      for (i = 0; i < sizeLabelTitle; i++)
        this._selectOrder.append("option").attr("value", i).text(_chartData.nodes.labelTitle[i]);

      sizeValueTitle = _chartData.nodes.valueTitle.length;
      for (i = 0; i < sizeValueTitle; i++)
        this._selectOrder.append("option").attr("value", i + 1000).text(_chartData.nodes.valueTitle[i]);  // 100 starts numerical index

      if (this._chart.indexAttrSort() < 1000)
        this._selectOrder.selectedIndex = await this._chart.indexAttrSort();
      else
        this._selectOrder.selectedIndex = await this._chart.indexAttrSort() - 1000 + sizeLabelTitle;
      let globalThis = this;
      this._selectOrder.on("change", function () {
        globalThis._chart.acSortExec(this.value);
      });
    }
  }

  @Method()
  async updateClusterVisPanel () {
      this.updateSelectCluster();
  }
 

  //------------------------- 
  // Nodelinks
  //-------------------------
  _addSliderGravity() {
    this._spanGravity = select(this.element.querySelector(".spanGravitys"))
    let globalThis = this;
    this._sliderGravity = select(this.element.querySelector(".gravitySlider"))
      .attr("min", 0)
      .attr("max", 3)
      .attr("value", 2)
      .attr("step", 0.1)
      .on("input", function (event){
        globalThis._spanGravity.text(this.value);
      })
      .on("change", function(event, ui) {
        globalThis._chart.acChangeGravity(this.value);
      });
  }

//-------------------------
  _addSliderCharge() {

    this._spanCharge = select(this.element.querySelector(".spanCharge"))
    let globalThis = this;
    this._sliderCharge = select(this.element.querySelector(".chargeSlider"))
      .attr("min", 50)
      .attr("max", 2000)
      .attr("value", 2)
      .attr("step", 50)
      .on("input", function (event) {
        globalThis._spanCharge.text(this.value);

      })
      .on("change", function (event) {
        globalThis._chart.acChangeCharge(this.value);
      });
  }

  //-------------------------
  _addSliderLinkDistance() {

    this._spanLinkDistance = select(this.element.querySelector(".spanLinkDistance"))
    let globalThis = this;
    this._sliderLinkDistance = select(this.element.querySelector(".linkDistanceSlider"))
      .attr("min", 15)
      .attr("max", 300)
      .attr("value", 20)
      .attr("step", 5)
      .on("input", function (event, ui) {
        globalThis._spanLinkDistance.text(this.value);
      })
      .on("change", function (event, ui) {
        globalThis._chart.acChangeLinkDistance(this.value);
      });
  }

    //-------------------------
  async _addAutocomplete() {
      this._searchAutocomplete = select(this.element.querySelector(".NE-Autocomplete")).attr("placeholder", "Search")

      this._searchAutocomplete.on("input", async (d) => {
        let value = d.target.value
        if (!value.length) {
          await this._chart.resetHighSearch();
        } else {
          this._chart.acSelectByName(value)
        }
      });
    }

  @Method()
  async updateNodePanel () {

      this.upStatistics();
      this.upSliderGravity();
      this.upSliderCharge();
      this.upSliderLinkDistance();
      this.atualizaAutocomplete();
  }
  //--------------      
  async upStatistics() {
    // let a = await this._chart.getQtNodes();
    this._spanNodes.text(await this._chart.getQtNodes());
    this._spanEdges.text(await this._chart.getQtEdges());
  }

  //--------------  
  async upSliderGravity() {
    var minGravity, maxGravity, stepGravity, dif;
    let chartGravity = await this._chart.getGravity()
    if (await chartGravity < 0.1) {
      minGravity = Math.round(chartGravity * 50) / 100;
      maxGravity = Math.round(chartGravity * 150) / 100;
    } else {
      minGravity = Math.round(chartGravity * 5) / 10;
      maxGravity = Math.round(chartGravity * 15) / 10;
    }
    dif = maxGravity - minGravity;
    if (dif <= 0.1)
      stepGravity = 0.01;
    else
      if (dif <= 0.5)
        stepGravity = 0.05;
      else
        stepGravity = 0.1;

    this._sliderGravity.attr("min", minGravity)
        .attr("max", maxGravity)
        .attr("value", chartGravity)
        .attr("step", stepGravity)
    this._spanGravity.text(chartGravity);
  }

  //--------------      
  async upSliderCharge() {
    let chartCharge = await this._chart.getCharge()
    this._sliderCharge.attr("value", chartCharge);
    this._spanCharge.text(chartCharge);
  }

  //--------------      
  async upSliderLinkDistance() {
    let chartDistance = await this._chart.getLinkDistance()
    this._sliderLinkDistance.attr("value", chartDistance);
    this._spanLinkDistance.text(chartDistance);
  }

  async atualizaAutocomplete () {
    
      let chartData = await this._chart.setData()
      let labels = chartData.nodes.dataNodes.map(d => d.labels[1])
      
      select(this.element.querySelector('#nodes-labels'))
        .selectAll('option')
        .data(labels)
        .join(
          enter => enter.append('option'),
          update => update,
          exit => exit.remove()
        )
        .attr('value', d => d)
        .text(d => d)
  }

  createFilter(){
    switch(this.typeVis){
      case state.views.nodelink.component:
          this._spanNodes = select(this.element.querySelector(".spanNodes"))
          this._spanEdges = select(this.element.querySelector(".spanEdges"))
          //------------- search bar
          this._addAutocomplete();

          //------------- Slider to modify gravity attribute
          this._addSliderGravity();

          //------------- Slider to modify charge attribute
          this._addSliderCharge();

          //------------- Slider to modify link distance attribute
          this._addSliderLinkDistance();
          break;

      case state.views.barchart.component:
        // this._addItemsSelectOrderIrisBar();
        // break;

    
      case state.views.iris.component:
        this._addItemsSelectOrderIrisBar();
        break;

      case state.views.glyphmatrix.component:
        //------------- select for rows/columns text 
        this._addSelectLegend();

        //------------- select for rows/columns "sort by" 
        this._addSelectOrderMatrix();

        //------------- range slider for changing the number of visible rows/columns
        this._addSliderLines();
        break;
      case state.views.cluster.component:
        //------------- select for rows/columns text 
        this._addSelectOrderCluster()
        break;
    }
    
  }

  componentDidLoad(){
    this.filterTemplate =  document.querySelector("."+"filter-content-" + this.typeVis)
    this._filter = select(this.element.querySelector("#" + this.idView + "-f"))
                     .style("overflow-y", "scroll")
                     .style("background-color","rgba(220, 220, 220, .8)")
                     .style("padding", "5px")
                     // .style("display", "none");
    if (this.filterTemplate !== null)
    {
      this._filter.node().appendChild(this.filterTemplate.content.cloneNode(true))
    }
    this._idPanel = this.idView + "-f";
    this.createFilter();

  }

  render() {
    return (
      <Host>
        <div id={ this.idView + "-f" } class="filter-panel"></div>
      </Host>
    );
  }
}
