var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Element, Host, Prop, h, Method } from '@stencil/core';
import { allPapersList, duoPapersList, clusterPapersList } from './process-data';
import Model from 'model-js';
import { ascending } from 'd3';
import { select } from 'd3-selection';
let MgeListing = class MgeListing {
    constructor() {
        /** represents the width of the paper's list chart*/
        this.width = 350;
        /** represents the height of the paper's list chart*/
        this.height = 350;
        /** The dataset name being used */
        this.datasetName = "[]";
        /** represents the panel associated with the graph*/
        this._papersListPanel = null; // represents the panel associated with the graph
        this._sortByText = true;
        /** Group representing IRIS*/
        this._grpPapersList = null; // Group representing IRIS 
        /** Selection that contains all groups of bars*/
        this._grpPapers = null; // Selection that contains all groups of bars
        /** Selection that contains the names of the members of a cluster*/
        this._names = null; // Selection that contains the names of the members of a cluster
        /** Maximum length of title*/
        this._maxLenghtTitleIndex = 7.8;
        /** Maximum length of names*/
        this._maxNamesLenght = 87;
        /** List of items in the data*/
        this._data = null;
        /** Colors for the different types*/
        this._colorsRect = ["#1f77b4", "#2ca02c", "#d62728", "#ff7d0e"]; // colors for the different types
        this.sortByType = function () {
            this._sortByText = false;
            this._data.root.data.documents.sort(function (x, y) {
                return x.type.label.localeCompare(y.type.label);
            });
            this.model.redraw += 1;
        };
        this.sortByFirstAuthor = function () {
            this._sortByText = false;
            this._data.root.data.documents.sort((x, y) => {
                if (x.authors[0] == this._data.root.data.id || y.authors[0] == this._data.root.data.id)
                    return -1;
                else {
                    let authorNameX = this._findAuthorById(x.authors[0]);
                    let authorNameY = this._findAuthorById(y.authors[0]);
                    return authorNameX.localeCompare(authorNameY);
                }
            });
            this.model.redraw += 1;
        };
        this.model = Model();
        this._dashboard = document.querySelector("mge-dashboard");
    }
    //---------------------
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
    //---------------------
    async dataVisToNode(index) {
        return this.model.data.children.data[index];
    }
    ;
    //---------------------
    /** This function is to set the data to the listing papers chart
      * If no arguments, It will return the value of data
      */
    async setData(_, globalData, secondNode, isFromEdge = false, isFromCluster = false, isFromHC = false) {
        if (!arguments.length)
            return this.model.data;
        if (isFromEdge) {
            _ = duoPapersList(_, secondNode, globalData);
        }
        else if (isFromCluster) {
            _ = clusterPapersList(_, globalData);
        }
        else if (isFromHC) {
            _ = JSON.parse(JSON.stringify(_));
            _ = _.root.data;
        }
        else {
            _ = allPapersList(_, globalData);
        }
        this.model.data = _;
        let headerHeight = 50;
        this._view.height = this.model.box.height;
        // _papersListPanel.update();
        // _irisPanel.update();
        // setupPrimaryVersion();
    }
    ;
    sortByText() {
        this._sortByText = false;
        this._data.root.data.documents.sort(function (x, y) {
            return ascending(x.title, y.title);
        });
        this.model.redraw += 1;
    }
    ;
    //---------------------
    sortByYear() {
        this._sortByText = false;
        this._data.root.data.documents.sort(function (x, y) {
            return ascending(x.date, y.date);
        });
        this.model.redraw += 1;
    }
    ;
    addPaperListChart(idDiv, divTag) {
        this.model.margin = { top: 2, right: 2, bottom: 2, left: 2 };
        this.model.box = { width: this.width, height: this.height };
        this.model.pInnerRadius = 0.13; // Percentage relative to graph width for _innerRadius calculation
        this.model.pOuterRadius = 0.57; // Percentage relative to graph width for _OuterRadius calculation
        this.model.pMaxHeightBar = 0.15; // Percentage relative to graph width for _MaxHeightBar calculation
        this.model.pFocusWidthBar = 0.0275; // Percentage relative to graph width for calculation of _focusArea.widthBar
        this.model.pMinWidthBar = 0.01; // Percentage relative to graph width for calculation of _minArea.widthBar Original 4
        this.model.indexAttBar = 0; // Index of the attribute that will be plotted in the toolbar
        this.model.redraw = 0;
        // ---------------- Initialization Actions
        let _svg = divTag.append("svg"), // Create dimensionless svg
        _grpChart = _svg.append("g");
        // Add zoom event
        // let _zoomListener = zoom().on("zoom", _chartZoom);
        // _zoomListener.scaleExtent([0.9, 1.1]);
        // _svg.call(_zoomListener);
        _svg.attr("class", "PaperListView");
        this._grpPapersList = _grpChart.append("g").attr("class", "PapersListChart");
        //===================================================
        this.model.when(["box", "margin"], (box, margin) => {
            this.model.widthChart = box.width - margin.left - margin.right;
            this.model.heightChart = box.height - margin.top - margin.bottom;
        });
        this.model.when("box", (box) => {
            _svg.attr("width", box.width).attr("height", box.height);
            select(this.element.querySelectorAll(".paper-list")[0]).style("width", box.width + "px").style("height", box.height + "px");
            select(this.element).attr("height", box.height).attr("width", box.width);
        });
        //---------------------
        this.model.when("margin", function (margin) {
            _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        });
        //---------------------
        this.model.when(["data", "widthChart", "heightChart", "redraw"], () => {
            if (this._grpPapers !== null)
                this._grpPapers.remove();
            this._data = this.model.data;
            if (this._sortByText)
                this.sortByText();
            let endOfNames = 0;
            if (this.model.data.root.data.documents.length * 38 >= 350) {
                _svg.attr("height", this.model.data.root.data.documents.length * 38);
            }
            if (this.model.data.children.cluster === true) {
                if (this._names !== null)
                    this._names.remove();
                let authors = [];
                this.model.data.children.data.forEach(d => {
                    authors.push(d.labels[1]);
                });
                // Cluster term
                this._grpPapersList.append("text")
                    .attr("class", "PL-names")
                    .text("Cluster: ")
                    .attr("x", 10)
                    .attr("y", 12)
                    .style("font-size", "12px")
                    .append("title")
                    .text("Cluster: " + authors.join(','));
                let y = 12;
                this._names = this._grpPapersList.selectAll(".PL-grpNames")
                    .data(authors)
                    .enter()
                    .append("text")
                    .attr("class", "PL-names")
                    .attr('transform', (d, i) => `translate(55, ${y + i * 12})`)
                    .style("font-size", "12px")
                    .text(d => d);
                endOfNames = authors.length * 12 + y;
            }
            let x = 5, y = (this.model.data.children.cluster === true ? endOfNames + 15 : 15);
            this._grpPapers = this._grpPapersList.selectAll(".PL-grpPapers")
                .data(this.model.data.root.data.documents)
                .enter()
                .append("g")
                .attr("class", "PL-grpPapers")
                .attr('transform', (_, i) => `translate(${x}, ${y + 35 * i})`);
            this._grpPapers.append("rect")
                .attr("class", "PL-type")
                .attr("height", 10)
                .attr("width", 10)
                .attr("fill", (d) => {
                return this._colorsRect[d.type.index];
            })
                .append("title")
                .text(d => d.type.label);
            let maxLenghtTitle = this.model.widthChart;
            const protocol = window.location.protocol + '//';
            const hostname = window.location.host;
            x = 15;
            this._grpPapers.append('a')
                .attr("xlink:href", function (d) { return d.link; })
                .attr("target", "_blank")
                .classed('PL-icon', true)
                .append("image")
                .attr('xlink:href', '../../../assets/images/external-link.svg')
                // ../../../assets/images/ui-icons_555555_256x240.png
                // .attr('xlink:href', protocol + hostname + 'assets/images/external-link.svg') 
                .attr('width', 12)
                .attr('height', 12)
                .attr('transform', `translate(${x}, ${-2})`);
            x = 35;
            this._grpPapers.append("text")
                .attr("class", "PL-title")
                .text(d => d.date ? '(' + d.date + ') ' + d.title : d.title)
                .attr("x", x)
                .style("font-size", "12px")
                .append("title")
                .text(function (d) { return d.title; });
            this._grpPapers.append("text")
                .attr("class", "PL-infos")
                .text((d) => this._getAuthorList(d))
                .attr('transform', `translate(${x}, 15)`)
                .style("font-size", "12px")
                .append("title")
                .text((d) => this._getAuthorList(d));
            let globalThis = this;
            updateSVGWidth();
            function updateSVGWidth() {
                globalThis._grpPapers.selectAll('text')
                    .each(function () {
                    let textlength = this.getComputedTextLength();
                    if (textlength > maxLenghtTitle)
                        maxLenghtTitle = textlength;
                    // console.log(this.getComputedTextLength())
                });
                _svg.attr("width", maxLenghtTitle + 50);
            }
        } // End
        );
        /**
       * Zoom event
       */
        // function _chartZoom(event) {
        //     _zoomListener.scaleExtent([0.9, 1.1]);
        //     _grpChart.attr("transform", event.transform)
        // }
    }
    //--------------------------------- Private functions
    _getAuthorList(d) {
        if (d.authorList != null) {
            return d.authorList.replaceAll('--', ' and ');
        }
        let authors = [];
        d.authors.forEach(e => {
            authors.push(this._findAuthorById(e));
        });
        return authors.join(', ').replaceAll(',,', ',');
        ;
    }
    /**
     *
     * _getTheRightOrder
     *
     * Returns the index for the color
     *
     * @param type
     * @returns number
     * @private
     */
    _getTheIndex(type) {
        switch (type) {
            case "publications":
                return 0;
            case "conference paper":
                return 1;
            case "report":
                return 2;
            case "article":
                return 3;
        }
    }
    /**
     *
     * _findAuthorById
     *
     * Returns the author depending on his id
     *
     * @param id
     * @returns string
     * @private
     */
    _findAuthorById(id) {
        for (let i = 0; i < this.model.data.children.data.length; i++) {
            if (this.model.data.children.data[i].id === id) {
                return this.model.data.children.data[i].labels[1];
            }
            else if (this.model.data.children.data[i].idOrig === id) {
                return this.model.data.children.data[i].labels[1];
            }
        }
        if (this.model.data.children.others.length === 0) {
            return "Not known";
        }
        else {
            for (let j = 0; j < this.model.data.children.others.length; j++) {
                if (this.model.data.children.others[j].id === id) {
                    return this.model.data.children.others[j].labels[1];
                }
                else if (this.model.data.children.others[j].idOrig === id) {
                    return this.model.data.children.others[j].labels[1];
                }
            }
        }
    }
    buildChart(idDiv, svg) {
        this.addPaperListChart(idDiv, svg);
    }
    componentDidLoad() {
        this._view = this._dashboard.shadowRoot.querySelector("[id-view='" + this.element.id + "']");
        let svg = select(this.element.querySelectorAll(".paper-list")[0])
            .style("width", this.width + "px")
            .style("height", this.height + "px");
        this.buildChart("paper-list", svg);
    }
    render() {
        return (h(Host, null,
            h("div", { class: "paper-list" })));
    }
};
__decorate([
    Element()
], MgeListing.prototype, "element", void 0);
__decorate([
    Prop()
], MgeListing.prototype, "width", void 0);
__decorate([
    Prop()
], MgeListing.prototype, "height", void 0);
__decorate([
    Prop()
], MgeListing.prototype, "datasetName", void 0);
__decorate([
    Prop({ mutable: true })
], MgeListing.prototype, "_papersListPanel", void 0);
__decorate([
    Prop({ mutable: true })
], MgeListing.prototype, "_grpPapersList", void 0);
__decorate([
    Prop({ mutable: true })
], MgeListing.prototype, "_grpPapers", void 0);
__decorate([
    Prop({ mutable: true })
], MgeListing.prototype, "_names", void 0);
__decorate([
    Prop({ mutable: true })
], MgeListing.prototype, "_maxLenghtTitleIndex", void 0);
__decorate([
    Prop({ mutable: true })
], MgeListing.prototype, "_maxNamesLenght", void 0);
__decorate([
    Prop({ mutable: true })
], MgeListing.prototype, "_data", void 0);
__decorate([
    Prop({ mutable: true })
], MgeListing.prototype, "_colorsRect", void 0);
__decorate([
    Method()
], MgeListing.prototype, "setBox", null);
__decorate([
    Method()
], MgeListing.prototype, "dataVisToNode", null);
__decorate([
    Method()
], MgeListing.prototype, "setData", null);
MgeListing = __decorate([
    Component({
        tag: 'mge-listing',
        styleUrl: 'mge-listing.css',
        shadow: false,
    })
], MgeListing);
export { MgeListing };
