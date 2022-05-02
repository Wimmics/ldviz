import { Component, Element, Host, Prop, h, Method, Watch } from '@stencil/core';
import { tree, zoom, hierarchy } from "d3"
import { select } from 'd3-selection';
import Model from 'model-js';
import state from "../../../store"

@Component({
    tag: 'mge-history',
    styleUrl: 'mge-history.css',
    shadow: false,
})
export class MgeHistory {

    @Element() element: HTMLElement;
    /** represents the width of the history panel*/
    @Prop() width: number = 350;
    /** represents the height of the history panel*/
    @Prop() height: number = 250;

    public model: any;

    @Prop({ mutable: true }) _historydata = [];


    /** Represents the panel associated with the graphic */
    @Prop({ mutable: true }) historyTreePanel = null;  // Represents the panel associated with the graphic
    /** Space height for each node without the margins */
    @Prop({ mutable: true }) _nodoHeight = 14;    // Space height for each node without the margins
    /** Distance from the text to the left coordinate of the node */
    @Prop({ mutable: true }) _leftText = 18;      // Distance from the text to the left coordinate of the node
    /** Margin css of the node */
    @Prop({ mutable: true }) _nodeMargin = 1;
    /** The height symbol */
    @Prop({ mutable: true }) _rectHeight = this._nodoHeight - this._nodeMargin * 2;
    /** The tree layout to stored tree data*/
    @Prop({ mutable: true }) _treeLayout = tree().size([0, this._nodoHeight]);
    /** Vector with objects of all nodes */
    @Prop({ mutable: true }) _vNodes = [];        // Vector with objects of all nodes

    /** The parent dashboard */
    @Prop({ mutable: true }) _dashboard;


    @Prop({ mutable: true }) _htdata;

    /** Group representing history tree */
    @Prop({ mutable: true }) _grpHistory = null;   // Group representing history tree
    /** Group representing nodes in the tree */
    @Prop({ mutable: true }) _grpNodes = null;

    @Prop() typeVis: string;

    private protocol = window.location.protocol + '//';

    private hostname = window.location.host;

    constructor() {
        this.model = Model();
        this._dashboard = document.querySelector("mge-dashboard")

    }
    /** This function is to set the data to the tree history data
      */
    @Method()
    async setTree(newTree) {
        this.setData(newTree);
    }
    /** 
     * The initial function to create all of elements in the history treechart
     * In this function, it will set Geometric attributes of the graph
     * create actions on graph and manage all of the interaction on the graph
     * */
    @Method()
    async addHistoryTreeChart(idDiv, divTag) {

        this.model.margin = { top: 4, right: 4, bottom: 4, left: 4 };
        this.model.box = { width: this.width, height: this.height };


        let _svg = divTag.append("svg"),  // Create dimensionless svg
            _grpChart = _svg.append("g");                       // Does not exist in the original Iris
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
            select(this.element).attr("height", box.height).attr("width", box.width)
        });

        //---------------------
        this.model.when("margin", function (margin) {
            _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        });

        //---------------------
        this.model.when(["data"], () => {
            this._appendNodos();
            let maxLenghtTitle = this.model.widthChart,
                globalThis = this;
            updateSVGWidth()
            function updateSVGWidth() {
                globalThis._grpNodes.selectAll('text')
                    .each(function () {
                        let textlength = this.getComputedTextLength();
                        if (textlength > maxLenghtTitle) maxLenghtTitle = textlength;
                    })
                _svg.attr("width", maxLenghtTitle + 50);
            }

        });


        function _chartZoom(event) {
            _zoomListener.scaleExtent([0.9, 1.1]);
            _grpChart.attr("transform", event.transform)
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
                    return "HT-grpNodos"
            })
            .attr("transform", function (d) { return "translate(" + d.y + "," + (d.x + 5) + ")"; })
            .classed("HT-NodeHidden", function (d) { return d.data.hidden });

        this._grpNodes.append("rect")
            .attr("x", d => d.data.typeChart != "mge-annotation" ? this._nodeMargin : null || d.data.typeChart == "mge-annotation" ? this._nodeMargin + 6 : null)
            .attr("y", d => d.data.typeChart != "mge-annotation" ? this._nodeMargin : null || d.data.typeChart == "mge-annotation" ? this._nodeMargin - 4 : null)
            .attr("rx", d => d.data.typeChart == "mge-query" ? 12 : 0)
            .attr("ry", d => d.data.typeChart == "mge-query" ? 12 : 0)
            .style("fill", d => d.data.typeChart == "mge-query" ? "rgb(255, 245, 246)" : null || d.data.typeChart == "mge-annotation" ? "rgb(252, 241, 230)" : null)
            .style("stroke", d => d.data.typeChart == "mge-query" ? "rgb(222, 66, 91)" : null || d.data.typeChart == "mge-annotation" ? "rgb(243, 153, 59)" : null)
            .attr("height", d => d.data.typeChart != "mge-annotation" ? this._rectHeight : null || d.data.typeChart == "mge-annotation" ? this._rectHeight - 2 : null)
            .attr("width", d => d.data.typeChart != "mge-annotation" ? this._rectHeight : null || d.data.typeChart == "mge-annotation" ? this._rectHeight - 2 : null)
            .attr("transform", d => d.data.typeChart == "mge-annotation" ? "rotate(45,0,0)" : null)
            .on("click", async (event, d) => {
                if (d.data.id === 'chart-0') return;

                if (d.data.id !== "chart-history") {
                    if (!d.data.hidden) {
                        await this._dashboard.closeView(d.data.view);
                    } else {
                        await this._dashboard.showView(d.data.view);
                    }
                    this._grpNodes.classed("HT-NodeHidden", function (d) { return d.data.hidden });
                }
            });

        this._grpNodes.append("text")
            .attr("x", this._leftText)
            .attr("y", d => d.data.typeChart != "mge-annotation" ? this._nodoHeight / 2 + 3 : null || d.data.typeChart == "mge-annotation" ? this._nodoHeight / 2 + 6 : null)
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
    @Method()
    async setBox(_) {
        if (!arguments.length)
            return this.model.box;
        this.model.box = _;

    };

    /** This function is to set the data to the chart
      * If no arguments, It will return the value of data
      */
    @Method()
    async setData(_) {
        if (!arguments.length)
            return this.model.data;
        this.model.data = _[0];
        //state._historydata = this.model.data.children;
        
        this._vNodes = this.organise(this._treeLayout(hierarchy(this.model.data)).descendants());
        state._historydata = [];
        state._annotationdata = [];
        state._querydata = [];
        this._vNodes.forEach((n, i) => {
            n.x = i * this._nodoHeight;
            n.y = n.depth * this._nodoHeight;
            state._historydata.push(n.data.title);
            if (n.data.typeChart == "mge-query") {
                state._querydata.push(n.data.title);
                //console.log("state query: " + state._querydata);
            }
            if (n.data.typeChart != "mge-annotation" && n.data.typeChart != "mge-query"){
                state._annotationdata.push(n.data.title);
                //console.log("view list: "+state._annotationdata);
            }
        });
        if (_.length > 1) {
            for (let index = 1; index < _.length; index++) {
                let n = {};
                n["data"] = _[index];
                n["x"] = this._vNodes.length * this._nodoHeight;
                n["y"] = 0;
                state._historydata.push(n["data"].title);
                state._annotationdata.push(n["data"].title);
                this._vNodes.push(n);
            }
        }
        // _irisPanel.update();
        // setupPrimaryVersion();
    };


    organise(lists){
        let result= []
        if (lists[0]["parent"] == undefined){
            result.push(lists[0]);
            if (lists[0]["children"]){
                lists[0]["children"].forEach(element => {

                    result.push(element);
                    if (element["children"] != undefined) {
                        result = result.concat(this.organise(element["children"]));
                    }
                });
            }
        }else{
            lists.forEach(element => {

                result.push(element);
                if (element["children"] != undefined) {
                    result = result.concat(this.organise(element["children"]));
                }
            });
            
        }
        
        
        return result;

    }

    // Function to save annotation
    saveHistoryData() {
        select(this.element.querySelector("#saveHistorybtn")).on("click", () => {

            this._htdata = {
                "history-path": state._historydata,
                "data": state.savedData,
                "time": this.getdate()
            }
            this.saveHistoryContent(this._htdata);
        })


    }

    getdate() {
        var today = new Date();
        var date = today.getDate() + "/" + (today.getMonth() + 1) + '/' + today.getFullYear();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return date + ' ' + time;
    }

    async saveHistoryContent(data) {
        let url = this.protocol + this.hostname + "/saveHistory";
        fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(response => {
            console.log(response);
            //location.href = this.protocol + this.hostname + '/' + page;
        }).catch(error => {
            console.log(error);
        });
    }

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
        this.saveHistoryData();
    }

    render() {
        return (
            <Host>
                <div class="history-tree">
                    <div class="history-buttons" style={{ "position": "absolute", "bottom": "10px", "width": "100%", "text-align": "right" }}>
                        <button type='button' class="btn btn-outline-primary" id="saveHistorybtn">Save</button>
                    </div>
                </div>
            </Host>
        );
    }

}
