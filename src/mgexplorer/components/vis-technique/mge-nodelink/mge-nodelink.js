var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Element, Host, Prop, h, Method } from '@stencil/core';
// import AlgCluster from './algCluster';
import state from "../../../store";
import { drag } from 'd3-drag';
import { normalNodeTooltips, normalEdgeTooltips } from './tooltips';
import Model from 'model-js';
import { max, zoom, forceSimulation, forceLink, range, schemeCategory10, forceCenter, forceManyBody, forceCollide, forceX, forceY } from 'd3';
import { select } from 'd3-selection';
import { scaleLinear, scaleOrdinal } from 'd3-scale';

let MgeNodelink = class MgeNodelink {
    constructor() {
        /** represents the width of the nodelinks chart*/
        this.width = 350;
        /** represents the height of the nodelinks chart*/
        this.height = 350;
        /** The dataset name being used */
        this.datasetName = "[]";                                                                              
        /** Represents the panel associated with the graphic */
        this._nodeEdgePanel = null; // Represents the panel associated with the graphic
        /** Represents the legend associated with the graphic */
        this._nodeEdgeLegend = null;
        /** The group represents the entire graphic */
        //--------------------------------- Private functions
        this.dragNode = simulation => {
            function dragstarted(event, d) {
                if (!event.active)
                    simulation.alphaTarget(0.05).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }
            function dragended(event, d) {
                if (!event.active)
                    simulation.alphaTarget(0);
                // simulation.stop()
                d.fx = null;
                d.fy = null;
            }
            return drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        };

        this.model = Model();

        this._grpNodeEdge = null; // Group representing the graph
        this._forceLayout = forceSimulation(),
        this._indexAttrSize = 0; // Just for categorical
        this._rClusterScale = scaleLinear().range([3, 40]);
        this._linkWidthScale = scaleLinear().range([1, 7]);
        this._linkDistanceScale = scaleLinear();
        this._chargeScale = scaleLinear().range([50, 800]);
        this._rNormalNode = 3, // Normal node radius
        this._colors = {
            nodoNormal: "blue",
            nodoNormal2: "red",
            nodoMix: "purple",
            edgeNormal: "gray"
        },
        this._configDefault = {
            charge: 100,
            linkDistance: 25,
            fNodoClusterDefault: function () { return ""; }
        },
        this._tooltips = {
            divTT: null,
            normalNode: null,
            clusterNode: null,
            normalEdge: null,
            clusterEdge: null
        },
        this._configLayout = {
            charge: this._configDefault.charge,
            fCharge: function (d) {
                return -(this._chargeScale(d.qtNodes) + this._configLayout.charge);
            },
            linkDistance: this._configDefault.linkDistance,
            gravity: 0 // calculated
        },
        this._graphElem = {
            nodes: null,
            edges: null
        },
        this._graphData = null, // Structure Displayed
        this._colorScale = null;
    }

    async addNodeLinkChart(idDiv, divTag) {
        this.model.margin = { top: 2, right: 2, bottom: 2, left: 2 };
        this.model.box = { width: this.width, height: this.height };
        this.model.redraw = 0; // When changed perform a redraw
        // ---------------- Initialization Actions
        let _svg = divTag.append("svg"), // Create dimensionless svg
        _grpChart = _svg.append("g"); // Does not exist in the original Iris

        // Add zoom event
        let _zoomListener = zoom().on("zoom", _chartZoom);
        _zoomListener.scaleExtent([0.5, 10]);
        _svg.call(_zoomListener);

        this._tooltips.divTT = divTag.append("div")
            .style("display", "none")
            .classed("NE-Tooltip", true); // Tooltip for the normal node
        this._grpNodeEdge = _grpChart.append("g").attr("class", "NodeEdgeChart");

        //===================================================
        this.model.when("box", (box) => {
            _svg.attr("width", box.width).attr("height", box.height);
            select(this.element).attr("height", box.height).attr("width", box.width);
        });

        //---------------------
        this.model.when("margin", function (margin) {
            _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        });

        //---------------------
        this.model.when(["box", "margin"], (box, margin) => {
            this.model.widthChart = box.width - margin.left - margin.right;
            this.model.heightChart = box.height - margin.top - margin.bottom;
            this._forceLayout.force("center", forceCenter(this.model.widthChart / 2, this.model.heightChart / 2));
        });

        //---------------------
        this.model.when(["data", "redraw"], (data) => {
            console.log(data)
            let dataLength;
            dataLength = data.nodes.dataNodes.length;

            let gravity = 500 / ((Math.PI * this.model.widthChart * this.model.widthChart / 4) / dataLength);
            if (gravity < 0.05)
                this._configLayout.gravity = 0.05;

            if (gravity < 0.1)
                this._configLayout.gravity = Math.round(this._configLayout.gravity * 100) / 100;
            else
                this._configLayout.gravity = Math.round(this._configLayout.gravity * 10) / 10;
            
            this._forceLayout.force("charge").strength(this._configLayout.gravity);
            this._forceLayout.alpha(1).restart();
            // this._forceLayout.force("gravity", this._configLayout.gravity);
            
            this._nodeEdgePanel.updateNodePanel(); // Updates information in the panel associated with the technique
           
            this._appendEdges();
            this._appendNodes();
        });

        function _chartZoom(event) {
            _zoomListener.scaleExtent([0.5, 10]);
            _grpChart.attr("transform", event.transform);
        }
    }

    _appendNodes() {
        //let corScale = d3.scale.category20();
        if (this._graphElem.nodes != null) {
            this._graphElem.nodes = null;
        }
        // console.log()
        if (this._graphData.nodes[0].cluster) {
            this._graphElem.nodes = this._grpNodeEdge.selectAll(".NE-node")
                .data(this._graphData.nodes)
                .enter()
                .append("circle")
                .attr("class", "NE-node")
                .attr("r", (d) => { return this._rClusterScale(d.qtNodes); })
                .style("fill", this._colors.nodoNormal)
                .on("mouseover", this._onMouseOverNode.bind(this))
                .on("mouseout", this._onMouseOutNode.bind(this));
            // .call(this.dragNode(this._forceLayout));
            var color_nodes = this._graphElem.nodes[0];
        }
        else {
            let setColors = new Set();
            this._graphElem.nodes = this._grpNodeEdge.selectAll(".NE-node")
                .data(this._graphData.nodes)
                .enter()
                .append("circle")
                .attr("class", "NE-node")
                //      .attr("r", function (d) { return _rClusterScale(1)} )
                .attr("r", (d) => { return this._rClusterScale(d.values[this._indexAttrSize] /*qtNodes*/); })
                .style("fill", (d) => {
                if (d.style != null) {
                    return d.style;
                }
                return this._colorScale(d.values[12]);
            })
                .on("mouseover", this._onMouseOverNode.bind(this))
                .on("mouseout", this._onMouseOutNode.bind(this));
        }
    }
    _appendEdges() {
        if (this._graphElem.edges != null)
            this._graphElem.edges = null;
        this._graphElem.edges = this._grpNodeEdge.selectAll(".NE-edge")
            .data(this._graphData.edges)
            .enter()
            .append("line")
            .attr("class", "NE-edge")
            .style("stroke-width", (d) => { return this._linkWidthScale(d.qt); })
            .on("mouseover", this._onMouseOverEdge.bind(this))
            .on("mouseout", this._onMouseOutEdge.bind(this));
    }
    _onMouseOverNode(event, d) {
        this._graphElem.nodes.each(function (n) { n.highLight = false; });
        d.highLight = true;
        if (d.cluster) {
            if (this._tooltips.clusterNode != null)
                this._tooltips.clusterNode.create(this._tooltips.divTT, d, event);
        }
        else {
            if (this._tooltips.normalNode != null)
                this._tooltips.normalNode.create(this._tooltips.divTT, d, event);
        }
        this._graphElem.edges.classed("NE-HighLight", function (edge) {
            if (edge.source === d || edge.target === d)
                return edge.source.highLight = edge.target.highLight = true;
            else
                return false;
        });
        this._graphElem.nodes.classed("NE-HighLight", function (node) { return node.highLight; });
    }
    /**
     * _onMouseOutNode
     */
    _onMouseOutNode(event, d) {
        this._graphElem.nodes.classed("NE-HighLight", false);
        this._graphElem.edges.classed("NE-HighLight", false);
        d.highLight = false;
        if (d.cluster) {
            if (this._tooltips.clusterNode != null)
                this._tooltips.clusterNode.remove();
        }
        else {
            if (this._tooltips.normalNode != null)
                this._tooltips.normalNode.remove();
        }
    }
    /**
     * _onMouseOverEdge
     */
    _onMouseOverEdge(event, d) {
        this._graphElem.nodes.each(function (n) { n.highLight = false; });
        d.highLight = true;
        d.source.highLight = true;
        d.target.highLight = true;
        let path = event.path || event.composedPath();
        select(path[0]).classed("NE-HighLight", true);
        this._graphElem.nodes.classed("NE-HighLight", function (node) { return node.highLight; });
        if (d.source.cluster && d.target.cluster) {
            if (this._tooltips.clusterEdge != null)
                this._tooltips.clusterEdge.create(this._tooltips.divTT, d, event);
        }
        else {
            if (this._tooltips.normalEdge != null)
                this._tooltips.normalEdge.create(this._tooltips.divTT, d, event);
        }
    }
    /**
   * _onMouseOutEdge
   */
    _onMouseOutEdge(event, d) {
        d.highLight = false;
        d.source.highLight = false;
        d.target.highLight = false;
        let path = event.path || event.composedPath();
        select(path[0]).classed("NE-HighLight", false);
        this._graphElem.nodes.classed("NE-HighLight", false);
        if (d.source.cluster && d.target.cluster) {
            if (this._tooltips.clusterEdge != null)
                this._tooltips.clusterEdge.remove();
        }
        else {
            if (this._tooltips.normalEdge != null)
                this._tooltips.normalEdge.remove();
        }
    }
    _adjustGraph(data) {
        let result = {
            nodes: null,
            edges: null
        };
        result.nodes = data.nodes.dataNodes.filter(function (d) { return d.visible; });
        result.nodes.forEach(function (d, i) {
            d.newIndex = i;
        });
        result.edges = data.edges.dataEdges.filter(function (d) { return d.visible; });
        result.edges.forEach(function (d) {
            d.source = data.nodes.dataNodes[d.src].newIndex;
            d.target = data.nodes.dataNodes[d.tgt].newIndex;
        });
        return result;
    }
    //---------------------
    async setBox(_) {
        if (!arguments.length)
            return this.model.box;
        this.model.box = _;
    }
    ;
    //---------------------
    // This function is required in all techniques
    // It is called internally in conectChart
    async setPanel(_) {
        if (!arguments.length)
            return this._nodeEdgePanel;
        this._nodeEdgePanel = _;
    }
    ;
    //---------------------
    // This function is required in all techniques
    // It is called internally in conectChart
    async setLegend(_) {
        if (!arguments.length)
            return this._nodeEdgeLegend;
        this._nodeEdgeLegend = _;
    }
    ;
    //---------------------
    setTTNormalNode(_) {
        this._tooltips.normalNode = _;
    }
    ;
    //---------------------
    setTTClusterNode(_) {
        this._tooltips.clusterNode = _;
    }
    ;
    //---------------------
    setTTNormalEdge(_) {
        this._tooltips.normalEdge = _;
    }
    ;
    //---------------------
    setTTClusterEdge(_) {
        this._tooltips.clusterEdge = _;
    }
    ;
    //---------------------
    async setData(_, globalData) {
        //let qtLabel=0, qtValue=0;
        let maxQtNodes, maxLinkDistance, maxQtEdges, vNodesTemp;
        if (!arguments.length)
            return this.model.data;
        this.model.data = _;
        if (this.model.data.isCluster === undefined) {
            vNodesTemp = range(0, this.model.data.nodes.dataNodes.length).map(function () { return 0; });
            this.model.data.isCluster = false;
            this.model.data.nodes.qtNodes = this.model.data.nodes.dataNodes.length;
            this.model.data.nodes.dataNodes.forEach(function (d) {
                d.idCluster = -1;
                d.qtNodes = 1;
                d.visible = true;
                d.cluster = false;
                d.grau = 0;
            });
            this.model.data.edges.qtEdges = this.model.data.edges.dataEdges.length;
            this.model.data.edges.dataEdges.forEach(function (d) {
                vNodesTemp[d.src]++;
                vNodesTemp[d.tgt]++;
                d.qt = 1;
                d.source = d.src;
                d.target = d.tgt;
                d.visible = true;
            });
            this.model.data.nodes.dataNodes.forEach(function (d, i) { d.grau = vNodesTemp[i]; });
        }
        this._colorScale = scaleOrdinal(schemeCategory10)
            .domain(await this.getColorBreaks());
        this.model.data.nodes.dataNodes.forEach(function (d) { d.highLight = false; });
        this._graphData = this._adjustGraph(this.model.data);
        this._rClusterScale.domain([1, this.model.data.nodes.qtNodes]);
        maxQtNodes = max(this._graphData.nodes, function (d) { return d.qtNodes; });
        this._chargeScale.domain([1, maxQtNodes]);
        maxLinkDistance = Math.round(this._rClusterScale(maxQtNodes));
        this._linkDistanceScale.range([3, maxLinkDistance]).domain([1, maxQtNodes]);
        maxQtEdges = max(this._graphData.edges, function (d) { return d.qt; });
        if (maxQtEdges === 1) {
            this._linkWidthScale.domain([maxQtEdges]);
        }
        else {
            this._linkWidthScale.domain([1, maxQtEdges]);
        }
        this._forceLayout.nodes(this._graphData.nodes).force("charge", forceManyBody().strength((d) => { return -(this._chargeScale(d.qtNodes) + this._configLayout.charge); }))
            .force("link", forceLink().links(this._graphData.edges).distance((d) => {
            return this._configLayout.linkDistance + this._linkDistanceScale(d.source.qtNodes) + this._linkDistanceScale(d.target.qtNodes);
        })).force("forceX", forceX().strength(this._configLayout.gravity).x(this.width * .7))
            .force("forceY", forceY().strength(this._configLayout.gravity).y(this.height * .7))
            .force('collide', forceCollide(function (d) {
            return d.id === "j" ? 25 : 15;
        }));
        this._forceLayout.on("tick", () => {
            if (this.model.data !== null)
                var ticksPerRender = this.model.data.nodes.dataNodes.length / 100;
            else
                var ticksPerRender = 1;
            if (this._graphElem.edges != null) {
                requestAnimationFrame(() => {
                    for (var i = 0; i < ticksPerRender; i++) {
                        this._forceLayout.tick();
                    }
                    this._graphElem.edges.attr("x1", function (d) { return d.source.x; })
                        .attr("y1", function (d) { return d.source.y; })
                        .attr("x2", function (d) { return d.target.x; })
                        .attr("y2", function (d) { return d.target.y; });
                    this._graphElem.nodes.attr("cx", function (d) { return d.x; })
                        .attr("cy", function (d) { return d.y; });
                    if (this._forceLayout.alpha() < 0.03)
                        this._forceLayout.stop();
                });
            }
        }).on("end", function () {
        });
        let indexNodeAttrTitle = [state.ATN_Category, state.ATN_LinhaPesq, state.ATN_QtLinhaPesq, state.ATN_QtPublicacoes];
        this.setTTNormalNode(normalNodeTooltips(this.model.data, state.ATN_AuthorName, indexNodeAttrTitle, state.headerTitle));
        this.setTTNormalEdge(normalEdgeTooltips(this.model.data, state.ATN_AuthorName, [state.ATE_QtPublicacoes]));
        // _appendLegend();
    }
    ;
    //---------------------
    /** This function will get the `gravity` attribute of force layout in node-links chart
    */
    async getGravity() {
        return this._configLayout.gravity;
    }
    ;
    //---------------------
    /** This function will get the `charge` attribute of force layout in node-links chart
    */
    async getCharge() {
        return this._configLayout.charge;
    }
    ;
    //---------------------
    /** This function will get the `distance` attribute of links in force layout in node-links chart
    */
    async getLinkDistance() {
        return this._configLayout.linkDistance;
    }
    ;
    //---------------------
    /** This function will get the total number of nodes
    */
    async getQtNodes() {
        console.log(this._graphData)
        return this._graphData.nodes.length;
    }
    ;
    //---------------------
    /** This function will get the total number of edges
    */
    async getQtEdges() {
        return this._graphData.edges.length;
    }
    ;
    //---------------------
    /** Changes the attribute that will be used to map the size
    */
    async indexAttrSize(_) {
        if (!arguments.length)
            return this._indexAttrSize + 1000;
        this._indexAttrSize = _ - 1000;
    }
    ;
    //======== Actions Functions
    //---------------------
    /** This function will change the value of gravity on force layout. This function will be called when adjust Gravity slider in filter panel
    */
    acChangeGravity(value) {
        this._configLayout.gravity = +value;
        this._forceLayout.force("forceX", forceX().strength(this._configLayout.gravity));
        this._forceLayout.force("forceY", forceY().strength(this._configLayout.gravity));
        this._forceLayout.alpha(1).restart();
    }
    ;
    //---------------------
    /** This function will change the value of charge on force layout. This function will be called when adjust Charge slider in filter panel
    */
    acChangeCharge(value) {
        this._configLayout.charge = +value;
        this._forceLayout.force("charge", forceManyBody().strength((d) => { return -(this._chargeScale(d.qtNodes) + this._configLayout.charge); }));
        this._forceLayout.alpha(1).restart();
    }
    ;
    //---------------------
    /** This function will change the value of links distance on force layout. This function will be called when adjust LinkDistance slider in filter panel
    */
    acChangeLinkDistance(value) {
        this._configLayout.linkDistance = +value;
        this._forceLayout.force("link", forceLink().links(this._graphData.edges).distance((d) => {
            return this._configLayout.linkDistance + this._linkDistanceScale(d.source.qtNodes) + this._linkDistanceScale(d.target.qtNodes);
        })).alpha(1).restart();
    }
    //---------------------
    acChangeAttrSize(atributo) {
        this._indexAttrSize = atributo;
        this._appendEdges();
        this._appendNodes();
        this.model.redraw += 1;
    }
    ;
    //---------------------
    /** This function will remove hightlight effect on all of nodes and links. This function will be called when clear text inside text search
    */
    resetHighSearch() {
        this._graphElem.nodes.classed("NE-HighSearch", function (d) { return false; });
    }
    ;
    //---------------------
    /** This function will hightlight node and all related links by name of selected node. This function will be called when used text search in filter panel
    */
    acSelectByName(nome) {
        this._graphElem.nodes.each(function (d) {
            console.log("flag");
            d.highSearch = false;
            d.highSearch = (d.labels[1] === nome);
        });
        this._graphElem.nodes.classed("NE-HighSearch", function (d) { return d.highSearch; });
    }
    ;
    //---------------------
    /** This function will hightlight all nodes in a cluster. This function will be called when used text search in filter panel
    */
    acSelectByNameCluster(nomeCluster) {
        this._graphElem.nodes.each(function (d) {
            d.highSearch = false;
            d.highSearch = (d.key === nomeCluster);
        });
        this._graphElem.nodes.classed("NE-HighSearch", function (d) { return d.highSearch; });
    }
    ;
    async getColorBreaks() {
        let breaks = this.model.data.nodes.dataNodes.map(d => d.values[12]);
        breaks = breaks.filter((d, i) => breaks.indexOf(d) == i).sort();
        return breaks;
    }
    ;
    async getColorScale() {
        return this._colorScale;
    }
    ;
    // getColorLabels(){
    //     return this._colorLabels;
    // }
    buildChart(idDiv, svg) {
        this.setBox(this.model.box);
        this.indexAttrSize(1011);
        this.addNodeLinkChart(idDiv, svg);
    }
    componentDidLoad() {
        let svg = select(this.element.querySelectorAll(".nodelink")[0])
            .attr("width", this.width)
            .attr("height", this.height);
        this.buildChart("nodelink", svg);
    }
    render() {
        return (h(Host, null,
            h("div", { class: "nodelink" })));
    }
};
__decorate([
    Element()
], MgeNodelink.prototype, "element", void 0);
__decorate([
    Prop()
], MgeNodelink.prototype, "width", void 0);
__decorate([
    Prop()
], MgeNodelink.prototype, "height", void 0);
__decorate([
    Prop()
], MgeNodelink.prototype, "datasetName", void 0);
__decorate([
    Prop()
], MgeNodelink.prototype, "_nodeEdgePanel", void 0);
__decorate([
    Prop()
], MgeNodelink.prototype, "_nodeEdgeLegend", void 0);
__decorate([
    Prop()
], MgeNodelink.prototype, "_grpNodeEdge", void 0);
__decorate([
    Method()
], MgeNodelink.prototype, "addNodeLinkChart", null);
__decorate([
    Method()
], MgeNodelink.prototype, "setBox", null);
__decorate([
    Method()
], MgeNodelink.prototype, "setPanel", null);
__decorate([
    Method()
], MgeNodelink.prototype, "setLegend", null);
__decorate([
    Method()
], MgeNodelink.prototype, "setData", null);
__decorate([
    Method()
], MgeNodelink.prototype, "getGravity", null);
__decorate([
    Method()
], MgeNodelink.prototype, "getCharge", null);
__decorate([
    Method()
], MgeNodelink.prototype, "getLinkDistance", null);
__decorate([
    Method()
], MgeNodelink.prototype, "getQtNodes", null);
__decorate([
    Method()
], MgeNodelink.prototype, "getQtEdges", null);
__decorate([
    Method()
], MgeNodelink.prototype, "indexAttrSize", null);
__decorate([
    Method()
], MgeNodelink.prototype, "acChangeGravity", null);
__decorate([
    Method()
], MgeNodelink.prototype, "acChangeCharge", null);
__decorate([
    Method()
], MgeNodelink.prototype, "acChangeLinkDistance", null);
__decorate([
    Method()
], MgeNodelink.prototype, "acChangeAttrSize", null);
__decorate([
    Method()
], MgeNodelink.prototype, "resetHighSearch", null);
__decorate([
    Method()
], MgeNodelink.prototype, "acSelectByName", null);
__decorate([
    Method()
], MgeNodelink.prototype, "acSelectByNameCluster", null);
__decorate([
    Method()
], MgeNodelink.prototype, "getColorBreaks", null);
__decorate([
    Method()
], MgeNodelink.prototype, "getColorScale", null);
MgeNodelink = __decorate([
    Component({
        tag: 'mge-nodelink',
        styleUrl: 'mge-nodelink.css',
        shadow: false,
    })
], MgeNodelink);
export { MgeNodelink };
