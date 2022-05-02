var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Element, Host, Prop, h, Method } from '@stencil/core';
import { select } from "d3-selection";
import autocomplete from 'autocompleter';
import state from "../../../store";
// import "jquery-ui/ui/widgets/slider";
let MgePanel = class MgePanel {
    constructor() {
        /** Represents the select input for order of Iris(`mge-iris`) setting panel and  histogram(mge-barchart) setting panel */
        this._selectOrder = null;
        /** Display the value of the attribute gravity (of `mge-nodelinks`)*/
        this._spanGravity = null; // Display the value of the attribute gravity
        /** Display positive value of charge attribute (of `mge-nodelinks`)*/
        this._spanCharge = null; // Display positive value of charge attribute
        /** Displays the value of the linkDistance attribute (of `mge-nodelinks`)*/
        this._spanLinkDistance = null; // Displays the value of the linkDistance attribute
        /** Text span to show number of nodes (of `mge-nodelinks`)*/
        this._spanNodes = null; // Quantity of nodes
        /** Text span to show number of edges (of `mge-nodelinks`)*/
        this._spanEdges = null; // Quantity of edges
        /** Slider to adjust Gravity (of `mge-nodelinks`)*/
        this._sliderGravity = null;
        /** Slider to adjust linkDistance (of `mge-nodelinks`)*/
        this._sliderCharge = null;
        /** Slider to adjust linkDistance (of `mge-nodelinks`) */
        this._sliderLinkDistance = null;
        /** Text search input (of `mge-nodelinks`)*/
        this._searchAutocomplete = null;
        this._selectLegend = null;
        this._spanVisibleLines = null; // number of visible rows/columns in the view
        this._divSlider = null;
        this._labelAttr = null;
        this._selectAttr = null;
        this._br1 = null;
        this._br2 = null;
        this._vAttrSizeSelecionaveis = [];
    }
    setChart(_) {
        this._chart = _;
    }
    //------------------------
    // IRIS and BARCHART
    _addItemsSelectOrderIrisBar() {
        let selOption;
        this._selectOrder = this.element.querySelector(".IC-selOrderBy");
        if (this._selectOrder !== null) {
            let _that = this;
            this._selectOrder[0].selectedIndex = 0;
            this._selectOrder.addEventListener('change', async function () {
                let valor = +this.value;
                if (valor === 0)
                    await _that._chart.acSortExecText();
                else
                    await _that._chart.acSortExecAttribute();
            });
        }
    }
    //-------------------------
    //GLYPH MATRIX
    //-------------------------
    async _addSelectLegend() {
        this._selectLegend = select(this.element.querySelector(".MG-selLegend"));
    }
    async updateSelectLegend() {
        var selOption, sizeLabelTitle, i;
        let _chartData = await this._chart.setData();
        if (_chartData != null) {
            selOption = this._selectLegend.selectAll("option");
            if (!selOption.empty())
                selOption.remove();
            // sizeLabelTitle = _matrixGlyphChart.data().nodes.labelTitle.length;
            // for (i = 0; i < sizeLabelTitle; i++)
            // _chartData.nodes.labelTitle.forEach((d,i) => this._selectLegend.append("option").attr("value", i).text(d).property("selected", async (d) => { return d === await this._chart.indexAttrLegend()}))
            _chartData.nodes.labelTitle.forEach((d, i) => this._selectLegend.append("option").attr("value", i).text(d));
            this._selectLegend.selectedIndex = await this._chart.indexAttrLegend();
            let globalThis = this;
            this._selectLegend.on("change", async function () {
                await globalThis._chart.acChangeAttrLegend(parseInt(this.value));
            });
        }
    }
    //-------------------------
    async _addSelectOrderMatrix() {
        this._selectOrder = select(this.element.querySelector(".MG-selOrder"));
        // this._selectOrder = select("#" + this._idPanel).append("select").attr("class", "MG-selOrder");   
    }
    async updateSelectOrderMatrix() {
        var selOption, sizeLabelTitle, i, sizeValueTitle;
        let _chartData = await this._chart.setData();
        if (_chartData != null) {
            selOption = select("#" + this._idPanel + " .MG-selOrder").selectAll("option");
            if (!selOption.empty())
                selOption.remove();
            sizeLabelTitle = _chartData.nodes.labelTitle.length;
            for (i = 0; i < sizeLabelTitle; i++)
                this._selectOrder.append("option").attr("value", i).text(_chartData.nodes.labelTitle[i]);
            sizeValueTitle = _chartData.nodes.valueTitle.length;
            for (i = 0; i < sizeValueTitle; i++)
                this._selectOrder.append("option").attr("value", i + 1000).text(_chartData.nodes.valueTitle[i]); // 100 come�a �ndice num�ricos    
            // S� funciona quando todos os atributos forem incluidos no <select>         
            // Seta o item selecionado
            if (this._chart.indexAttrSort() < 1000)
                this._selectOrder.selectedIndex = await this._chart.indexAttrSort();
            else
                this._selectOrder.selectedIndex = await this._chart.indexAttrSort() - 1000 + sizeLabelTitle;
            let globalThis = this;
            this._selectOrder.on("change", function () {
                globalThis._chart.acSortExec(this.value);
            });
        }
    }
    //-------------------------
    _addSliderLines() {
        this._spanVisibleLines = select(this.element.querySelector(".spanVisibleLines"));
        //     $(idDivPanel).append( $("<label/>").append("&nbsp;Visible lines:").append(_spanVisibleLines));
        this._spanVisibleLines.text(2);
        let globalThis = this;
        let _divSlider = select(this.element.querySelector(".visibleLinesSlider"))
            .attr("min", 1)
            .attr("max", 3)
            .attr("value", 2)
            .attr("step", 1)
            .on("input", function (event) {
            globalThis._spanVisibleLines.text(this.value);
        })
            .on("change", function (event, ui) {
            globalThis._chart.acChangeVisibleLines(this.value);
        });
    }
    async updateSliderMatrix() {
        let _divSlider = select(this.element.querySelector(".visibleLinesSlider"))
            .attr("min", await this._chart.getMinVisibleLines())
            .attr("max", await this._chart.getMaxVisibleLines())
            .attr("value", await this._chart.getVisibleLines());
        this._spanVisibleLines.text(await this._chart.getVisibleLines());
    }
    async updateGlyphMatrixPanel() {
        this.updateSelectLegend();
        this.updateSelectOrderMatrix();
        this.updateSliderMatrix();
    }
    //-------------------------
    // ClusterVis
    //-------------------------
    async _addSelectOrderCluster() {
        // this._selectOrder = select("#" + this._idPanel).append("select").attr("class", "CV-selOrder"); 
        this._selectOrder = select(this.element.querySelector(".CV-selOrder"));
    }
    async updateSelectCluster() {
        let selOption, sizeLabelTitle, i, sizeValueTitle, _chartData = await this._chart.setData();
        if (_chartData != null) {
            selOption = this._selectOrder.selectAll("option");
            if (!selOption.empty())
                selOption.remove();
            sizeLabelTitle = _chartData.nodes.labelTitle.length;
            for (i = 0; i < sizeLabelTitle; i++)
                this._selectOrder.append("option").attr("value", i).text(_chartData.nodes.labelTitle[i]);
            sizeValueTitle = _chartData.nodes.valueTitle.length;
            for (i = 0; i < sizeValueTitle; i++)
                this._selectOrder.append("option").attr("value", i + 1000).text(_chartData.nodes.valueTitle[i]); // 100 starts numerical index
            if (this._chart.indexAttrSort() < 1000)
                this._selectOrder.selectedIndex = await this._chart.indexAttrSort();
            else
                this._selectOrder.selectedIndex = await this._chart.indexAttrSort() - 1000 + sizeLabelTitle;
            let globalThis = this;
            this._selectOrder.on("change", function () {
                globalThis._chart.acSortExec(this.value);
            });
        }
    }
    async updateClusterVisPanel() {
        this.updateSelectCluster();
    }
    //------------------------- 
    // Nodelinks
    //-------------------------
    _addSliderGravity(idDivPanel) {
        this._spanGravity = select(this.element.querySelector(".spanGravitys"));
        let globalThis = this;
        this._sliderGravity = select(this.element.querySelector(".gravitySlider"))
            .attr("min", 0)
            .attr("max", 3)
            .attr("value", 2)
            .attr("step", 0.1)
            .on("input", function (event) {
            globalThis._spanGravity.text(this.value);
        })
            .on("change", function (event, ui) {
            globalThis._chart.acChangeGravity(this.value);
        });
    }
    //-------------------------
    _addSliderCharge(idDivPanel) {
        this._spanCharge = select(this.element.querySelector(".spanCharge"));
        let globalThis = this;
        this._sliderCharge = select(this.element.querySelector(".chargeSlider"))
            .attr("min", 50)
            .attr("max", 2000)
            .attr("value", 2)
            .attr("step", 50)
            .on("input", function (event) {
            globalThis._spanCharge.text(this.value);
        })
            .on("change", function (event) {
            globalThis._chart.acChangeCharge(this.value);
        });
    }
    //-------------------------
    _addSliderLinkDistance(idDivPanel) {
        this._spanLinkDistance = select(this.element.querySelector(".spanLinkDistance"));
        let globalThis = this;
        this._sliderLinkDistance = select(this.element.querySelector(".linkDistanceSlider"))
            .attr("min", 15)
            .attr("max", 300)
            .attr("value", 20)
            .attr("step", 5)
            .on("input", function (event, ui) {
            globalThis._spanLinkDistance.text(this.value);
        })
            .on("change", function (event, ui) {
            globalThis._chart.acChangeLinkDistance(this.value);
        });
    }
    //-------------------------
    async _addAutocomplete(idDivPanel) {
        this._searchAutocomplete = select(this.element.querySelector(".NE-Autocomplete")).attr("placeholder", "Search");
        this._searchAutocomplete.on("input", async (d) => {
            if (d.target.value === "") {
                await this._chart.resetHighSearch();
            }
        });
    }
    async updateNodePanel() {
        this.upStatistics();
        this.upSliderGravity();
        this.upSliderCharge();
        this.upSliderLinkDistance();
        this.atualizaAutocomplete();
    }
    //--------------      
    async upStatistics() {
        let a = await this._chart.getQtNodes();
        this._spanNodes.text(await this._chart.getQtNodes());
        this._spanEdges.text(await this._chart.getQtEdges());
    }
    //--------------  
    async upSliderGravity() {
        var minGravity, maxGravity, stepGravity, dif;
        let chartGravity = await this._chart.getGravity();
        if (await chartGravity < 0.1) {
            minGravity = Math.round(chartGravity * 50) / 100;
            maxGravity = Math.round(chartGravity * 150) / 100;
        }
        else {
            minGravity = Math.round(chartGravity * 5) / 10;
            maxGravity = Math.round(chartGravity * 15) / 10;
        }
        dif = maxGravity - minGravity;
        if (dif <= 0.1)
            stepGravity = 0.01;
        else if (dif <= 0.5)
            stepGravity = 0.05;
        else
            stepGravity = 0.1;
        this._sliderGravity.attr("min", minGravity)
            .attr("max", maxGravity)
            .attr("value", chartGravity)
            .attr("step", stepGravity);
        this._spanGravity.text(chartGravity);
    }
    //--------------      
    async upSliderCharge() {
        let chartCharge = await this._chart.getCharge();
        this._sliderCharge.attr("value", chartCharge);
        this._spanCharge.text(chartCharge);
    }
    //--------------      
    async upSliderLinkDistance() {
        let chartDistance = await this._chart.getLinkDistance();
        this._sliderLinkDistance.attr("value", chartDistance);
        this._spanLinkDistance.text(chartDistance);
    }
    async atualizaAutocomplete() {
        var nomes = [], i, c;
        let chartData = await this._chart.setData();
        if (chartData.isCluster) {
            for (i = 0; i < chartData.info.qtNodos; i++) {
                nomes[i] = { "label": chartData.nodes.dataNodes[i].labels[1] };
            }
            autocomplete({
                input: this._searchAutocomplete.node(),
                minLength: 1,
                fetch: function (text, update) {
                    text = text.toLowerCase();
                    // you can also use AJAX requests instead of preloaded data
                    var suggestions = nomes.filter(n => n.label.toLowerCase().startsWith(text));
                    update(suggestions);
                },
                onSelect: (item) => {
                    var i, j, nomeCluster = " ";
                    for (i = chartData.info.qtNodos; i < chartData.nodes.dataNodes.length; i++) {
                        for (j = 0; j < chartData.nodes.dataNodes[i].values.length; j++)
                            if (item.label == chartData.nodes.dataNodes[i].values[j].labels[1]) {
                                nomeCluster = chartData.nodes.dataNodes[i].key;
                                i = 1000;
                                break;
                            }
                    }
                    this._searchAutocomplete.node().value = item.label;
                    this._chart.acSelectByNameCluster(nomeCluster);
                }
            });
        }
        else {
            for (i = 0; i < chartData.info.qtNodos; i++) {
                nomes[i] = { "label": chartData.nodes.dataNodes[i].labels[1] };
            }
            autocomplete({
                input: this._searchAutocomplete.node(),
                minLength: 1,
                fetch: function (text, update) {
                    text = text.toLowerCase();
                    // you can also use AJAX requests instead of preloaded data
                    var suggestions = nomes.filter(n => n.label.toLowerCase().startsWith(text));
                    update(suggestions);
                },
                onSelect: (item) => {
                    this._searchAutocomplete.node().value = item.label;
                    this._chart.acSelectByName(item.label);
                }
            });
        }
    }
    createFilter() {
        switch (this.typeVis) {
            case state.typeChart.nodeLinks:
                this._spanNodes = select(this.element.querySelector(".spanNodes"));
                this._spanEdges = select(this.element.querySelector(".spanEdges"));
                //------------- Autocomplete
                this._addAutocomplete("#" + this._idPanel);
                //------------- Slider para altera��o do atributo gracity
                this._addSliderGravity("#" + this._idPanel);
                //------------- Slider para altera��o do atributo gracity
                this._addSliderCharge("#" + this._idPanel);
                //------------- Slider para altera��o do atributo gracity
                this._addSliderLinkDistance("#" + this._idPanel);
                break;
            case state.typeChart.histogram:
                this._addItemsSelectOrderIrisBar();
                break;
            case state.typeChart.iris:
                this._addItemsSelectOrderIrisBar();
                break;
            case state.typeChart.glyphMatrix:
                //------------- select for rows/columns text 
                this._addSelectLegend();
                //------------- select for rows/columns "sort by" 
                this._addSelectOrderMatrix();
                //------------- range slider for changing the number of visible rows/columns
                this._addSliderLines();
                break;
            case state.typeChart.cluster:
                //------------- select for rows/columns text 
                this._addSelectOrderCluster();
                break;
        }
    }
    componentDidLoad() {
        this.filterTemplate = document.querySelector("." + "filter-content-" + this.typeVis);
        this._filter = select(this.element.querySelector("#" + this.idView + "-f"))
            .style("overflow-y", "scroll")
            .style("background-color", "rgba(220, 220, 220, .8)")
            .style("padding", "5px");
        // .style("display", "none");
        if (this.filterTemplate !== null) {
            this._filter.node().appendChild(this.filterTemplate.content.cloneNode(true));
        }
        this._idPanel = this.idView + "-f";
        this.createFilter();
    }
    render() {
        return (h(Host, null,
            h("div", { id: this.idView + "-f", class: "filter-panel" })));
    }
};
__decorate([
    Element()
], MgePanel.prototype, "element", void 0);
__decorate([
    Prop()
], MgePanel.prototype, "typeVis", void 0);
__decorate([
    Prop()
], MgePanel.prototype, "idView", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_idPanel", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "filterTemplate", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_selectOrder", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_filter", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_chart", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_spanGravity", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_spanCharge", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_spanLinkDistance", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_spanNodes", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_spanEdges", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_sliderGravity", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_sliderCharge", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_sliderLinkDistance", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_searchAutocomplete", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_selectLegend", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_spanVisibleLines", void 0);
__decorate([
    Prop({ mutable: true })
], MgePanel.prototype, "_divSlider", void 0);
__decorate([
    Method()
], MgePanel.prototype, "setChart", null);
__decorate([
    Method()
], MgePanel.prototype, "updateGlyphMatrixPanel", null);
__decorate([
    Method()
], MgePanel.prototype, "updateClusterVisPanel", null);
__decorate([
    Method()
], MgePanel.prototype, "updateNodePanel", null);
MgePanel = __decorate([
    Component({
        tag: 'mge-panel',
        styleUrl: 'mge-panel.css',
        shadow: false,
    })
], MgePanel);
export { MgePanel };
