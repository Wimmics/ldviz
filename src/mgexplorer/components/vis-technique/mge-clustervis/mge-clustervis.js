var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Element, Host, Prop, h, Method } from '@stencil/core';
import { zoom, hierarchy, curveBundle, radialLine, schemeCategory10, groups, ascending } from "d3";
import { clusterClusterVis, normalClusterVis, sort } from "./process-data";
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { max } from 'd3-array';
import Model from 'model-js';
import state from "../../../store";
import { select } from 'd3-selection';
let MgeClustervis = class MgeClustervis {
    constructor() {
        /** represents the width of the Cluster chart*/
        this.width = 350;
        /** represents the height of the Cluster chart*/
        this.height = 350;
        /** The dataset name being used */
        this.datasetName = "[]";
        /** Represents the panel associated with the graphic */
        this._clusterVisPanel = null; // Represents the panel associated with the graphic
        /** Coordinate x of the center of the cluster */
        this._xClusterCenter = 0;
        /** Coordinate y of the center of the cluster */
        this._yClusterCenter = 0;
        /** (calculated) Internal circle radius where the graph is drawn */
        this._innerRadius = 0; // (calculated) Internal circle radius where the graph is drawn
        /** (calculated) Outernal circle radius where the graph is drawn */
        this._outerRadius = 0;
        /** Group representing ClusterVis */
        this._grpCluster = null; // Group representing ClusterVis
        /** Selection that contains all groups that store the rings */
        this._grpRings = null; // Selection that contains all groups that store the rings
        /** Selection that contains all groups that store the bars */
        this._grpBars = null;
        /** Selection that contains all groups that store the links */
        this._grpLinks = null;
        /** Selection that contains the links */
        this._links = null; // Selection that contains the links
        /** Indicates that the same scale should be used for all bars */
        this._sameScale = false; // Indicates that the same scale should be used for all bars
        this._vRings = []; // List with the data of the rings:
        // { indexAttr, typeAttr ("L"-label, "V"-value), pHeight (percentage of _widthAllFaixas, maxValue (maximum value of the data for the ring }
        this._barsArea = {
            widthBar: 0,
            angleBar: 0.0,
            startSector: 0,
            marginBar: 1,
            pMarginBar: 0.0033,
            maxBars: 0,
            numBars: 0 //  Number of bars in the clusterVis
        };
        this._dataLinks = {
            heightTree: 2,
            degreeTree: 2,
            tree: null,
            vBundleLinks: null,
            tension: 0.85,
            bundle: curveBundle // Beam generator
        };
        this._indexAttrSort = 0; // Index of the attribute used for sort (0-first labels[] 1000-first values[])
        // Vector of colors with 20 elements inverted (da d3)
        this._vCores20Inv = ["#17becf", "#bcbd22", "#7f7f7f", "#e377c2", "#8c564b", "#9467bd", "#9edae5", "#dbdb8d", "#c7c7c7", "#f7b6d2",
            "#c49c94", "#c5b0d5", "#ff9896", "#d62728", "#98df8a", "#2ca02c", "#ffbb78", "#ff7f0e", "#aec7e8", "#1f77b4"];
        this._vOrder = null; // Indirect ordering vector
        this._vAngle = null; // Vector that contains the angular measurement of each bar. Calculated at _calcGeometry
        this._grpBarsRotScale = scaleOrdinal(); // Scale used to set the angle of rotation of each bar
        this._ringScale = scaleLinear().domain([0, 100]);
        this._colorScale = scaleOrdinal(schemeCategory10);
        // ---------------- Model
        this.model = Model();
        this._sort = sort(); // Creates sorting function
        if (this.datasetName == "databaseUFRGS2004") {
            if (testnode.cluster) {
                this.chartData = clusterClusterVis(testnode, testdata);
            }
            else {
                this.chartData = normalClusterVis(testnode, testdata);
            }
        }
    }
    /**
     * The initial function to create all of elements in the cluster chart
     * In this function, it will set Geometric attributes of the graph
     * create actions on graph and manage all of the interaction on the graph
     * */
    async addClusterChart(idDiv, divTag) {
        this.model.margin = { top: 30, right: 40, bottom: 30, left: 40 };
        this.model.box = { width: this.width, height: this.height };
        this.model.pInnerRadius = 0.20; // Percentage of the width of the graph for calculating the _innerRadius
        this.model.pOuterRadius = 0.47; // Percentage of the width of the graph for calculating the _OuterRadius
        this.model.pWidthBar = 0.0275; // Percentage relative to the width of the graph for calculating the width of the bars
        this.model.redraw = 0; // When changed perform a redraw
        let _svg = divTag.append("svg"), //Create dimensionless svg
        _grpChart = _svg.append("g"); // Does not exist in the original Irisv
        this._drawLine = radialLine().curve(curveBundle.beta(0.85)) // Generator of splines that makes up the edges
            .radius(function (d) { return d.data.y; })
            .angle(function (d) { return d.data.x / 180 * Math.PI; });
        // Add zoom event
        let _zoomListener = zoom().on("zoom", _chartZoom);
        _zoomListener.scaleExtent([0.9, 1.1]);
        _svg.call(_zoomListener);
        this._grpCluster = _grpChart.append("g").attr("class", "ClusterVisChart");
        this._grpCluster.append("circle").attr("class", "CV-Inner");
        //===================================================
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
        this.model.when(["widthChart", "pInnerRadius"], (widthChart, pInnerRadius) => {
            this._innerRadius = Math.floor(widthChart * pInnerRadius);
            this._ringScale.range([this._innerRadius, this._outerRadius]);
        });
        //---------------------
        this.model.when(["widthChart", "pOuterRadius"], (widthChart, pOuterRadius) => {
            this._outerRadius = Math.floor(widthChart * pOuterRadius);
            this._ringScale.range([this._innerRadius, this._outerRadius]);
        });
        //---------------------
        this.model.when(["widthChart", "pWidthBar"], (widthChart, pWidthBar) => {
            this._barsArea.widthBar = widthChart * pWidthBar;
            this._barsArea.marginBar = widthChart * this._barsArea.pMarginBar;
        });
        //---------------------
        this.model.when(["data", "redraw"], async (data) => {
            this._xClusterCenter = Math.floor(this.model.widthChart / 2);
            this._yClusterCenter = Math.floor(this.model.heightChart / 2);
            this._grpCluster.attr("transform", "translate(" + this._xClusterCenter + "," + this._yClusterCenter + ")");
            await this._calcGeometry(data);
            this._grpBarsRotScale.range(this._vAngle).domain(this._vOrder);
            await this._calcCoordinates(data.nodes.dataNodes);
            _appendRings();
            _appendBars(data);
            _appendLinks();
            this._clusterVisPanel.updateClusterVisPanel();
        });
        var _appendRings = () => {
            if (this._grpRings != null)
                this._grpRings.remove();
            this._grpRings = this._grpCluster.selectAll(".CV-grpRings")
                .data(this._vRings) // Original _vRings
                .enter()
                .append("g")
                .attr("class", "CV-grpRings");
            this._grpRings.append("circle")
                .attr("r", (d) => { return this._ringScale(d.pHeight); });
        };
        /**
         * _appendBars
         *
         * Adds the SVG elements relative to the bars
         */
        var _appendBars = (data) => {
            let i, j, k, achei, maxDoAnel, categoriasAux = [], categorias = [];
            let circleScale = scaleOrdinal();
            if (this._grpBars != null)
                this._grpBars.remove();
            this._grpBars = this._grpCluster.selectAll(".CV-grpBars")
                .data(data.nodes.dataNodes)
                .enter()
                .append("g")
                .attr("class", "CV-grpBars")
                .attr("transform", (d, i) => { return "rotate(" + this._grpBarsRotScale(i) + ")"; });
            this._grpBars.append("line")
                .attr("x1", this._ringScale(0))
                .attr("y1", 0)
                .attr("x2", this._ringScale(100))
                .attr("y2", 0);
            for (i = 0; i < this._vRings.length; i++) {
                if (this._vRings[i].typeAttr === "L")
                    categoriasAux = categoriasAux.concat(this._vRings[i].vLabelDomain.sort());
            }
            // Removes duplicate vector elements
            k = 0;
            for (i = 0; i < categoriasAux.length; i++) {
                achei = false;
                for (j = 0; j < categorias.length; j++)
                    if (categoriasAux[i] === categorias[j]) {
                        achei = true;
                        break;
                    }
                if (!achei) {
                    categorias[k] = categoriasAux[i];
                    k++;
                }
            }
            if (this._sameScale) {
                maxDoAnel = -1;
                for (i = 0; i < this._vRings.length; i++) {
                    if (this._vRings[i].maxValue > maxDoAnel)
                        maxDoAnel = this._vRings[i].maxValue;
                }
                for (i = 0; i < this._vRings.length; i++) {
                    if (this._vRings[i].typeAttr === "V") {
                        this._vRings[i].barCircleScale.range([1, Math.floor(this._vRings[i].pHeightBar * (this._outerRadius - this._innerRadius))]).domain([0, maxDoAnel]);
                    }
                    else {
                        this._vRings[i].barCircleScale.range(this._vCores20Inv).domain(categorias);
                    }
                }
            }
            else {
                for (i = 0; i < this._vRings.length; i++) {
                    if (this._vRings[i].typeAttr === "V") {
                        this._vRings[i].barCircleScale.range([1, Math.floor(this._vRings[i].pHeightBar * (this._outerRadius - this._innerRadius))]).domain([0, this._vRings[i].maxValue]);
                    }
                    else {
                        this._vRings[i].barCircleScale.range(this._vCores20Inv).domain(categorias);
                    }
                }
            }
            for (i = 0; i < this._vRings.length; i++) {
                if (this._vRings[i].typeAttr === "V") {
                    this._grpBars.append("rect")
                        .attr("class", "CV-node")
                        .attr("x", this._ringScale(this._vRings[i].pX))
                        .attr("y", () => { return -this._barsArea.widthBar / 2; })
                        .attr("height", () => { return this._barsArea.widthBar; })
                        .attr("width", (d) => { return this._vRings[i].barCircleScale(d.values[this._vRings[i].indexAttr]); })
                        .style("fill", () => { return this._colorScale(this._vRings[i].indexAttr); })
                        .on("mouseover", this._mouseOverNode.bind(this))
                        .on("mouseout", this._mouseOutNode.bind(this))
                        .append("title")
                        .text((d) => { return d.labels[1] + "\n" + data.nodes.valueTitle[this._vRings[i].indexAttr] + ": " + d.values[this._vRings[i].indexAttr]; });
                }
                else {
                    circleScale.range(this._vCores20Inv).domain(this._vRings[i].vLabelDomain);
                    this._grpBars.append("circle")
                        .attr("class", "CV-node")
                        .attr("cx", this._ringScale(this._vRings[i].pX) + this._barsArea.widthBar / 2)
                        .attr("cy", 0)
                        .attr("r", this._barsArea.widthBar / 2)
                        .style("fill", (d) => { return this._vRings[i].barCircleScale(d.labels[this._vRings[i].indexAttr]); }) //<-- Check how to put the color
                        .on("mouseover", this._mouseOverNode.bind(this))
                        .on("mouseout", this._mouseOutNode.bind(this))
                        .append("title")
                        .text((d) => {
                        return d.labels[1] + "\n" +
                            data.nodes.labelTitle[this._vRings[i].indexAttr] + ": " + d.labels[this._vRings[i].indexAttr];
                    });
                }
            }
        };
        /**
         * _appendLinkss
         *
         * Adds the SVG elements relative to the edges
         */
        var _appendLinks = () => {
            if (this._grpLinks != null)
                this._grpLinks.remove();
            this._grpLinks = this._grpCluster.append("g")
                .attr("class", "CV-grpLinks")
                .attr("transform", "rotate(90)");
            this._links = this._grpLinks.selectAll("path")
                .data(this._dataLinks.vBundleLinks)
                .enter()
                .append("path")
                .each(function (d) { d.source = d[0].data, d.target = d[d.length - 1].data; })
                .attr("d", this._drawLine);
        };
        /**
         * Zoom event
         */
        function _chartZoom(event) {
            _zoomListener.scaleExtent([0.5, 10]);
            _grpChart.attr("transform", event.transform);
        }
    }
    /**
       * _mouseOverNode
       */
    _mouseOverNode(event, d) {
        this._grpBars.each(function (n) { n.highLight = false; });
        this._links.classed("CV-linkHL", function (link) {
            if (link.source === d || link.target === d) {
                return link.source.highLight = link.target.highLight = true;
            }
            else
                return false;
        });
        this._grpBars.classed("CV-nodeHL", function (node) { return node.highLight; });
        this._grpBars.append("text")
            .text("")
            .classed("CV-names", true); // For showing names on mouseover
        let index = _findMaxValue(this._vRings);
        let x = this._ringScale(this._vRings[this._vRings.length - 1].pX) + this._vRings[index].barCircleScale(this._vRings[index].maxValue);
        this._grpBars.selectAll("text.CV-names")
            .attr("x", x)
            .attr("y", 0)
            .attr("text-anchor", "start")
            .text(function (n) {
            if (n.highLight === true) {
                if (_isTheFirstOccurence(n.id, d.cluster)) {
                    d.cluster.push(n);
                }
                let names = n.labels[1];
                return names;
            }
            return "";
        })
            .style("font-size", "10px")
            .style("font-family", "Arial")
            .style("color", "black");
        function _isTheFirstOccurence(id, tab) {
            if (tab.length === 0)
                return true;
            else {
                for (let i = 0; i < tab.length; i++) {
                    if (tab[i].id === id)
                        return false;
                }
                return true;
            }
        }
        function _findMaxValue(_vRings) {
            let i, max = 0;
            for (i = 0; i < _vRings.length; i++) {
                if (_vRings[i].maxValue > max)
                    max = i;
            }
            return max;
        }
    }
    _mouseOutNode(event, d) {
        this._grpBars.classed("CV-nodeHL", false);
        this._links.classed("CV-linkHL", false);
        this._grpBars.selectAll("text.CV-names").text(" ");
    }
    /**
       * _calcGeometry
       *
       * Calculates all geometric parameters for ClusterVis display
       */
    async _calcGeometry(data) {
        let largBarra, percMargin, percBar; // Percentage of the margin in relation to the width occupied by the sector
        this._barsArea.angleBar = await this._widthToAngle(this._barsArea.widthBar + this._barsArea.marginBar, this._innerRadius);
        this._barsArea.maxBars = Math.floor(360 / this._barsArea.angleBar);
        this._barsArea.angleBar = 360.0 / this._barsArea.maxBars;
        this._barsArea.numBars = this.model.data.nodes.dataNodes.length;
        this._barsArea.startSector = Math.round((this._barsArea.maxBars - this._barsArea.numBars) / 2);
        if (this._barsArea.numBars > this._barsArea.maxBars) {
            percMargin = this._barsArea.pMarginBar / (this.model.pWidthBar + this._barsArea.pMarginBar);
            percBar = 1 - percMargin;
            this._barsArea.angleBar = 360.0 / this._barsArea.numBars;
            largBarra = await this._angleToWidth(this._barsArea.angleBar, this._innerRadius);
            this._barsArea.widthBar = largBarra * percBar;
            this._barsArea.marginBar = largBarra * percMargin;
            this._barsArea.startSector = 0;
        }
        this._vAngle = [];
        data.nodes.dataNodes.forEach((d, i) => {
            this._vAngle[i] = ((i + this._barsArea.startSector) * this._barsArea.angleBar + 180) % 360;
        });
    }
    /**
     * _calcCoordinates
     *
     * Calculates the coordinates of the leaf nodes
     */
    async _calcCoordinates(dataNodes) {
        let distScale = scaleLinear().range([20, this._innerRadius]).domain([0, this._dataLinks.heightTree]);
        this._vOrder.forEach((d, i) => {
            dataNodes[d].x = this._vAngle[i];
            dataNodes[d].y = this._innerRadius;
        });
        posOrdem(this._dataLinks.tree);
        function posOrdem(raiz) {
            let xPrim, xUlt;
            if (raiz.children !== undefined) {
                raiz.children.forEach(function (d) {
                    posOrdem(d);
                });
                xPrim = raiz.children[0].data.x;
                xUlt = raiz.children[raiz.children.length - 1].data.x;
                if (xPrim < xUlt) {
                    raiz.x = (xPrim + xUlt) / 2;
                    raiz.data.x = (xPrim + xUlt) / 2;
                }
                else {
                    raiz.x = ((xUlt + 360 - xPrim) / 2 + xPrim) % 360;
                    raiz.data.x = (xPrim + xUlt) / 2;
                }
                raiz.y = distScale(raiz.depth);
                raiz.data.y = distScale(raiz.depth);
            }
        }
    }
    /**
     * _widthToAngle
     *
     * Calculates the angle of the occupied sector by a width
     * E: width, radius
     * S: angle in degrees
     */
    async _widthToAngle(width, radius) {
        return Math.acos(1.0 - width * width / (2 * radius * radius)) * 180.0 / Math.PI;
    }
    /**
     * _angleToWidth
     *
     * Calculates the sector width from the angle and a radius
     * E: width, radius
     * S: angle in degrees
     */
    async _angleToWidth(angle, radius) {
        let angRadianos = angle * Math.PI / 180.0;
        return Math.sqrt(2 * radius * radius - 2 * radius * radius * Math.cos(angRadianos));
    }
    /**
     * _getTree
     *
     * Generates a tree in the format { id:..., chidren[] }
     */
    async _getTree(heightTree, dados, degree, vOrder) {
        let children = null;
        let levelMax = heightTree - 1;
        let result = createTree(0, vOrder);
        result.depth = 0;
        function createTree(nivel, vNodos) {
            let obj = [], objPai, inic, fim, delta;
            if (nivel < levelMax) {
                delta = Math.floor(vNodos.length / degree);
                inic = 0;
                fim = delta;
                for (let i = 0; i < degree - 1; i++) {
                    obj.push(createTree(nivel + 1, vNodos.slice(inic, fim)));
                    inic = fim;
                    fim += delta;
                }
                obj.push(createTree(nivel + 1, vNodos.slice(inic)));
                objPai = { id: "N" + nivel, children: obj };
            }
            else if (nivel === levelMax) {
                children = [];
                vNodos.forEach(function (d) {
                    children.push(dados[d]);
                });
                objPai = { id: "N" + nivel, children: children };
            }
            objPai.children.forEach(function (d) {
                d.parent = objPai;
                d.depth = nivel + 1;
            });
            return objPai;
        }
        return result;
    }
    /**
     * _getEdges
     *
     * Generates a vector with the list of edges in the format: [ {source:Object, target: Object},...]
     */
    async _getEdges(dados, nodes) {
        let nodos = dados.nodes.dataNodes, edges = dados.edges.dataEdges, objSource, objTarget, map = {};
        nodes.forEach(function (d) {
            map[d.data.id] = d;
        });
        let result = [];
        edges.forEach(function (d) {
            objSource = findNodo(d.src);
            objTarget = findNodo(d.tgt);
            result.push(map[objSource.id].path(map[objTarget.id]));
        });
        function findNodo(id) {
            for (let i = 0; i < nodos.length; i++)
                if (nodos[i].id === id)
                    return nodos[i];
            return null;
        }
        return result;
    }
    // This function is only valid for numeric attributes
    async _updateMaxRings() {
        this._vRings.forEach((ring) => {
            if (ring.typeAttr === "V")
                ring.maxValue = max(this.model.data.nodes.dataNodes, function (d) { return d.values[ring.indexAttr]; });
            else
                ring.maxValue = 0; // Copy here what was done in the addAttribute()
        });
    }
    async obtemRings() {
        return this._vRings;
    }
    ;
    //---------------------
    async setBox(_) {
        if (!arguments.length)
            return this.model.box;
        this.model.box = _;
    }
    ;
    //---------------------
    /** This function is required in all techniques
    * It is called internally in conectChart
    */
    async setPanel(_) {
        if (!arguments.length)
            return this._clusterVisPanel;
        this._clusterVisPanel = _;
    }
    ;
    //---------------------
    /** This function is to set the data to the chart
      * If no arguments, It will return the value of data
      */
    async setData(_, globalData) {
        if (!arguments.length)
            return this.model.data;
        if (_.cluster) {
            _ = clusterClusterVis(_, globalData);
        }
        else {
            _ = normalClusterVis(_, globalData);
        }
        this.model.data = _;
        this.addAttribute(state.ATN_Category, "L");
        this.addAttribute(state.ATN_QtPublicacoes - 1000, "V");
        this.addAttribute(state.ATN_QtProceedings - 1000, "V");
        this.addAttribute(state.ATN_QtJournals - 1000, "V");
        this.addAttribute(state.ATN_QtBooks - 1000, "V");
        this._sort.inic(this.model.data.nodes.labelTitle.length, this.model.data.nodes.valueTitle.length)
            .data(this.model.data.nodes.dataNodes);
        this._sort.exec(this._indexAttrSort);
        this._vOrder = this._sort.getVetOrder();
        this._dataLinks.tree = hierarchy(await this._getTree(this._dataLinks.heightTree, this.model.data.nodes.dataNodes, this._dataLinks.degreeTree, this._vOrder));
        this._dataLinks.vBundleLinks = await this._getEdges(this.model.data, this._dataLinks.tree.descendants());
        this.model.data.nodes.dataNodes.forEach(function (d) { d.highLight = false; });
        this._updateMaxRings();
        // this._clusterVisPanel.update();   // For now it's only here.
    }
    ;
    //---------------------
    /**
     * Set value of Percentage relative to graph width for _innerRadius calculation
     * If no arguments, It will return the value of pInnerRadius
     */
    async setpInnerRadius(_) {
        if (!arguments.length)
            return this.model.pInnerRadius;
        this.model.pInnerRadius = _;
    }
    ;
    //---------------------
    /**
     * Set value of Percentage relative to graph width for _OuterRadius calculation
     * If no arguments, It will return the value of pOuterRadius
     */
    async setpOuterRadius(_) {
        if (!arguments.length)
            return this.model.pOuterRadius;
        this.model.pOuterRadius = _;
    }
    ;
    //---------------------
    removeAnelExterno() {
        let i, deltaHeight, pHeight, pX;
        this._vRings.pop(); // Removes the data from the ring
        deltaHeight = 100 / this._vRings.length;
        // Adjust todo o this._vRings
        for (i = 0, pHeight = deltaHeight; i < this._vRings.length; i++, pHeight += deltaHeight) {
            this._vRings[i].pHeight = pHeight;
            this._vRings[i].pHeightBar = deltaHeight / 100;
        }
        if (this._vRings.length > 0) {
            this._vRings[0].pX = 0;
            pX = this._vRings[this._vRings.length - 1].pHeight;
            for (i = 1; i < this._vRings.length; i++)
                this._vRings[i].pX = this._vRings[i - 1].pHeight;
        }
        this.model.redraw += 1;
    }
    ;
    //---------------------
    addAttribute(_indexAttr, _typeAttr) {
        let maxValue, tempKeys, pX, deltaHeight = 100 / (this._vRings.length + 1), _vLabelDomain = [];
        if (_typeAttr === "V") {
            maxValue = max(this.model.data.nodes.dataNodes, function (d) { return d.values[_indexAttr]; });
        }
        else { // Determines domain for categorical attributes (deve ser colocado tamb�m na fun��o chart.data)
            maxValue = -1;
            tempKeys = groups(this.model.data.nodes.dataNodes, d => d.labels[_indexAttr]).sort((a, b) => ascending(a[0], b[0]));
            for (i = 0; i < tempKeys.length; i++)
                _vLabelDomain[i] = tempKeys[i].key;
        }
        pX = 0;
        //      barScale = d3.scale.linear().range(0, model.ringScale(deltaHeight)-_innerRadius).domain(0,maxValue);
        // Adjust todo o _vRings
        for (var i = 0, pHeight = deltaHeight; i < this._vRings.length; i++, pHeight += deltaHeight) {
            this._vRings[i].pHeight = pHeight;
            this._vRings[i].pHeightBar = deltaHeight / 100;
        }
        //    barScale.range(0, ringScale() ).domain(0,maxValue);  
        if (this._vRings.length > 0) {
            this._vRings[0].pX = 0;
            pX = this._vRings[this._vRings.length - 1].pHeight;
            for (i = 1; i < this._vRings.length; i++)
                this._vRings[i].pX = this._vRings[i - 1].pHeight;
        }
        if (_typeAttr === "V")
            this._vRings.push({
                indexAttr: _indexAttr, typeAttr: _typeAttr, pHeight: pHeight, pX: pX,
                pHeightBar: deltaHeight / 100, maxValue: maxValue, vLabelDomain: _vLabelDomain, barCircleScale: scaleLinear()
            });
        else
            this._vRings.push({
                indexAttr: _indexAttr, typeAttr: _typeAttr, pHeight: pHeight, pX: pX,
                pHeightBar: deltaHeight / 100, maxValue: maxValue, vLabelDomain: _vLabelDomain, barCircleScale: scaleOrdinal()
            });
        this.model.redraw += 1;
    }
    ;
    //---------------------
    alteraAttribute(_indexAnel, _indexAttr, _typeAttr) {
        let maxValue, tempKeys, i, _vLabelDomain = [];
        if (_typeAttr === "V") {
            maxValue = max(this.model.data.nodes.dataNodes, function (d) { return d.values[_indexAttr]; });
        }
        else { // Determines or domain for categorical attributes (should also be placed in the function chart.data)
            maxValue = -1;
            tempKeys = groups(this.model.data.nodes.dataNodes, d => d.labels[_indexAttr]).sort((a, b) => ascending(a[0], b[0]));
            // tempKeys = nest().key(function (d) { return d.labels[_indexAttr]; }).sortKeys(ascending).entries(this.model.data.nodes.dataNodes);
            for (i = 0; i < tempKeys.length; i++)
                _vLabelDomain[i] = tempKeys[i].key;
        }
        this._vRings[_indexAnel].indexAttr = _indexAttr;
        this._vRings[_indexAnel].typeAttr = _typeAttr;
        this._vRings[_indexAnel].maxValue = maxValue;
        this._vRings[_indexAnel].vLabelDomain = _vLabelDomain;
        if (_typeAttr === "V")
            this._vRings[_indexAnel].barCircleScale = scaleLinear();
        else
            this._vRings[_indexAnel].barCircleScale = scaleOrdinal();
        this.model.redraw += 1;
    }
    ;
    //---------------------
    async indexAttrSort(_) {
        if (!arguments.length)
            return this._indexAttrSort;
        this._indexAttrSort = _;
    }
    ;
    //======== Actions Functions
    async acSortExec(_) {
        this._indexAttrSort = _;
        this._sort.exec(this._indexAttrSort);
        this._vOrder = this._sort.getVetOrder();
        this._grpBarsRotScale.domain(this._vOrder);
        this._calcCoordinates(this.model.data.nodes.dataNodes);
        this._grpBars.transition().duration(800)
            .attr("transform", (d, i) => { return "rotate(" + this._grpBarsRotScale(i) + ")"; });
        this._grpLinks.selectAll("path")
            .data(this._dataLinks.vBundleLinks).transition().duration(800).attr("d", this._drawLine);
    }
    ;
    //-------------------------
    acAlteraAnel(indexAnel, indexAttr) {
        let indexAtributo;
        indexAtributo = +indexAttr;
        if (indexAtributo >= 1000)
            this.alteraAttribute(indexAnel, indexAtributo - 1000, "V");
        else
            this.alteraAttribute(indexAnel, indexAtributo, "L");
        this._clusterVisPanel.alteraSelectOrder();
    }
    ;
    //-------------------------
    acSameScale(checked) {
        this._sameScale = checked;
        this.model.redraw += 1;
    }
    ;
    buildChart(idDiv, svg) {
        this.setBox(this.model.box);
        this.indexAttrSort(2);
        this.addClusterChart(idDiv, svg);
    }
    componentDidLoad() {
        let clusterDiv = select(this.element.querySelectorAll(".cluster")[0])
            .attr("width", this.width)
            .attr("height", this.height);
        this.buildChart("cluster", clusterDiv);
    }
    render() {
        return (h(Host, null,
            h("div", { class: "cluster" })));
    }
};
__decorate([
    Element()
], MgeClustervis.prototype, "element", void 0);
__decorate([
    Prop()
], MgeClustervis.prototype, "width", void 0);
__decorate([
    Prop()
], MgeClustervis.prototype, "height", void 0);
__decorate([
    Prop()
], MgeClustervis.prototype, "datasetName", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_clusterVisPanel", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_xClusterCenter", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_yClusterCenter", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_innerRadius", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_outerRadius", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_grpCluster", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_grpRings", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_grpBars", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_grpLinks", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_links", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_sameScale", void 0);
__decorate([
    Prop({ mutable: true })
], MgeClustervis.prototype, "_drawLine", void 0);
__decorate([
    Method()
], MgeClustervis.prototype, "addClusterChart", null);
__decorate([
    Method()
], MgeClustervis.prototype, "_calcGeometry", null);
__decorate([
    Method()
], MgeClustervis.prototype, "_calcCoordinates", null);
__decorate([
    Method()
], MgeClustervis.prototype, "_widthToAngle", null);
__decorate([
    Method()
], MgeClustervis.prototype, "_angleToWidth", null);
__decorate([
    Method()
], MgeClustervis.prototype, "_getTree", null);
__decorate([
    Method()
], MgeClustervis.prototype, "_getEdges", null);
__decorate([
    Method()
], MgeClustervis.prototype, "_updateMaxRings", null);
__decorate([
    Method()
], MgeClustervis.prototype, "obtemRings", null);
__decorate([
    Method()
], MgeClustervis.prototype, "setBox", null);
__decorate([
    Method()
], MgeClustervis.prototype, "setPanel", null);
__decorate([
    Method()
], MgeClustervis.prototype, "setData", null);
__decorate([
    Method()
], MgeClustervis.prototype, "setpInnerRadius", null);
__decorate([
    Method()
], MgeClustervis.prototype, "setpOuterRadius", null);
__decorate([
    Method()
], MgeClustervis.prototype, "removeAnelExterno", null);
__decorate([
    Method()
], MgeClustervis.prototype, "addAttribute", null);
__decorate([
    Method()
], MgeClustervis.prototype, "alteraAttribute", null);
__decorate([
    Method()
], MgeClustervis.prototype, "indexAttrSort", null);
__decorate([
    Method()
], MgeClustervis.prototype, "acSortExec", null);
__decorate([
    Method()
], MgeClustervis.prototype, "acAlteraAnel", null);
__decorate([
    Method()
], MgeClustervis.prototype, "acSameScale", null);
MgeClustervis = __decorate([
    Component({
        tag: 'mge-clustervis',
        styleUrl: 'mge-clustervis.css',
        shadow: false,
    })
], MgeClustervis);
export { MgeClustervis };
