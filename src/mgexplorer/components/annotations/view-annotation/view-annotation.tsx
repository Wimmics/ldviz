import { Component, h, Prop, Element, State } from "@stencil/core";

import state from "../../../store"
import { select, selectAll } from 'd3-selection'


@Component({
    tag: 'view-annotation',
    styleUrl: 'view-annotation.css',
    shadow: false,
})

export class viewAnnotation {

    @Prop() width: number = 350;
    @Prop() height: number = 350;
    @State() expanded = false;
    @Element() element: HTMLElement;
    @Prop() idAnnotation: string;


    @Prop({ mutable: true }) _annotation ; 
    @Prop({ mutable: true }) _dashboard ;

    constructor() {
        this._dashboard = document.querySelector("mge-dashboard");
        
        //*[@id="viewArea"]/mge-dashboard//div/div/mge-view[3]
        //*[@id="viewArea"]/mge-dashboard//div/div/mge-view[4]

    }

    selectView() {
        select(this.element.querySelector(".selectBox")).on("click", () => {
            var checkboxes = this.element.querySelector("#checkboxes");
            //console.log(checkboxes)
            if (!this.expanded) {
                checkboxes["style"]["display"] = "block";
                this.expanded = true;
            } else {
                checkboxes["style"]["display"] = "none";
                this.expanded = false;
            }
        })
    };






    componentDidLoad() {
        this.selectView();
        //console.log(state.annotations[this.idAnnotation]);
    }




    render() {

        let viewList = []
        state._annotationdata.forEach(element => {
            if ( !element.includes("annotation"))
            viewList.push(element);
        }); 
        let enabled = state.annotations[this.idAnnotation].disabled;
        let viewContent = (
            <div>
                <table class="annotation_view table" id='annotation-view'>
                    <tr>
                        <td >Views * </td>
                        <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                            <div >
                                <div class="multiselect" style={{ width: this.width * 0.65 + "px" }}>
                                    <div class="selectBox"  style={{ width: this.width * 0.65 + "px" }}>
                                        <select id="selectview" style={{ width: this.width * 0.65 + "px" }}>
                                            <option>Select an option</option>
                                        </select>
                                        <div class="overSelect"></div>
                                    </div>
                                    <div id="checkboxes" style={{ width: this.width * 0.65 + "px" }}>
                                        {viewList.map((item: any = {}) =>
                                            <label htmlFor={item} style={{ width: this.width * 0.65 + "px" }}>
                                                <input type="checkbox" name="views[]" disabled={ enabled }   id={item} value={item} />{item}</label>
                                        )}
                                    </div>
                                </div>
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

        return viewContent;
    }
}