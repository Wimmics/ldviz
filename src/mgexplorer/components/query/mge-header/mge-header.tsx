import { Component, Element, Host, Prop, h, Method, Watch} from '@stencil/core';
import  { select, selectAll } from 'd3-selection'
import state from "../../../store"

@Component({
  tag: 'mge-header',
  styleUrl: 'mge-header.css',
  shadow: true,
})
export class MgeHeader {

@Element() element: HTMLElement;
  @Prop() width: number = 400;
  @Prop() height: number = 400;
  // @Prop() data: any;

  @Prop() data=[];


  @Method()
  async setData(_){
    this.data = _
  }

  private loadData = () => {
      let value = (this.element.shadowRoot.querySelector("#selectQuery")as HTMLInputElement).value;
      const selectedData = this.data.filter(d => d.label == value)[0].data;


      selectAll('mge-dashboard').remove();
      this.element.shadowRoot.querySelector('#lblMensagem').innerHTML = "Co-authorship Network of I3S Laboratory from 2007 to 2020 containing " + 
          selectedData.info.qtNodos + ' nodes and ' + selectedData.info.qtArestas + ' edges';
      state._data = selectedData
      select('#viewArea').append("mge-dashboard")
                // .attr("data", "databaseUFRGS2004")
                .attr("type-div", "mge-nodelink")
                .attr("id-template", "filter-content-iris")
                .attr("title", "Michel Riveill's 23  connections  papers")
                .attr("x", 0)
                .attr("y", 0)
  }
  // buildChart(idDiv, svg){ 
  //   // console.log(this._chart);
  //   // this._chart().data(this.chartData);
  // }


  componentDidRender(){
      let selectQuery = select(this.element.shadowRoot.querySelector("#selectQuery"))
        .attr("width", this.width)
        .attr("height", this.height);


      selectQuery.selectAll('option')
            .data(this.data)
            .enter()
                .append('option')
                .attr('value', d => d.label)
                .text(d => d.label)

      selectAll("input[id*='type']")
          .on('change', function() {
              const _this = this;
              selectAll(this.element.shadowRoot.querySelector("input[id*='type']"))
                  .property('checked', function() { return this == _this ? true : false; })
          })
  }



  render() {
    return (
      <Host>
        <div id="toolBar" >
            <form id="query">
              <label id="titulo">MGExplorer</label>
              <label>Choose a dataset:</label>
              <select id="selectQuery"></select>
              <i class="fas fa-arrow-circle-right " onClick={ this.loadData }></i>
              or load your own 
              <span ><i class="fas fa-upload" ></i></span>
            </form>
          </div>
          <label id="lblMensagem"></label>
      </Host>
    );
  }

}

