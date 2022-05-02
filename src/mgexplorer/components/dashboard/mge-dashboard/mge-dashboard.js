var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Element, Host, Prop, h, Method } from '@stencil/core';
import { select, selectAll } from 'd3-selection';
import { drag } from 'd3-drag';
import state from "../../../store";
import { toPng, toSvg } from 'html-to-image';


// import * as $ from 'jquery';
let MgeDashboard = class MgeDashboard {
    // @Prop({ mutable: true }) _configView = {};
    constructor() {
        /** type of visualization which want to create in inital point */
        this.initComponent = "mge-query";
        this.title = "[]";
        /** x-coordinate (The horizontal value in a pair of coordinates) of the dashboard*/
        this.x = 0;
        /** y-coordinate (The vertical value in a pair of coordinates) of the dashboard*/
        this.y = 0;
        /** Stores the tree of connections between views */
        this._treeCharts = null; // Stores the tree of connections between views
        /** Stores the graph that contains history */
        this._historyChart = null; // Stores the graph that contains history
        this._treeCharts = null, // Stores the tree of connections between views
            this._historyChart = null, // Stores the graph that contains history
            this._dashboardArea = {
                div: null,
                dash: null,
                svg: null,
                width: 0,
                height: 0
            };
        this._dashboardArea.div = select("#viewArea");
        this._dashboardArea.width = this._dashboardArea.div.node().scrollWidth;
        this._dashboardArea.height = this._dashboardArea.div.node().scrollHeight;
        const that = this;
        this._dragConect = drag().on("drag", function (e, d) { return that._onDragConect.call(this, e, d, that); });
        this.datasetName = "data-" + state.indexQueryData;
    }
    /** Get all of params from list pre-defined query to save in global variables.
     * Global variable in this case is a set of public variables that all components in the application can use)
     * */
    setParams(globalParams, locals) {
        state.globalParams = globalParams;
        state.queriesList = locals.queries;
    }
    /** This function allows to store new dataset which got from mge-query to a global variable
      */
    setData(_) {
        // Store JSON formatted data to global variable of application 
        state._data[this.datasetName] = JSON.parse(_);
    }
    /** This function is to create links from parent window and the children windown
      * It includes connection and line links
      */
    async _addLink(viewParent, viewChild) {
        let line, conect;
        let centerViewParent = await viewParent.getCenter(), centerViewChild = await viewChild.getCenter();
        if (typeof centerViewParent !== "undefined" && typeof centerViewChild !== "undefined") {
            this._dashboardArea.svg.select("defs").append("marker").attr("id", "arrow PA-" + await viewParent.idChart() + " FA-" + await viewChild.idChart()).attr("markerWidth", 30).attr("markerHeight", 30).attr("orient", "auto").attr("refY", 2).attr("fill", "#3383FF").attr("refX", 140).append("path").attr("d", "M0,0 L4,2 0,4").attr("x1", centerViewParent.cx).attr("y1", centerViewParent.cy).attr("x2", centerViewChild.cx).attr("y2", centerViewChild.cy);
            // this._dashboardArea.svg.querySelector(".defs").append("marker").attr("id", "hidden-"+ await viewParent.idChart()).attr("markerWidth", 30).attr("markerHeight", 30).attr("orient", "auto").attr("refY", 2).attr("fill","#3383FF").attr("refX",2);
            line = this._dashboardArea.svg.
                insert("line", ".DS-conect")
                .attr("x1", centerViewParent.cx)
                .attr("y1", centerViewParent.cy)
                .attr("x2", centerViewChild.cx)
                .attr("y2", centerViewChild.cy)
                .attr("marker-end", "url(#arrow PA-" + await viewParent.idChart() + " FA-" + await viewChild.idChart() + ")")
                .attr("class", "DS-linkChartShow P-" + await viewParent.idChart() + " F-" + await viewChild.idChart());
            conect = this._dashboardArea.svg.
                append("rect")
                .datum([{ x: centerViewChild.cx, y: centerViewChild.cy, viewParent: viewParent, viewChild: viewChild }])
                .attr("class", "DS-conect " + await viewChild.idChart())
                .attr("x", centerViewChild.cx - 6)
                .attr("y", centerViewChild.cy - 6)
                .attr("rx", d => viewChild.typeVis == "mge-query" ? 12 : 0)
                .attr("ry", d => viewChild.typeVis == "mge-query" ? 12 : 0)
                .attr("width", 12)
                .attr("height", 12)
                .on("click", () => {
                this.showView(viewChild);
            });
            conect.append("title").text(viewChild.titleView);
            conect.call(this._dragConect);
            // Create circle instead of rect for mge-query 
            if (viewChild.typeDiv == "mge-query") {
                conect.attr("rx", 12).attr("ry", 12);
            }
        }
        return { line: line, conect: conect, visible: true };
    }
    //---------------------
    /** This function is to show the view includes chart
      * It will be updated depend on the status of the view in tree history
      */
    async showView(view) {
        let nodeTree = await this.getChart(await view.idChart());
        let node = nodeTree;
        while (node.link.visible === false) {
            node.link.visible = true;
            node = node.parentNode;
            node.isLeaf = false;
            if (node.parentNode == null) // Check if root
                break;
        }
        nodeTree.hidden = false;
        view.setVisible(true);
        this.refreshLinks();
    }
    ;
    /** This method hides the given view from the dashboard (CSS - display:none) and update the status of this
    view in the history panel (mge-history).
        */
    async closeView(view) {
        let nodeTree = await this.getChart(await view.idChart());
        let node = nodeTree;
        if (node.isLeaf) {
            while (node != null) {
                // node.link.visible = false;
                if (temFilhosVisiveis(node.parentNode)) {
                    break;
                }
                else {
                    node.parentNode.isLeaf = true;
                }
                node = node.parentNode;
                if (node.hidden === false) {
                    break;
                }
            }
        }
        nodeTree.hidden = true;
        view.setVisible(false);
        this.refreshLinks();
        function temFilhosVisiveis(node) {
            let i;
            if (node.children === undefined)
                return false;
            else {
                for (i = 0; i < node.children.length; i++)
                    //          if (node.children[i].hidden===false)
                    if (node.children[i].link.visible)
                        return true;
            }
            return false;
        }
    }
    /** Drag event from connection of the views
      */
    async _onDragConect(event, d, globalThis) {
        let dt, line, rects, selPaiArrow, selFilhosArrows;
        d.x = event.x;
        d.y = event.y;
        select(this).attr("x", d.x - 6).attr("y", d.y - 6);
        dt = select(this).datum();
        line = globalThis._dashboardArea.svg.select(".F-" + await dt[0].viewChild.idChart());
        rects = globalThis._dashboardArea.svg.selectAll(".P-" + await dt[0].viewChild.idChart());
        selPaiArrow = globalThis._dashboardArea.svg.select(".FA-" + await dt[0].viewChild.idChart());
        selFilhosArrows = globalThis._dashboardArea.svg.selectAll(".PA-" + await dt[0].viewChild.idChart());
        line.attr("x2", d.x).attr("y2", d.y);
        rects.attr("x1", d.x).attr("y1", d.y);
        selPaiArrow.attr("x2", d.x).attr("y2", d.y).attr("refX", (d.x - selPaiArrow.attr("x1")) / 4);
        selFilhosArrows.attr("x1", d.x).attr("y1", d.y).attr("refX", (d.x - selFilhosArrows.attr("x1")) / 4);
        dt[0].viewChild.setCenter(d.x, d.y); // Move the hidden window
        dt[0].viewChild.refresh();
        dt[0].x = d.x;
        dt[0].y = d.y;
    }
    async getChart(idChart) {
        return getChartRec(this._treeCharts);
        function getChartRec(nodeTree) {
            let tempNodeTree;
            if (nodeTree == null)
                return null;
            if (nodeTree.id === idChart)
                return nodeTree;
            if (nodeTree.children === undefined)
                return null;
            for (let i = 0; i < nodeTree.children.length; i++) {
                tempNodeTree = getChartRec(nodeTree.children[i]);
                if (tempNodeTree != null)
                    return tempNodeTree;
            }
            return null;
        }
    }
    ;
    /** This method adds a new view to the dashboard and update the tree history with information regarding the new view.
      */
    async addChart(idParent, objChart) {
        let nodeTree, link;
        if (idParent === 0) {
            if (this._treeCharts == null) {
                this._treeCharts = {
                    id: objChart.id, title: objChart.title, typeChart: objChart.typeChart, hidden: objChart.hidden,
                    x: objChart.x, y: objChart.y, view: objChart.view,
                    parentNode: null, isLeaf: true, link: null
                };
            }
            else {
                return;
            }
        }
        else {
            nodeTree = await this.getChart(idParent);
            if (nodeTree == null)
                return;
            if (nodeTree.children === undefined)
                nodeTree.children = [];
            nodeTree.isLeaf = false;
            // link = _addLink(nodeTree.view, objChart.view);
            nodeTree.children.push({
                id: objChart.id, title: objChart.title, typeChart: objChart.typeChart, hidden: objChart.hidden,
                x: objChart.x, y: objChart.y, view: objChart.view,
                parentNode: nodeTree, isLeaf: true, link: objChart.link
            });
        }
    }
    ;
    refreshSvg() {
        this._dashboardArea.width = this._dashboardArea.div.node().scrollWidth;
        this._dashboardArea.height = this._dashboardArea.div.node().scrollHeight;
        this._dashboardArea.svg.attr("width", this._dashboardArea.width);
        this._dashboardArea.svg.attr("height", this._dashboardArea.height);
    }
    ;
    /** This function is to clear all of elements in dashboard
      * It will be run when clicking re-run for new query in initial point
      */
    resetDashboard() {
        selectAll(this.element.shadowRoot.querySelectorAll('line, rect, mge-view[id-view]:not([id-view="chart-0"]):not([id-view="chart-history"])')).remove();
        this._treeCharts.children = [];
        this.refreshLinks();
    }
    addScreenshot() {

       
        let _btnSaveScreen = select("#captureButton");
        _btnSaveScreen.on("click", (event, d) => {
            let isSVG = select("#typeCapture").node().checked;
            var scale = 2;
            if (isSVG) {
                toSvg(this.element.shadowRoot.querySelector(".contentDashboard"), {
                    quality: 1.0,
                    backgroundColor: '#FFFFFF',
                    width: this._dashboardArea.width * scale,
                    height: this._dashboardArea.height * scale,
                    style: {
                        transform: 'scale(' + scale + ')',
                        transformOrigin: 'top left'
                    }
                })
                    .then(dataURL => {
                    // It will return a canvas element
                    var linkScreenShot = document.createElement('a');
                    linkScreenShot.href = dataURL;
                    linkScreenShot.download = `screenshot_${Date.now()}.svg`;
                    // Firefox requires the link to be in the body
                    document.body.appendChild(linkScreenShot);
                    // simulate click
                    linkScreenShot.click();
                    // remove the link when done
                    document.body.removeChild(linkScreenShot);
                })
                    .catch(function (error) {
                    console.error('oops, something went wrong!', error);
                });
            }
            else {
                toPng(this.element.shadowRoot.querySelector(".contentDashboard"), {
                    quality: 1.0,
                    backgroundColor: '#FFFFFF',
                    width: this._dashboardArea.width * scale,
                    height: this._dashboardArea.height * scale,
                    style: {
                        transform: 'scale(' + scale + ')',
                        transformOrigin: 'top left'
                    }
                })
                    .then(dataURL => {
                    // It will return a canvas element
                    var linkScreenShot = document.createElement('a');
                    linkScreenShot.href = dataURL;
                    linkScreenShot.download = `screenshot_${Date.now()}.png`;
                    // Firefox requires the link to be in the body
                    document.body.appendChild(linkScreenShot);
                    // simulate click
                    linkScreenShot.click();
                    // remove the link when done
                    document.body.removeChild(linkScreenShot);
                })
                    .catch(function (error) {
                    console.error('oops, something went wrong!', error);
                });
            }
        });
    }
    async addDashboard(_svg) {
        this._historyChart = _svg.append("mge-view")
            .attr("x", this.x)
            .attr("y", this.y + 400)
            .attr("type-vis", "mge-history")
            .attr("title-view", "History")
            .attr("id-view", "chart-history");
        this._initView = _svg
            .append("mge-view")
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("dataset-name", this.datasetName)
            .attr("type-vis", this.initComponent)
            .attr("title-view", "Initial query")
            .attr("id-view", "chart-0");
        if (typeof await this._initView.node().getChart() !== "undefined") {
            let _initView = await this._initView.node().getChart();
            await _initView.setData(state._data[this.datasetName]);
            if (this.initComponent == "mge-query")
                await _initView.setInitial();
        }
        this.addChart(0, {
            id: "chart-0", title: "Initial query", typeChart: this.initComponent, hidden: false,
            x: this.x, y: this.y, view: this._initView.node()
        });
        await this.refreshLinks();
        this.addScreenshot();
    }
    /** This function is to refresh the status of the links and connection
      */
    async refreshLinks() {
        refreshLinksRec(this._treeCharts);
        this._historyChart.node().componentOnReady().then(async () => {
            let viewChart = await this._historyChart.node().getChart();
            if (typeof viewChart !== "undefined")
                await viewChart.setTree(this._treeCharts);
        });
        function refreshLinksRec(nodeTree) {
            if (nodeTree != null) {
                processNode(nodeTree);
            }
            if (nodeTree.children !== undefined) {
                for (let i = 0; i < nodeTree.children.length; i++) {
                    refreshLinksRec(nodeTree.children[i]);
                }
            }
        }
        function processNode(nodeTree) {
            if (nodeTree.link != null) {
                if (nodeTree.link.visible) {
                    if (nodeTree.hidden === true || (nodeTree.parentNode.hidden && !nodeTree.hidden)) {
                        nodeTree.link.line.classed("DS-linkChartShow", false);
                        nodeTree.link.line.classed("DS-linkChartHidden", true);
                        // nodeTree.link.line.attr("marker-end", "url(#hidden)")
                    }
                    else {
                        nodeTree.link.line.classed("DS-linkChartShow", true);
                        nodeTree.link.line.classed("DS-linkChartHidden", false);
                        // nodeTree.link.line.attr("marker-end", "url(#arrow" + nodeTree.id)
                    }
                    nodeTree.link.conect.style("display", null);
                    nodeTree.link.line.style("display", null);
                }
                else {
                    nodeTree.link.conect.style("display", "none");
                    nodeTree.link.line.style("display", "none");
                }
            }
        }
    }
    ;
    componentDidRender() {
        if (state._data[this.datasetName] != null) {
            state._data[this.datasetName].nodes.dataNodes.forEach(function (node) {
                node.idOrig = node.id;
            });
        }
        else {
            testdata.nodes.dataNodes.forEach(function (node) {
                node.idOrig = node.id;
            });
            state._data[this.datasetName] = testdata;
        }
    }
    componentDidLoad() {
        let svg = select(this.element.shadowRoot.querySelectorAll(".graph")[0]);
        this._dashboardArea.svg = select(this.element.shadowRoot.querySelectorAll(".linktool")[0])
            .attr("width", this._dashboardArea.width)
            .attr("height", this._dashboardArea.height)
            .style("top", 0)
            .style("left", 0)
            .style("right", 0)
            .style("position", "absolute");
        this.addDashboard(svg);
    }
    render() {
        return (h(Host, null,
            h("div", { class: "contentDashboard", style: { "width": "100%", "height": "100%" } },
                h("div", { class: "graph" }),
                h("svg", { class: "linktool" },
                    h("defs", null)))));
    }
};
__decorate([
    Element()
], MgeDashboard.prototype, "element", void 0);
__decorate([
    Prop()
], MgeDashboard.prototype, "initComponent", void 0);
__decorate([
    Prop({ mutable: true })
], MgeDashboard.prototype, "x", void 0);
__decorate([
    Prop({ mutable: true })
], MgeDashboard.prototype, "y", void 0);
__decorate([
    Prop({ mutable: true })
], MgeDashboard.prototype, "_initView", void 0);
__decorate([
    Prop({ mutable: true })
], MgeDashboard.prototype, "datasetName", void 0);
__decorate([
    Prop({ mutable: true })
], MgeDashboard.prototype, "_treeCharts", void 0);
__decorate([
    Prop({ mutable: true })
], MgeDashboard.prototype, "_historyChart", void 0);
__decorate([
    Prop({ mutable: true })
], MgeDashboard.prototype, "_dashboardArea", void 0);
__decorate([
    Prop({ mutable: true })
], MgeDashboard.prototype, "_dragConect", void 0);
__decorate([
    Method()
], MgeDashboard.prototype, "setParams", null);
__decorate([
    Method()
], MgeDashboard.prototype, "setData", null);
__decorate([
    Method()
], MgeDashboard.prototype, "_addLink", null);
__decorate([
    Method()
], MgeDashboard.prototype, "showView", null);
__decorate([
    Method()
], MgeDashboard.prototype, "closeView", null);
__decorate([
    Method()
], MgeDashboard.prototype, "getChart", null);
__decorate([
    Method()
], MgeDashboard.prototype, "addChart", null);
__decorate([
    Method()
], MgeDashboard.prototype, "refreshSvg", null);
__decorate([
    Method()
], MgeDashboard.prototype, "resetDashboard", null);
__decorate([
    Method()
], MgeDashboard.prototype, "refreshLinks", null);
MgeDashboard = __decorate([
    Component({
        tag: 'mge-dashboard',
        styleUrl: 'mge-dashboard.css',
        shadow: true,
    })
], MgeDashboard);
export { MgeDashboard };
