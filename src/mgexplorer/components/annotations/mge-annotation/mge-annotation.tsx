import { Component, Host, Prop, h, Method, State, Listen, Element } from '@stencil/core';
import state from "../../../store"
import { select, selectAll } from 'd3-selection'
import Model from 'model-js';
import { saveAs } from 'file-saver';


@Component({
    tag: 'mge-annotation',
    styleUrl: 'mge-annotation.css',
    shadow: false,
})
export class MgeAnnotation {

    @Prop() width: number = 350;
    @Prop() height: number = 350;

    @Prop() initComponent: string = "mge-query";

    /** The parent dashboard */
    @Prop({ mutable: true }) _dashboard;

    //@Prop({ mutable: true }) model;

    @Prop({ mutable: true }) _view;


    @State() selectValue: string;

    @State() selectValueType: string;

    @State() selectValueFormat: string;

    @Element() element: HTMLElement;

    @Prop({ mutable: true }) formAnnotation = null

    @Prop({ mutable: true }) parents = [];


    @Prop({ mutable: true }) disabled = false;

    @Prop({ mutable: true }) idannotation;

    private protocol = window.location.protocol + '//';

    private hostname = window.location.host;
    public model: any;
    constructor() {
        this._dashboard = document.querySelector("mge-dashboard");

        //*[@id="viewArea"]/mge-dashboard//div/div/mge-view[3] 
        //state.annotations[this.element.id] = false;


    }

    @Method()
    async setBox(_) {
        //console.log(arguments);
        if (!arguments.length)
            return this.model.box;
        this.height = arguments[0].height;
        this.width = arguments[0].width;
    };

    idChart() {
        return "chart-annotation"
    }

    handleSelect(event) {
        //console.log(event.target.value);
        this.selectValue = event.target.value;

    }

    @Listen('idevent', { target: 'body' })
    getdata(event: CustomEvent) {
        this.idannotation = event.detail;
    }

    /* handleSelectType(event) {
        this.selectValueType = event.target.value;
    }

    handleSelectFormat(event) {
        this.selectValueFormat = event.target.value;
    } */

    // Function to save annotation
    saveAnnotationData() {
        select(this.element.querySelector("#saveAnnotationbtn")).on("click", async () => {
            /* if (this.element.querySelector("textarea")["value"] == "") {
                console.log("verified");
                select(this.element.querySelector("#saveAnnotationbtn")).attr('disabled', true);
                this.resetAnnotationForm();
            } else if (this.element.querySelector("textarea")["value"] != "") { */
                //console.log("not verified anymore");
                select(this.element.querySelector("#saveAnnotationbtn")).attr('disabled', false);
                let data = []
                let rect = await this._dashboard.shadowRoot.querySelector("rect.DS-conect." + this.element.id)
                //let annotype = this.element.querySelector("#annotation_format").getAttribute("value");
                //let format = this.selectValueFormat;
                //let type = this.selectValueType;
                let cat = this.selectValue;
                if (cat == 'dashboard' || cat == 'object') {

                    let hiddens = this.element.querySelectorAll("input[type=hidden]");
                    hiddens.forEach(element => {
                        data.push(element.getAttribute("value"));
                    });

                    if (cat == 'object') {
                        rect.remove()
                        const that = this;
                        let parents = [];
                        let parent = this._dashboard.shadowRoot.querySelector("mge-view[id-view='" + this.idannotation + "']");
                        parents.push(parent);
                        this._dashboard._addLinkAnnotation(parents, this._view).then(async (links) => {
                            for (let i = 0; i < links.lines.length; i++) {
                                let line = links.lines[i]
                                await this._dashboard.addChart(parents[i].idView, {
                                    id: that._view.idView, title: this.element.id, typeChart: that._view.typeVis, hidden: false, x: that._view.x, y: that._view.y, view: that._view, link: { line: line, conect: links.conect, visible: links.visible }
                                })
                                await this._dashboard.refreshLinks();
                                // await this._dashboard.updateLink({ line: line, conect: links.conect, visible: links.visible }, this._view.idView);             
                            }
                            this._dashboard._treeCharts.pop(1);
                        })
                        select(this.element.querySelector("#notedata")).attr('disabled', true);
                        select(this.element.querySelector("#objectdetails")).attr('disabled', true);
                    } else if (cat == 'dashboard') {
                        select(this.element.querySelector("#notedata")).attr('disabled', true);
                    }

                } else if (cat == 'view') {
                    rect.remove()
                    const that = this;
                    let checkboxes = this.element.querySelectorAll("input[type=checkbox]");
                    let parents = [];
                    checkboxes.forEach(async (element) => {
                        if (element["checked"]) {
                            data.push(element["defaultValue"]);
                            let parent = this._dashboard.shadowRoot.querySelector("mge-view[titleview='" + element["defaultValue"] + "']");
                            parents.push(parent);
                        }
                    });
                    this._dashboard._addLinkAnnotation(parents, this._view).then(async (links) => {
                        for (let i = 0; i < links.lines.length; i++) {
                            let line = links.lines[i]
                            await this._dashboard.addChart(parents[i].idView, {
                                id: that._view.idView, title: this.element.id, typeChart: that._view.typeVis, hidden: false, x: that._view.x, y: that._view.y, view: that._view, link: { line: line, conect: links.conect, visible: links.visible }
                            })
                            await this._dashboard.refreshLinks();
                            // await this._dashboard.updateLink({ line: line, conect: links.conect, visible: links.visible }, this._view.idView);

                        }
                        this._dashboard._treeCharts.pop(1);
                    })
                    select(this.element.querySelector("#selectview")).attr('disabled', true);
                    select(this.element.querySelector("#notedata")).attr('disabled', true);
                    //select(this.element.querySelectorAll("input[type='checkbox']")).attr('disabled', true);
                } else if (cat == 'query') {
                    rect.remove()
                    const that = this;
                    let checkboxes = this.element.querySelectorAll("input[type=checkbox]");
                    let parents = [];
                    checkboxes.forEach(async (element) => {
                        if (element["checked"]) {
                            data.push(element["defaultValue"]);
                            //console.log(element["defaultValue"]);
                            if (element["defaultValue"] == "Initial query") {
                                //console.log("test initial query " + this._dashboard.shadowRoot.querySelector("mge-view[titleview='" + element["defaultValue"] + "']"));

                            }
                            let parent = this._dashboard.shadowRoot.querySelector("mge-view[titleview='" + element["defaultValue"] + "']");
                            //console.log("parent: " + parent)
                            parents.push(parent);
                        }
                    });
                    this._dashboard._addLinkAnnotation(parents, this._view).then(async (links) => {
                        for (let i = 0; i < links.lines.length; i++) {
                            let line = links.lines[i]
                            await this._dashboard.addChart(parents[i].idView, {
                                id: that._view.idView, title: this.element.id, typeChart: that._view.typeVis, hidden: false, x: that._view.x, y: that._view.y, view: that._view, link: { line: line, conect: links.conect, visible: links.visible }
                            })
                            await this._dashboard.refreshLinks();
                            // await this._dashboard.updateLink({ line: line, conect: links.conect, visible: links.visible }, this._view.idView);

                        }
                        this._dashboard._treeCharts.pop(1);


                    })
                    select(this.element.querySelector("#notedata")).attr('disabled', true);
                }


                let note = this.element.querySelector("textarea")["value"]

                state.formData = {
                    //"annotation-format": format,
                    //"annotation-type": type,
                    "type-connection": cat,
                    "connected-to": data,
                    "note ": note,
                    "time": this.getdate()
                }
                this.saveAnnotationContent(state.formData);
                this.disableForm();
            
        })
        this.selectValue = '--';
        //this.selectValueType = 'alert';
        //this.selectValueFormat = 'text';
        this.element.querySelector("textarea")["value"] = "";


    }

    exportAnnotation() {
        select(this.element.querySelector("#exportAnnotationbtn")).on("click", async () => {
            let data = [];
            let datas = {};
            let cat = this.selectValue;
            datas["id"] = this.element.id;
            datas["type-connection"] = cat;
            if (cat == 'dashboard' || cat == 'object') {
                let hiddens = this.element.querySelectorAll("input[type=hidden]");
                hiddens.forEach(element => {
                    data.push(element.getAttribute("value"));
                });
            } else if (cat == 'view') {
                let checkboxes = this.element.querySelectorAll("input[type=checkbox]");
                checkboxes.forEach(async (element) => {
                    if (element["checked"]) {
                        data.push(element["defaultValue"]);
                    }
                });

            } else if (cat == 'query') {
                let checkboxes = this.element.querySelectorAll("input[type=checkbox]");
                checkboxes.forEach(async (element) => {
                    if (element["checked"]) {
                        data.push(element["defaultValue"]);
                    }
                });
            }
            datas["connected-to"] = data
            let note = this.element.querySelector("textarea")["value"]
            datas["note"] = note;
            datas["time"] = this.getdate();
            //console.log(datas);

            var fileToSave = new Blob([JSON.stringify(datas)], {
                type: 'application/json'
            });

            // Save the file
            saveAs(fileToSave, this.element.id + ".json");
        });
    }

    resetAnnotationForm() {
        select(this.element.querySelector("#resetAnnotationbtn")).on("click", () => {
            //console.log("reset form");
            this.selectValue = '--';
            //this.selectValueType = 'alert';
            //this.selectValueFormat = 'text';
            this.element.querySelector("textarea")["value"] = "";
        })
    }

    closeAnnotation() {
        select(this.element.querySelector("#cancelAnnotationbtn")).on("click", () => {
            this._dashboard._treeCharts.pop(1);
            this._dashboard.refreshLinks();
            this._view.remove();

        })
    }

    /**
      * This function to disable Run and clone button after get result from server
      *
    */
    disableForm() {
        //select(this.element.querySelector("#annotation_format")).attr('disabled', true);
        //select(this.element.querySelector("#form_type")).attr('disabled', true);
        select(this.element.querySelector("#connection-types")).attr('disabled', true);
        select(this.element.querySelector("input[type='checkbox']")).attr('disabled', true);
        select(this.element.querySelector("#saveAnnotationbtn")).attr('disabled', true);
        select(this.element.querySelector("#cancelAnnotationbtn")).attr('disabled', true);
        select(this.element.querySelector("#resetAnnotationbtn")).attr('disabled', true);
        select(this.element.querySelector("#freenotedata")).attr('disabled', true);
        state.annotations[this.element.id]["disabled"] = true;
    }


    getdate() {
        var today = new Date();
        var date = today.getDate() + "/" + (today.getMonth() + 1) + '/' + today.getFullYear();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return date + ' ' + time;
    }

    async saveAnnotationContent(data) {
        let page = null;
        let url = this.protocol + this.hostname + "/saveAnnotation";
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



    componentDidLoad() {
        this._view = this._dashboard.shadowRoot.querySelector("[id-view='" + this.element.id + "']");
        this.saveAnnotationData();
        this.resetAnnotationForm();
        this.closeAnnotation();
        this.exportAnnotation();
    }


    render() {

        let generalContent = (
            <div>
                <table class="annotation_general table" id='annotation-general'>
                    <tr>
                        <td>Note *</td>
                        <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                            <div class="annotation-note" contenteditable>
                                <textarea name="notedata" id='freenotedata' style={{ width: this.width * 0.65 + "px" }}></textarea>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        );

        let dashboardContent = (
            <div>
                <dashboard-annotation></dashboard-annotation>
            </div>
        );

        let viewContent = (
            <div>
                <view-annotation id-annotation={this.element.id}></view-annotation>
            </div>
        );

        let objectContent = (
            <div>
                <object-annotation id-annotation={this.element.id}></object-annotation>
            </div>
        );

        let queryContent = (
            <div>
                <query-annotation></query-annotation>
            </div>
        );



        let contentToDisplay = '--';
        if (this.selectValue == 'dashboard') {
            contentToDisplay = dashboardContent;
        } else if (this.selectValue == 'view') {
            contentToDisplay = viewContent;
        } else if (this.selectValue == 'object') {
            contentToDisplay = objectContent;
        } else if (this.selectValue == 'query') {
            contentToDisplay = queryContent;
        }
        else {
            contentToDisplay = generalContent;
        }


        return (
            <Host>
                <div class="annotation-tree">
                    <div class="formtree">
                        <form name='annotation-form' id='annotation-form' class="content">
                            <section id='annotation_parameters'>
                                <table class="annotationform_section table" id='annotation-head'>
                                    {/* <tr>
                                        <td >Format * </td>
                                        <td>
                                            <select class="table_cell" id="annotation_format" onInput={(event) => this.handleSelectFormat(event)} name="annotation_format" style={{ width: this.width * 0.65 + "px" }}>
                                                <option value="text" selected={this.selectValueFormat === 'text'}>Text</option>
                                                <option value="marker" selected={this.selectValueFormat === 'marker'}>Marker</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td > Type * </td>
                                        <td >
                                            <select class="table_cell" id="form_type" onInput={(event) => this.handleSelectType(event)} name="annoation_type" style={{ width: this.width * 0.65 + "px" }}>
                                                <option value="alert" selected={this.selectValueType === 'alert'}>Alert</option>
                                                <option value="question" selected={this.selectValueType === 'question'}>Question</option>
                                                <option value="information" selected={this.selectValueType === 'information'}>Information</option>
                                            </select>
                                        </td>
                                    </tr> */}
                                    <tr>
                                        <td > Connect to * </td>
                                        <td >
                                            <select class="table_cell" name="connection-types" id="connection-types" onInput={(event) => this.handleSelect(event)} style={{ width: this.width * 0.65 + "px" }}>
                                                <option value="--" selected={this.selectValue === '--'}>--</option>
                                                <option value="dashboard" selected={this.selectValue === 'dashboard'}>Dashboard</option>
                                                <option value="view" selected={this.selectValue === 'view'}>View</option>
                                                <option value="object" selected={this.selectValue === 'object'}>Object</option>
                                                <option value="query" selected={this.selectValue === 'query'}>Query</option>
                                            </select>
                                        </td>
                                    </tr>
                                </table>
                                <tr>
                                    <div>
                                        {contentToDisplay}
                                    </div>
                                </tr>
                            </section>
                        </form>
                    </div>
                    <div class="annotation-buttons" style={{ "position": "absolute", "bottom": "10px", "width": "100%", "text-align": "right" }}>
                        <button type='button' class="btn btn-outline-primary" id="saveAnnotationbtn">Save</button>
                        <button type='button' class="btn btn-outline-secondary" id='cancelAnnotationbtn'>Cancel</button>
                        <button type='button' class="btn btn-outline-secondary" id='resetAnnotationbtn'>Reset</button>
                        <button type='button' class="btn btn-outline-secondary" id='exportAnnotationbtn'>Export</button>
                    </div>
                </div>
            </Host>
        );
    }

}
