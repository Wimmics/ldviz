import { Component, h, Prop } from "@stencil/core";

import state from "../../../store"

@Component({
    tag: 'dashboard-annotation',
    styleUrl: 'dashboard-annotation.css',
    shadow: false,
})

export class dashboardAnnotation {

    @Prop() width: number = 350;
    @Prop() height: number = 350;


    render() {

        let dashboardContent = (
            <div>
                <table class="annotation_view table" id='annotation-view'>
                    <tr>
                        <td >History * </td>
                        <td>
                            <div class="table_cell" style={{ width: this.width * 0.65 + "px" }}>
                                <ul>
                                    {state._historydata.map((item: any = {}) =>
                                        <li>
                                            {item}
                                            <input type="hidden" name="dashboardInput" value={item} />
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
            </div>);



        return dashboardContent;
    }
}