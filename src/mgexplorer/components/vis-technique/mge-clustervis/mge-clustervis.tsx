import { Component, Element, Host, Prop, h, Event, EventEmitter, Method } from '@stencil/core';
import { tree, zoom, hierarchy, curveBundle, radialLine, schemeCategory10, groups, ascending, schemeAccent } from "d3";
// import { clusterClusterVis, normalClusterVis, sort } from "./process-data"
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { max } from 'd3-array'; import Model from 'model-js';
import state from "../../../store"
import { select } from 'd3-selection';
import { Touchscreen } from 'puppeteer';

import { sort, subGraph } from '../../../../lib/mge-mappers'

@Component({
    tag: 'mge-clustervis',
    styleUrl: 'mge-clustervis.css',
    shadow: false,
})
export class MgeClustervis {

    @Element() element: HTMLElement;
    /** represents the width of the Cluster chart*/
    @Prop() width: number = 350;
    /** represents the height of the Cluster chart*/
    @Prop() height: number = 350;
    /** The dataset name being used */
    @Prop() datasetName: string = "[]";

    public chartData: any;
    public model: any;
    public _chart: any;
    public _sort: any;
    private _subGraph: any;

    public selectedobj = {
        "view": "clustervis",
        "clusters": [],
    };

    /** Represents the panel associated with the graphic */
    @Prop({ mutable: true }) _clusterVisPanel = null;  // Represents the panel associated with the graphic
    /** Coordinate x of the center of the cluster */
    @Prop({ mutable: true }) _xClusterCenter = 0;
    /** Coordinate y of the center of the cluster */
    @Prop({ mutable: true }) _yClusterCenter = 0;
    /** (calculated) Internal circle radius where the graph is drawn */
    @Prop({ mutable: true }) _innerRadius = 0;     // (calculated) Internal circle radius where the graph is drawn
    /** (calculated) Outernal circle radius where the graph is drawn */
    @Prop({ mutable: true }) _outerRadius = 0;
    /** Group representing ClusterVis */
    @Prop({ mutable: true }) _grpCluster = null;   // Group representing ClusterVis
    /** Selection that contains all groups that store the rings */
    @Prop({ mutable: true }) _grpRings = null;    // Selection that contains all groups that store the rings
    /** Selection that contains all groups that store the bars */
    @Prop({ mutable: true }) _grpBars = null;
    /** Selection that contains all groups that store the links */
    @Prop({ mutable: true }) _grpLinks = null;
    /** Selection that contains the links */
    @Prop({ mutable: true }) _links = null;   // Selection that contains the links
    /** Indicates that the same scale should be used for all bars */
    @Prop({ mutable: true }) _sameScale = false;  // Indicates that the same scale should be used for all bars
    /** Generator of splines that makes up the edges */
    @Prop({ mutable: true }) _drawLine;

    private _vRings = [];       // List with the data of the rings:
    // { indexAttr, typeAttr ("L"-label, "V"-value), pHeight (percentage of _widthAllFaixas, maxValue (maximum value of the data for the ring }

    private _barsArea = {
        widthBar: 0,       // (calculated) Width of bar in the area of maximum width (focus) Original: 11
        angleBar: 0.0,     // (calculated) Angle of the sector occupied by the bars that are in Focus
        startSector: 0,     // Position of the sector where the first bar is positioned
        marginBar: 1,      //
        pMarginBar: 0.0033,
        maxBars: 0,        // (calculated) maximum number of bars considering the innermost ring of the clusterVis
        numBars: 0         //  Number of bars in the clusterVis
    };

    private _dataLinks = {
        heightTree: 2,       // Height of the tree to be generated
        degreeTree: 2,       // Degree of intermediate nodes
        tree: null,         // Artificially generated tree
        vBundleLinks: null,  // Vector of edges
        tension: 0.85,        // Voltage used in drawing the edges
        bundle: curveBundle  // Beam generator
    };

    private _indexAttrSort = 0; // Index of the attribute used for sort (0-first labels[] 1000-first values[])
    // Vector of colors with 20 elements inverted (da d3)
    // private _vCores20Inv = ["#17becf", "#bcbd22", "#7f7f7f", "#e377c2", "#8c564b", "#9467bd", "#9edae5", "#dbdb8d", "#c7c7c7", "#f7b6d2",
        // "#c49c94", "#c5b0d5", "#ff9896", "#d62728", "#98df8a", "#2ca02c", "#ffbb78", "#ff7f0e", "#aec7e8", "#1f77b4"];
    private _vOrder = null;      // Indirect ordering vector
    private _vAngle = null;      // Vector that contains the angular measurement of each bar. Calculated at _calcGeometry
    private _grpBarsRotScale = scaleOrdinal();    // Scale used to set the angle of rotation of each bar
    private _ringScale = scaleLinear().domain([0, 100]);
    private _colorScale = scaleOrdinal(schemeCategory10).domain([3, 4, 5, 6]);

    constructor() {
        // ---------------- Model
        this.model = Model();
        this._sort = sort();    // Creates sorting function
        this._subGraph = subGraph()

    }

    /** 
     * The initial function to create all of elements in the cluster chart
     * In this function, it will set Geometric attributes of the graph
     * create actions on graph and manage all of the interaction on the graph
     * */
    @Method()
    async addClusterChart(divTag) {

        this.model.margin = { top: 30, right: 40, bottom: 30, left: 40 };
        this.model.box = { width: this.width, height: this.height };
        this.model.pInnerRadius = 0.20;    // Percentage of the width of the graph for calculating the _innerRadius
        this.model.pOuterRadius = 0.47;    // Percentage of the width of the graph for calculating the _OuterRadius
        this.model.pWidthBar = 0.0275;    // Percentage relative to the width of the graph for calculating the width of the bars

        this.model.redraw = 0;        // When changed perform a redraw

        let _svg = divTag.append("svg"),  //Create dimensionless svg
            _grpChart = _svg.append("g");                       // Does not exist in the original Irisv
        this._drawLine = radialLine().curve(curveBundle.beta(0.85))        // Generator of splines that makes up the edges
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
            select(this.element).attr("height", box.height).attr("width", box.width)
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
            // console.log(pOuterRadius)
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
            _appendNodeNames();
            this._clusterVisPanel.updateClusterVisPanel()
        });

        var _appendRings = () => {
            this._grpRings = this._grpCluster.selectAll(".CV-grpRings")
                .data(this._vRings)    // Original _vRings
                .join(
                    enter => enter.append('g')
                        .attr("class", "CV-grpRings"),
                    update => update,
                    exit => exit.remove()
                )

            this._grpRings.append("circle")
                .attr("r", (d) => { return this._ringScale(d.pHeight) });
        }

        /**
         * _appendBars
         *
         * Adds the SVG elements relative to the bars
         */
        var _appendBars = async (data) => {
            
            let categories = []; //circleScale = scaleOrdinal(schemeAccent);

            let setCategories = () => {
                categories = this._vRings.map(d => d.typeAttr === "L" ? d.vLabelDomain.sort() : []).flat()
                categories = categories.filter( (d,i) => d && categories.indexOf(d) === i)
            }

            let setBarCircleScale = async () => {
                
                this._vRings.forEach(ring => {
                    if (ring.typeAttr === "V") {
                        ring.barCircleScale = scaleOrdinal(schemeAccent)
                            .range([0, Math.floor(ring.pHeightBar * (this._outerRadius - this._innerRadius))])
                            .domain([0, this._sameScale ? max(this._vRings, d => d.maxValue) : ring.maxValue]);
                    } else {
                        ring.barCircleScale = scaleOrdinal(schemeAccent).domain(categories);
                    }
                })
            }
            
            this._grpBars = this._grpCluster.selectAll(".CV-grpBars")
                .data(data.nodes.dataNodes)
                .join(
                    enter => enter.append("g")
                        .attr("class", "CV-grpBars"),
                    update => update,
                    exit => exit.remove()
                )
                .attr("transform", (d, i) => { return "rotate(" + this._grpBarsRotScale(i) + ")"; });
 
            // separator of nodes
            this._grpBars.append("line")
                .attr("x1", this._ringScale(0))
                .attr("y1", 0)
                .attr("x2", this._ringScale(100))
                .attr("y2", 0);

            setCategories(); // only useful when nodes are categorized
        
            await setBarCircleScale()
        
            for (let i = 0; i < this._vRings.length; i++) {
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
                        .on("click", this._onMouseClick.bind(this))
                        .append("title")
                        .text((d) => { return d.labels[1] + "\n" + data.nodes.valueTitle[this._vRings[i].indexAttr] + ": " + d.values[this._vRings[i].indexAttr] });
                } else {
                    this._grpBars.append("circle")
                        .attr("class", "CV-node")
                        .attr("cx", this._ringScale(this._vRings[i].pX) + this._barsArea.widthBar / 2)
                        .attr("cy", 0)
                        .attr("r", this._barsArea.widthBar / 2)
                        .style("fill", (d) => { return this._vRings[i].barCircleScale(d.labels[this._vRings[i].indexAttr]); })  
                        .on("mouseover", this._mouseOverNode.bind(this))
                        .on("mouseout", this._mouseOutNode.bind(this))
                        .on("click", this._onMouseClick.bind(this))
                        .append("title")
                        .text((d) => {
                            return d.labels[1] + "\n" +
                                data.nodes.labelTitle[this._vRings[i].indexAttr] + ": " + d.labels[this._vRings[i].indexAttr]
                        });
                }
            }
        }

        /**
         * _appendLinkss
         *
         * Adds the SVG elements relative to the edges
         */
        var _appendLinks = () => {
            // if (this._grpLinks != null)
            //     this._grpLinks.remove();

            this._grpLinks = this._grpCluster.append("g")
                .attr("class", "CV-grpLinks")
                .attr("transform", "rotate(90)");

            this._links = this._grpLinks.selectAll("path")
                .data(this._dataLinks.vBundleLinks)
                .join(
                    enter => enter.append("path"),
                    update => update,
                    exit => exit.remove()
                )
                .attr("d", this._drawLine)   
                .each(function (d) { 
                    d.source = d[0].data 
                    d.target = d[d.length - 1].data 
                })
                
        }

        var _appendNodeNames = () => {

            let maxValue = max(this._vRings, d => d.maxValue);
            let index = this._vRings.findIndex(d => d.maxValue === maxValue)
            let x = this._ringScale(this._vRings[this._vRings.length - 1].pX) + this._vRings[index]
                .barCircleScale(this._vRings[index].maxValue);

            this._grpBars.append("text")
                .classed("CV-names", true)
                .attr("x", x)
                .attr("y", 0)
                .attr("text-anchor", "start")
                .text(d => d.labels[1])
                .style("font-size", "10px")
                .style("font-family", "Arial")
                .style("color", "black");

        }

        /**
         * Zoom event
         */
        function _chartZoom(event) {
            _zoomListener.scaleExtent([0.5, 10]);
            _grpChart.attr("transform", event.transform)
        }



    }


    @Event({ bubbles: true, composed: true }) testevent: EventEmitter;
    _onMouseClick(event, data) {
        Object.entries(state.annotations).forEach(([key, value]) => {
           
            if (value["disabled"] == false) {

                if (value["data"] == "" || value["data"].view != "clustervis") {

                    value["data"] = {
                        "view": "clustervis",
                        "clusters": []
                    };
                }
                data.cluster.forEach(cl => {
                    value["data"].clusters.push(cl.labels[1])
                });
                state.annotations[key] = value;
            }
        });
        this.testevent.emit(state.annotations);
      
        this._send_id(this.element.id);
    }

    @Event({ bubbles: true, composed: true }) idevent: EventEmitter;
    _send_id(id) {
        this.idevent.emit(id)
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
            else return false;
        });

        this._grpBars.classed("CV-nodeHL", function (node) { return node.highLight; });

        this._grpBars.selectAll('text.CV-names')
            .style('font-weight', d => d.highLight ? 'bold' : 'normal')
            .style('display', d => d.highLight ? "block" : "none")
    }

    _mouseOutNode(event, d) {
        this._grpBars.classed("CV-nodeHL", false);
        this._links.classed("CV-linkHL", false);
        this._grpBars.selectAll("text.CV-names")
            .style('font-weight', 'normal')
            .style('display', 'block')
    }

    /**
       * _calcGeometry
       *
       * Calculates all geometric parameters for ClusterVis display
       */
    @Method()
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
    @Method()
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
                raiz.data.y = distScale(raiz.depth)
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
    @Method()
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
    @Method()
    async _angleToWidth(angle, radius) {
        let angRadianos = angle * Math.PI / 180.0;
        return Math.sqrt(2 * radius * radius - 2 * radius * radius * Math.cos(angRadianos));
    }

    /**
     * _getTree
     *
     * Generates a tree in the format { id:..., chidren[] }
     */
    @Method()
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
            } else
                if (nivel === levelMax) {
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

    @Method()
    async _getEdges(dados, nodes) {
        let nodos = dados.nodes.dataNodes,
            edges = dados.edges.dataEdges,
            objSource, objTarget, map = {};

        nodes.forEach(function (d) {
            map[d.data.id] = d;
        });
        let result = [];
        edges.forEach(function (d) {
            objSource = findNodo(d.src);
            objTarget = findNodo(d.tgt);
            result.push(map[objSource.id].path(map[objTarget.id]))
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
    @Method()
    async _updateMaxRings() {
        this._vRings.forEach((ring) => {
            if (ring.typeAttr === "V")
                ring.maxValue = max(this.model.data.nodes.dataNodes, function (d) { return d.values[ring.indexAttr]; });
            else
                ring.maxValue = 0;  // Copy here what was done in the addAttribute()
        });
    }

    //---------------------
    @Method()
    async setBox(_) {
        if (!arguments.length)
            return this.model.box;
        this.model.box = _;

    };


    //---------------------

    /** This function is required in all techniques
    * It is called internally in conectChart
    */
    @Method()
    async setPanel(_) {
        if (!arguments.length)
            return this._clusterVisPanel;
        this._clusterVisPanel = _;

    };

    //---------------------
    /** This function is to set the data to the chart
      * If no arguments, It will return the value of data
      */
    @Method()
    async setData(_, globalData) {
        if (!arguments.length)
            return this.model.data;
        if (_.cluster) {
            _ = this._subGraph.clusterClusterVis(_, globalData);
        } else {
            _ = this._subGraph.normalClusterVis(_, globalData);
        }

        this.model.data = _;

        this.addAttribute(state.ATN_Category, "L")
        this.addAttribute(state.ATN_QtPublicacoes - 1000, "V")
        this.addAttribute(state.ATN_QtProceedings - 1000, "V")
        this.addAttribute(state.ATN_QtJournals - 1000, "V")
        this.addAttribute(state.ATN_QtBooks - 1000, "V")

        this._sort.inic(this.model.data.nodes.labelTitle.length, this.model.data.nodes.valueTitle.length)
            .data(this.model.data.nodes.dataNodes);

        this._sort.exec(this._indexAttrSort);
        this._vOrder = this._sort.getVetOrder();
        this._dataLinks.tree = hierarchy(await this._getTree(this._dataLinks.heightTree, this.model.data.nodes.dataNodes, this._dataLinks.degreeTree, this._vOrder));

        this._dataLinks.vBundleLinks = await this._getEdges(this.model.data, this._dataLinks.tree.descendants());

        this.model.data.nodes.dataNodes.forEach(function (d) { d.highLight = false; });
        this._updateMaxRings();
    };

    //---------------------
    /**
     * Set value of Percentage relative to graph width for _innerRadius calculation
     * If no arguments, It will return the value of pInnerRadius
     */
    @Method()
    async setpInnerRadius(_) {
        if (!arguments.length)
            return this.model.pInnerRadius;
        this.model.pInnerRadius = _;
    };

    //---------------------
    /**
     * Set value of Percentage relative to graph width for _OuterRadius calculation
     * If no arguments, It will return the value of pOuterRadius
     */
    @Method()
    async setpOuterRadius(_) {
        if (!arguments.length)
            return this.model.pOuterRadius;
        this.model.pOuterRadius = _;
    };

    // //---------------------
    // @Method()
    // async removeAnelExterno() {
    //     let i, deltaHeight, pHeight, pX;

    //     this._vRings.pop();  // Removes the data from the ring
    //     deltaHeight = 100 / this._vRings.length;

    //     // Adjust todo o this._vRings
    //     for (i = 0, pHeight = deltaHeight; i < this._vRings.length; i++, pHeight += deltaHeight) {
    //         this._vRings[i].pHeight = pHeight;
    //         this._vRings[i].pHeightBar = deltaHeight / 100;
    //     }

    //     if (this._vRings.length > 0) {
    //         this._vRings[0].pX = 0;
    //         pX = this._vRings[this._vRings.length - 1].pHeight;

    //         for (i = 1; i < this._vRings.length; i++)
    //             this._vRings[i].pX = this._vRings[i - 1].pHeight;
    //     }

    //     this.model.redraw += 1;

    // };

    //---------------------
    
    @Method()
    addAttribute(_indexAttr, _typeAttr) {
        let maxValue, tempKeys, pX,
            deltaHeight = 100 / (this._vRings.length + 1),
            _vLabelDomain = [];

        if (_typeAttr === "V") {
            maxValue = max(this.model.data.nodes.dataNodes, function (d) { return d.values[_indexAttr]; });

            // if the ring has no data, return withour adding a new ring to the list
            if (maxValue === 0) return
        }
        else {    // Determines domain for categorical attributes (deve ser colocado tamb�m na fun��o chart.data)
            maxValue = -1;
            tempKeys = groups(this.model.data.nodes.dataNodes, d => d.labels[_indexAttr]).sort((a, b) => ascending(a[0], b[0]));
            for (i = 0; i < tempKeys.length; i++)
                _vLabelDomain[i] = tempKeys[i].key;
        }

        pX = 0;

        // Adjust todo o _vRings
        for (var i = 0, pHeight = deltaHeight; i < this._vRings.length; i++, pHeight += deltaHeight) {
            this._vRings[i].pHeight = pHeight;
            this._vRings[i].pHeightBar = deltaHeight / 100;
        }

        if (this._vRings.length > 0) {
            this._vRings[0].pX = 0;
            pX = this._vRings[this._vRings.length - 1].pHeight;

            for (i = 1; i < this._vRings.length; i++)
                this._vRings[i].pX = this._vRings[i - 1].pHeight;
        }

        this._vRings.push({
            indexAttr: _indexAttr, 
            typeAttr: _typeAttr, 
            pHeight: pHeight, 
            pX: pX,
            pHeightBar: deltaHeight / 100, 
            maxValue: maxValue, 
            vLabelDomain: _vLabelDomain,
            barCircleScale : _typeAttr !== "V" ? scaleLinear() : scaleOrdinal()
        })

        this.model.redraw += 1;
    };

    //---------------------
    @Method()
    alteraAttribute(_indexAnel, _indexAttr, _typeAttr) {
        let maxValue, tempKeys, i,
            _vLabelDomain = [];

        if (_typeAttr === "V") {
            maxValue = max(this.model.data.nodes.dataNodes, function (d) { return d.values[_indexAttr]; });
        } else {    // Determines or domain for categorical attributes (should also be placed in the function chart.data)
            maxValue = -1;
            tempKeys = groups(this.model.data.nodes.dataNodes, d => d.labels[_indexAttr]).sort((a, b) => ascending(a[0], b[0]));
           
            for (i = 0; i < tempKeys.length; i++)
                _vLabelDomain[i] = tempKeys[i].key;
        }

        this._vRings[_indexAnel].indexAttr = _indexAttr;
        this._vRings[_indexAnel].typeAttr = _typeAttr;
        this._vRings[_indexAnel].maxValue = maxValue;
        this._vRings[_indexAnel].vLabelDomain = _vLabelDomain;
        this._vRings[_indexAnel].barCircleScale = _typeAttr === "V" ? scaleLinear() : scaleOrdinal()

        this.model.redraw += 1;

    };

    //---------------------
    @Method()
    async indexAttrSort(_) {
        if (!arguments.length)
            return this._indexAttrSort;
        this._indexAttrSort = _;
    };

    //======== Actions Functions
    @Method()
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
    };

    //-------------------------
    @Method()
    acAlteraAnel(indexAnel, indexAttr) {
        let indexAtributo;

        indexAtributo = +indexAttr;

        if (indexAtributo >= 1000)
            this.alteraAttribute(indexAnel, indexAtributo - 1000, "V");
        else
            this.alteraAttribute(indexAnel, indexAtributo, "L");
        this._clusterVisPanel.alteraSelectOrder();
    };

    //-------------------------
    @Method()
    acSameScale(checked) {
        this._sameScale = checked;
        this.model.redraw += 1;
    };


    buildChart(svg) {
        this.setBox(this.model.box);
        this.indexAttrSort(2)
        this.addClusterChart(svg);
    }

    componentDidLoad() {
        let clusterDiv = select(this.element.querySelectorAll(".cluster")[0])
            .attr("width", this.width)
            .attr("height", this.height);
        this.buildChart(clusterDiv);
    }



    render() {
        return (
            <Host>
                <div class="cluster" />
            </Host>
        );
    }

}
