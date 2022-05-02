var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Element, Host, Prop, h, Method } from '@stencil/core';
import NumericGlyph from './numericGlyph';
import state from "../../../store";
import { drag } from 'd3-drag';
import { clusterMatrixGlyph, normalMatrixGlyph, sort } from './process-data';
import { matrixCell } from './tooltips';
import Model from 'model-js';
import { zoom, range, schemeCategory10 } from 'd3';
import { select } from 'd3-selection';
import { scaleLinear, scaleOrdinal, scaleBand } from 'd3-scale';
let MgeGlyphMatrix = class MgeGlyphMatrix {
    constructor() {
        /** represents the width of the matrix chart*/
        this.width = 350;
        /** represents the height of the matrix chart*/
        this.height = 350;
        /** The dataset name being used */
        this.datasetName = "[]";
        this._glyphStar = NumericGlyph(state.GLYPH_STAR);
        /** Group represents the entire chart*/
        this._matrixGlyphPanel = null; // Group represents the entire chart
        /** keeps data on the different types of documents (attributes)*/
        this._cellGlyph = NumericGlyph(0); // objeto que representa o glifo associado a celula
        /** keeps data on the different types of documents (attributes)*/
        this._grpMatrixGlyph = null; // Grupo que representa todo o grafico
        /** The group represents the matrix overview*/
        this._grpOverview = null; // The group represents the matrix overview    
        /** Select with left side legend bar*/
        this._grpLeftLegend = null;
        /** Select with top side legend bar*/
        this._grpTopLegend = null;
        /** Select with matrix chart*/
        this._grpMatrix = null;
        this._grpDragLL = null;
        this._grpDragTL = null;
        this._grpDragMT = null;
        /** Select with all groups from left side legend bar*/
        this._grpBarsLL = null; // Select with all groups from left side legend bar
        /** Select with all groups from top side legend bar*/
        this._grpBarsTL = null;
        /** Contains lines with cells in each line*/
        this._grpLines = null; // Contains lines with cells in each line
        this._legend = {
            margin: 1,
            marginText: 1,
            width: 0,
            totalWidth: 0,
            fontHeight: 0,
            coordMin: 0 // Coordenada minima. Limitador do deslocamento da legenda para cima. Igual para x e y
        };
        this._overview = {
            rectBk: null,
            rectCur: null // Cursor
        };
        this._cell = {
            height: 0,
            heightMin: 10 // Usada para definir qtVisibleLinesMax (inclui a margem de 1px)
        };
        this._cellColorScaleDefault = scaleOrdinal(schemeCategory10);
        this._fCellColorMapDefault = (d) => {
            return this._cellColorMap.colorScale(d);
        };
        this._cellColorMap = {
            colorScale: this._cellColorScaleDefault,
            indexAttrColor: 0,
            fMap: this._fCellColorMapDefault
        };
        this._colors = {
            legendBk: "#F0D1B2",
            legendTxt: "black",
            overviewBk: "#F0D1B2",
            overviewCur: "#E6B280"
        };
        this._lines = {
            qtVisible: 0,
            qtMaxVisible: 0,
            qtMinVisible: 0,
            qtTotal: 0 // Quantidade total de linhas da matriz (calculado)
        };
        this._tooltips = {
            divTT: null,
            matrixCell: null,
            xCell: -1,
            yCell: -1 // Coluna da c�lula onde est� o tooltip. -1 Se n�o est� ativo      
        };
        /** Matrix area width (calculated)*/
        this._matrixWidth = 0; // Matrix area width (calculated)
        /** Matrix area height (calculated)*/
        this._matrixHeight = 0; // Matrix area height (calculated)
        /** Attribute index used for sorting */
        this._indexAttrSort = 0; // Attribute index used for sorting (first (0 labels [] first 1000 values [])
        /** The index of the attribute will be printed in the legend (node)*/
        this._indexAttrLegend = 0; // The index of the attribute will be printed in the legend (node)
        /** Indirect ordering vector*/
        this._vOrder = null; // Indirect ordering vector
        /** Scale is used to determine the coordinates of cells and legend elements*/
        this._cellCoordScale = scaleBand(); // Scale is used to determine the coordinates of cells and legend elements
        /** Scale is used to set the coordinates of the overview cursor*/
        this._overviewScale = scaleLinear(); // Scale is used to set the coordinates of the overview cursor
        /** Listener of legends*/
        this._dragListenerL = null; // Listener of legends
        /** Listener of Matrix*/
        this._dragListenerM = null; // Listener of Matrix
        this.model = Model();
        this._glyphStar.indexMapAttr([state.ATE_QtPublicacoes - 1000, state.ATE_QtProceedings - 1000, state.ATE_QtBooks - 1000, state.ATE_QtJournals - 1000]);   
        this._idClipLeft = this.element.id + "l"; // Id da �rea de recorte da legenda esquerda
        this._idClipTop = this.element.id + "t"; // Id da �rea de recorte da legenda do topo
        this._idClipMatrix = this.element.id + "m"; // Id da �rea de recorte da matriz
    }
    /**
     * The initial function to create all of elements in the Matrix Glyph chart
     * In this function, it will set Geometric attributes of the graph
     * create actions on graph and manage all of the interaction on the graph
     * */
    async addMatrixGlyph(idDiv, divTag) {
        this.model.margin = { top: 2, right: 2, bottom: 2, left: 2 };
        this.model.box = { width: this.width, height: this.height };
        this.model.pLegendWidth = 0.15; // Percentual da largura em rela��o ao this.model.widthChart
        this.model.pFontHeight = 0.0225; // Percentual da altura da fonte em rela�� ao this.model.widthChart
        this.model.redraw = 0; // Quando alterado executa um redesenho  
        // ---------------- Acoes de inicializacao
        var _svg = divTag.append("svg"), // Cria o svg sem dimensoes  
        _grpChart = _svg.append("g"); // Grupo que representa a �rea para o gr�fico,    
        this._sort = sort(); // Cria fun��o de ordena��o
        // Add zoom event
        let _zoomListener = zoom().on("zoom", _chartZoom);
        _zoomListener.scaleExtent([0.5, 10]);
        _svg.call(_zoomListener);
        // .on("mousemove.zoom", _chartZoomMove)
        // .on("mousedown.zoom", _chartZoomMove)
        // .on("touchstart.zoom", _chartZoomMove)
        // .on("touchend.zoom", null);
        this._tooltips.divTT = divTag.append("div")
            .style("display", "none")
            .classed("MG-Tooltip", true), // Tooltip para o nodo normal  
            this._dragListenerL = drag()
                .on("drag", this._chartDragLegend.bind(this))
                .on("end", this._chartDragendLegend.bind(this));
        this._dragListenerM = drag()
            .on("drag", this._chartDragMatrix.bind(this))
            .on("end", this._chartDragendMatrix.bind(this));
        // ==========  <CLIPPATH>    
        _grpChart.append("clipPath").attr("id", this._idClipTop).append("rect"); // ----- clipPath da legenda do topo                             
        _grpChart.append("clipPath").attr("id", this._idClipLeft).append("rect"); // ----- clipPath da legenda esquerda
        _grpChart.append("clipPath").attr("id", this._idClipMatrix).append("rect"); // ----- clipPath da matrix                               
        this._grpMatrixGlyph = _grpChart.append("g").attr("class", "MatrixGlyphChart");
        this._grpOverview = this._grpMatrixGlyph.append("g").attr("class", "MG-Overview");
        this._overview.rectBk = this._grpOverview.append("rect").style("fill", this._colors.overviewBk);
        this._overview.rectCur = this._grpOverview.append("rect").style("fill", this._colors.overviewCur);
        this._grpTopLegend = this._grpMatrixGlyph.append("g") // Grupo da legenda superior
            .attr("class", "MG-TopLegend")
            .attr("clip-path", "url(#" + this._idClipTop + ")");
        this._grpDragTL = this._grpTopLegend.selectAll("g")
            .data([{ x: 0, y: 0, cellsInv: 0, t: 0 }])
            .enter()
            .append("g").call(this._dragListenerL);
        this._grpLeftLegend = this._grpMatrixGlyph.append("g") // Grupo da legenda esquerda
            .attr("class", "MG-LeftLegend")
            .attr("clip-path", "url(#" + this._idClipLeft + ")");
        this._grpDragLL = this._grpLeftLegend.selectAll("g")
            .data([{ x: 0, y: 0, cellsInv: 0, t: 1 }])
            .enter()
            .append("g").call(this._dragListenerL);
        this._grpMatrix = this._grpMatrixGlyph.append("g") // Grupo da matriz
            .attr("class", "MG-Matrix")
            .attr("clip-path", "url(#" + this._idClipMatrix + ")");
        this._grpDragMT = this._grpMatrix.selectAll("g")
            .data([{ x: 0, y: 0, cellsInvX: 0, cellsInvY: 0 }])
            .enter()
            .append("g").call(this._dragListenerM);
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
            this.model.widthChart = box.width - margin.left - margin.right,
                this.model.heightChart = box.height - margin.top - margin.bottom;
        });
        //---------------------
        this.model.when(["widthChart", "pLegendWidth"], (widthChart, pLegendWidth) => {
            this._legend.width = Math.round(this.model.widthChart * pLegendWidth);
            this._legend.totalWidth = this._legend.margin + this._legend.width;
            this._overviewScale.range([0, this._legend.totalWidth - 1]);
            this._matrixWidth = this.model.widthChart - this._legend.totalWidth;
            this._matrixHeight = this.model.heightChart - this._legend.totalWidth;
            this._calcVisibleLines();
            _grpChart.select("#" + this._idClipMatrix + " rect")
                .attr("width", this._matrixWidth)
                .attr("height", this._matrixHeight);
            _grpChart.select("#" + this._idClipLeft + " rect")
                .attr("width", this._legend.totalWidth)
                .attr("height", this._matrixHeight);
            _grpChart.select("#" + this._idClipTop + " rect")
                .attr("width", this._legend.totalWidth)
                .attr("height", this._matrixWidth);
            // this.model.redraw += 1;    // Para for�ar o redesenho      
        });
        //---------------------
        this.model.when(["widthChart", "pFontHeight"], (widthChart, pFontHeight) => {
            this._legend.fontHeight = widthChart * pFontHeight;
            // this.model.redraw += 1;    // Para for�ar o redesenho      
        });
        //--------------------- 
        this.model.when(["data", "redraw"], async (data, widthChart, heightChart, redraw) => {
            // this._matrixGlyphPanel.update();  // Atualiza informa��es no painel associado a t�cnica   
            this._cellCoordScale.range([0, this._matrixWidth * this._lines.qtTotal / this._lines.qtVisible])
                .domain(this._vOrder);
            this._cell.height = await this._calcHeightCell();
            this._legend.coordMin = this._matrixWidth - this._matrixWidth * this._lines.qtTotal / this._lines.qtVisible;
            this._overview.rectBk
                .attr("width", this._legend.totalWidth - 1)
                .attr("height", this._legend.totalWidth - 1);
            this._overview.rectCur
                .attr("x", this._overviewScale(-this._grpDragMT.datum().cellsInvX))
                .attr("y", this._overviewScale(-this._grpDragMT.datum().cellsInvY))
                .attr("width", this._overviewScale(this._lines.qtVisible))
                .attr("height", this._overviewScale(this._lines.qtVisible));
            this._grpLeftLegend.attr("transform", "translate(0," + this._legend.totalWidth + ")");
            this._grpDragLL.attr("transform", (d) => {
                d.y = d.cellsInv * this._cellCoordScale.bandwidth();
                return "translate(0," + d.y + ")";
            });
            this._grpTopLegend.attr("transform", "translate(" + this._legend.totalWidth + "," + this._legend.width + ") rotate(-90)");
            this._grpDragTL.attr("transform", (d) => {
                d.y = d.cellsInv * this._cellCoordScale.bandwidth();
                return "translate(0," + d.y + ")";
            });
            this._grpMatrix.attr("transform", "translate(" + this._legend.totalWidth + "," + this._legend.totalWidth + ")");
            this._grpDragMT.attr("transform", (d) => {
                d.x = d.cellsInvX * this._cellCoordScale.bandwidth();
                d.y = d.cellsInvY * this._cellCoordScale.bandwidth();
                return "translate(" + d.x + "," + d.y + ")";
            });
            this._appendLeftLegend(data);
            this._appendTopLegend(data);
            this._appendMatrix(data);
            this._matrixGlyphPanel.updateGlyphMatrixPanel();
        });
        /**
         * Zoom event
         */
        function _chartZoom(event) {
            _zoomListener.scaleExtent([0.5, 10]);
            if (event.sourceEvent.type === "mousemove") {
            }
            else {
                _grpChart.attr("transform", event.transform);
            }
        }
        function _chartZoomMove(event) {
            _zoomListener.scaleExtent([0.5, 10]);
            _grpChart.attr("transform", event.transform);
        }
    }
    _appendLeftLegend(data) {
        if (this._grpBarsLL != null)
            this._grpBarsLL.remove();
        this._grpBarsLL = this._grpDragLL.selectAll("g")
            .data(data.nodes.dataNodes)
            .enter()
            .append("g")
            .attr("transform", (d, i) => { return "translate(0," + this._cellCoordScale(i) + ")"; });
        this._grpBarsLL.append("rect")
            .attr("class", "GM-node")
            .attr("width", this._legend.width)
            .attr("height", this._cell.height)
            .style("fill", this._colors.legendBk);
        this._grpBarsLL.append("text")
            .attr("class", "GM-node")
            .attr("x", this._legend.marginText) // -3 margem do texto em rela��o ao ret�ngulo onde ele est� inserido            
            .attr("y", this._cellCoordScale.bandwidth() / 2) // Foi usado para centralizar o texto na linha da matriz
            .attr("dy", ".2em")
            .attr("text-anchor", "start")
            .style("font", this._legend.fontHeight + "px sans-serif")
            .style("fill", this._colors.legendTxt)
            .text((d, i) => { return this._adjustLengthText(d.labels[1], 12); })
            .append("title")
            .text(d => d.labels[1]);
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
    //---------------------    
    _appendTopLegend(data) {
        if (this._grpBarsTL != null)
            this._grpBarsTL.remove();
        this._grpBarsTL = this._grpDragTL.selectAll("g")
            .data(data.nodes.dataNodes)
            .enter()
            .append("g")
            .attr("transform", (d, i) => { return "translate(0," + this._cellCoordScale(i) + ")"; });
        this._grpBarsTL.append("rect")
            .attr("class", "GM-node")
            .attr("width", this._legend.width)
            .attr("height", this._cell.height)
            .style("fill", this._colors.legendBk);
        this._grpBarsTL.append("text")
            .attr("class", "GM-node")
            .attr("x", this._legend.marginText) // -3 margem do texto em rela��o ao ret�ngulo onde ele est� inserido            
            .attr("y", this._cellCoordScale.bandwidth() / 2) // Foi usado para centralizar o texto na linha da matriz
            .attr("dy", ".2em")
            .attr("text-anchor", "start")
            .style("font", this._legend.fontHeight + "px sans-serif")
            .style("fill", this._colors.legendTxt)
            .text((d, i) => { return this._adjustLengthText(d.labels[1], 12); })
            .append("title")
            .text(d => d.labels[1]);
    }
    //---------------------    
    _appendMatrix(data) {
        var globalThis = this;
        if (this._grpLines != null)
            this._grpLines.remove();
        this._cellGlyph.calcScale(this._cellCoordScale.bandwidth());
        this._grpLines = this._grpDragMT.selectAll("g")
            .data(data.matrix)
            .enter()
            .append("g")
            .attr("class", "MG-Line")
            .attr("transform", (d, i) => { return "translate(0," + this._cellCoordScale(i) + ")"; })
            .each(async function (d, i) {
            await drawCells(d, this, globalThis); // Desenha cada c�lula da matriz
        });
        async function drawCells(d, elemThis, globalThis) {
            var cells = select(elemThis).selectAll(".MG-Cell")
                .data(d.filter(function (d) { return d.exist; })) // Seleciona as c�lulas que possuem dados
                .enter()
                .append("g")
                .attr("class", "MG-Cell")
                .attr("transform", (d, i) => { return "translate(" + globalThis._cellCoordScale(d.x) + ",0)"; }) // Inclui grupos de cada c�lula da linha
                .on("mouseenter", globalThis._onMouseEnterNode.bind(globalThis))
                .on("mouseleave", globalThis._onMouseLeaveNode.bind(globalThis));
            cells.append("rect")
                .attr("width", await globalThis._calcHeightCell())
                .attr("height", await globalThis._calcHeightCell())
                .style("fill", function (d) {
                if (globalThis._cellColorMap.indexAttrColor >= 1000) {
                    return globalThis._cellColorMap.fMap(d.values[globalThis._cellColorMap.indexAttrColor - 1000]);
                }
                else
                    return globalThis._cellColorMap.fMap(d.labels[globalThis._cellColorMap.indexAttrColor]);
            });
            globalThis._cellGlyph.draw(cells);
        }
    }
    /**
     * _onMouseOverNode
     */
    async _onMouseEnterNode(event, d) {
        if (this._tooltips.matrixCell != null)
            this._tooltips.matrixCell.create(this._tooltips.divTT, d, event);
    }
    /**
     * _onMouseOutNode
     */
    async _onMouseLeaveNode(event, d) {
        if (this._tooltips.matrixCell != null)
            this._tooltips.matrixCell.remove();
    }
    /**
     * _calcVisibleLines
     *
     * Determines limits for visible lines
     */
    async _calcVisibleLines() {
        this._lines.qtMaxVisible = Math.floor(this._matrixHeight / this._cell.heightMin);
        if (this._lines.qtMaxVisible > 3)
            this._lines.qtMinVisible = 3;
        else
            this._lines.qtMinVisible = 1;
        if (this._lines.qtMaxVisible > this._lines.qtTotal)
            this._lines.qtMaxVisible = this._lines.qtTotal;
        if (this._lines.qtMaxVisible < this._lines.qtVisible && this._lines.qtMaxVisible != 0)
            this._lines.qtVisible = this._lines.qtMaxVisible;
    }
    ;
    /**
     * _calcHeightCell
     *
     * Calculate cell height/width. So is the comment bar
     */
    async _calcHeightCell() {
        var h = this._cellCoordScale.bandwidth();
        if (h > 2)
            h -= 1; // Ajusta para margem de 1 px entre c�lulas
        return h;
    }
    ;
    /**
     * _limCoord
     *
     * Limit the coordinate value
     */
    async _limCoord(coord) {
        if (coord < this._legend.coordMin)
            return this._legend.coordMin;
        else if (coord > 0)
            return 0;
        else
            return coord;
    }
    ;
    async _chartDragLegend(event, d) {
        var temp;
        d.y += event.dy;
        d.y = await this._limCoord(d.y);
        select(this).attr("transform", "translate(0," + d.y + ")");
        temp = this._grpDragMT.datum();
        if (d.t == 0) {
            temp.x = d.y;
            this._overview.rectCur.attr("x", this._overviewScale(-Math.round(d.y / this._cellCoordScale.bandwidth())));
        }
        else {
            temp.y = d.y;
            this._overview.rectCur.attr("y", this._overviewScale(-Math.round(d.y / this._cellCoordScale.bandwidth())));
        }
        this._grpDragMT.attr("transform", "translate(" + temp.x + "," + temp.y + ")");
    }
    _chartDragendLegend(event, d) {
        var temp;
        d.cellsInv = Math.round(d.y / this._cellCoordScale.bandwidth());
        d.y = d.cellsInv * this._cellCoordScale.bandwidth();
        select(this).attr("transform", "translate(0," + d.y + ")");
        temp = this._grpDragMT.datum();
        if (d.t == 0) {
            temp.x = d.y;
            temp.cellsInvX = d.cellsInv;
        }
        else {
            temp.y = d.y;
            temp.cellsInvY = d.cellsInv;
        }
        this._grpDragMT.attr("transform", "translate(" + temp.x + "," + temp.y + ")");
    }
    async _chartDragMatrix(event, d) {
        var tempL, tempT;
        d.x += event.dx;
        d.x = await this._limCoord(d.x);
        d.y += event.dy;
        d.y = await this._limCoord(d.y);
        this._grpDragMT.attr("transform", "translate(" + d.x + "," + d.y + ")");
        this._grpDragLL.datum().y = d.y;
        this._grpDragTL.datum().y = d.x;
        this._overview.rectCur
            .attr("x", this._overviewScale(-Math.round(d.x / this._cellCoordScale.bandwidth())))
            .attr("y", this._overviewScale(-Math.round(d.y / this._cellCoordScale.bandwidth())));
        this._grpDragLL.attr("transform", "translate(0," + d.y + ")");
        this._grpDragTL.attr("transform", "translate(0," + d.x + ")");
    }
    _chartDragendMatrix(event, d) {
        var temp;
        d.cellsInvX = Math.round(d.x / this._cellCoordScale.bandwidth());
        d.cellsInvY = Math.round(d.y / this._cellCoordScale.bandwidth());
        d.x = d.cellsInvX * this._cellCoordScale.bandwidth();
        d.y = d.cellsInvY * this._cellCoordScale.bandwidth();
        this._grpDragMT.attr("transform", "translate(" + d.x + "," + d.y + ")");
        this._grpDragLL.attr("transform", "translate(0," + d.y + ")");
        this._grpDragTL.attr("transform", "translate(0," + d.x + ")");
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
    //---------------------
    /** This function is required in all techniques
      * It is called internally in conectChart
      */
    async setPanel(_) {
        if (!arguments.length)
            return this._matrixGlyphPanel;
        this._matrixGlyphPanel = _;
    }
    //---------------------
    /** This function is to set the data to the chart
      * If no arguments, It will return the value of data
      */
    async setData(_, globalData) {
        var qtLabel = 0, qtValue = 0;
        if (!arguments.length)
            return this.model.data;
        if (_.cluster) {
            _ = clusterMatrixGlyph(_, globalData);
        }
        else {
            _ = normalMatrixGlyph(_, globalData);
        }
        this.model.data = _;
        if (this.model.data.nodes.labelTitle != null)
            qtLabel = this.model.data.nodes.labelTitle.length;
        if (this.model.data.nodes.valueTitle != null)
            qtValue = this.model.data.nodes.valueTitle.length;
        this._sort.inic(qtLabel, qtValue).data(this.model.data.nodes.dataNodes);
        this._sort.exec(this._indexAttrSort);
        this._vOrder = this._sort.getVetOrder();
        this._lines.qtTotal = this.model.data.nodes.dataNodes.length;
        this._lines.qtVisible = this.model.data.nodes.dataNodes.length;
        this._overviewScale.domain([0, this._lines.qtTotal]);
        await this._calcVisibleLines();
        this._grpDragTL.datum({ x: 0, y: 0, cellsInv: 0, t: 0 });
        this._grpDragLL.datum({ x: 0, y: 0, cellsInv: 0, t: 1 });
        this._grpDragMT.datum({ x: 0, y: 0, cellsInvX: 0, cellsInvY: 0 });
        this._cellGlyph.data(_);
        // if (this._matrixGlyphPanel != null)
        //   this._matrixGlyphPanel.updateSelect();
        this.setTTMatrixCell(matrixCell(this.model.data, this._glyphStar, state.ATN_AuthorName));
    }
    //---------------------   
    async indexAttrSort(_) {
        if (!arguments.length)
            return this._indexAttrSort;
        this._indexAttrSort = _;
    }
    //---------------------   
    async indexAttrLegend(_) {
        if (!arguments.length)
            return this._indexAttrLegend;
        this._indexAttrLegend = _;
    }
    //---------------------   
    async indexAttrCellColor(_) {
        if (!arguments.length)
            return this._cellColorMap.indexAttrColor;
        this._cellColorMap.indexAttrColor = _;
    }
    //---------------------   
    async pLegendWidth(_) {
        if (!arguments.length)
            return this.model.pLegendWidth;
        this.model.pLegendWidth = _;
    }
    //---------------------   
    async cellColorsMap(colors) {
        if (!arguments.length) {
            this._cellColorMap.colorScale = this._cellColorScaleDefault;
            this._cellColorMap.fMap = this._fCellColorMapDefault;
        }
        else if (typeof colors === "function")
            this._cellColorMap.fMap = colors;
        else {
            this._cellColorMap.colorScale = scaleOrdinal().domain(range(colors.length)).range(colors);
        }
    }
    //---------------------   
    async setTTMatrixCell(_) {
        this._tooltips.matrixCell = _;
    }
    //---------------------   
    async getMaxVisibleLines() {
        return this._lines.qtMaxVisible;
    }
    //---------------------   
    async getMinVisibleLines() {
        return this._lines.qtMinVisible;
    }
    //---------------------   
    async getVisibleLines() {
        return this._lines.qtVisible;
    }
    async debug() {
        console.log(">>>>>DEBUG");
        console.log(this._lines);
        console.log(this._matrixHeight);
        console.log(this._legend);
        console.log(this.model.heightChart);
    }
    //---------------------   
    async pFontHeight(_) {
        if (!arguments.length)
            return this.model.pFontHeight;
        this.model.pFontHeight = _;
    }
    //---------------------   
    async glyph(_) {
        if (!arguments.length)
            return this._cellGlyph;
        this._cellGlyph = _;
    }
    /*
        //---------------------
      chart.setGlyph = function(idGlyph) {
        _cellGlyph = NumericGlyph(idGlyph);
        return chart;
      }
    
      
        //---------------------
      chart.glyphIndexMapAttr = function(vet) {
        _cellGlyph.indexMapAttr(vet);
        return chart;
      }
    */
    //======== Fun�oes de a��es   
    async acSortExec(_) {
        this._indexAttrSort = _;
        this._sort.exec(this._indexAttrSort);
        this._vOrder = this._sort.getVetOrder();
        this._cellCoordScale.domain(this._vOrder);
        this._grpBarsLL.transition().duration(800)
            .attr("transform", (d, i) => { return "translate(0," + this._cellCoordScale(i) + ")"; });
        this._grpBarsTL.transition().duration(800)
            .attr("transform", (d, i) => { return "translate(0," + this._cellCoordScale(i) + ")"; });
        this._grpLines.transition().duration(800)
            .attr("transform", (d, i) => { return "translate(0," + this._cellCoordScale(i) + ")"; })
            .selectAll(".MG-Cell")
            .attr("transform", (d, i) => { return "translate(" + this._cellCoordScale(d.x) + ",0)"; });
    }
    //---------------------     
    async acChangeAttrLegend(_) {
        this._indexAttrLegend = _;
        this._grpBarsLL.selectAll("text")
            .text((d, i) => { return d.labels[this._indexAttrLegend]; });
        this._grpBarsTL
            .selectAll("text")
            .text((d, i) => { return d.labels[this._indexAttrLegend]; });
    }
    //---------------------   
    async acChangeVisibleLines(qtLines) {
        var tempTL = this._grpDragTL.datum(), tempLL = this._grpDragLL.datum(), tempMT = this._grpDragMT.datum(), dLines = qtLines - this._lines.qtVisible;
        let calcCellsInv = (dLines, cellsInv) => {
            if (dLines > this._lines.qtTotal - this._lines.qtVisible + cellsInv)
                return (qtLines - this._lines.qtTotal); // cellsInv possui valor negativo  
            return cellsInv;
        };
        tempTL.cellsInv = calcCellsInv(dLines, tempTL.cellsInv);
        tempLL.cellsInv = calcCellsInv(dLines, tempLL.cellsInv);
        tempMT.cellsInvX = tempTL.cellsInv;
        tempMT.cellsInvY = tempLL.cellsInv;
        this._lines.qtVisible = qtLines;
        this.model.redraw += 1;
    }
    buildChart(idDiv, svg) {
        this.addMatrixGlyph(idDiv, svg);
        this.setBox(this.model.box);
        this.indexAttrSort(0); // Numeric attribute 0. Must be before date ()
        this.indexAttrLegend(0); //  Must be before date ()
        this.indexAttrCellColor(1001);
        this.glyph(this._glyphStar);
        this.cellColorsMap(["#99E6E6"]);
        // this.setData(this.chartData);
        // console.log(this._chart);
        // this._chart().data(this.chartData);
    }
    componentWillLoad() {
    }
    componentDidLoad() {
        let svg = select(this.element.querySelectorAll(".glyph-matrix")[0])
            .attr("width", this.width)
            .attr("height", this.height);
        // console.log(this.id)
        // this._nodeEdgeLegend.create(this.id)
        this.buildChart("glyph-matrix", svg);
    }
    render() {
        return (h(Host, null,
            h("div", { class: "glyph-matrix" })));
    }
};
__decorate([
    Element()
], MgeGlyphMatrix.prototype, "element", void 0);
__decorate([
    Prop()
], MgeGlyphMatrix.prototype, "width", void 0);
__decorate([
    Prop()
], MgeGlyphMatrix.prototype, "height", void 0);
__decorate([
    Prop()
], MgeGlyphMatrix.prototype, "datasetName", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_matrixGlyphPanel", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_cellGlyph", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_grpMatrixGlyph", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_grpOverview", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_grpLeftLegend", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_grpTopLegend", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_grpMatrix", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_grpBarsLL", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_grpBarsTL", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_grpLines", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_matrixWidth", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_matrixHeight", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_idClipLeft", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_idClipTop", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_idClipMatrix", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_indexAttrSort", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_indexAttrLegend", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_vOrder", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_cellCoordScale", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_overviewScale", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_dragListenerL", void 0);
__decorate([
    Prop({ mutable: true })
], MgeGlyphMatrix.prototype, "_dragListenerM", void 0);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "addMatrixGlyph", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "_onMouseEnterNode", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "_onMouseLeaveNode", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "_calcVisibleLines", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "_calcHeightCell", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "_limCoord", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "setBox", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "setPanel", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "setData", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "indexAttrSort", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "indexAttrLegend", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "indexAttrCellColor", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "pLegendWidth", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "cellColorsMap", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "setTTMatrixCell", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "getMaxVisibleLines", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "getMinVisibleLines", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "getVisibleLines", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "debug", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "pFontHeight", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "glyph", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "acSortExec", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "acChangeAttrLegend", null);
__decorate([
    Method()
], MgeGlyphMatrix.prototype, "acChangeVisibleLines", null);
MgeGlyphMatrix = __decorate([
    Component({
        tag: 'mge-glyph-matrix',
        styleUrl: 'mge-glyph-matrix.css',
        shadow: false,
    })
], MgeGlyphMatrix);
export { MgeGlyphMatrix };
