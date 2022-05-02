var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Element, Host, Prop, h, Method } from '@stencil/core';
import { tree, zoom, hierarchy } from "d3";
import { select } from 'd3-selection';
import Model from 'model-js';
let MgeHistory = class MgeHistory {
    constructor() {
        /** represents the width of the history panel*/
        this.width = 350;
        /** represents the height of the history panel*/
        this.height = 250;
        /** Represents the panel associated with the graphic */
        this.historyTreePanel = null; // Represents the panel associated with the graphic
        /** Space height for each node without the margins */
        this._nodoHeight = 14; // Space height for each node without the margins
        /** Distance from the text to the left coordinate of the node */
        this._leftText = 18; // Distance from the text to the left coordinate of the node
        /** Margin css of the node */
        this._nodeMargin = 1;
        /** The height symbol */
        this._rectHeight = this._nodoHeight - this._nodeMargin * 2;
        /** The tree layout to stored tree data*/
        this._treeLayout = tree().size([0, this._nodoHeight]);
        /** Vector with objects of all nodes */
        this._vNodes = []; // Vector with objects of all nodes
        /** Group representing history tree */
        this._grpHistory = null; // Group representing history tree
        /** Group representing nodes in the tree */
        this._grpNodes = null;
        this.model = Model();
        this._dashboard = document.querySelector("mge-dashboard");
    }
    /** This function is to set the data to the tree history data
      */
    async setTree(newTree) {
        this.setData(newTree);
    }
    /**
     * The initial function to create all of elements in the history treechart
     * In this function, it will set Geometric attributes of the graph
     * create actions on graph and manage all of the interaction on the graph
     * */
    async addHistoryTreeChart(idDiv, divTag) {
        this.model.margin = { top: 4, right: 4, bottom: 4, left: 4 };
        this.model.box = { width: this.width, height: this.height };
        let _svg = divTag.append("svg"), // Create dimensionless svg
        _grpChart = _svg.append("g"); // Does not exist in the original Iris
        this._grpHistory = _grpChart.append("g").attr("class", "HistoryTreeChart");
        // Add zoom event
        let _zoomListener = zoom().on("zoom", _chartZoom);
        _zoomListener.scaleExtent([0.9, 1.1]);
        // _svg.call(_zoomListener);
        this.model.when(["box", "margin"], (box, margin) => {
            this.model.widthChart = box.width - margin.left - margin.right;
            this.model.heightChart = box.height - margin.top - margin.bottom;
        });
        this.model.when("box", (box) => {
            _svg.attr("width", box.width).attr("height", box.height);
            select(this.element).attr("height", box.height).attr("width", box.width);
        });
        //---------------------
        this.model.when("margin", function (margin) {
            _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        });
        //---------------------
        this.model.when(["data"], () => {
            this._appendNodos();
            let maxLenghtTitle = this.model.widthChart, globalThis = this;
            updateSVGWidth();
            function updateSVGWidth() {
                globalThis._grpNodes.selectAll('text')
                    .each(function () {
                    let textlength = this.getComputedTextLength();
                    if (textlength > maxLenghtTitle)
                        maxLenghtTitle = textlength;
                    // console.log(this.getComputedTextLength())
                });
                _svg.attr("width", maxLenghtTitle + 50);
            }
        });
        function _chartZoom(event) {
            _zoomListener.scaleExtent([0.9, 1.1]);
            _grpChart.attr("transform", event.transform);
        }
    }
    _appendNodos() {
        if (this._grpNodes != null)
            this._grpNodes.remove();
        this._grpNodes = this._grpHistory.selectAll(".HT-grpNodos")
            .data(this._vNodes)
            .enter()
            .append("g")
            .attr("class", function (d) {
            if (d.data.id === "chart-history")
                return "HT-grpNodos HT-grpRoot";
            else
                return "HT-grpNodos";
        })
            .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
            .classed("HT-NodeHidden", function (d) { return d.data.hidden; });
        this._grpNodes.append("rect")
            .attr("x", this._nodeMargin)
            .attr("y", this._nodeMargin)
            .attr("rx", d => d.data.typeChart == "mge-query" ? 12 : 0)
            .attr("ry", d => d.data.typeChart == "mge-query" ? 12 : 0)
            .attr("height", this._rectHeight)
            .attr("width", this._rectHeight)
            .on("click", async (event, d) => {
            if (d.data.id !== "chart-history") {
                if (!d.data.hidden) {
                    await this._dashboard.closeView(d.data.view);
                }
                else {
                    await this._dashboard.showView(d.data.view);
                }
                this._grpNodes.classed("HT-NodeHidden", function (d) { return d.data.hidden; });
            }
        });
        this._grpNodes.append("text")
            .attr("x", this._leftText)
            .attr("y", this._nodoHeight / 2 + 3)
            .attr("text-anchor", "start")
            .text(function (d) {
            return d.data.title;
        });
    }
    /**
    * Set box size for the chart includes the content
    * input is a object includes height and width
    * If no arguments, It will return the value of box
    */
    async setBox(_) {
        if (!arguments.length)
            return this.model.box;
        this.model.box = _;
    }
    ;
    /** This function is to set the data to the chart
      * If no arguments, It will return the value of data
      */
    async setData(_) {
        if (!arguments.length)
            return this.model.data;
        this.model.data = _;
        this._vNodes = this._treeLayout(hierarchy(this.model.data)).descendants();
        this._vNodes.forEach((n, i) => {
            n.x = i * this._nodoHeight;
            n.y = n.depth * this._nodoHeight;
        });
        // _irisPanel.update();
        // setupPrimaryVersion();
    }
    ;
    componentWillLoad() {
        this.setBox(this.model.box);
    }
    buildChart(idDiv, svg) {
        this.addHistoryTreeChart(idDiv, svg);
    }
    componentDidLoad() {
        let svg = select(this.element.querySelectorAll(".history-tree")[0])
            .style("width", this.width + "px")
            .style("height", this.height + "px");
        this.buildChart("history-tree", svg);
    }
    render() {
        return (h(Host, null,
            h("div", { class: "history-tree" })));
    }
};
__decorate([
    Element()
], MgeHistory.prototype, "element", void 0);
__decorate([
    Prop()
], MgeHistory.prototype, "width", void 0);
__decorate([
    Prop()
], MgeHistory.prototype, "height", void 0);
__decorate([
    Prop({ mutable: true })
], MgeHistory.prototype, "historyTreePanel", void 0);
__decorate([
    Prop({ mutable: true })
], MgeHistory.prototype, "_nodoHeight", void 0);
__decorate([
    Prop({ mutable: true })
], MgeHistory.prototype, "_leftText", void 0);
__decorate([
    Prop({ mutable: true })
], MgeHistory.prototype, "_nodeMargin", void 0);
__decorate([
    Prop({ mutable: true })
], MgeHistory.prototype, "_rectHeight", void 0);
__decorate([
    Prop({ mutable: true })
], MgeHistory.prototype, "_treeLayout", void 0);
__decorate([
    Prop({ mutable: true })
], MgeHistory.prototype, "_vNodes", void 0);
__decorate([
    Prop({ mutable: true })
], MgeHistory.prototype, "_dashboard", void 0);
__decorate([
    Prop({ mutable: true })
], MgeHistory.prototype, "_grpHistory", void 0);
__decorate([
    Prop({ mutable: true })
], MgeHistory.prototype, "_grpNodes", void 0);
__decorate([
    Method()
], MgeHistory.prototype, "setTree", null);
__decorate([
    Method()
], MgeHistory.prototype, "addHistoryTreeChart", null);
__decorate([
    Method()
], MgeHistory.prototype, "setBox", null);
__decorate([
    Method()
], MgeHistory.prototype, "setData", null);
MgeHistory = __decorate([
    Component({
        tag: 'mge-history',
        styleUrl: 'mge-history.css',
        shadow: false,
    })
], MgeHistory);
export { MgeHistory };
