var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Element, Host, Prop, h, Method } from '@stencil/core';
import { select, selectAll } from 'd3-selection';
import state from "../../../store";
let MgeHeader = class MgeHeader {
    constructor() {
        this.width = 400;
        this.height = 400;
        // @Prop() data: any;
        this.data = [];
        this.loadData = () => {
            let value = this.element.shadowRoot.querySelector("#selectQuery").value;
            const selectedData = this.data.filter(d => d.label == value)[0].data;
            selectAll('mge-dashboard').remove();
            this.element.shadowRoot.querySelector('#lblMensagem').innerHTML = "Co-authorship Network of I3S Laboratory from 2007 to 2020 containing " +
                selectedData.info.qtNodos + ' nodes and ' + selectedData.info.qtArestas + ' edges';
            state._data = selectedData;
            select('#viewArea').append("mge-dashboard")
                // .attr("data", "databaseUFRGS2004")
                .attr("type-div", "mge-nodelink")
                .attr("id-template", "filter-content-iris")
                .attr("title", "Michel Riveill's 23  connections  papers")
                .attr("x", 0)
                .attr("y", 0);
        };
    }
    async setData(_) {
        this.data = _;
    }
    // buildChart(idDiv, svg){ 
    //   // console.log(this._chart);
    //   // this._chart().data(this.chartData);
    // }
    componentDidRender() {
        let selectQuery = select(this.element.shadowRoot.querySelector("#selectQuery"))
            .attr("width", this.width)
            .attr("height", this.height);
        selectQuery.selectAll('option')
            .data(this.data)
            .enter()
            .append('option')
            .attr('value', d => d.label)
            .text(d => d.label);
        selectAll("input[id*='type']")
            .on('change', function () {
            const _this = this;
            selectAll(this.element.shadowRoot.querySelector("input[id*='type']"))
                .property('checked', function () { return this == _this ? true : false; });
        });
    }
    render() {
        return (h(Host, null,
            h("div", { id: "toolBar" },
                h("form", { id: "query" },
                    h("label", { id: "titulo" }, "MGExplorer"),
                    h("label", null, "Choose a dataset:"),
                    h("select", { id: "selectQuery" }),
                    h("i", { class: "fas fa-arrow-circle-right ", onClick: this.loadData }),
                    "or load your own",
                    h("span", null,
                        h("i", { class: "fas fa-upload" })))),
            h("label", { id: "lblMensagem" })));
    }
};
__decorate([
    Element()
], MgeHeader.prototype, "element", void 0);
__decorate([
    Prop()
], MgeHeader.prototype, "width", void 0);
__decorate([
    Prop()
], MgeHeader.prototype, "height", void 0);
__decorate([
    Prop()
], MgeHeader.prototype, "data", void 0);
__decorate([
    Method()
], MgeHeader.prototype, "setData", null);
MgeHeader = __decorate([
    Component({
        tag: 'mge-header',
        styleUrl: 'mge-header.css',
        shadow: true,
    })
], MgeHeader);
export { MgeHeader };
