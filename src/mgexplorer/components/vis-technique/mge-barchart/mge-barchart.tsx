import { Component, Element, Host, Prop, h, Method} from '@stencil/core';
import { select } from 'd3-selection';
// import { zoom } from 'd3';
// import {allPapersList, duoPapersList, clusterPapersList, sort} from './process-data'
import { zoom, svg, axisBottom, axisLeft, format, max } from "d3";
import { scaleLinear, scaleBand } from 'd3-scale';
import state from "../../../store"
import Model from 'model-js';

import { sort, subGraph } from '../../../../lib/mge-mappers'

@Component({
  tag: 'mge-barchart',
  styleUrl: 'mge-barchart.css',
  shadow: false,
})

export class MgeBarchart {

    @Element() element: HTMLElement;
    /** represents the width of the Histogram chart*/
    @Prop() width: number = 350;
    /** represents the height of the Histogram chart*/
    @Prop() height: number = 350;
    /** The dataset name being used */
    @Prop() datasetName: string = "[]";

    public chartData: any;
    public model: any;
    public _chart: any;
    public _sort: any;
    private _subGraph: any;

    /** represents the panel associated with the graph */
    @Prop({ mutable: true }) _barPanel;  // represents the panel associated with the graph
    private _sortByText;
    /** (calculated) radius of the circle where the centroid is inserted */
    @Prop({ mutable: true }) _innerRadius;  // (calculated) radius of the circle where the centroid is inserted
    /** (calculated) Outernal circle radius where the graph is drawn */
    @Prop({ mutable: true }) _outerRadius;
    /** (calculated) distance occupied by the bars  */
    @Prop({ mutable: true }) _maxHeightBar; // (calculated) distance occupied by the bars - Change causes change in the maximum number of bars of the Iris - Original 40
    /** Group representing Histogram*/
    @Prop({ mutable: true }) _grpHistogram;   // Group representing IRIS
    private _abscissa;
    private _ordinate;
    private _ordinateTitle;
    private _abscissaTitle;
    private _abscissaBottomMargin;
    private _abscissaRightMargin;
    private _yAxis;
    private _xAxis;
    private _x;
    private _y;
    private _bins;
    /** keeps data on the different types of documents (attributes)*/
    @Prop({ mutable: true }) _documentTypes;
    private _orderedDocumentArray;
    private _years;

    // Used only when the amount of elements in this.datasetName is less than or equal to "dataVis"


    /** Indirect ordering vector*/
    @Prop({ mutable: true }) _vOrder ;      // Indirect ordering vector

    private _orders ;

    private _focusArea;

        //_updateIndexCenter = true,   // Indicates that IndexCenter should be updated

    // private _fishEyeArea;

    private _minArea;

    private _hiddenArea;

    /** Contains the indexes of the attributes that can be configured in the graph*/
    @Prop({ mutable: true }) _cfgIndexAttr;
    /** keeps the count of documents per year and type*/
    @Prop({ mutable: true }) _histogramData;

    /** Number of types of documents in the base*/
    @Prop({ mutable: true }) _nbOfTypesDoc;     // number of types of documents in the base
    /** colors for the different types*/
    @Prop({ mutable: true }) _colorsBars ;  // colors for the different types
    private _helpTooltip;

    

    constructor() {
        // ---------------- Model
        this.model = Model();
        this._sort = sort();
        this._subGraph = subGraph()
       
        this._barPanel = null  // represents the panel associated with the graph
        this._sortByText = true

        this._innerRadius = 0  // (calculated) radius of the circle where the centroid is inserted
        this._outerRadius = 0
        this._maxHeightBar = 0 // (calculated) distance occupied by the bars - Change causes change in the maximum number of bars of the Iris - Original 40

        this._grpHistogram = null   // Group representing IRIS
        this._abscissa = null
        this._ordinate = null
        this._ordinateTitle = null
        this._abscissaTitle = null
        this._abscissaBottomMargin = 70
        this._abscissaRightMargin = 40
        this._yAxis = null
        this._xAxis = null
        this._x = null
        this._y = null
        this._bins = null
        this._documentTypes = null
        this._orderedDocumentArray = null
        this._years = null

                // Used only when the amount of elements in this.datasetName is less than or equal to "dataVis"


        this._vOrder = null    // Indirect ordering vector

        this._orders = {
                    publications: [0, 1, 2, 3],
                    journals: [1, 2, 3, 0],
                    books: [2, 3, 0, 1],
                    proceedings: [3, 0, 1, 2],
                }

        this._focusArea = {
                    widthBar: 0,       // (calculated) Width of bar in the area of maximum width (focus) Original: 11
                    angleBar: 0.0,     // (calculated) Angle of the sector occupied by the bars that are in Focus
                    marginBar: 1,      //
                    angleSector: 0.0,  // (calculated)
                    indexCenter: 0,    // (calculated) index in the dataVis vector where the center of the focus is
                    numBars: 7         // Number of bars in focus (best odd number)
                }

        this._minArea = {
                    widthBar: 0,        // Width of the bar in the area where the width of the bars is minimum Original: 4
                    angleBar: 0.0,      // (calculated) Angle of the sector occupied by the bars that are in the area of minimum width (MIN)
                    marginBar: 1,
                    numBars: 0,       // (calculated)
                    angleSector: 0.0    // (calculated)
                }

        this._hiddenArea = {
                    widthBar: 0,    // (calculated) Bar width of area not visible (equal to focus)
                    angleBar: 0.0,  // (calculated)
                    numBars: 1,    // Number of bars with a width equal to the focus in hidden area
                    angleSector: 0.0   // (calculated) Sector angle occupied by hidden area
                }

        this._cfgIndexAttr = {          // Contains the indexes of the attributes that can be configured in the graph
                    titleCentroid: 0,       // Index of the attribute to be printed in the center of the circle (Must be Label)
                    titleDegree: "co-authors",     // Text to be used after degree value in centroid
                    textBar: 0             // Text that will be printed after the bars
                },

        this._nbOfTypesDoc = 4     // number of types of documents in the base
        this._colorsBars = ["#1f77b4", "#2ca02c", "#d62728", "#ff7d0e"]    // colors for the different types
        
    }


    /**
   * Set box size for the chart includes the content
   * input is a object includes height and width
   * If no arguments, It will return the value of box
   */
    @Method()
    async setBox(_) {
        if (!arguments.length)
            return this.model.box;
        this.model.box = _;

    };

    //---------------------
    @Method()
    async setpMaxHeightBar (_) {
        if (!arguments.length)
            return this.model.pMaxHeightBar;
        this.model.pMaxHeightBar = _;
    };

    //---------------------
    /** This function is required in all techniques
    * It is called internally in conectChart
    */
    @Method()
    async setPanel (_) {
        if (!arguments.length)
            return this._barPanel;
        this._barPanel = _;

    };
    //---------------------
    /** This function is to set the data to the chart
    * If no arguments, It will return the value of data
    */
    @Method()
    async setData (_, globalData, secondNode, isFromEdge=false, isFromCluster=false, isFromHC=false) {
        if (!arguments.length)
            return this.model.data;

        if (!isFromEdge && !isFromCluster) {
            this.model.data = this._subGraph.allPapersList(_, globalData);
        } else if (isFromEdge) {
            this.model.data = this._subGraph.duoPapersList(_, secondNode, globalData);
        } else if (isFromCluster) {
            this.model.data = this._subGraph.clusterPapersList(_, globalData);
        }

        const documents = this.model.data.root.data.documents;
        this._documentTypes = documents.map(d => d.type)
        this._documentTypes = this._documentTypes.filter((d,i) => this._documentTypes.findIndex(e => e.index === d.index) == i)        

        this._years = documents.map(d => d.date)
        this._years = this._years.filter((d,i) => this._years.indexOf(d) == i)
        this._years.sort() 

        this._histogramData = this._years.map(y => {
            let docs = documents.filter(d => d.date === y);
            let types = docs.map(d => d.type)
            types = types.filter((d,i) => types.findIndex(e => e.index === d.index) == i)
            return {
                'year': y,
                'docTypes': types
            }
        })

        this._histogramData.forEach(d => {
            d.docTypes = d.docTypes.map(t => {
                return {
                    'label': t.label,
                    'index': t.index,
                    'count': documents.filter(e => e.type.index == t.index && e.date == d.year).length
                }
            })
        })

        // Configure to sort node names
        this._sort.inic(this.model.data.children.labelTitle.length,this. model.data.children.valueTitle.length)
            .data(this.model.data.children.data);

        this._sort.exec(this._cfgIndexAttr.textBar);
        this._vOrder = this._sort.getVetOrder();
        this.setupVersionWithYearAndPublications();

    };

    //---------------------

    @Method()
    async dataVisToNode (index) {
        return this.model.data.children.data[index];
    };

    @Method()
    async getSourceObject () {
        return this.model.data.root.data;
    };

    //---------------------
    @Method()
    async setIndexAttrBar (_) {
        if (!arguments.length)
            return this.model.indexAttBar + 1000;
        this.model.indexAttBar = _ - 1000;
    };



    //======== Actions Functions
    @Method()
    async acSortExecText () {
        this._sortByText = true;
        this._sort.exec(this._cfgIndexAttr.textBar);
        this._vOrder = this._sort.getVetOrder();
        this.model.redraw += 1;
    };

    //---------------------
    @Method()
    async acSortExecAttribute () {
        this._sortByText = false;
        this._sort.exec(this.model.indexAttBar + 1000);
        this._vOrder = this._sort.getVetOrder();
        this.model.redraw += 1;
    };

    setupPrimaryVersion () {
        this._x = scaleBand()
            .domain(Array.from(this._years))     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
            .range([0, this.model.box.width]);
        this._xAxis = axisBottom()
            .scale(this._x);


        // Y axis: 
        this._y = scaleLinear()

        this._yAxis = axisLeft()
            .scale(this._y);

        this._abscissaTitle = this._grpHistogram.append("text")
            .attr("y", 1)
            .attr("dy", ".71em")
            .text("Publication Year");


        this._ordinateTitle = this._helpTooltip.append("svg")
            .attr("class", "HC-legend")
            .attr("y", 1)
            .attr("dy", ".71em")


        this._ordinate = this._grpHistogram.append("g")
            .attr("class", "HC-ordina")
            .style("fill", "none")
            .style("stroke", "black")
            .style("shape-rendering", "crispEdges")
            .call(this._yAxis);

        this._abscissa = this._grpHistogram.append("g")
            .attr("transform", "translate(0," + this.model.box.height + ")")
            .attr("class", "HC-abscissa")
            .style("fill", "none")
            .style("stroke", "black")
            .style("shape-rendering", "crispEdges")
            .call(this._xAxis);
    }

    setupVersionWithYearAndPublications() {

        this._x = scaleBand()
            .rangeRound([0, this.model.box.width])
            .padding(0.2)
            .domain(Array.from(this._years))    // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })

        this._xAxis = axisBottom()
            .scale(this._x);

        // Y axis: 
        this._y = scaleLinear()

        this._yAxis = axisLeft()
            .scale(this._y)
            .tickFormat(format("d"));

        this._abscissaTitle = this._grpHistogram.append("text")
            .attr("y", 1)
            .attr("dy", ".71em")
            .text("Publication Year");


        this._ordinateTitle = this._helpTooltip.append("svg")
            .attr("class", "HC-legend")
            .attr("y", 1)
            .attr("dy", ".71em")


        this._ordinate = this._grpHistogram.append("g")
            .attr("class", "HC-ordina")
            .style("fill", "none")
            .style("stroke", "black")
            .style("shape-rendering", "crispEdges")
            .call(this._yAxis);

        this._abscissa = this._grpHistogram.append("g")
            .attr("transform", "translate(0," + this.model.box.height + ")")
            .attr("class", "HC-abscissa")
            .style("fill", "none")
            .style("stroke", "black")
            .style("shape-rendering", "crispEdges")
            .call(this._xAxis);
    }

    _openToolTip(){
        this._helpTooltip.style("display", "block");
    }
 
    _closeToolTip(){
        this._helpTooltip.style("display", "none");

    }

  /** 
   * The initial function to create all of elements in the histogram chart
   * In this function, it will set Geometric attributes of the graph
   * create actions on graph and manage all of the interaction on the graph
   * */
 addHistogramChart(idDiv, divTag) {

        // ---------------- Geometric attributes of the graph
        this.model.margin = { top: 2, right: 2, bottom: 2, left: 2 };
        this.model.box = { width: this.width, height: this.height };
        this.model.pInnerRadius = 0.13;    // Percentage relative to graph width for _innerRadius calculation
        this.model.pOuterRadius = 0.57;    // Percentage relative to graph width for _OuterRadius calculation
        this.model.pMaxHeightBar = 0.15;  // Percentage relative to graph width for _MaxHeightBar calculation
        this.model.pFocusWidthBar = 0.0275;  // Percentage relative to graph width for calculation of _focusArea.widthBar
        this.model.pMinWidthBar = 0.01;       // Percentage relative to graph width for calculation of _minArea.widthBar Original 4

        this.model.indexAttBar = 0;           // Index of the attribute that will be plotted in the toolbar

        this.model.redraw = 0;


        // ---------------- Initialization Actions
        let _svg = divTag.append("svg"),  // Create dimensionless svg
            _grpChart = _svg.append("g");                       // Does not exist in the original Iris
        // Add zoom event
        let _zoomListener = zoom().on("zoom", _chartZoom);
        _zoomListener.scaleExtent([0.5, 10]);
        _svg.call(_zoomListener).on("mousemove.zoom", null)
                                .on("mousedown.zoom", null)
                                .on("touchstart.zoom", null)
                                .on("touchend.zoom", null);

        let _helpContainer = divTag.append("div")
            .attr("class", "helpContainer")
            .on("mouseover", this._openToolTip.bind(this))
            .on("mouseout", this._closeToolTip.bind(this));

        _helpContainer.append("i")
            .attr("class", "fas fa-info-circle")
            .style("font-size", "24px");
            // .text("&#xf05a")
            // .style("font-family" , "FontAwesome");

        this._helpTooltip = divTag.append("div")
            .attr("class", "helpTooltip")
            .attr("style", "width:40%;height:80px")
            .style("display", "none");

        this._grpHistogram = _grpChart.append("g").attr("class", "HistogramChart").attr("transform", "translate(30,20)");

        // _______________________

        const dataTest = [{ price: "20.0" }, { price: "34.0" }, { price: "35.0" }, { price: "40.0" }, { price: "59.0" }, { price: "60.0" }, { price: "61.0" }, { price: "62.0" }, { price: "70.0" }, { price: "80.0" }, { price: "100.0" }];
        const dataTestResearch = [{ year: '2007', qtResearch: "6", qtPublication: "5" }, { year: '2008', qtResearch: "1", qtPublication: "7" }, { year: '2009', qtResearch: "2", qtPublication: "3" }]


        //_______________________________

        //===================================================
        this.model.when(["box", "margin"], (box, margin) => {
            this.model.widthChart = box.width - margin.left - margin.right;
            this.model.heightChart = box.height - margin.top - margin.bottom;
        });

        this.model.when("box", function (box) {
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
        });

        //---------------------
        this.model.when(["widthChart", "pOuterRadius"], (widthChart, pOuterRadius) => {
            this._outerRadius = Math.floor(widthChart * pOuterRadius);
        });

        //---------------------
        this.model.when(["data", "indexAttBar", "pMaxHeightBar"], (data, widthChart, indexAttBar, pMaxHeightBar) => {
            let maxValue = 150
            this._maxHeightBar = Math.floor(widthChart * pMaxHeightBar);
            this.model.barScale = scaleLinear().range([0, this._maxHeightBar]).domain([0, maxValue]);
            
        });

        //---------------------
        this.model.when(["widthChart", "pFocusWidthBar"], (widthChart, pFocusWidthBar) => {
            this._focusArea.widthBar = Math.floor(widthChart * pFocusWidthBar);
            this._hiddenArea.widthBar = this._focusArea.widthBar;
        });

        //---------------------
        this.model.when(["widthChart", "pMinWidthBar"], (widthChart, pMinWidthBar) => {
            this._minArea.widthBar = Math.floor(widthChart * pMinWidthBar);
            if (this._minArea.widthBar === 0)
                this._minArea.widthBar = 1;
        });
        
        //---------------------
        this.model.when(["box", "data", "barScale", "pInnerRadius", "pOuterRadius", "redraw"],
            (data, widthChart, heightChart) => {
                
                // Update abscissa
                this._x.rangeRound([0, this.model.box.width * 0.90 - this._abscissaRightMargin]);
                this._xAxis.scale(this._x)
                this._abscissa.attr("transform", "translate(0," + `${this.model.box.height - this._abscissaBottomMargin}` + ")")
                    .call(this._xAxis);

                // Update ordinate
                let docsCount = {}
                this.model.data.root.data.documents.forEach(d => {
                    let key = d.date + '-' + d.type.label;
                    if (!Object.keys(docsCount).includes(key)) {
                        docsCount[key] = 0;
                    }
                    docsCount[key] ++;
                })

                // this._y.domain([0, this.model.data.root.data.documents.length]);
                // console.log([0, max(Object.values(docsCount))])
                this._y.domain([0, max(Object.values(docsCount))]);

                this._y.range([`${this.model.box.height - this._abscissaBottomMargin}`, 0]);

                this._yAxis.scale(this._y).ticks(max(Object.values(docsCount)))

                this._ordinate.call(this._yAxis);

                constructChartBars();

                this._abscissaTitle.attr("transform", "translate(40," + `${this.model.box.height - 40}` + ")")

            } // End
        );

        var constructChartBars = () => {

            let x1 = scaleBand()
                .domain([0, 1, 2, 3]) // there is only four types for now
                .rangeRound([0, this._x.bandwidth()]);

            this._grpHistogram.selectAll(".HC-grpBar").remove();

            // _histogramData format: [{year:"", docTypes : {type:"..."}}, {year:""...}]
            let _grpBars = this._grpHistogram.selectAll(".HC-grpBar")
                .data(this._histogramData)
                .enter()
                    .append("g")
                    .attr("class", "HC-grpBar")
                    .attr("transform", d => `translate(${this._x(d.year)},0)`)
                    .attr("width", _ => this._x.bandwidth())
                    .attr("height", _ => this.model.box.height - this._abscissaBottomMargin)

            let index = 0;

            _grpBars.selectAll('rect')
                .data(d => d.docTypes)
                .enter()
                .append("rect")
                    .attr("class", "HC-bars")
                    .attr("transform", (d,i) => { 
                        return `translate(${x1(d.index)}, ${this._y(d.count)})`; 
                    })
                    .attr("width", _ => x1.bandwidth())
                    .attr("height", d => (this.model.box.height - this._abscissaBottomMargin) - this._y(d.count))
                    .style("fill", d => this._colorsBars[d.index])
                        .append("title")
                        .text(d => d.label + " : " + d.count)

            // set legend per attribute type
            this._ordinateTitle.selectAll("*").remove();
            let legendGrp = this._ordinateTitle.selectAll('g')
                .data(this._documentTypes)
                .enter()
                    .append('g')

            legendGrp.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", d => this._colorsBars[d.index])
                .attr("transform", (_,i) => "translate(10," + `${20 * i + 10}` + ")");

            legendGrp.append("text")
                .attr("transform", (_,i) => "translate(30," + `${20 * i + 10}` + ")")
                .attr("y", "10")
                .text(d => d.label)
                    .append("title")
                    .text(d => d.label);


        }

        /**
         * Zoom event
         */
        function _chartZoom(event) {
            _zoomListener.scaleExtent([0.5, 10]);
            _grpChart.attr("transform", event.transform)
        }
    }

    buildChart(idDiv, svg){ 
        this.addHistogramChart(idDiv, svg);
    }

    componentWillLoad(){
        this.setBox(this.model.box);
        // this.setData(this.chartData, state._data["data-0"]);

    }

    componentDidLoad(){
        let svg = select(this.element.querySelectorAll(".histogram")[0])
            .attr("width", this.width)
            .attr("height", this.height);
        this.buildChart("histogram", svg);
    }

    render() {
        return  (
           
          <Host>
            <div class="histogram"/>
          </Host>

        )
    }
}
