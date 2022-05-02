import { Component, h, Prop, Element, State } from "@stencil/core";
import state from "../../../store"
import { select, selectAll } from 'd3-selection'

@Component({
    tag: 'query-annotation',
    styleUrl: 'query-annotation.css',
    shadow: false,
})

export class queryAnnotation {

    @Prop() width: number = 350;
    @Prop() height: number = 350;
    @State() expanded = false;
    @Element() element: HTMLElement;

    selectQuery() {
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
        this.selectQuery();
    }

    render(){
        let queryList = state._querydata;
        let queryContent = (
            <div>
                <table class="annotation_view table" id='annotation-view'>
                    <tr>
                        <td >Query * </td>
                        <td class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                            <div >
                                <div class="multiselect" style={{ width: this.width * 0.65 + "px" }}>
                                    <div class="selectBox"  style={{ width: this.width * 0.65 + "px" }}>
                                        <select style={{ width: this.width * 0.65 + "px" }}>
                                            <option>Select an option</option>
                                        </select>
                                        <div class="overSelect"></div>
                                    </div>
                                    <div id="checkboxes" style={{ width: this.width * 0.65 + "px" }}>
                                        {queryList.map((item: any = {}) =>
                                            <label htmlFor={item} style={{ width: this.width * 0.65 + "px" }}>
                                                <input type="checkbox" name="views[]" id={item} value={item} />{item}</label>
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

        return queryContent;
    }
}
