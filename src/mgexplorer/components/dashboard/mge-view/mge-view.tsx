import { Component, Element, Host, Prop, h, Method, Watch} from '@stencil/core';
import state from "../../../store"
import {toPng, toSvg} from 'html-to-image';
import { pointer, select, selectAll } from 'd3-selection';
import Swal from 'sweetalert2';
import $ from 'jquery';
import { saveAs } from 'file-saver'
import { takeScreenshot } from '../../../utils/utils';
import { isWebUri } from 'valid-url';
// import 'jquery-resizable-dom/src/jquery-resizable';

@Component({
  tag: 'mge-view',
  styleUrl: 'mge-view.css',
  shadow: true,
})
export class MgeView {

@Element() element: HTMLElement;
  /** represents the width of the view displayed by the window*/
  @Prop() width: number = 400;
  /** represents the height of the view displayed by the window*/
  @Prop() height: number = 400;
  /** represents type of visualization technique displayed via content of the view*/
  @Prop() typeVis: string;
   /** represents ID of the view*/
  @Prop() idView: string;
  /** The dataset name being used */
  @Prop() datasetName: string = "[]";
  /** The title of the view */
  @Prop() titleView:string = "[]";
  /** x-coordinate (The horizontal value in a pair of coordinates) of view's position*/
  @Prop() x:number = 0;
  /** y-coordinate (The vertical value in a pair of coordinates) of view's position*/
  @Prop() y:number = 0;
  /** Id of dashboard which is containing this view */
  @Prop() idDash : string;

  @Watch("x")
  validateName(newValue: number, oldValue: number) {
    this._position.x = this.x;
    this._position.y = this.y;
    this._center.cx = this._position.x + this._dimView.width / 2;
    this._center.cy = this._position.y + this._dimView.height / 2;
    
  }
  @Watch("height")
  @Watch("width")
  updateDimview(newValue: number, oldValue: number) {
    this._dimView.width = this.width;
    this._dimView.height = this.height + this._barTitleHeight;
    this._center.cx = this._position.x + this._dimView.width / 2;
    this._center.cy = this._position.y + this._dimView.height / 2;
    
  }

  // private datatype = "number";


  private pos1;
  private pos2;
  private pos3;
  private pos4;
  private mover;
  private cont;
  // private resizer;
  private _dashboard;
  // private _selectOrder = null;
  // private _selectAttr = null;
  /** View center point */
  @Prop({ mutable: true }) _center = { cx: 0, cy: 0 };
  /** View current position */
  @Prop({ mutable: true }) _position = { x: 0, y: 0};
  /** Title bar height */
  @Prop({ mutable: true }) _barTitleHeight = 15;  // Title bar height
  /** View dimensions */
  @Prop({ mutable: true }) _dimView = { width: 10, height: 10 };
  /** Div that represents the header part of a view */
  @Prop({ mutable: true }) _top;
  /**  Div that represents the content includes chart of a view  */
  @Prop({ mutable: true }) _content;
  /**  Div that represents the filter panel of a view  */
  @Prop({ mutable: true }) _filter;
  /**  Chart associated with view  */
  @Prop({ mutable: true }) _chart; // Chart associated with view
  /**  Div that represents the view included  */
  @Prop({ mutable: true }) viewDiv;

  private selLinkPai;
  private selLinkFilhos;
  private selConect;
  private selLinkPaiArrow;
  private selLinkFilhosArrow;

  private DS_NodeEdge;
  private DS_ClusterVis;
  private DS_Iris;
  private DS_Iris_Duo;
  private DS_GlyphMatrix;
  private DS_Iris_Solo;
  private DS_Papers_List;
  private DS_NodeEdge_HAL;
  private DS_ClusterVis_HAL;
  private DS_FollowUpQuery;
  private DS_Histogram;
  private DS_Papers_List_Node;

  private _selectedQuery;
  private _contextMenu;

  private _dashboardArea;
  private listHasFilter=["mge-nodelink", "mge-barchart", "mge-clustervis", "mge-glyph-matrix", "mge-iris"];
  private _canNodeRedirectCorese = false;

  private _query;

  constructor(){

    this.DS_NodeEdge = 0,
    this.DS_ClusterVis = 1,
    this.DS_Iris = 2,
    this.DS_GlyphMatrix = 3,
    this.DS_Iris_Solo = 4,
    this.DS_Papers_List = 5,
    this.DS_NodeEdge_HAL = 6,
    this.DS_ClusterVis_HAL = 7;
    this.DS_FollowUpQuery = 8;
    this.DS_Histogram = 9
    this.DS_Iris_Duo = 10
    this.DS_Papers_List_Node = 11

    this._selectedQuery;

    this._contextMenu = {
                showing: false,
                vItens: [null, null, null, null]
            },

    this._dashboardArea = {
                div: null,
                dash: null,
                svg: null,
                width: 0,
                height: 0
            };

    this._dashboard = document.querySelector("mge-dashboard")
    this.pos1 = 0;
    this.pos2 = 0;
    this.pos3 = 0;
    this.pos4 = 0;
    this._dimView.width = this.width;
    this._dimView.height = this.height + this._barTitleHeight;
    this._position.x = this.x;
    this._position.y = this.y;
    this._center.cx = this._position.x + this._dimView.width / 2;
    this._center.cy = this._position.y + this._dimView.height / 2;
    if (this.typeVis != "mge-history"){
      state.indexChart++;
    }
    
  }
  /** Refresh bar title width when we resize the windown
    */
  @Method()
  async _refreshBarTitle() {
      this._top.attr("width", this._dimView.width).attr("height", this._barTitleHeight);
  }
  
  setResizable(){
    let globalThis = this;
    var startX, startY, startWidth, startHeight, h , w;
    const resizers = selectAll(this.element.shadowRoot.querySelectorAll('.resizer'));

    // Loop over them
    [].forEach.call(resizers.nodes(), (resizer) => {
      resizer.onmousedown = initDragResize.bind(this);  
    });
    // elm.onmousedown = initDragResize.bind(this);
    
    function initDragResize(event) {
      event = event || window.event;
      event.preventDefault();
      // Get the current mouse position
      startX = event.clientX;
      startY = event.clientY;

      // Calculate the dimension of element
      const styles = window.getComputedStyle(this.element.shadowRoot.querySelector("#" + this.idView + "-g"  ));
      w = parseInt(styles.width, 10);
      h = parseInt(styles.height, 10);
      this.selLinkPai = select(this._dashboard.shadowRoot.querySelector(".F-" + this.idView));
      this.selLinkFilhos = selectAll(this._dashboard.shadowRoot.querySelectorAll(".P-" + this.idView));
      this.selConect = select(this._dashboard.shadowRoot.querySelector("." + this.idView));
      this.selLinkPaiArrow = select(this._dashboard.shadowRoot.querySelector(".FA-" + this.idView));
      this.selLinkFilhosArrow = selectAll(this._dashboard.shadowRoot.querySelectorAll(".PA-" + this.idView));
      
      document.onmousemove = doDragResize.bind(this);
      document.onmouseup = stopDragResize.bind(this);
    }

    function doDragResize(e) {
      let aspect = this._dimView.height / this._dimView.width;

      // Updates the dimensions of the <div>
      let dx = e.clientX - startX;
      let dy = e.clientY - startY;

      this._dimView.width = w + dx -2;
      this._dimView.height = h + dy -2;
      this._dimView.height = this._dimView.height - this._barTitleHeight;

      if (this._dimView.width >= 0 && this._dimView.height >= 0){
        this._refreshBarTitle();
        this._chart.setBox({ width: this._dimView.width, height: this._dimView.height });
        this._center.cx = this._position.x + this._dimView.width / 2;
        this._center.cy = this._position.y + this._dimView.height / 2;
        
        if (!this.selLinkPai.empty()) {
            let dt = this.selConect.datum();
            this.selLinkPai.attr("x2", this._center.cx).attr("y2", this._center.cy);
            this.selConect.attr("x", this._center.cx - 6).attr("y", this._center.cy - 6);
            dt[0].x = this._center.cx;
            dt[0].y = this._center.cy;
        }
        this.selLinkFilhos.attr("x1", this._center.cx).attr("y1", this._center.cy);
        if (!this.selLinkPaiArrow.empty())
          this.selLinkPaiArrow.attr("targetX", this._center.cx).attr("targetY", this._center.cy).attr("refX", (Math.sqrt((this._center.cx - this.selLinkPaiArrow.attr("sourceX"))**2 + (this._center.cy - this.selLinkPaiArrow.attr("sourceY"))**2) / 3.5));

        if (!this.selLinkFilhosArrow.empty())
          this.selLinkFilhosArrow.attr("sourceX", this._center.cx).attr("sourceY", this._center.cy).attr("refX", (Math.sqrt((this.selLinkFilhosArrow.attr("targetX") - this._center.cx)**2 + (this.selLinkFilhosArrow.attr("targetY") - this._center.cy)**2 ) / 3.5));
        this._dashboard.refreshSvg();
      }

            
    }

    function stopDragResize(e) {
        document.onmouseup = null
        document.onmousemove = null
    }
  }

  /**
   * Get the selection of the visualization technique element which containing in this view
   */
  @Method()
  async getChart(){
    return this._chart;
  }

  dragElement (elm) {
    elm.onmousedown = this.dragMouseDown.bind(this);
  }

  elementDrag (event) {
    event = event || window.event;
    this.selLinkPai = selectAll(this._dashboard.shadowRoot.querySelectorAll(".F-" + this.idView));
    this.selLinkFilhos = selectAll(this._dashboard.shadowRoot.querySelectorAll(".P-" + this.idView));
    this.selConect = select(this._dashboard.shadowRoot.querySelector("." + this.idView));
    this.selLinkPaiArrow = selectAll(this._dashboard.shadowRoot.querySelectorAll(".FA-" + this.idView));
    this.selLinkFilhosArrow = selectAll(this._dashboard.shadowRoot.querySelectorAll(".PA-" + this.idView));
    this.moveWindow(event.clientX, event.clientY);

  }

  moveWindow (x, y) {
    this.pos1 = this.pos3 - x
    this.pos2 = this.pos4 - y
    this.pos3 = x
    this.pos4 = y
    this.cont.style.top = this.cont.offsetTop - this.pos2 + 'px' ;
    this.cont.style.left = this.cont.offsetLeft - this.pos1 + 'px' ;

    this._position.x = this.cont.offsetLeft ;
    this._position.y = this.cont.offsetTop;
    // this.viewDiv.setPosition(this._position.x, this._position.y)

    this._center.cx = this._position.x + this._dimView.width / 2;
    this._center.cy = this._position.y + this._dimView.height / 2;
    if (!this.idView.indexOf("annotation")){
      let result =selectAll(this._dashboard.shadowRoot.querySelectorAll("." + this.idView))
      result.attr("x", this._center.cx - 6).attr("y", this._center.cy - 6);
      
    }

    if (!this.selLinkPai.empty()) {
        this.selLinkPai.attr("x2", this._center.cx).attr("y2", this._center.cy);
        this.selConect.attr("x", this._center.cx - 6).attr("y", this._center.cy - 6);
        
        
    }
    if (!this.selLinkPaiArrow.empty())
      this.selLinkPaiArrow.attr("targetX", this._center.cx).attr("targetY", this._center.cy).attr("refX", (Math.sqrt((this._center.cx - this.selLinkPaiArrow.attr("sourceX"))**2 + (this._center.cy - this.selLinkPaiArrow.attr("sourceY"))**2) / 3.5));

    if (!this.selLinkFilhosArrow.empty())
      this.selLinkFilhosArrow.attr("sourceX", this._center.cx).attr("sourceY", this._center.cy).attr("refX", (Math.sqrt((this.selLinkFilhosArrow.attr("targetX") - this._center.cx)**2 + (this.selLinkFilhosArrow.attr("targetY") - this._center.cy)**2 ) / 3.5));

    this.selLinkFilhos.attr("x1", this._center.cx).attr("y1", this._center.cy);
    this._dashboard.refreshSvg()
  }

  closeDragElement () {
    /* stop moving when mouse button is released: */
    document.onmouseup = null
    document.onmousemove = null
  }

  // Events
  dragMouseDown (event) {
    event = event || window.event
    event.preventDefault();
    this.pos3 = event.clientX
    this.pos4 = event.clientY
    // this.dashboard.setPosition(event.clientX, event.clientY);
    document.onmouseup = this.closeDragElement.bind(this);

    document.onmousemove = this.elementDrag.bind(this);
  }

  /**
   * Set new center point for the view
   * Inputs are coordinates (x and y) of new center position
   */
  @Method()
  setCenter (x, y) {
      this._center.cx = x;
      this._center.cy = y;
      this._position.x = this._center.cx - this._dimView.width / 2;
      this._position.y = this._center.cy - this._dimView.height / 2;
    };

  /**
   * Get current center position of the view
   */
  @Method()
  async getCenter () {
      return this._center;
    };

  /**
   * Get ID of the view
   */
  @Method()
  async idChart () {
      return this.idView;
    };

  /**
   * this function allows to Refresh position of the view
   */
  @Method()
  async refresh () {
      this.viewDiv.node().style.top = this._position.y + "px";
      this.viewDiv.node().style.left = this._position.x + "px";
  };

  /**
   * This function allows to set new title for the view
   */
  @Method()
  async setTitle(_){
    this.titleView = _
    this._top.attr("title", this.titleView);
    select(this.element).attr("titleView", this.titleView);
    select(this.element.shadowRoot.querySelector(".title")).text(_)
  }

  getAllStyles(elem) {
    if (!elem) return []; // Element does not exist, empty list.
    var win = document.defaultView || window, style, styleNode = {};
    if (win.getComputedStyle) { /* Modern browsers */
        style = win.getComputedStyle(elem, '');
        for (var i=0; i<style.length; i++) {
            Object.assign(styleNode,  { [style[i]] : style.getPropertyValue(style[i])});
            //               ^name ^           ^ value ^
        }
    } else if (elem.currentStyle) { /* IE */
        style = elem.currentStyle;
        for (var name in style) {
            Object.assign(styleNode, { [name] : style[name]} );
        }
    } else { /* Ancient browser..*/
        style = elem.style;
        for (var i=0; i<style.length; i++) {
            Object.assign(styleNode, { [style[i] ] : style[style[i]]} );
        }
    }
    return styleNode;
  }

  addTopContent(){
    if (this.listHasFilter.includes(this.typeVis)){

      let _btnMenu = this._top.append("button")
            .attr("id", this.idView + "-t-menu-btn")
            .attr("class", "fas fa-angle-double-down"),
          _btnSaveScreen = this._top.append("button")
            .attr("id", this.idView + "-t-screenshot-btn")
            .attr("class", "fas fa-camera");

      _btnMenu.on("click", (event, d) => {
          let path = event.path || event.composedPath()
          if (this._filter.style.display == "none")
          {
              this._filter.style.display = "block";
              path[0].className = "fas fa-angle-double-up";
          } 
          else
          {
            path[0].className = "fas fa-angle-double-down";
            this._filter.style.display = "none";
          }
      });
      
        _btnSaveScreen.on("click", (event, d) => {

          Swal.fire({
            title: '',
            html: `File format: <select class='selectTypeCapture' id='typeCapture'>
              <option value='png'>PNG</option>
              <option value='svg'>SVG</option>
            </select>`,
            confirmButtonText: 'OK',
            showCancelButton: true,
            focusConfirm: false,
            preConfirm: () => {
              const selectElement = select("#typeCapture").node()
              const value = selectElement.options[selectElement.selectedIndex].value;
              return value
            }
          }).then((result) => {
            if (!result.value) return;
            
            /// TO-DO: apply the same to mge-view
            function showError(error){
              console.error('oops, something went wrong!', error);
            }
            
            const node = this.viewDiv.node()

            let scale = 2
            const options = { 
                quality: 1.0,
                backgroundColor: '#FFFFFF',
                width: this.viewDiv.node().scrollWidth * scale, 
                height: this.viewDiv.node().scrollHeight * scale,
                style: {left: '0',
                      right: '0',
                      bottom: '0',
                      top: '0',
                      transform: 'scale('+scale+')',
                      transformOrigin: 'top left'}
            }

            if (result.value === 'svg'){
              toSvg( node, options )
              .then( dataURL => takeScreenshot(dataURL, result.value, this.typeVis))
              .catch( error => showError(error));
            } else {
              toPng( node, options )
              .then( dataURL => takeScreenshot(dataURL, result.value, this.typeVis))
              .catch( error => showError(error));
            }
          })   
        })
      };

      if (this.typeVis == 'mge-query'){
        this._top.style('background-color', '#de425b')
      } else if (this.typeVis == 'mge-annotation')
      {
        this._top.style('background-color', '#f3993b')
      }
      this._top.append("span")
              .attr("class", "title")
              .attr("id", this.idView + "-t-title")
              .style("white-space", "nowrap")
              .style("overflow", "hidden")
              .style("text-overflow", "ellipsis")
              .style("width", 0)
              .text(this.titleView);

      if (this.typeVis != state.views.history.component && this.idView != "chart-0")
        this._top.append("button")
              .attr("class", "fas fa-times")
              .attr("id", this.idView + "-t-close-btn")
              // .text("x")
              .on("click", async (event, d) => {
                await this._dashboard.closeView(this.element);
              });

  };

  addChartContent(div){
    div.append(this.typeVis).attr("dataset-name", this.datasetName)
                            .attr("id", this.idView)
                            .attr("id-dash", this.idDash);
    this._chart = this.element.shadowRoot.querySelector(this.typeVis)

  }

  async addSettingsContent(){
    let _filterDiv = this.viewDiv.append("mge-panel").attr("id", this.idView + "-p")
                     .attr("type-vis", this.typeVis)
                     .attr("id-view", this.idView)
                     .style("display", "none");
    this._filter = _filterDiv.node()
    
    this._filter.setChart(this._chart)
    if (![state.views.history.component, state.views.query.component, state.views.listing.component, state.views.annotation.component].includes(this.typeVis)){
      await this._chart.setPanel(this._filter)
    }
  }

  async buildChart(div){
    this._top = div.append("div")
                  .attr("class", "top")
                  .attr("id", this.idView + "-t")
                  .attr("title", this.titleView)
                  .style("height", this._barTitleHeight)
                  .style("overflow", "hidden");

    this._content = div.append("div")
                  .attr("class", "content")
                  .attr("id", this.idView + "-c")
                  .style("width", this.width)
                  .style("height", "90%")
                  .style("overflow", "hidden");

    this.addTopContent();
    this.addChartContent(this._content);
    this.addSettingsContent();

  }

  _onMouseOverContent(event, d) {
      select(this.element.shadowRoot.querySelector(".resizer-i")).classed("resizer-autohide", false)
  }

  /**
   * _onMouseOutContent
   */
  _onMouseOutContent(event, d) {
    select(this.element.shadowRoot.querySelector(".resizer-i")).classed("resizer-autohide", true)
      
  }

  /**
   * Set visible for all contents in view
   * if input status is true, the content wil be visible
   * if input status is false, the content will be hidden
   */
  @Method()
  setVisible(status){
    if (status)
        this.cont.style.display = "block";
    else
        this.cont.style.display = "none";

  }

  /**
   * Set new position for the view
   * Inputs are coordinates : x and y
   */
  @Method()
  setPosition(x, y){
      this.x = x;
      this.y = y;
  }

  /**
   * Get current position of the view
   */
  @Method()
  async getPosition(){
      return this._position;
  }

  _initAction(){
    // this._dashboardArea.div = select("#viewArea");
    this._dashboardArea.dash = select(this.element);
    this._dashboardArea.dash.classed("DS-viewArea", true)
            .on("click", (event) => {
              if (event.detail === 1) {this._onClickAction.bind(this)(event)} else if (event.detail === 2) {
                this._dblClickAction.bind(this)(event)
              }
            })
            .on("contextmenu", this._onContextMenu.bind(this))

  }

  _onClickAction(event) {
      if (this._contextMenu.showing && this._contextMenu.showing !== "keep") {
          this._contextMenu.showing = false;
          selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
          select("#subContextMenuDiv").remove();
      }
  }

  _onContextMenu(event) {
    let clickedElem, viewDiv, popupDiv, mousePos;
    this._selectedQuery = 8;
    //parseInt($("#selectQuery")[0].selectedIndex);
    event.preventDefault();


    if (this._contextMenu.showing) {
      event.preventDefault();
      this._contextMenu.showing = false;
      selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
    }

    if (event.composedPath()[0].nodeName !== this.typeVis) {
      this._contextMenu.showing = true;

      clickedElem = select(event.composedPath()[0]);

      if (clickedElem.classed("IC-node") || clickedElem.classed("GM-node")) {
          event.preventDefault();

          viewDiv = this._findParentDiv(clickedElem);
          mousePos = pointer(event, viewDiv.node());

          popupDiv = viewDiv.append("div")
              .attr("class", "DS-popup medium-size")
              .style("left", mousePos[0] + "px")
              .style("top", mousePos[1] + "px");

          if (clickedElem.classed("IC-node"))
              this._execCtxMenuIris(popupDiv, clickedElem, viewDiv.node());
          else
              if (clickedElem.classed("GM-node"))
                  this._execCtxMenuGlyphMatrix(popupDiv, clickedElem, viewDiv.node());
      }

      if (this._selectedQuery !== 8) {
          if (clickedElem.classed("NE-node")
              || clickedElem.classed("NE-edge")
              || clickedElem.classed("CV-node")) {

              event.preventDefault();

              viewDiv = this._findParentDiv(clickedElem);
              mousePos = pointer(event, viewDiv.node());

              popupDiv = viewDiv.append("div")
                  .attr("class", "DS-popup medium-size")
                  .style("left", mousePos[0] + "px")
                  .style("top", mousePos[1] + "px");
              this._contextMenu.showing = true;

              if ((clickedElem.classed("NE-node") || clickedElem.classed("NE-edge")) && this._selectedQuery !== 8)
                  this._execCtxMenuNodeEdge(popupDiv, clickedElem, viewDiv.node());
              else
                  if (clickedElem.classed("CV-node"))
                      this._execCtxMenuClusterVis(popupDiv, clickedElem, viewDiv.node());
          }
      } else {
          event.preventDefault();

          viewDiv = this._findParentDiv(clickedElem);
          mousePos = pointer(event, viewDiv.node());
          popupDiv = viewDiv.append("div")
                  .attr("class", "DS-popup big-size")
                  .style("left", mousePos[0] + "px")
                  .style("top", mousePos[1] + "px");
          this._contextMenu.showing = true;
          if (clickedElem.classed("IC-node")) {
            this._execCtxMenuIris(popupDiv, clickedElem, viewDiv.node());
          }else if (clickedElem.classed("IC-bars")) {
            this._execCtxMenuIrisBars(popupDiv, select(clickedElem.node().parentNode.parentNode), viewDiv.node());
          } else if (clickedElem.classed("NE-node") || clickedElem.classed("NE-edge")) {
            this._execCtxMenuNodeEdgeHAL(popupDiv, clickedElem, viewDiv.node());
          } else if (clickedElem.classed("CV-node")) {
            this._execCtxMenuClusterVisHAL(popupDiv, clickedElem, viewDiv.node());
          } else if (clickedElem.classed("PL-infos")) {
            this._execCtxMenuPapersListNode(popupDiv, clickedElem, viewDiv.node());
          } else if (clickedElem.classed('PL-title')) {
            this._execCtxMenuPapersList(popupDiv, clickedElem, viewDiv.node());
          } else if (clickedElem.classed('HC-bars')){
            this._execCtxMenuHistogram(popupDiv, select(clickedElem.node().parentNode), viewDiv.node());
          }
      }
    }
  }

  _dblClickAction(event) {
      let clickedElem = select(event.composedPath()[0]);
      let viewDiv = this._findParentDiv(clickedElem);
      if (clickedElem.classed("IC-node")) {
          let data = this._contextMenu.vItens[this.DS_Iris_Solo];
          data[0].fActionNode(clickedElem.datum(), viewDiv.node())
      }
  }

  //------------
  _findParentDiv(clickedElem) {
    
      let nodeElem = clickedElem.node();
      while (nodeElem.parentNode != null && nodeElem.parentNode.className !== "hydrated") {
      // while (nodeElem.parentNode != null && !(nodeElem.parentNode instanceof ShadowRoot)) {  
          nodeElem = select(nodeElem.parentNode).node();
          
      }
      return select(nodeElem.parentNode);
      // }
      
  }

  //------------  
  _execCtxMenuNodeEdge(popupDiv, clickedElem, parentId) {
      popupDiv.selectAll("div")
          .data(this._contextMenu.vItens[this.DS_NodeEdge])
          .enter()
          .append("div")
          .on("click", (event, d) => {
              this._contextMenu.showing = false;
              select(this.element.shadowRoot.querySelectorAll(".DS-popup")[0]).remove();
              if (clickedElem.classed("NE-node"))
                  d.fActionNode(clickedElem.datum(), parentId);
              // else
              // d.fActionEdge(clickedElem.datum(),parentId);
          })
          .append("label")
          .text(function (d) { return d.label; });
  }

  //------------
  _execCtxMenuNodeEdgeHAL(popupDiv, clickedElem, parentId) {

      if (clickedElem.classed("NE-node")) {
          // Display the main context menu only if a node is clicked
          popupDiv.selectAll("div")
              .data(this._contextMenu.vItens[this.DS_NodeEdge_HAL])
              .enter()
              .append("div")
              .on("click", (event, d) => {
                  // let mousePos,
                  //     viewDiv,
                  //     contextMenuDivRight,
                  //     subContextMenuDiv;
                  if (typeof(d.submenu) === "undefined") {
                      if (clickedElem.classed("NE-node"))
                          d.fActionNode(clickedElem.datum(), parentId, event.target.innerText);
                      else
                          d.fActionEdge(clickedElem.datum(), parentId);
                      this._contextMenu.showing = false;
                      select(this.element.shadowRoot.querySelectorAll(".DS-popup")[0]).remove();

                  } 
              })
              .append("label")
              .text(function (d) { return d.label; });
      }
  }

  //------------  
  _execCtxMenuClusterVis(popupDiv, clickedElem, parentId) {

      popupDiv.selectAll("div")
          .data(this._contextMenu.vItens[this.DS_ClusterVis])
          .enter()
          .append("div")
          .on("click", (event, d) => {
              this._contextMenu.showing = false;
              selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
              d.fActionNode(clickedElem.datum(), parentId);
              //console.log("here 1");
          })
          .append("label")
          .text(function (d) { return d.label; });
  }

  //------------
  _execCtxMenuClusterVisHAL(popupDiv, clickedElem, parentId) {

      popupDiv.selectAll("div")
          .data(this._contextMenu.vItens[this.DS_ClusterVis_HAL])
          .enter()
          .append("div")
          .on("click", (event, d) => {
              this._contextMenu.showing = false;
              selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
              d.fActionNode(clickedElem.datum(), parentId);
              //console.log("here 2");
          })
          .append("label")
          .text(function (d) { return d.label; });
  }

  //------------  
  _execCtxMenuIris(popupDiv, clickedElem, parentId) {
      popupDiv.selectAll("div")
          .data(this._contextMenu.vItens[this.DS_Iris])
          .enter()
          .append("div")
          .on("click", (event, d) => {
              this._contextMenu.showing = false;
              selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
              d.fActionNode(clickedElem.datum(), parentId);
          })
          .append("label")
          .text(function (d) { return d.label; });
  }

  //------------  
  _execCtxMenuGlyphMatrix(popupDiv, clickedElem, parentId) {
      popupDiv.selectAll("div")
          .data(this._contextMenu.vItens[this.DS_GlyphMatrix])
          .enter()
          .append("div")
          .on("click", (event, d) => {
              this._contextMenu.showing = false;
              selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
              d.fActionNode(clickedElem.datum(), parentId);
          })
          .append("label")
          .text(function (d) { return d.label; });
  }

  //------------
  _execCtxMenuIrisBars(popupDiv, clickedElem, parentNode) {
      popupDiv.selectAll("div")
          .data(this._contextMenu.vItens[this.DS_Iris_Duo])
          .enter()
          .append("div")
          .on("click", (event, d) => {
              this._contextMenu.showing = false;
              selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
              d.fActionNode(clickedElem.datum(), parentNode);
          })
          .append("label")
          .text(function (d) { return d.label; });
  }
  _execCtxMenuHistogram(popupDiv, clickedElem, parentId){
          popupDiv.selectAll("div")
          .data(this._contextMenu.vItens[this.DS_Histogram])
          .enter()
          .append("div")
          .on("click", (event, d) => {
              this._contextMenu.showing = false;
              selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
              d.fActionNode(clickedElem.datum(), parentId);
          })
          .append("label")
          .text(function (d) { return d.label; });
        }

  //------------
  _execCtxMenuPapersList(popupDiv, clickedElem, parentId) {
      popupDiv.selectAll("div")
          .data(this._contextMenu.vItens[this.DS_Papers_List])
          .enter()
          .append("div")
          .on("click", (event, d) => {
              this._contextMenu.showing = false;
              selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
              d.fActionNode(clickedElem.datum(), parentId, event.target.innerText);
          })
          .append("label")
          .text(function (d) { return d.label; });
  }

  _execCtxMenuPapersListNode(popupDiv, clickedElem, parentId) {
    popupDiv.selectAll("div")
        .data(this._contextMenu.vItens[this.DS_Papers_List_Node])
        .enter()
        .append("div")
        .on("click", (event, d) => {
            this._contextMenu.showing = false;
            selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
            d.fActionNode(clickedElem.datum(), parentId);
        })
        .append("label")
        .text(function (d) { return d.label; });
  }

  //---------------------------------     
  setItemsContextMenu = function (codChart, items) {
      this._contextMenu.vItens[codChart] = items;
  };

  _initContextMenu() {
        this.setItemsContextMenu(this.DS_NodeEdge, [
            { label: state.views.cluster.title, fActionNode: this._fActionNodeNE_CV.bind(this), fActionEdge: this._fActionNotImplemented },
            { label: state.views.iris.title, fActionNode: this._fActionNodeNE_IC.bind(this), fActionEdge: this._fActionNotApplicable },
            { label: state.views.glyphmatrix.title, fActionNode: this._fActionNodeNE_GM.bind(this), fActionEdge: this._fActionEdgeNE_GM.bind(this) },
            { label: state.views.barchart.title, fActionNode: this._fActionNodeNE_HC.bind(this), fActionEdge: this._fActionNotImplemented },
            { label: "New Query", fActionNode: this._fActionNodeNE_NQ.bind(this), fActionEdge: this._fActionNotImplemented }
        ]);

        this.setItemsContextMenu(this.DS_ClusterVis, [
            { label: state.views.cluster.title, fActionNode: this._fActionNodeCV_CV.bind(this) },
            { label: state.views.iris.title, fActionNode: this._fActionNodeCV_IC.bind(this) },
            { label: state.views.glyphmatrix.title, fActionNode: this._fActionNodeCV_GM.bind(this) },
            { label: state.views.barchart.title, fActionNode: this._fActionNodeNE_HC.bind(this) },
            { label: state.views.listing.title, fActionNode: this._fActionNodeCV_PL.bind(this) },
            { label: "New Query", fActionNode: this._fActionNodeCV_NQ.bind(this), fActionEdge: this._fActionNotImplemented }
        ]);

        this.setItemsContextMenu(this.DS_Iris, [
            { label: state.views.barchart.title, fActionNode: this._fActionNodeIC_HC.bind(this) },
            { label: state.views.listing.title, fActionNode: this._fActionNodeIC_PLOnName.bind(this) },
            { label: "New Query", fActionNode: this._fActionNodeCV_NQ.bind(this), fActionEdge: this._fActionNotImplemented }
        ]);

        this.setItemsContextMenu(this.DS_Iris_Duo, [
          { label: state.views.barchart.title, fActionNode: this._fActionNodeIC_HC.bind(this) },
          { label: state.views.listing.title, fActionNode: this._fActionNodeIC_PL.bind(this) },
          { label: "New Query", fActionNode: this._fActionNodeCV_NQ.bind(this), fActionEdge: this._fActionNotImplemented }
      ]);

        this.setItemsContextMenu(this.DS_GlyphMatrix, [
            { label: state.views.cluster.title, fActionNode: this._fActionNodeGM_CV.bind(this) },
            { label: state.views.iris.title, fActionNode: this._fActionNodeGM_IC.bind(this) },
            { label: state.views.glyphmatrix.title, fActionNode: this._fActionNodeGM_GM.bind(this) },
            { label: state.views.barchart.title, fActionNode: this._fActionNodeNE_HC.bind(this) },
            { label: state.views.listing.title, fActionNode: this._fActionNodeGM_PL.bind(this) }
        ]);

        this.setItemsContextMenu(this.DS_Iris_Solo, [
            { label: state.views.iris.title, fActionNode: this._fActionNodeIC_IC_SameView.bind(this) }
        ]);

        this.setItemsContextMenu(this.DS_Papers_List_Node, [
          { label: "New Query", fActionNode: this._fActionNodeLP_NQ.bind(this), fActionEdge: this._fActionNotImplemented }
        ]);

        let query = state._queries[this.datasetName]
        let redirectServices = query && query.stylesheet && query.stylesheet.services != undefined;
        if (redirectServices) {
          let serviceOptions = []  
          query.stylesheet.services.forEach(d => {
            serviceOptions.push({"label": d.label, fActionNode: this._fActionNode_Service.bind(this), fActionEdge: this._fActionNotApplicable.bind(this)})
          })

          this.setItemsContextMenu(this.DS_NodeEdge_HAL, [
              { label: state.views.cluster.title, fActionNode: this._fActionNodeNE_CV.bind(this), fActionEdge: this._fActionNotImplemented },
              { label: state.views.iris.title, fActionNode: this._fActionNodeNE_IC.bind(this), fActionEdge: this._fActionNotApplicable.bind(this) },
              { label: state.views.glyphmatrix.title, fActionNode: this._fActionNodeNE_GM.bind(this), fActionEdge: this._fActionEdgeNE_GM.bind(this) },
              { label: state.views.barchart.title, fActionNode: this._fActionNodeNE_HC.bind(this), fActionEdge: this._fActionNotImplemented },
              { label: state.views.listing.title, fActionNode: this._fActionNodeNE_PL.bind(this), fActionEdge: this._fActionEdgeNE_PL.bind(this) },
              { label: "New Query", fActionNode: this._fActionNodeNE_NQ.bind(this), fActionEdge: this._fActionNotImplemented}
          ].concat(serviceOptions));
  
          this.setItemsContextMenu(this.DS_Papers_List, [
            { label: "New Query", fActionNode: this._fActionNodeLP_NQ.bind(this), fActionEdge: this._fActionNotImplemented }
          ].concat(serviceOptions))

        } else {
            this.setItemsContextMenu(this.DS_NodeEdge_HAL, [
                { label: state.views.cluster.title, fActionNode: this._fActionNodeNE_CV.bind(this), fActionEdge: this._fActionNotImplemented },
                { label: state.views.iris.title, fActionNode: this._fActionNodeNE_IC.bind(this), fActionEdge: this._fActionNotApplicable },
                { label: state.views.glyphmatrix.title, fActionNode: this._fActionNodeNE_GM.bind(this), fActionEdge: this._fActionEdgeNE_GM.bind(this) },
                { label: state.views.barchart.title, fActionNode: this._fActionNodeNE_HC.bind(this), fActionEdge: this._fActionNotImplemented },
                { label: state.views.listing.title, fActionNode: this._fActionNodeNE_PL.bind(this), fActionEdge: this._fActionEdgeNE_PL.bind(this) },
                { label: "New Query", fActionNode: this._fActionNodeNE_NQ.bind(this), fActionEdge: this._fActionNotImplemented},
            ]);

            this.setItemsContextMenu(this.DS_Papers_List, [
              { label: "New Query", fActionNode: this._fActionNodeLP_NQ.bind(this), fActionEdge: this._fActionNotImplemented }
            ]);
        }

        this.setItemsContextMenu(this.DS_ClusterVis_HAL, [
            { label: state.views.cluster.title, fActionNode: this._fActionNodeCV_CV.bind(this) },
            { label: state.views.iris.title, fActionNode: this._fActionNodeCV_IC.bind(this) },
            { label: state.views.glyphmatrix.title, fActionNode: this._fActionNodeCV_GM.bind(this) },
            { label: state.views.barchart.title, fActionNode: this._fActionNodeCV_HC.bind(this) },
            { label: state.views.listing.title, fActionNode: this._fActionNodeCV_PL.bind(this) }
        ]);
    }
    async _fActionNotApplicable() {
          alert("Not applicable!!");
      }
    async _fActionNotImplemented() {
          alert("Not implemented!!");
      }

    //=======================
    // Actions GM: GlyphMatrix
    //=======================
    async _fActionNodeGM_CV(node, parentNode) {
      this._showChart(node, parentNode.id, state.views.cluster);
    }

    //---------------
    async _fActionNodeGM_IC(node, parentNode) {

      this._showChart(node, parentNode.id, state.views.iris);
    }

    //---------------
    async _fActionNodeGM_GM(node, parentNode) {
       this._showChart(node, parentNode.id, state.views.glyphmatrix);
    }

    //---------------
    async _fActionNodeGM_PL(node, parentNode) {
      this._showChart(node, parentNode.id, state.views.listing, false, undefined, true);
    }

    //=======================
    // Actions CV: ClusterVis
    //=======================
    async _fActionNodeCV_CV(node, parentNode) {
      this._showChart(node, parentNode.id, state.views.cluster);
    }

    //---------------
    async _fActionNodeCV_IC(node, parentNode) {
      this._showChart(node, parentNode.id, state.views.iris);
    }

    //---------------
    async _fActionNodeCV_GM(node, parentNode) {
      this._showChart(node, parentNode.id, state.views.glyphmatrix);
    }

    //---------------
    async _fActionNodeCV_PL(node, parentNode) {
      this._showChart(node, parentNode.id, state.views.listing, false, undefined, true);
    }

    //---------------
    async _fActionNodeCV_HC(node, parentNode) {
      this._showChart(node, parentNode.id, state.views.barchart, false, undefined, true);
    }

    async _fActionNodeCV_NQ(node, parentNode) {
        this._showChart(node, parentNode.id, state.views.query, false);
    }

    //---------------
    async _fActionEdgeNE_PL(edge, parentNode) {
        this._showChart(edge, parentNode.id, state.views.listing, false, undefined);
    }

    async _fActionNodeNE_CV(node, parentNode) {
        this._showChart(node, parentNode.id, state.views.cluster, false, undefined);
    }

    //---------------
    async _fActionNodeNE_IC(node, parentNode) {
        this._showChart(node, parentNode.id, state.views.iris, false);
    }

    //---------------
    async _fActionNodeNE_GM(node, parentNode) {
      this._showChart(node, parentNode.id, state.views.glyphmatrix, false);
    }

    //---------------
    async _fActionNodeNE_PL(node, parentNode) {
        this._showChart(node, parentNode.id, state.views.listing, false);
    }

    async _fActionNodeNE_HC(node, parentNode) {
      this._showChart(node, parentNode.id, state.views.barchart, false);
    }

    async _fActionNodeNE_NQ(node, parentNode, parentChart) {
        this._showChart(node, parentNode.id, state.views.query, false);
    }


  async _fActionEdgeNE_GM(edge, parentId) {
        
    }
    //=======================
    // Actions IC: Iris
    //=======================
    //---------------
    async _fActionNodeIC_CV(nodeIris, parentNode) {
                let vOrder = await parentNode.getVOrder();
                let sourceNode = await parentNode.getSourceObject();
                let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
                this._showChart(targetNode, parentNode.id, state.views.cluster, true);
            }
    async _fActionNodeIC_IC(nodeIris, parentNode) {
          let vOrder = await parentNode.getVOrder();
          let sourceNode = await parentNode.getSourceObject();
          let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
          this._showChart(targetNode, parentNode.id, state.views.iris , true, targetNode);
      }

    //---------------
    async _fActionNodeIC_GM(nodeIris, parentNode) {
        let vOrder = await parentNode.getVOrder();
          let sourceNode = await parentNode.getSourceObject();
          let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
          this._showChart(targetNode, parentNode.id, state.views.glyphmatrix , true, targetNode);
    }
    async _fActionNodeIC_IC_SameView(nodeIris, parentNode) {
          let vOrder = await parentNode.getVOrder();
          let sourceNode = await parentNode.getSourceObject();
          let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
          this._showChart(targetNode, parentNode.id, state.views.iris , true, targetNode);
      }

      //---------------
    async _fActionNodeIC_PL(nodeIris, parentNode) {
          let sourceNode = await parentNode.getSourceObject();
          let vOrder = await parentNode.getVOrder();
          let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
          this._showChart(sourceNode, parentNode.id, state.views.listing, true, targetNode);
      }

      //---------------
    async _fActionNodeIC_PLOnName(nodeIris, parentNode) {
          let vOrder = await parentNode.getVOrder();
          let node = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
          this._showChart(node, parentNode.id, state.views.listing, false, undefined);
      }

      //---------------
    async _fActionNodeIC_HC(nodeIris, parentNode) {
          let vOrder = await parentNode.getVOrder();
          let sourceNode = await parentNode.getSourceObject();
          let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
          this._showChart(sourceNode, parentNode.id, state.views.barchart, true, targetNode);
      }

    async _fActionNodeIC_HCCluster(nodeIris, parentNode) {
            let vOrder = await parentNode.getVOrder();
            let sourceNode = await parentNode.getSourceObject();
            let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
            this._showChart(targetNode, parentNode.id, state.views.barchart , true, targetNode);
        }

  // Listing paper
  async _fActionNodeLP_NQ(node, parentNode, parentChart) {
        this._showChart(node, parentNode.id, state.views.query, false);
    }

  async _fActionNode_Service(node, parentId, service) {
    let query = state._queries[this.datasetName]
    
    const baseUrl = query.stylesheet.services.filter(d => d.label == service)[0].url;
    
    if (service === 'ACTA' && !node.pmid) {
        alert("ACTA is only available for scholarly articles with an associated PubMed ID.")
        return;
    }

    let uri = node.labels ? node.labels[1] : node.link
    let url = baseUrl + encodeURIComponent(service == 'ACTA' ? node.pmid : uri);
    window.open(url); 
  }

  /**
   * This function allows to create a new view from current view.
   * After create a new view , it will be added to the dashboard with a generated title
   * view: information on view to be created (from state)
   */
  @Method()
  async _showChart(node, parentId, view, isFromEdge=false, secondNode=null, isFromCluster=false, isFromHC=false) {

    let chartNode, viewChild, link, convertData;
    var parentPosition = await this.getPosition()
    var childId = "chart-" + state.indexChart;
    state._id_parent = childId;
    let _viewChild = select(this._dashboard.shadowRoot.querySelector(".graph"))
                      .append("mge-view")
                      .attr("x", parentPosition.x + 30)
                      .attr("y", parentPosition.y + 30)
                      .attr("dataset-name", this.datasetName)
                      .attr("type-vis", view.component)
                      .attr("id-view", childId);

    chartNode = await _viewChild.node().getChart()
    
    await chartNode.setData(node, state._data[this.datasetName], secondNode, isFromEdge, isFromCluster, isFromHC)
    convertData = await chartNode.setData()
    state.savedData = convertData;
    viewChild= _viewChild.node();

    let title = view.component === 'mge-query' ? view.title('Follow Up') : view.title;
    if (view.component != 'mge-nodelink') {
      if (secondNode) {
        title = `${title} (${node.labels[1]} and ${secondNode.labels[1]})`
      } else if (node) {
        if (node.labels) 
          title = `${title} (${node.labels[1]})`
        else if (node.label) {
          title = `${title} (${node.label})`
        }
      }
    } 
    
    await viewChild.setTitle(title)

    link = await this._dashboard._addLink(this.element, viewChild)

    await this._dashboard.addChart(parentId, {
              id: childId, title: title, typeChart: view.component, hidden: false,
              x: viewChild.x, y: viewChild.y, view: viewChild, link: link
          })

    await this._dashboard.refreshLinks()

    return _viewChild
  }

  @Method()
  async setDatasetName(value) {
    this.datasetName = value;
  }

  componentDidRender(){    
    this._initContextMenu();
    this._initAction();
    this.selLinkPai = select(this._dashboard.shadowRoot.querySelector(".F-" + this.idView));
    this.selLinkFilhos = selectAll(this._dashboard.shadowRoot.querySelectorAll(".P-" + this.idView));
    this.selConect = select(this._dashboard.shadowRoot.querySelector("." + this.idView));
    this._position.x = this.x;
    this._position.y = this.y;
    this._center.cx = this._position.x + this._dimView.width / 2;
    this._center.cy = this._position.y + this._dimView.height / 2;
  }

  componentDidLoad(){
      this.viewDiv = select(this.element.shadowRoot.querySelector("#" + this.idView + "-g"  ))
                      .attr("width", this.width)
                      .attr("height", this.height)
                      .style("left", this._position.x +"px")
                      .style("top", this._position.y +"px")
                      .style("position", "absolute")
                      // .style("border-style", "groove")
                      // .style("border-width", "0.5px")
                      .style("box-shadow", "0 2px 4px rgb(0 0 0 / 20%")
                      .on("mouseover", this._onMouseOverContent.bind(this))
                      .on("mouseout", this._onMouseOutContent.bind(this));
                      
                      
      
      this.buildChart(this.viewDiv);
      this.mover = this.element.shadowRoot.querySelector("#" + this.idView + '-t');
      this.cont = this.element.shadowRoot.querySelector("#" + this.idView + "-g");
      this.dragElement(this.mover);
      this.setResizable();
  }


  render() {
    return (
      <Host>
        <div id={ this.idView + "-g" } >
            <div class="resizer resizer-i resizer-autohide"></div>
            <div class="resizer resizer-r"></div>
            <div class="resizer resizer-b"></div>
        </div>
      </Host>
    );
  }

}
