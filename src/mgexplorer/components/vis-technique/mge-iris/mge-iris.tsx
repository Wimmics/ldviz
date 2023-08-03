import { Component, Element, Host, Prop, h, Method} from '@stencil/core';
import { select , selectAll} from 'd3-selection';
import { max, sum } from 'd3-array';
// import {normalIris, sort} from './process-data';
import { zoom, range, arc } from "d3";
import { scaleLinear, scaleOrdinal } from 'd3-scale';
import state from "../../../store"
import Model from 'model-js'; // t import 2 cai 
import { schemeCategory10  } from 'd3-scale-chromatic'

import { sort, subGraph } from '../../../../lib/mge-mappers'

@Component({
  tag: 'mge-iris',
  styleUrl: 'mge-iris.css',
  shadow: false,
})
export class MgeIris {

  @Element() element: HTMLElement;
  /** represents the width of the Iris chart*/
  @Prop() width: number = 350;
  /** represents the height of the Iris chart*/
  @Prop() height: number = 350;
  /** The dataset name being used */
  @Prop() datasetName: string = "[]";

  public chartData: any;
  public model: any;
  public _sort: any;
  private _subGraph: any;

  private _helpTooltip = null;
  private _itemTypes = [];

  /** The dataset name being used */
  @Prop({ mutable: true }) _irisPanel;  // represents the panel associated with the graph
  private _sortByText;
  private _xIrisCenter;
  private _yIrisCenter;
  /** (calculated) radius of the circle where the centroid is inserted */
  @Prop({ mutable: true }) _innerRadius;  // (calculated) radius of the circle where the centroid is inserted
  /** (calculated) Outernal circle radius where the graph is drawn */
  @Prop({ mutable: true }) _outerRadius;
  /** (calculated) distance occupied by the bars*/
  @Prop({ mutable: true }) _maxHeightBar; // (calculated) distance occupied by the bars - Change causes change in the maximum number of bars of the Iris - Original 40
  /** Total number of the bars */
  @Prop({ mutable: true }) _numTotalBars;
  /** Maximum number of the bars */
  @Prop({ mutable: true }) _numMaxBars;
  /** Group representing IRIS */
  @Prop({ mutable: true }) _grpIris;   // Group representing IRIS
  /** Selection that contains all groups of bars */
  @Prop({ mutable: true }) _grpBars;       // Selection that contains all groups of bars
  /**  Vector of visible data. Points to the elements of model.data */
  @Prop({ mutable: true }) _dataVis;        // Vector of visible data. Points to the elements of model.data (has the attributes "angle" and "index")
  /** Index in the "dataVis" vector where the first element of the data vector is located*/
  @Prop({ mutable: true }) _indexFirstData;   // Index in the "dataVis" vector where the first element of the data vector is located
            // Used only when the amount of elements in this.data is less than or equal to "dataVis"
  /** Percentage of center displacement */
  @Prop({ mutable: true }) _pDesloc;       // Percentage of center displacement

  /** Indirect ordering vector*/
  @Prop({ mutable: true }) _vOrder;      // Indirect ordering vector

  /** The orders of typesDocs*/
  @Prop({ mutable: true }) _orders

  /** Contains the attribute of the focused area*/
  @Prop({ mutable: true }) _focusArea;

  //_updateIndexCenter = true,   // Indicates that IndexCenter should be updated

  /** Contains the attribute of the fish eye area*/
  @Prop({ mutable: true }) _fishEyeArea ;

  /** Contains the attribute of the minimum area */
  @Prop({ mutable: true }) _minArea;

  /** Contains the attribute of the hidden area */
  @Prop({ mutable: true }) _hiddenArea;

  /** Contains the indexes of the attributes that can be configured in the graph */
  @Prop({ mutable: true }) _cfgIndexAttr;

  /** number of types of documents in the base */
  @Prop({ mutable: true }) _nbOfTypesDoc;    // number of types of documents in the base
  /** colors for the different types*/
  @Prop({ mutable: true }) _colorsBars;   // colors for the different types


  constructor() {
    // ---------------- Model
    this.model = Model();
    this._sort = sort();
    this._subGraph = subGraph()
 
    this._irisPanel = null;  // represents the panel associated with the graph
    this._sortByText = true;
    this._xIrisCenter = 0;
    this._yIrisCenter = 0;
    this._innerRadius = 0;  // (calculated) radius of the circle where the centroid is inserted
    this._outerRadius = 0;
    this._maxHeightBar = 0; // (calculated) distance occupied by the bars - Change causes change in the maximum number of bars of the Iris - Original 40
    this._numTotalBars = 0;
    this._numMaxBars = 0;
    this._grpIris = null;   // Group representing IRIS
    this._grpBars = null;       // Selection that contains all groups of bars
    this._dataVis = [];        // Vector of visible data. Points to the elements of model.data (has the attributes "angle" and "index")
    this._indexFirstData = 0;   // Index in the "dataVis" vector where the first element of the data vector is located
                // Used only when the amount of elements in this.data is less than or equal to "dataVis"
    this._pDesloc = 0.08;       // Percentage of center displacement

    this._vOrder = null;      // Indirect ordering vector

    this._orders = {
                    publications: [0, 1, 2, 3],
                    journals: [1, 2, 3, 0],
                    books: [2, 3, 0, 1],
                    proceedings: [3, 0, 1, 2],
                },

    this._focusArea = {
                    widthBar: 0,       // (calculated) Width of bar in the area of maximum width (focus) Original: 11
                    angleBar: 0.0,     // (calculated) Angle of the sector occupied by the bars that are in Focus
                    marginBar: 1,      //
                    angleSector: 0.0,  // (calculated)
                    indexCenter: 0,    // (calculated) index in the dataVis vector where the center of the focus is
                    numBars: 7         // Number of bars in focus (best odd number)
                },

                //_updateIndexCenter = true,   // Indicates that IndexCenter should be updated

    this._fishEyeArea = {
                    geometry: [{ width: 0.0, angle: 0.0 }],   // One element for each bar
                    marginBar: 1,                          // Margin between the bars of the fish eye area
                    numBars: 0,         // (calculated)
                    angleSector: 0.0                        // (calculated) Sum of the angle of all bars forming the fish eye area
                },

    this._minArea = {
                    widthBar: 0,        // Width of the bar in the area where the width of the bars is minimum Original: 4
                    angleBar: 0.0,      // (calculated) Angle of the sector occupied by the bars that are in the area of minimum width (MIN)
                    marginBar: 1,
                    numBars: 0,       // (calculated)
                    angleSector: 0.0    // (calculated)
                },

    this._hiddenArea = {
                    widthBar: 0,    // (calculated) Bar width of area not visible (equal to focus)
                    angleBar: 0.0,  // (calculated)
                    numBars: 1,    // Number of bars with a width equal to the focus in hidden area
                    angleSector: 0.0   // (calculated) Sector angle occupied by hidden area
                },

    this._cfgIndexAttr = {          // Contains the indexes of the attributes that can be configured in the graph
                    titleCentroid: 1,       // Index of the attribute to be printed in the center of the circle (Must be Label)
                    titleDegree: "co-authors",     // Text to be used after degree value in centroid
                    textBar: 0             // Text that will be printed after the bars
                },

    this._nbOfTypesDoc = 4,     // number of types of documents in the base
    this._colorsBars = scaleOrdinal(schemeCategory10).domain([0,1,2,3])     // colors for the different types
    
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
    /**
   * Set value of Percentage relative to graph width for _innerRadius calculation
   * If no arguments, It will return the value of pInnerRadius
   */
    @Method()
    async setpInnerRadius (_) {
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
    async setpOuterRadius (_) {
        if (!arguments.length)
            return this.model.pOuterRadius;
        this.model.pOuterRadius = _;
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
    * */
    @Method()
    async setPanel (_) {
        if (!arguments.length)
            return this._irisPanel;
        this._irisPanel = _;

    };

    //---------------------
    @Method()
    async setData (_, globalData) {
        if (!arguments.length)
            return this.model.data;
        this.model.data = this._subGraph.normalIris(_, globalData);

        this._vOrder = range(this.model.data.children.data.length)
        this._vOrder.sort((a,b) => {
            return this.model.data.children.data[a].labels[1].localeCompare(this.model.data.children.data[b].labels[1])
        })

    };

    //---------------------
    /** Configure the data that will be printed in the centroid and the text of the bar (Label only)
    */
    @Method()
    async setConfigCentroid (titulo, tituloGrau, textoBarra) {
        this._cfgIndexAttr.titleCentroid = titulo;
        this._cfgIndexAttr.titleDegree = tituloGrau;
        this._cfgIndexAttr.textBar = textoBarra;
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

    @Method()
    async getVOrder () {
        return this._vOrder;
    };


    //======== Actions Functions
    @Method()
    async acSortExecText () {
        this._vOrder.sort((a,b) => {
            return this.model.data.children.data[a].labels[1].localeCompare(this.model.data.children.data[b].labels[1])
        })

        this.model.redraw += 1;
    };

    //---------------------
    @Method()
    async acSortExecAttribute (ascending) {
    
        this._vOrder.sort((a,b) => {
            return ascending * (sum(this.model.data.children.data[b].edge.values.filter((_,i) => i < this._nbOfTypesDoc)) - 
                sum(this.model.data.children.data[a].edge.values.filter((_,i) => i < this._nbOfTypesDoc)))
        })

        this.model.redraw += 1;
    };

    @Method()
    async updateTextSize () {
        selectAll(this.element.querySelectorAll(".IC-node"))
            .attr("width", this.model.widthChart / 3)

    };

    @Method()
    async putBarsOnIris () {
        const self = this;

        const groupActive = (d, i) => this._focusArea.indexCenter === i
        const groupFontSize = d => (d.widthText * 0.55) + "px"
        const groupYPos = d => d.widthText / 2 * 0.48 
        const groupTransform = d => "rotate(" + d.angleRot + ")"
        const groupOnClick = function (event, d) {
            const e = self._grpBars.nodes();
            const i = e.indexOf(this);
            if (i > self._focusArea.indexCenter){
                self.chartRotate(i - self._focusArea.indexCenter, 1, i - 1);
            }
            else{
                self.chartRotate(self._focusArea.indexCenter - i, -1, i + 1);
            }
        }

        this._grpBars = this._grpIris.selectAll(".IC-grpBar")
            .data(this._dataVis)
            .join(
                enter => enter.append("g")
                    .attr("class", "IC-grpBar")
                    .attr("transform", groupTransform)
                    .on("click", groupOnClick)
                    .call(g => g.append("text")
                        .attr("class", "IC-node")
                        .text(d => this._text(d) )
                        .attr("x", this._innerRadius + this._maxHeightBar)
                        .attr("y", groupYPos)
                        .style("font-size", groupFontSize))  // Size reduced by 30%
                    .call(g => g.append("title").text(d => this._tooltipComplete(d))),
                update => update
                    .call(g => g.transition().duration(500)
                        .attr("transform", groupTransform))
                    .call(g => g.select('text')
                        .text(d => this._text(d) )
                        .style("font-size", groupFontSize)
                        .attr("y", groupYPos))
                    .call(g => g.select('title').text(d => this._tooltipComplete(d))
                    ),
                exit => exit.remove()
            )
            .on("click", groupOnClick)
        
        const pairTitle = function(d) { const parent = select(this.parentNode.parentNode).datum(); return self._tooltip(parent, d.typeIndex)}
        const rectHeight = function() { const parent = select(this.parentNode.parentNode).datum(); return parent.width; }
        const rectYPos = function() { const parent = select(this.parentNode.parentNode).datum(); return Math.round(-parent.width / 2); }
        const rectXPos = function(d,i) {
                const siblings = select(this.parentNode.parentNode).datum().children.filter(e => e.typeIndex < d.typeIndex);
                return self._innerRadius + (i == 0 ? 0 : sum(siblings, e => self.model.barScale(e.value)))
            }
        const rectWidth = d => this.model.barScale(d.value) 
        const rectFill = d => this._colorsBars(d.typeIndex)
        
        this._grpBars.selectAll('g')
            .data(d => d.children)
            .join(
                enter => enter.append('g')
                    .call(g => g.append("rect")
                        .attr("class", "IC-bars")
                        .attr("x", rectXPos)
                        .attr("y", rectYPos)
                        .attr("height", rectHeight)
                        .attr("width", rectWidth)
                        .attr("fill", rectFill))
                    .call(g => g.append("title").text(pairTitle)),
                update => update
                    .call(g => g.select('title').text(pairTitle))
                    .call(g => g.select('rect')
                        .attr("height", rectHeight)
                        .attr("width", rectWidth)
                        .attr("fill", rectFill)
                        .transition().duration(500)
                        .attr("x", rectXPos)
                        .attr("y", rectYPos)),
                exit => exit.remove()
            )

    };

    async chartRotate (qtBars, dir, origin) {
        if (qtBars > 0) {
            this.moveDataVis(this._focusArea.indexCenter + dir, this._focusArea.indexCenter);
            await this.putBarsOnIris();
            setTimeout( () => { // the timeout allows for smooth animation
                this.chartRotate(qtBars - 1, dir, origin - dir);
            }, 45);
        }
    };

    moveDataVis (source, target) {
        let i, index, sizeData;

        sizeData = this.model.data.children.data.length;
        if (sizeData >= this._dataVis.length) {
            index = (sizeData + this._dataVis[source].indexData - target) % sizeData;
            for (i = 0; i < this._dataVis.length; i++) {
                this._dataVis[i].indexData = index;
                index = (index + 1) % sizeData;
            }
        } else {
            index = (this._indexFirstData - source + target + this._dataVis.length) % this._dataVis.length;
            this._indexFirstData = index;
            for (i = 0; i < this._dataVis.length; i++)
                this._dataVis[i].indexData = -1;
            for (i = 0; i < sizeData; i++) {
                this._dataVis[index].indexData = i;
                index = (index + 1) % this._dataVis.length;
            }
        }

        this._setDataVisChildren()
    };

    //---------------------
    async acChangeAttrBar (atributo) {
        this.model.indexAttBar = atributo;
        // this._grpBars.remove();
        await this.putBarsOnIris();
        /*if ( !_sortByText) {
            _sort.exec(model.indexAttBar+1000);
            _vOrder = _sort.getVetOrder();
        }*/
    };

   /**
         *
         * _getTheRightOrder
         *
         * Returns the order in which we need to display the types of documents
         *
         * @param i
         * @returns {number[]}
         * @private
         */
    @Method()
    async _getTheRightOrder(i) {
        switch (i) {
            case 0:
                return this._orders.publications;
            case 1:
                return this._orders.journals;
            case 2:
                return this._orders.books;
            case 3:
                return this._orders.proceedings;
        }
    };

    /**
     * _calcWidthBar
     *
     * Calculates the bar width of the chart
     * If there is no slash (d.indexData == -1) do not draw
     */
    _calcWidthBar(d, i) {
        if (d.indexData !== -1) {
            return this.model.barScale(this.model.data.children.data[this._vOrder[d.indexData]].edge.values[i]);
        }
        else
            return 0;       // Do not draw the rectangle
    };

    /**
     *
     * _calcXBar
     *
     * Calculates the x position of the bar
     *
     * @param d
     * @param beginning
     * @param end
     * @returns {number}
     * @private
     */
    _calcXBar(d, beginning, end) {
        let order = this._getTheRightOrder(end);
        let start = 0;
        if (beginning < end) {
            let i = 0;
            beginning = beginning + this._nbOfTypesDoc;
            while (beginning >= end) {
                start += this._calcWidthBar(d, order[i]);
                beginning--;
                i++;
            }
        } else {
            while (beginning >= end) {
                start += this._calcWidthBar(d, beginning);
                beginning--;
            }
        }
        return start;
    }

    /**
     * _text
     *
     * returns the text associated with the slash
     *   number + " " + name
     */
     _text(d) {
        if (d.indexData !== -1)
            return this.model.data.children.data[this._vOrder[d.indexData]].labels[1]
            //return this._adjustLengthText(this.model.data.children.data[this._vOrder[d.indexData]].labels[1], 20);
        else
            return "";
    }

    /**
     * _textCentroid
     *
     * Adjusts the size of the text that will be printed in the centroid title
     */
     _adjustLengthText(stText, limit) {
        if (stText.length > limit)
            return stText.slice(0, limit) + "...";
        else
            return stText;
    }

    /**
     * _tooltip
     *
     * returns the tooltip associated with the toolbar
     *
     */
     _tooltip(d, i) {
        // console.log("flag");
        if (d.indexData !== -1) {
            return this.model.data.children.data[this._vOrder[d.indexData]].labels[1] + "\n" +  // Full name
                this.model.data.edges.valueTitle[i] + ": " +
                this.model.data.children.data[this._vOrder[d.indexData]].edge.values[i];
        }
        else
            return "";       // Empty Tooltip
    }

    /**
     * _tooltipComplete
     *
     * returns the complete tooltip associated with the toolbar group
     *
     */
    _tooltipComplete(d) {
        if (d.indexData !== -1) {
            let result = this.model.data.children.data[this._vOrder[d.indexData]].labels[1] + "\n";
            let j;
            for (j = 0; j < this._nbOfTypesDoc; j++) {
                let title = this.model.data.edges.valueTitle[j]
                if (title.match(/z[0-9]/g)) continue; // only include existing types in the dataset (there are placeholders such as z0, z1 when there is less than 4 different types)

                result += title + ": " +
                    this.model.data.children.data[this._vOrder[d.indexData]].edge.values[j] + "\n";
            }
            return result;
        }
        
     return "";       // Empty Tooltip
    }

    /**
     * _angleToWidth
     *
     * Calculates the width of the circle string from the angle (degrees) and radius
     * E: angle, radius
     * S: width
     */
    _angleToWidth(angle, radius) {
        return 2 * radius * Math.sin(angle * Math.PI / 360.0);
    }

    /**
     * _widthToAngle
     *
     * Calculates the angle of the occupied sector by a width
     * E: width, radius
     * S: angle in degrees
     */
     _widthToAngle(width, radius) {
        return Math.acos(1.0 - width * width / (2 * radius * radius)) * 180.0 / Math.PI;
    }

    /**
     * _degreeToRadian
     *
     * Converts an angle from degrees to radians
     */
     _degreeToRadian(angle) {
        return angle * Math.PI / 180;
    }

    async _calcGeometry() {
        await this.i_CalcFocusArea();
        await this.i_CalcFishEyeArea();
        await this.i_CalcHiddenArea();
        await this.i_CalcMinArea();   // It should be the last one to be calculated as it is the area left over
        // Recalculates the sector angle of the hidden area
        // adding what's missing to 360 degrees

        this._hiddenArea.angleSector = 360 - this._fishEyeArea.angleSector * 2 - this._focusArea.angleSector - this._minArea.angleSector * 2;

        // The calculation of the number of bars must be performed after the calculation of the area elements
        this._numMaxBars = this._focusArea.numBars + 2 * this._fishEyeArea.numBars + 2 * this._minArea.numBars;
        this._numTotalBars = this.model.data.children.data.length; // number of coauthors of the selected author

        // The calculation of the index in the dataVis vector where the center of the focus is to be calculated after the elements of the areas
        this._focusArea.indexCenter = this._minArea.numBars + this._fishEyeArea.numBars + Math.floor(this._focusArea.numBars / 2);

        // Initializes the dataVis vector with capacity for the maximum number of bars
        // Do not associate the dataVis with the data vector (indicated by the value -1 in the indices)
        // console.log(i_BindDataVisToData);
        await this.i_InicDataVisVector();
        this.i_BindDataVisToData();
    }
//--------
    async i_CalcFocusArea() {
        
        this._focusArea.angleBar = this._widthToAngle(this._focusArea.widthBar + this._focusArea.marginBar, this._innerRadius);
        this._focusArea.angleSector = this._focusArea.angleBar * this._focusArea.numBars;
    }

    //--------
    async i_CalcFishEyeArea() {
        let index = 0;
        this._fishEyeArea.angleSector = 0.0;
        this._fishEyeArea.geometry = [{ width: 0.0, angle: 0.0 }];
        for (let widthBar = this._minArea.widthBar + 1; widthBar < this._focusArea.widthBar; widthBar++) {
            this._fishEyeArea.geometry[index] = { width: widthBar, angle: this._widthToAngle(widthBar + this._fishEyeArea.marginBar, this._innerRadius) };
            this._fishEyeArea.angleSector += this._fishEyeArea.geometry[index].angle;
            index++;
        }
        this._fishEyeArea.numBars = index;
    }

    //--------
    async i_CalcHiddenArea (){
        this._hiddenArea.angleBar = this._widthToAngle(this._hiddenArea.widthBar + 1, this._innerRadius);
        this._hiddenArea.angleSector = this._hiddenArea.angleBar * this._hiddenArea.numBars;
    }

    //--------
    async i_CalcMinArea (){
        
        this._minArea.angleBar = this._widthToAngle(this._minArea.widthBar + this._minArea.marginBar, this._innerRadius);
        this._minArea.numBars = Math.floor((360.0 - this._fishEyeArea.angleSector * 2 - this._focusArea.angleSector - this._hiddenArea.angleSector) / (2 * this._minArea.angleBar));
        this._minArea.angleSector = this._minArea.numBars * this._minArea.angleBar;
    }

    //--------
    async i_InicDataVisVector () {
        let angleRotBar;

        this._dataVis = range(this._numMaxBars).map(function () { return { angleRot: 0.0, width: 0, widthText: 0, indexData: 0, children: [] }; });


        // Determines as the initial rotation angle of the bar with index 0 the angle of the upper line of the sector of the not visible area
        angleRotBar = 180 + this._hiddenArea.angleSector / 2;

        // ---------- Minimum Area 1
        angleRotBar = this.i_CalcGeometryFixedArea(angleRotBar, 0, this._minArea.numBars - 1, this._minArea.widthBar, this._minArea.angleBar);

        // ---------- Fish Eye Area 1
        angleRotBar = this.i_CalcGeometryFishEyeArea(angleRotBar, this._minArea.numBars, this._minArea.numBars + this._fishEyeArea.numBars - 1, true);

        // ---------- Focus Area
        angleRotBar = this.i_CalcGeometryFixedArea(angleRotBar, this._minArea.numBars + this._fishEyeArea.numBars,
            this._minArea.numBars + this._fishEyeArea.numBars + this._focusArea.numBars - 1,
            this._focusArea.widthBar, this._focusArea.angleBar); // Focus Area

        // ---------- Fish Eye Area 2
        angleRotBar = this.i_CalcGeometryFishEyeArea(angleRotBar, this._minArea.numBars + this._fishEyeArea.numBars + this._focusArea.numBars,
            this._minArea.numBars + 2 * this._fishEyeArea.numBars + this._focusArea.numBars - 1,
            false);

        // ---------- Minimum Area 2
        angleRotBar = this.i_CalcGeometryFixedArea(angleRotBar, this._minArea.numBars + 2 * this._fishEyeArea.numBars + this._focusArea.numBars,
            2 * this._minArea.numBars + 2 * this._fishEyeArea.numBars + this._focusArea.numBars - 1,
            this._minArea.widthBar, this._minArea.angleBar);
    }
        //--------
    i_CalcGeometryFixedArea(angleRotBar, startIndex, finalIndex, width, angleBar) {
            
            let radiusText = this._innerRadius + this._maxHeightBar;
            for (let i = startIndex; i <= finalIndex; i++) {         // adjusts the angle of rotation to the center of the bar
                this._dataVis[i].angleRot = (angleRotBar + angleBar / 2) % 360;
                this._dataVis[i].indexData = -1;
                this._dataVis[i].width = width;
                this._dataVis[i].widthText = this._angleToWidth(angleBar, radiusText);

                angleRotBar = (angleRotBar + angleBar) % 360;
            }
            return angleRotBar;      
    }

        //--------
    i_CalcGeometryFishEyeArea(angleRotBar, startIndex, finalIndex, ascending) {
            let indexGeometry,
                lastIndex = this._fishEyeArea.geometry.length - 1,
                radiusText = this._innerRadius + this._maxHeightBar;

            for (let i = startIndex; i <= finalIndex; i++) {  
                indexGeometry = (ascending) ? i - startIndex : lastIndex - (i - startIndex);
                this._dataVis[i].angleRot = (angleRotBar + this._fishEyeArea.geometry[indexGeometry].angle / 2) % 360;
                this._dataVis[i].indexData = -1;
                this._dataVis[i].width = this._fishEyeArea.geometry[indexGeometry].width;
                this._dataVis[i].widthText = this._angleToWidth(this._fishEyeArea.geometry[indexGeometry].angle, radiusText);
                angleRotBar = (angleRotBar + this._fishEyeArea.geometry[indexGeometry].angle) % 360;
            }

            return angleRotBar;
    }


        
        //--------
    i_BindDataVisToData () {
        let i, startIndex, endIndex, index, sizeDataChildren;


        sizeDataChildren = this.model.data.children.data.length;

        if (sizeDataChildren >= this._dataVis.length)
            for (i = 0; i < this._dataVis.length; i++)
                this._dataVis[i].indexData = i;
        else {
            startIndex = this._focusArea.indexCenter - Math.floor(sizeDataChildren / 2);
            this._indexFirstData = startIndex;
            endIndex = startIndex + sizeDataChildren;
            index = 0;
            for (i = startIndex; i < endIndex; i++, index++)
                this._dataVis[i].indexData = index;
        }

        this._setDataVisChildren()
    } // End i_BindDataVisToData

    _setDataVisChildren(){
        this._dataVis.forEach(e => {
            e.children = [];
            if (e.indexData < 0) return;
            this.model.data.children.data[this._vOrder[e.indexData]].edge.values.slice(0,4).forEach((d,i) => {
                e.children.push({'typeIndex': i, 'value': d, 'typeName': this.model.data.edges.valueTitle[i]})
            })
        })

        this._itemTypes = this._dataVis.map(d => d.children).flat()
        this._itemTypes = this._itemTypes.filter( (d,i) => this._itemTypes.findIndex(e => e.typeIndex === d.typeIndex && e.typeName === d.typeName) === i)
        
    }

    @Method()
    async addIrisChart(idDiv, divTag) {

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

        this.model.widthChart = this.model.box.width - this.model.margin.left - this.model.margin.right;
        this.model.heightChart = this.model.box.height - this.model.margin.top - this.model.margin.bottom;

        // ---------------- Initialization Actions
        let _svg = divTag.append("svg"),  // Create dimensionless svg
            _grpChart = _svg.append("g");                       // Does not exist in the original Iris
        // Add zoom event
        let _zoomListener = zoom().on("zoom", _chartZoom);
        _zoomListener.scaleExtent([0.9, 1.1]);
        _svg.call(_zoomListener);

        let _helpContainer = divTag.append("div")
            .attr("class", "helpContainer")
            .on("mouseover", this._openToolTip.bind(this))
            .on("mouseout", this._closeToolTip.bind(this));

        _helpContainer.append("i")
            .attr("class", "fas fa-palette")
            .style("font-size", "20px");

        this._helpTooltip = divTag.append("div")
            .attr("class", "helpTooltip")
            .style("display", "none");

        this._helpTooltip.append("svg")
            .attr("class", "HC-legend")
            .attr("y", 1)
            .attr("dy", ".71em")

        this._grpIris = _grpChart.append("g").attr("class", "IrisChart");
        this._grpIris.append("circle").attr("class", "IC-centroidBack");
        this._grpIris.append("text")
            .text("")
            .classed("IC-centroidTitle", true);    // Includes title attribute of centroid

        this._grpIris.append("text")
            .text("")
            .classed("IC-authorsMissing", true);

        // ------      Inclusion of the arc (sector) that represents the background of the focus
        this._grpIris.append("path").attr("class", "IC-focus");

        //===================================================
        // this.model.when(["box", "margin"], (box, margin) => {
        //     this.model.widthChart = box.width - margin.left - margin.right;
        //     this.model.heightChart = box.height - margin.top - margin.bottom;
        // });

        this.model.when("box", (box) => {
            _svg.attr("width", box.width).attr("height", box.height);
            select(this.element).attr("height", box.height).attr("width", box.width)
        });

        //---------------------
        this.model.when("margin", function (margin) {
            _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        });

        //---------------------
        this.model.when(["pInnerRadius"], (pInnerRadius) => {
            this._innerRadius = Math.floor(this.model.widthChart * pInnerRadius);
            this._grpIris.select("circle.IC-centroidBack").attr("r", this._innerRadius);
        });

        //---------------------
        this.model.when(["widthChart", "heightChart"], (widthChart, heightChart) => {
            this.updateTextSize();

        });

        this.model.when(["widthChart", "pOuterRadius"], (widthChart, pOuterRadius) => {
            this._outerRadius = Math.floor(widthChart * pOuterRadius);

        });

        //---------------------
        this.model.when(["data", "indexAttBar", "pMaxHeightBar"], (data, indexAttBar, pMaxHeightBar) => {
           
            let maxValue = max(data.children.data, d => sum(d.edge.values.filter( (e,i) => i < this._nbOfTypesDoc)))
            this._maxHeightBar = Math.floor(this.model.widthChart * pMaxHeightBar);

            // console.log('SCALE ', maxValue,  this._maxHeightBar);
            this.model.barScale = scaleLinear().domain([0, maxValue]).range([0, this._maxHeightBar]);
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
        this.model.when(["data", "barScale", "pInnerRadius", "pOuterRadius", "redraw"],
            async (data) => {
                this._xIrisCenter = Math.floor(this.model.widthChart / 2) - Math.floor(this.model.widthChart * this._pDesloc);  // To move center to left
                this._yIrisCenter = Math.floor(this.model.heightChart / 2);

                this._grpIris.attr("transform", "translate(" + this._xIrisCenter + "," + this._yIrisCenter + ")");
                
                await this._calcGeometry();

                this._grpIris.select(".IC-focus")
                    .attr("d", arc().innerRadius(this._innerRadius)
                        .outerRadius(this._outerRadius)          // Change to avoid adding
                        .startAngle(- await this._degreeToRadian(this._focusArea.angleSector / 2) + Math.PI / 2)
                        .endAngle(await this._degreeToRadian(this._focusArea.angleSector / 2) + Math.PI / 2));

                let subName = (data.root.data.labels[this._cfgIndexAttr.titleCentroid]).split(',');
                
                this._grpIris.select("text.IC-centroidTitle")
                    .text(await this._adjustLengthText(subName[0], 13))
                    .style("font-size", (this._dataVis[this._focusArea.indexCenter].widthText * 0.60) + "px")
                    .append("title")
                    .text(data.root.data.labels[1]);

                await this.putBarsOnIris();
                let nbBarsMissing = 0; //to display the number of coauthors not shown
                if (this._numMaxBars < this._numTotalBars) {
                    nbBarsMissing = this._numTotalBars - this._numMaxBars;
                }
                this._grpIris.select("text.IC-authorsMissing")
                    .attr("x", (-2.8 * this._innerRadius))
                    .attr("y", 0)
                    .text((nbBarsMissing > 0 ? nbBarsMissing + " coauthors hidden" : "")) //only display text if there are coauthors not shown
                    .style("font-family", "Arial")
                    .style("font-size", "8px");

                this._setLegend()

            } // End
        );

        /**
         * Zoom event
         */
        function _chartZoom(event) {
            _zoomListener.scaleExtent([0.5, 10]);
            _grpChart.attr("transform", event.transform)
        }
  }

    _setLegend() {

        let legendSvg = this._helpTooltip.select("svg")

        let legendGrp = legendSvg.selectAll('g')
            .data(this._itemTypes)
            .enter()
                .append('g')

        legendGrp.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => this._colorsBars(d.typeIndex))
            .attr("transform", (_,i) => "translate(10," + `${20 * i + 10}` + ")");

        legendGrp.append("text")
            .attr("transform", (_,i) => "translate(30," + `${20 * i + 10}` + ")")
            .attr("y", "10")
            .text(d => d.typeName || "No description provided")
    }

    _openToolTip(){
        this._helpTooltip.style("display", "block");
    }

    _closeToolTip(){
        this._helpTooltip.style("display", "none");

    }

  buildChart(idDiv, svg){ 
    this.addIrisChart(idDiv, svg);
  }


  componentDidLoad(){
    let svg = select(this.element.querySelectorAll(".iris")[0])
        .attr("width", this.width)
        .attr("height", this.height);
    this.buildChart("iris", svg);
  }

  render() {
    return  (
       
      <Host>
        <div class="iris"/>
      </Host>
    )
  }
}