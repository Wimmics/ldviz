import { Component, h, Prop, Element, Listen, State } from "@stencil/core";

import state from "../../../store"


@Component({
    tag: 'object-annotation',
    styleUrl: 'object-annotation.css',
    shadow: false,
})



export class objectAnnotation {


    @Prop() idAnnotation: string;
    @Prop() width: number = 350;
    @Prop() height: number = 350;
    @State() expanded = false;
    @Element() element: HTMLElement;
    @State() selected = {};
    @Listen('testevent', { target: 'body' })
    getdata(event: CustomEvent) {
        //console.log("annotation");
        //console.log(state.objectview);
        var result = event.detail;
        //console.log(result);
        var test = result[this.idAnnotation].data;
        //console.log("test result "+test.view);
        if (test.view == "nodelink") {
            //console.log("into nodelink");
            this.selected = [];
            this.selected["view"] = "nodelink"
            this.selected["nodes"] = []
            test.nodes.forEach(node => {
                //console.log("label1: "+node.labels[1]);
                this.selected["nodes"].push(node.labels[1]);
            });
            this.selected["links"] = []
            test.links.forEach(node => {

                this.selected["links"].push(node.source.labels[1]+ " and "+ node.target.labels[1] );
            });

            //console.log(this.selected);
        } else if (test.view == "clustervis") {
            //console.log("into clustervis");
            this.selected = [];
            this.selected["view"] = "clustervis"
            this.selected["clusters"] = test.clusters;
            //console.log("test clusters"+test.clusters);
        } else if (test.view == "matrix") {
            //console.log("into matrix");
            this.selected = [];
            this.selected["view"] = "matrix"
            this.selected["source"] = test.source;
            this.selected["dest"] = test.dest;
            
            //console.log(this.selected);
        } else if (test.view == "listing") {
            //console.log("into listing");
            this.selected = [];
            this.selected = test;
            //console.log("test: "+test);
            this.selected["view"] = "listing";
            //console.log(this.selected);
        }

        // if ("source" in result){
        //     this.selected = [result["source"]["labels"][1], result["target"]["labels"][1]];
        // }else if ("title" in result){
        //     this.selected = [result["title"]];
        // }
        // else{
        //     this.selected = [result["labels"][1]];
        // }
    }

    // selectView() {
    //     select(this.element.querySelector(".selectBox")).on("click", () => {
    //         var checkboxes = this.element.querySelector("#checkboxes");
    //         //console.log(checkboxes)
    //         if (!this.expanded) {
    //             checkboxes["style"]["display"] = "block";
    //             this.expanded = true;
    //         } else {
    //             checkboxes["style"]["display"] = "none";
    //             this.expanded = false;
    //         }
    //     })
    // };






    componentDidLoad() {
        //this.selectView();
    }




    render() {

        let viewList = state._annotationdata;
        let disabled = state.annotations[this.idAnnotation].disabled;
        let viewContent = (
            <div>
                <table class="annotation_view table" id='annotation-view'>
                    <tr>
                        <td >Object * </td>
                        <td>
                            <div class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                            Please select objects from a view.
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Note *</td>
                        <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                            <div class="annotation-note" contenteditable>
                                <textarea name="notedata" id="notedata" style={{ width: this.width * 0.65 + "px" }}></textarea>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        );
        if (this.selected["view"] == "nodelink") {
            viewContent = (
                <div>
                    <table class="annotation_view table" id='annotation-view'>
                        <tr>
                            <td>
                                Objects *
                            </td>
                            <td>
                                <div class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                                    Please select objects from a view.
                                    {/* - {this.selected["view"]}/> */}
                                    <input type="hidden" name="view" value={this.selected["view"]}/> <br />
                                    {/* Nodes: <br /> */}
                                    <ul >{this.selected["nodes"].map((item: any = {}) =>
                                        <li>
                                            {item}
                                            <input type="hidden" name="nodes" value={item}/>
                                        </li>
                                    )}
                                    {this.selected["links"].map((item: any = {}) =>
                                            <li>
                                                {item}
                                                <input type="hidden" name="links" value={item}/>
                                            </li>
                                        )}
                                    </ul>
                                   {/*  Links:
                                    <ul>
                                        {this.selected["links"].map((item: any = {}) =>
                                            <li>
                                                {item}
                                                <input type="hidden" name="links" value={item} />
                                            </li>
                                        )}
                                    </ul> */}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Note *</td>
                            <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                                <div class="annotation-note" contenteditable>
                                    <textarea name="notedata" id="notedata" style={{ width: this.width * 0.65 + "px" }}></textarea>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            );
        } else if (this.selected["view"] == "clustervis") {
            viewContent = (
                <div>
                    <table class="annotation_view table" id='annotation-view'>
                        <tr>
                            <td >Object * </td>
                            <td>
                                <div class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                                    Please select objects from a view.
                                    {/* - {this.selected["view"]} */}
                                    <input type="hidden" name="view" value={this.selected["view"]} /> <br />

                                    <ul>{this.selected["clusters"].map((item: any = {}) =>
                                        <li>
                                            {item}
                                            <input type="hidden" name="clusters" value={item} />
                                        </li>
                                    )}
                                    </ul>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Note *</td>
                            <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                                <div class="annotation-note" contenteditable>
                                    <textarea name="notedata" id="notedata" style={{ width: this.width * 0.65 + "px" }}></textarea>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            );
        } else if (this.selected["view"] == "matrix") {
            viewContent = (
                <div>
                    <table class="annotation_view table" id='annotation-view'>
                        <tr>
                            <td >Object * </td>
                            <td>
                                <div class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                                    {/* - {this.selected["view"]} */}
                                    Please select objects from a view.
                                    <input type="hidden" name="view" value={this.selected["view"]} /> <br />
                                    <ul>
                                        <li>
                                            Source: {this.selected["source"]}
                                            <input type="hidden" name="source" value={this.selected["source"]} />
                                        </li>
                                        <li>
                                            Target: {this.selected["dest"]}
                                            <input type="hidden" name="dest" value={this.selected["dest"]} />
                                        </li>
                                    </ul>

                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Note *</td>
                            <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                                <div class="annotation-note" contenteditable>
                                    <textarea name="notedata" id="notedata" style={{ width: this.width * 0.65 + "px" }}></textarea>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            );
        } else if (this.selected["view"] == "listing") {
            viewContent = (
                <div>
                    <table class="annotation_view table" id='annotation-view'>
                        <tr>
                            <td >Object * </td>
                            <td>
                                <div class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                                    {/* - {this.selected["view"]} */}
                                    Please select objects from a view.
                                    <input type="hidden" name="view" value={this.selected["view"]} /> <br />
                                    <ul>
                                        <li>
                                            Date: {this.selected["date"]}
                                            <input type="hidden" name="date" value={this.selected["date"]} />
                                        </li>
                                        <li>
                                            Title: {this.selected["title"]}
                                            <input type="hidden" name="title" value={this.selected["title"]} />
                                        </li>
                                        <li>
                                            view: {this.selected["view"]}
                                            <input type="hidden" name="view" value={this.selected["view"]} />
                                        </li>
                                    </ul>
                                    authors: <br />
                                    <ul>{this.selected["authors"].map((item: any = {}) =>
                                        <li>
                                            {item}
                                            <input type="hidden" name="authors" value={item} />
                                        </li>
                                    )}
                                    </ul>

                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Note *</td>
                            <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                                <div class="annotation-note" contenteditable>
                                    <textarea name="notedata" id="notedata" style={{ width: this.width * 0.65 + "px" }}></textarea>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            );
        }


        return viewContent;
    }
}