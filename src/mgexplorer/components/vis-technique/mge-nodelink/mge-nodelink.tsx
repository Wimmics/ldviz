import { Component, Element, Host, Prop, h, Event, EventEmitter, Method} from '@stencil/core';
// import AlgCluster from './algCluster';
import state from "../../../store"
import { drag } from 'd3-drag';
import {normalNodeTooltips, normalEdgeTooltips} from './tooltips'
import Model from 'model-js';
import {max, zoom , forceSimulation, forceLink , range, schemeCategory10, forceCenter, forceManyBody, forceCollide, forceX, forceY} from 'd3'
import { nest } from 'd3-collection'
import  { select } from 'd3-selection'
import  { scaleLinear, scaleOrdinal } from 'd3-scale'


@Component({
  tag: 'mge-nodelink',
  styleUrl: 'mge-nodelink.css',
  shadow: false,
})
export class MgeNodelink {
  @Element() element: HTMLElement;
  /** represents the width of the nodelinks chart*/
  @Prop() width: number = 350;
  /** represents the height of the nodelinks chart*/
  @Prop() height: number = 350;
  /** The dataset name being used */
  @Prop() datasetName: string = "[]";
  @Prop({ mutable: true }) _view;

  public chartData: any;
  public model: any;
  public lcv: any;
  public _tooltips: any;

  /** Represents the panel associated with the graphic */
  @Prop() _nodeEdgePanel = null;  // Represents the panel associated with the graphic
  /** Represents the legend associated with the graphic */
  @Prop() _nodeEdgeLegend = null;

    /** The group represents the entire graphic */
  @Prop() _grpNodeEdge = null;    // Group representing todo o grafico
  private _forceLayout = null;

  private _indexAttrSize = null;      // Just for categorical

  private _rClusterScale;
  private _linkWidthScale;
  private _linkDistanceScale;
  private _chargeScale;

  private _configDefault = {
      charge: 100,
      linkDistance: 25,  // 30
      fNodoClusterDefault: function () { return "" }
  };

  private _configLayout = null;
  private _graphElem = null; // DOM elements
  private _graphData = null;
  public selectedobj = null;

  constructor(){

    this.model = Model();

    this._forceLayout = forceSimulation(),

    this._indexAttrSize = 'qtNodes';      // default size of circles depends on the number of connections (e.g. coauthors)

    this._rClusterScale = scaleLinear().range([3, 20]);
    this._linkWidthScale = scaleLinear().range([1, 7]);
    this._linkDistanceScale = scaleLinear();
    this._chargeScale = scaleLinear().range([50, 800]);

    this._tooltips = {
        divTT: null, // Div where the toolTip will be inserted
        normalNode: null,   // Object that manages the tooltip for normal node
        clusterNode: null,   // Object that manages the tooltip for Cluster type node
        normalEdge: null,
        clusterEdge: null
    }

    this._configLayout = {
        charge: this._configDefault.charge,
        fCharge: function (d) {
            return - (this._chargeScale(d.qtNodes) + this._configLayout.charge);
        },
        linkDistance: this._configDefault.linkDistance,
        gravity: 0,            // calculated,
        nodeSize: "links" // default is qtNodes
    }

    this._graphElem = { nodes: null, edges: null};
    this.selectedobj = { view: "nodelink", nodes: [], links: [] }
  }

  @Method()
  async addNodeLinkChart(idDiv, divTag){

    this.model.margin = { top: 2, right: 2, bottom: 2, left: 2 };
    this.model.box = { width: this.width, height: this.height };

    this.model.redraw = 0;        // When changed perform a redraw

    // ---------------- Initialization Actions
    let _svg = divTag.append("svg"),  // Create dimensionless svg
        _grpChart = _svg.append("g");                       // Does not exist in the original Iris
    
        // Add zoom event
    let _zoomListener = zoom().on("zoom", _chartZoom);
    _zoomListener.scaleExtent([0.5, 10]);
    _svg.call(_zoomListener);


    this._tooltips.divTT = divTag.append("div")
        .style("display", "none")
        .classed("NE-Tooltip", true);  // Tooltip for the normal node

    this._grpNodeEdge = _grpChart.append("g").attr("class", "NodeEdgeChart");

    //===================================================

    this.model.when("box", (box) => {
        _svg.attr("width", box.width).attr("height", box.height);
        select(this.element).attr("height", box.height).attr("width", box.width)
    });

    //---------------------
    this.model.when("margin", function (margin) {
        _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    });

    //---------------------
    this.model.when(["box", "margin"], (box, margin) => {
        this.model.widthChart = box.width - margin.left - margin.right;
        this.model.heightChart = box.height - margin.top - margin.bottom;
        this._forceLayout.force("center", forceCenter(this.model.widthChart / 2, this.model.heightChart / 2))
        this._forceLayout.alpha(1).restart();
    });

    //---------------------
    this.model.when(["data", "redraw"], (data) => {
        let dataLength = data.nodes.dataNodes.length;

        this._configLayout.gravity = 300 / ((Math.PI * this.model.widthChart * this.model.widthChart / 4) / dataLength); // no idea why 300
        if (this._configLayout.gravity < 0.05)
            this._configLayout.gravity = 0.05;

        if (this._configLayout.gravity < 0.1)
            this._configLayout.gravity = Math.round(this._configLayout.gravity * 100) / 100;
        else
            this._configLayout.gravity = Math.round(this._configLayout.gravity * 10) / 10;

        this._forceLayout.force("charge").strength(-this._configLayout.charge)
        this._forceLayout.force("forceX").strength(this._configLayout.gravity)//.x(this.width * .7))
        this._forceLayout.force("forceY").strength(this._configLayout.gravity)//.y(this.height * .7))
        this._forceLayout.alpha(1).restart();

        this._nodeEdgePanel.updateNodePanel();  // Updates information in the panel associated with the technique
        this._appendEdges();
        this._appendNodes();
        

    });

    function _chartZoom(event) {
            _zoomListener.scaleExtent([0.5, 10]);
            _grpChart.attr("transform", event.transform)
        }

  }
    //--------------------------------- Private functions
    dragNode = simulation => {
  
        function dragstarted(event, d) {
          if (!event.active) simulation.alphaTarget(0.05).restart();
          d.fx = d.x;
          d.fy = d.y;
        }
        
        function dragged(event, d) {
          d.fx = event.x;
          d.fy = event.y;
        }
        
        function dragended(event, d) {
          if (!event.active) simulation.alphaTarget(0);
          // simulation.stop()
          d.fx = null;
          d.fy = null;
        }
        
        return drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
      }
    /** Action to send data to object annotation */
    @Event({ bubbles: true, composed: true }) testevent: EventEmitter;
    _onMouseClick(type, event, data) {
        Object.entries(state.annotations).forEach(([key, value]) => {
            if(value["disabled"] == false){
                if (value["data"] == "" || value["data"].view != "nodelink" ){
                    value["data"] =  {
                        "view": "nodelink",
                        "nodes": [],
                        "links": []
                    };
                }  
                type == "node" ? value["data"].nodes.push(data) : value["data"].links.push(data);
                state.annotations[key]=value;       
            }
         });
        this.testevent.emit(state.annotations);
        this._send_id(this.element.id);
    }
    
    /** Action to send id of view */
    @Event({ bubbles: true, composed: true }) idevent: EventEmitter;
    _send_id(id) {
        this.idevent.emit(id)
    }

    _appendNodes() {
        this._graphElem.nodes = this._grpNodeEdge.selectAll(".NE-node")
            .data(this._graphData.nodes)
            .join(
                enter => enter.append('circle')
                            .attr("class", "NE-node"),
                update => update,
                exit => exit.remove()
                
            )
            .attr("r", d => this._rClusterScale(d[this._indexAttrSize]) )
            .style("fill", d => d.style)
            .on("mouseover", this._onMouseOverNode.bind(this))
            .on("mouseout", this._onMouseOutNode.bind(this))
            .on("click", this._onMouseClick.bind(this, "node"));
    }

    _appendEdges() {

        this._graphElem.edges = this._grpNodeEdge.selectAll(".NE-edge")
            .data(this._graphData.edges)
            .join(
                enter => enter.append('line')
                    .attr("class", "NE-edge"),
                update => update,
                exit => exit.remove()
            )            
            .style("stroke-width", (d) => {return this._linkWidthScale(d.qt); })
            .on("mouseover", this._onMouseOverEdge.bind(this))
            .on("mouseout", this._onMouseOutEdge.bind(this))
            .on("click", this._onMouseClick.bind(this,"link"));
    }


    _onMouseOverNode(event, d) {
        this._graphElem.nodes.each(function (n) { n.highLight = false; });
;
        state.selectedobj=d;
          d.highLight = true;
          if (d.cluster) {
              if (this._tooltips.clusterNode != null)
                  this._tooltips.clusterNode.create(this._tooltips.divTT, d, event);
          } else {
              if (this._tooltips.normalNode != null)
                  this._tooltips.normalNode.create(this._tooltips.divTT, d, event); 
          }
          this._graphElem.edges.classed("NE-HighLight", function (edge) {
              if (edge.source === d || edge.target === d) return edge.source.highLight = edge.target.highLight = true;
              else return false;
          });
          this._graphElem.nodes.classed("NE-HighLight", function (node) { return node.highLight; });
        
    }

    /**
     * _onMouseOutNode
     */
    _onMouseOutNode(event, d) {
        this._graphElem.nodes.classed("NE-HighLight", false);
        this._graphElem.edges.classed("NE-HighLight", false);
        d.highLight = false;
        if (d.cluster) {
            if (this._tooltips.clusterNode != null)
                this._tooltips.clusterNode.remove();
        } else {
            if (this._tooltips.normalNode != null)
                this._tooltips.normalNode.remove();
        }
    }

    /**
     * _onMouseOverEdge
     */
    _onMouseOverEdge(event, d) {
        state.selectedobj =d;
        this._graphElem.nodes.each(function (n) { n.highLight = false; });
        d.highLight = true;
        d.source.highLight = true;
        d.target.highLight = true;
        let path = event.path || event.composedPath()
        select(path[0]).classed("NE-HighLight", true);
        this._graphElem.nodes.classed("NE-HighLight", function (node) { return node.highLight; });

        if (d.source.cluster && d.target.cluster) {
            if (this._tooltips.clusterEdge != null)
                this._tooltips.clusterEdge.create(this._tooltips.divTT, d, event);
        } else {
            if (this._tooltips.normalEdge != null)
                this._tooltips.normalEdge.create(this._tooltips.divTT, d, event);
        }
        
    }
    
    /**
   * _onMouseOutEdge
   */
  _onMouseOutEdge(event, d) {
      d.highLight = false;
      d.source.highLight = false;
      d.target.highLight = false;
      let path = event.path || event.composedPath()
      select(path[0]).classed("NE-HighLight", false);
      this._graphElem.nodes.classed("NE-HighLight", false);
      if (d.source.cluster && d.target.cluster) {
          if (this._tooltips.clusterEdge != null)
              this._tooltips.clusterEdge.remove();
      } else {
          if (this._tooltips.normalEdge != null)
              this._tooltips.normalEdge.remove();
      }
      
  }

  _adjustGraph(data) {
      let result = {
          nodes: null,
          edges: null
      };

      result.nodes = data.nodes.dataNodes.filter(function (d) { return d.visible });
      result.nodes.forEach(function (d, i) {
          d.newIndex = i;
      });
      result.edges = data.edges.dataEdges.filter(function (d) { return d.visible });
      result.edges.forEach(function (d) {
          d.source = data.nodes.dataNodes[d.src].newIndex;
          d.target = data.nodes.dataNodes[d.tgt].newIndex;
      });
      return result;
  }

     //---------------------
    @Method()
    async setBox (_) {
        if (!arguments.length)
            return this.model.box;
        this.model.box = _;
    };

    //---------------------
    // This function is required in all techniques
    // It is called internally in conectChart
    @Method()
    async setPanel (_) {
        if (!arguments.length)
            return this._nodeEdgePanel;
        this._nodeEdgePanel = _;
    };

    //---------------------
    // This function is required in all techniques
    // It is called internally in conectChart
    @Method()
    async setLegend (_) {
        if (!arguments.length)
            return this._nodeEdgeLegend;
        this._nodeEdgeLegend = _;
    };

    //---------------------
    setTTNormalNode(_) {
        this._tooltips.normalNode = _;
    };

    //---------------------
    setTTClusterNode(_) {
        this._tooltips.clusterNode = _;

    };

    //---------------------
    setTTNormalEdge(_) {
        this._tooltips.normalEdge = _;
    };

    //---------------------
    setTTClusterEdge(_) {
        this._tooltips.clusterEdge = _;
    };

    //---------------------
    @Method()
    async setData(_, globalData) {
        //let qtLabel=0, qtValue=0;
        let maxQtEdges, vNodesTemp;
        if (!arguments.length)
            return this.model.data;
        this.model.data = _;

        if (this.model.data.isCluster === undefined) {
            vNodesTemp = range(0,this.model.data.nodes.dataNodes.length).map(function () { return 0; });
            this.model.data.isCluster = false;
            this.model.data.nodes.qtNodes = this.model.data.nodes.dataNodes.length;
            this.model.data.nodes.dataNodes.forEach(function (d) {
                d.idCluster = -1;
                d.qtNodes = 1;
                d.visible = true;
                d.cluster = false;
                d.grau = 0;
            });
            this.model.data.edges.qtEdges = this.model.data.edges.dataEdges.length;
            this.model.data.edges.dataEdges.forEach(function (d) {
                vNodesTemp[d.src]++;
                vNodesTemp[d.tgt]++;
                d.qt = 1;
                d.source = d.src;
                d.target = d.tgt;
                d.visible = true;
            });
            this.model.data.nodes.dataNodes.forEach(function (d, i) { d.grau = vNodesTemp[i]; });
        }

        this.model.data.nodes.dataNodes.forEach(function (d) { d.highLight = false; });

        this._graphData = this._adjustGraph(this.model.data);

        this._graphData.nodes.forEach(node => {
            node.qtNodes = this._graphData.edges.filter(d => d.src === node.id).length
            node.qtItems = this.qtItems(node)
        })

        await this._setClusterScale()

        let maxQtNodes =  max(this._graphData.nodes, d => d.qtNodes);
        this._chargeScale.domain([1, maxQtNodes]); // repulsion scale

        let maxLinkDistance = this._rClusterScale(maxQtNodes)
        this._linkDistanceScale.range([1, maxLinkDistance]).domain([1, maxQtNodes]);

        maxQtEdges = max(this._graphData.edges, function (d) { return d.qt });
        if (maxQtEdges === 1){
          this._linkWidthScale.domain([maxQtEdges]);
        }
        else {
          this._linkWidthScale.domain([1, maxQtEdges]);
        }

        await this._setForceLayout()

        this.setTTNormalNode(normalNodeTooltips(this.model.data, state.ATN_AuthorName, state.ATN_QtPublicacoes - 1000, state.headerTitle));
        this.setTTNormalEdge(normalEdgeTooltips(this.model.data, state.ATN_AuthorName, [state.ATE_QtPublicacoes]));
    };

    async _setClusterScale() {
        let maxQtAttr = max(this._graphData.nodes, d => d[this._indexAttrSize]);
        this._rClusterScale.domain([1, maxQtAttr]); // radius scale (changes according to the selected attribute)
        
    }

    async _setForceLayout() {
        this._forceLayout
            .nodes(this._graphData.nodes)
            .force("charge", forceManyBody().strength(-this._configLayout.charge))
            .force("link", forceLink().links(this._graphData.edges)
                .distance((d) => this._configLayout.linkDistance + this._linkDistanceScale(d.source.qtNodes) + this._linkDistanceScale(d.target.qtNodes)))
            .force("forceX", forceX().strength(this._configLayout.gravity))
            .force("forceY", forceY().strength(this._configLayout.gravity))
            .force('collide', forceCollide(d => this._rClusterScale(d[this._indexAttrSize])))

        this._forceLayout.on("tick", () => {
            if (this.model.data !== null)
                var ticksPerRender = this.model.data.nodes.dataNodes.length / 100;
            else 
                var ticksPerRender = 1;

            if (this._graphElem.edges != null){
                requestAnimationFrame(() => {
                    for (var i = 0; i < ticksPerRender; i++) {
                        this._forceLayout.tick();
                    }

                    this._graphElem.edges
                        .attr("x1", d => d.source.x )
                        .attr("y1", d => d.source.y )
                        .attr("x2", d => d.target.x )
                        .attr("y2", d => d.target.y )

                    this._graphElem.nodes
                        .attr("cx", d => d.x )
                        .attr("cy", d => d.y )

                        if (this._forceLayout.alpha() < 0.03)
                        this._forceLayout.stop();
                    })
            }
        })
    }

    //---------------------
    /** This function will get the `gravity` attribute of force layout in node-links chart
    */
    @Method()
    async getGravity() {
        return this._configLayout.gravity;
    };

    //---------------------
    /** This function will get the `charge` attribute of force layout in node-links chart
    */
    @Method()
    async getCharge() {
        return this._configLayout.charge;
    };

    //---------------------
    /** This function will get the `distance` attribute of links in force layout in node-links chart
    */
    @Method()
    async getLinkDistance() {
        return this._configLayout.linkDistance;
    };

    //---------------------
    /** This function will get the total number of nodes
    */
    @Method()
    async getQtNodes() {
        return this._graphData.nodes.length;
    };

    //---------------------
    /** This function will get the total number of edges
    */
    @Method()
    async getQtEdges() {
        return this._graphData.edges.length;
    };

    qtItems(node) {
        let total = 0
        let index = state.ATN_QtPublicacoes - 1000;
        for (let i = index; i < index + 3; i++) 
            total += node.values[i]

        return total;
    }


    //---------------------
    /** Changes the attribute that will be used to map the size
    */
    @Method()
    async indexAttrSize(_) {
        if (!arguments.length)
            return this._indexAttrSize;
        this._indexAttrSize = _;
    };

    //======== Actions Functions

    //---------------------
    /** This function will change the value of gravity on force layout. This function will be called when adjust Gravity slider in filter panel
    */
    @Method()
    async acChangeGravity(value) {
        this._configLayout.gravity = +value;
        this._forceLayout.force("forceX", forceX().strength(this._configLayout.gravity));
        this._forceLayout.force("forceY", forceY().strength(this._configLayout.gravity));
        this._forceLayout.alpha(1).restart();
    };

    //---------------------
    /** This function will change the value of charge on force layout. This function will be called when adjust Charge slider in filter panel
    */
    @Method()
    acChangeCharge(value) {
        this._configLayout.charge = +value;
        this._forceLayout.force("charge", forceManyBody().strength(d => -this._configLayout.charge));
        // .strength((d) => { return - (this._chargeScale(d.qtNodes) + this._configLayout.charge); })
        this._forceLayout.alpha(1).restart();
    };

    //---------------------
    /** This function will change the value of links distance on force layout. This function will be called when adjust LinkDistance slider in filter panel
    */
    @Method()
    acChangeLinkDistance(value) {
        this._configLayout.linkDistance = +value;
        this._forceLayout.force("link", forceLink().links(this._graphData.edges).distance((d) => {
            return this._configLayout.linkDistance + this._linkDistanceScale(d.source[this._indexAttrSize]) + this._linkDistanceScale(d.target[this._indexAttrSize]);
        })).alpha(1).restart();
    }
    

    //---------------------
    @Method()
    async acChangeAttrSize(value) {
        this._indexAttrSize = value;
        await this._setClusterScale();
        this._forceLayout.force('collide', forceCollide(d => this._rClusterScale(d[this._indexAttrSize])))
        .alpha(1).restart()
        this.model.redraw += 1;
    };
    

    //---------------------
    /** This function will remove hightlight effect on all of nodes and links. This function will be called when clear text inside text search
    */
    @Method()
    resetHighSearch() {
        this._graphElem.nodes.classed("NE-HighSearch", function (d) { return false });
    };

    //---------------------
    /** This function will hightlight node and all related links by name of selected node. This function will be called when used text search in filter panel
    */
    @Method()
    acSelectByName(nome) {

        this._graphElem.nodes.each(function (d) {
            d.highSearch = false;
            d.highSearch = (d.labels[1] === nome);
        });

        this._graphElem.nodes.classed("NE-HighSearch", function (d) { return d.highSearch });
    };

    

    //---------------------
    /** This function will hightlight all nodes in a cluster. This function will be called when used text search in filter panel
    */
    @Method()
    async acSelectByNameCluster(nomeCluster) {
        this._graphElem.nodes.each(function (d) {
            d.highSearch = false;
            d.highSearch = (d.key === nomeCluster);

        });
        this._graphElem.nodes.classed("NE-HighSearch", function (d) { return d.highSearch });
    };


  buildChart(idDiv, svg){ 
    this.setBox(this.model.box);
    // this.indexAttrSize(state.ATN_qtNodes);
    this.addNodeLinkChart(idDiv, svg);
  }


  componentDidLoad(){
      let svg = select(this.element.querySelectorAll(".nodelink")[0])
        .attr("width", this.width)
        .attr("height", this.height);
      this.buildChart("nodelink", svg);
  }


  render() {
    return (
      <Host>
        <div class="nodelink"/>
      </Host>
    );
  }

}
