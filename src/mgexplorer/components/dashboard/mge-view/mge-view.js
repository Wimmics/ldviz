var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, Element, Host, Prop, h, Method, Watch } from '@stencil/core';
import state from "../../../store";
import { toPng, toSvg } from 'html-to-image';
import { pointer, select, selectAll } from 'd3-selection';
// import 'jquery-resizable-dom/src/jquery-resizable';
let MgeView = class MgeView {
    constructor() {
        /** represents the width of the view displayed by the window*/
        this.width = 400;
        /** represents the height of the view displayed by the window*/
        this.height = 400;
        /** The dataset name being used */
        this.datasetName = "[]";
        /** The title of the view */
        this.titleView = "[]";
        /** x-coordinate (The horizontal value in a pair of coordinates) of view's position*/
        this.x = 0;
        /** y-coordinate (The vertical value in a pair of coordinates) of view's position*/
        this.y = 0;
        this.datatype = "number";
        this._selectOrder = null;
        this._selectAttr = null;
        /** View center point */
        this._center = { cx: 0, cy: 0 };
        /** View current position */
        this._position = { x: 0, y: 0 };
        /** Title bar height */
        this._barTitleHeight = 15; // Title bar height
        /** View dimensions */
        this._dimView = { width: 10, height: 10 };
        this.listHasFilter = ["mge-nodelink", "mge-barchart", "mge-clustervis", "mge-glyph-matrix", "mge-iris"];
        this._canNodeRedirectCorese = false;
        //---------------------------------     
        this.setItemsContextMenu = function (codChart, items) {
            this._contextMenu.vItens[codChart] = items;
        };
        this._headerTitle = typeof this.datatype == 'number' ? 'co-authors' : 'associations';
        this._themeInfo = typeof this.datatype == 'number' ? ' co-publication' : ' common item';
        this.DS_NodeEdge = 0,
            this.DS_ClusterVis = 1,
            this.DS_Iris = 2,
            this.DS_GlyphMatrix = 3,
            this.DS_Iris_Solo = 4,
            this.DS_Papers_List = 5,
            this.DS_NodeEdge_HAL = 6,
            this.DS_ClusterVis_HAL = 7;
        this.DS_FollowUpQuery = 8;
        this.DS_Histogram = 9;
        this._selectedQuery;
        this._configView = {
            barTitle: true,
            btTool: true,
            btClose: true,
            draggable: true,
            resizable: true,
            aspectRatio: false,
            visible: true
        },
            this._contextMenu = {
                showing: false,
                vItens: [null, null, null, null]
            },
            this._subContextMenu = {
                showing: false
            },
            this._dashboardArea = {
                div: null,
                dash: null,
                svg: null,
                width: 0,
                height: 0
            };
        this._dashboard = document.querySelector("mge-dashboard");
        this.pos1 = 0;
        this.pos2 = 0;
        this.pos3 = 0;
        this.pos4 = 0;
        this._dimView.width = this.width;
        this._dimView.height = this.height + this._barTitleHeight;
        this._position.x = this.x;
        this._position.y = this.y;
        this._center.cx = this._position.x + this._dimView.width / 2;
        this._center.cy = this._position.y + this._dimView.height / 2;
        if (this.typeVis != "mge-history") {
            state.indexChart++;
        }
    }
    validateName(newValue, oldValue) {
        this._position.x = this.x;
        this._position.y = this.y;
        this._center.cx = this._position.x + this._dimView.width / 2;
        this._center.cy = this._position.y + this._dimView.height / 2;
    }
    updateDimview(newValue, oldValue) {
        this._dimView.width = this.width;
        this._dimView.height = this.height + this._barTitleHeight;
        this._center.cx = this._position.x + this._dimView.width / 2;
        this._center.cy = this._position.y + this._dimView.height / 2;
    }
    /** Refresh bar title width when we resize the windown
      */
    async _refreshBarTitle() {
        this._top.attr("width", this._dimView.width).attr("height", this._barTitleHeight);
    }
    /** This funtion is to generate the title of the window
     * it depends on the type chart to generate
      */
    async generateTitle(node, data, _typeChart, parentId, isFromEdge = false, secondNode = null, isFromCluster = false, isFromHC = false) {
        let title, nbPapers;
        switch (_typeChart) {
            case state.typeChart.nodeLinks:
                title = "";
                let queryName = title.startsWith("query") ?
                    title.split("query")[1] : "";
                title = "Co-publication Followup Query " + queryName;
                return title;
            case state.typeChart.followupQuery:
                if (node.labels)
                    title = "Follow up query (" + node.labels[1] + ")";
                else
                    title = "Follow up query (" + node.authorList + ")";
                return title;
            case state.typeChart.histogram:
                nbPapers = data.root.data.documents.length;
                title = node.labels[state.ATN_AuthorName];
                if (isFromEdge) {
                    title += " and " + secondNode.labels[state.ATN_AuthorName];
                }
                else if (isFromCluster) {
                    title += "'s cluster";
                }
                else {
                    title += ' and ' + this._headerTitle;
                }
                title += ': ' + nbPapers + this._themeInfo + (nbPapers > 1 ? 's' : '');
                return title;
            case state.typeChart.cluster:
                if (node.cluster) {
                    // title = node.key + "\'s cluster";
                    title = node.labels[state.ATN_AuthorName] + "\'s cluster";
                }
                else {
                    title = node.labels[state.ATN_AuthorName] + " and " + state.headerParameter + this._headerTitle + " (" + data.nodes.dataNodes.length + " clusters)";
                }
                return title;
            case state.typeChart.glyphMatrix:
                if (node.cluster) {
                    return node.labels[state.ATN_AuthorName] + "\'s cluster";
                }
                else {
                    return node.labels[state.ATN_AuthorName] + " and " + state.headerParameter + this._headerTitle;
                }
            case state.typeChart.iris:
                return node.labels[state.ATN_AuthorName] + " and " + data.children.data.length + " " + state.headerParameter + this._headerTitle;
            case state.typeChart.paperlist:
                nbPapers = data.root.data.documents.length;
                title = node.labels[state.ATN_AuthorName];
                if (isFromEdge) {
                    title += " and " + secondNode.labels[state.ATN_AuthorName];
                }
                else if (isFromCluster) {
                    title += "'s cluster";
                }
                else {
                    title += ' and ' + this._headerTitle;
                }
                title += ': ' + nbPapers + this._themeInfo + (nbPapers > 1 ? 's' : '');
                if (isFromHC) {
                    let parentChart = await this._dashboard.getChart(parentId);
                    let authors = parentChart.title.split(':')[0];
                    let date = data.root.data.documents[0].date;
                    title = authors + ': ' + nbPapers + this._themeInfo + (nbPapers > 1 ? 's' : '') + ` in ${date}`;
                }
                return title;
            default:
                // code...
                break;
        }
    }
    setResizable() {
        let globalThis = this;
        var startX, startY, startWidth, startHeight, h, w;
        const resizers = selectAll(this.element.shadowRoot.querySelectorAll('.resizer'));
        // Loop over them
        [].forEach.call(resizers.nodes(), (resizer) => {
            resizer.onmousedown = initDragResize.bind(this);
        });
        // elm.onmousedown = initDragResize.bind(this);
        function initDragResize(event) {
            event = event || window.event;
            event.preventDefault();
            // Get the current mouse position
            startX = event.clientX;
            startY = event.clientY;
            // Calculate the dimension of element
            const styles = window.getComputedStyle(this.element.shadowRoot.querySelector("#" + this.idView + "-g"));
            w = parseInt(styles.width, 10);
            h = parseInt(styles.height, 10);
            this.selLinkPai = select(this._dashboard.shadowRoot.querySelector(".F-" + this.idView));
            this.selLinkFilhos = selectAll(this._dashboard.shadowRoot.querySelectorAll(".P-" + this.idView));
            this.selConect = select(this._dashboard.shadowRoot.querySelector("." + this.idView));
            this.selLinkPaiArrow = select(this._dashboard.shadowRoot.querySelector(".FA-" + this.idView));
            this.selLinkFilhosArrow = selectAll(this._dashboard.shadowRoot.querySelectorAll(".PA-" + this.idView));
            document.onmousemove = doDragResize.bind(this);
            document.onmouseup = stopDragResize.bind(this);
        }
        function doDragResize(e) {
            let aspect = this._dimView.height / this._dimView.width;
            // Updates the dimensions of the <div>
            let dx = e.clientX - startX;
            let dy = e.clientY - startY;
            this._dimView.width = w + dx - 2;
            this._dimView.height = h + dy - 2;
            this._dimView.height = this._dimView.height - this._barTitleHeight;
            // if (this._config.aspectRatio) {
            //     // Adjusts height to maintain appearance
            //     this._dimView.height = aspect * this._dimView.width;
            //     _dimView.height = this._dimView.height + _barTitleHeight;
            //     _divView.css({ "height": _dimView.height });
            // }
            // this._refreshBarTitle();
            if (this._dimView.width >= 0 && this._dimView.height >= 0) {
                this._refreshBarTitle();
                this._chart.setBox({ width: this._dimView.width, height: this._dimView.height });
                this._center.cx = this._position.x + this._dimView.width / 2;
                this._center.cy = this._position.y + this._dimView.height / 2;
                if (!this.selLinkPai.empty()) {
                    let dt = this.selConect.datum();
                    this.selLinkPai.attr("x2", this._center.cx).attr("y2", this._center.cy);
                    this.selConect.attr("x", this._center.cx - 6).attr("y", this._center.cy - 6);
                    this.selLinkPaiArrow.attr("x2", this._center.cx).attr("y2", this._center.cy).attr("refX", (this._center.cx - this.selLinkPaiArrow.attr("x1")) / 4);
                    dt[0].x = this._center.cx;
                    dt[0].y = this._center.cy;
                }
                this.selLinkFilhos.attr("x1", this._center.cx).attr("y1", this._center.cy);
                this.selLinkFilhosArrow.attr("x1", this._center.cx).attr("y1", this._center.cy).attr("refX", (this._center.cx - this.selLinkFilhosArrow.attr("x1")) / 4);
                this._dashboard.refreshSvg();
            }
        }
        function stopDragResize(e) {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    /**
     * Get the selection of the visualization technique element which containing in this view
     */
    async getChart() {
        return this._chart;
    }
    dragElement(elm) {
        elm.onmousedown = this.dragMouseDown.bind(this);
    }
    elementDrag(event) {
        event = event || window.event;
        this.selLinkPai = select(this._dashboard.shadowRoot.querySelector(".F-" + this.idView));
        this.selLinkFilhos = selectAll(this._dashboard.shadowRoot.querySelectorAll(".P-" + this.idView));
        this.selConect = select(this._dashboard.shadowRoot.querySelector("." + this.idView));
        this.selLinkPaiArrow = select(this._dashboard.shadowRoot.querySelector(".FA-" + this.idView));
        this.selLinkFilhosArrow = selectAll(this._dashboard.shadowRoot.querySelectorAll(".PA-" + this.idView));
        this.moveWindow(event.clientX, event.clientY);
    }
    moveWindow(x, y) {
        this.pos1 = this.pos3 - x;
        this.pos2 = this.pos4 - y;
        this.pos3 = x;
        this.pos4 = y;
        this.cont.style.top = this.cont.offsetTop - this.pos2 + 'px';
        this.cont.style.left = this.cont.offsetLeft - this.pos1 + 'px';
        this._position.x = this.cont.offsetLeft;
        this._position.y = this.cont.offsetTop;
        // this.viewDiv.setPosition(this._position.x, this._position.y)
        this._center.cx = this._position.x + this._dimView.width / 2;
        this._center.cy = this._position.y + this._dimView.height / 2;
        if (!this.selLinkPai.empty()) {
            this.selLinkPai.attr("x2", this._center.cx).attr("y2", this._center.cy);
            this.selConect.attr("x", this._center.cx - 6).attr("y", this._center.cy - 6);
            this.selLinkPaiArrow.attr("x2", this._center.cx).attr("y2", this._center.cy).attr("refX", (this._center.cx - this.selLinkPaiArrow.attr("x1")) / 4);
        }
        this.selLinkFilhos.attr("x1", this._center.cx).attr("y1", this._center.cy);
        this.selLinkFilhosArrow.attr("x1", this._center.cx).attr("y1", this._center.cy).attr("refX", (this._center.cx - this.selLinkFilhosArrow.attr("x1")) / 4);
        this.selLinkPaiArrow;
        this._dashboard.refreshSvg();
    }
    closeDragElement() {
        /* stop moving when mouse button is released: */
        document.onmouseup = null;
        document.onmousemove = null;
    }
    // Events
    dragMouseDown(event) {
        event = event || window.event;
        event.preventDefault();
        // console.log('sender');
        this.pos3 = event.clientX;
        this.pos4 = event.clientY;
        // this.dashboard.setPosition(event.clientX, event.clientY);
        document.onmouseup = this.closeDragElement.bind(this);
        document.onmousemove = this.elementDrag.bind(this);
    }
    /**
     * Set new center point for the view
     * Inputs are coordinates (x and y) of new center position
     */
    setCenter(x, y) {
        this._center.cx = x;
        this._center.cy = y;
        this._position.x = this._center.cx - this._dimView.width / 2;
        this._position.y = this._center.cy - this._dimView.height / 2;
    }
    ;
    /**
     * Get current center position of the view
     */
    async getCenter() {
        return this._center;
    }
    ;
    /**
     * Get ID of the view
     */
    async idChart() {
        return this.idView;
    }
    ;
    /**
     * this function allows to Refresh position of the view
     */
    refresh() {
        this.viewDiv.node().style.top = this._position.y + "px";
        this.viewDiv.node().style.left = this._position.x + "px";
    }
    ;
    /**
     * This function allows to set new title for the view
     */
    async setTitle(_) {
        this.titleView = _;
        this._top.attr("title", this.titleView);
        select(this.element).attr("titleView", this.titleView);
        select(this.element.shadowRoot.querySelector(".title")).text(_);
    }
    getAllStyles(elem) {
        if (!elem)
            return []; // Element does not exist, empty list.
        var win = document.defaultView || window, style, styleNode = {};
        if (win.getComputedStyle) { /* Modern browsers */
            style = win.getComputedStyle(elem, '');
            for (var i = 0; i < style.length; i++) {
                Object.assign(styleNode, { [style[i]]: style.getPropertyValue(style[i]) });
                //               ^name ^           ^ value ^
            }
        }
        else if (elem.currentStyle) { /* IE */
            style = elem.currentStyle;
            for (var name in style) {
                Object.assign(styleNode, { [name]: style[name] });
            }
        }
        else { /* Ancient browser..*/
            style = elem.style;
            for (var i = 0; i < style.length; i++) {
                Object.assign(styleNode, { [style[i]]: style[style[i]] });
            }
        }
        return styleNode;
    }
    addTopContent() {
        if (this.listHasFilter.includes(this.typeVis)) {
            let _btnMenu = this._top.append("button")
                .attr("id", this.idView + "-t-menu-btn")
                .attr("class", "fas fa-angle-double-down"), _btnSaveScreen = this._top.append("button")
                .attr("id", this.idView + "-t-screenshot-btn")
                .attr("class", "fas fa-camera");
            _btnMenu.on("click", (event, d) => {
                let path = event.path || event.composedPath();
                if (this._filter.style.display == "none") {
                    this._filter.style.display = "block";
                    path[0].className = "fas fa-angle-double-up";
                }
                else {
                    path[0].className = "fas fa-angle-double-down";
                    this._filter.style.display = "none";
                }
            });
            _btnSaveScreen.on("click", (event, d) => {
                let isSVG = select("#typeCapture").node().checked;
                var scale = 2;
                if (isSVG) {
                    toSvg(this.viewDiv.node(), {
                        quality: 1.0,
                        backgroundColor: '#FFFFFF',
                        width: this.viewDiv.node().scrollWidth * scale,
                        height: this.viewDiv.node().scrollHeight * scale,
                        style: { left: '0',
                            right: '0',
                            bottom: '0',
                            top: '0',
                            transform: 'scale(' + scale + ')',
                            transformOrigin: 'top left' }
                    })
                        .then(dataURL => {
                        // It will return a canvas element
                        var linkScreenShot = document.createElement('a');
                        linkScreenShot.href = dataURL;
                        linkScreenShot.download = `screenshot_${this.typeVis}_${Date.now()}.svg`;
                        // Firefox requires the link to be in the body
                        document.body.appendChild(linkScreenShot);
                        // simulate click
                        linkScreenShot.click();
                        // remove the link when done
                        document.body.removeChild(linkScreenShot);
                    })
                        .catch(function (error) {
                        console.error('oops, something went wrong!', error);
                    });
                }
                else {
                    toPng(this.viewDiv.node(), {
                        quality: 1.0,
                        backgroundColor: '#777777',
                        width: this.viewDiv.node().scrollWidth * scale,
                        height: this.viewDiv.node().scrollHeight * scale,
                        style: { left: '0',
                            right: '0',
                            bottom: '0',
                            top: '0',
                            transform: 'scale(' + scale + ')',
                            transformOrigin: 'top left' }
                    })
                        .then(dataURL => {
                        // It will return a canvas element
                        var linkScreenShot = document.createElement('a');
                        linkScreenShot.href = dataURL;
                        linkScreenShot.download = `screenshot_${this.typeVis}_${Date.now()}.png`;
                        // Firefox requires the link to be in the body
                        document.body.appendChild(linkScreenShot);
                        // simulate click
                        linkScreenShot.click();
                        // remove the link when done
                        document.body.removeChild(linkScreenShot);
                    })
                        .catch(function (error) {
                        console.error('oops, something went wrong!', error);
                    });
                }
            });
        }
        ;
        this._top.append("span")
            .attr("class", "title")
            .attr("id", this.idView + "-t-title")
            .style("white-space", "nowrap")
            .style("overflow", "hidden")
            .style("text-overflow", "ellipsis")
            .style("width", 0)
            .text(this.titleView);
        if (this.typeVis != state.typeChart.history && this.idView != "chart-0")
            this._top.append("button")
                .attr("class", "fas fa-times")
                .attr("id", this.idView + "-t-close-btn")
                // .text("x")
                .on("click", async (event, d) => {
                await this._dashboard.closeView(this.element);
            });
    }
    ;
    addChartContent(div) {
        div.append(this.typeVis).attr("dataset-name", this.datasetName)
            .attr("id", this.idView)
            .attr("id-dash", this.idDash);
        this._chart = this.element.shadowRoot.querySelector(this.typeVis);
    }
    async addSettingsContent() {
        let _filterDiv = this.viewDiv.append("mge-panel").attr("id", this.idView + "-p")
            .attr("type-vis", this.typeVis)
            .attr("id-view", this.idView)
            .style("display", "none");
        this._filter = _filterDiv.node();
        this._filter.setChart(this._chart);
        if (![state.typeChart.history, state.typeChart.followupQuery, state.typeChart.paperlist].includes(this.typeVis)) {
            await this._chart.setPanel(this._filter);
        }
    }
    async buildChart(div) {
        this._top = div.append("div")
            .attr("class", "top")
            .attr("id", this.idView + "-t")
            .attr("title", this.titleView)
            .style("height", this._barTitleHeight)
            .style("overflow", "hidden");
        this._content = div.append("div")
            .attr("class", "content")
            .attr("id", this.idView + "-c")
            .style("width", this.width)
            .style("height", "90%")
            .style("overflow", "hidden");
        this.addTopContent();
        this.addChartContent(this._content);
        this.addSettingsContent();
    }
    _onMouseOverContent(event, d) {
        select(this.element.shadowRoot.querySelector(".resizer-i")).classed("resizer-autohide", false);
    }
    /**
     * _onMouseOutContent
     */
    _onMouseOutContent(event, d) {
        select(this.element.shadowRoot.querySelector(".resizer-i")).classed("resizer-autohide", true);
    }
    /**
     * Set visible for all contents in view
     * if input status is true, the content wil be visible
     * if input status is false, the content will be hidden
     */
    setVisible(status) {
        if (status)
            this.cont.style.display = "block";
        else
            this.cont.style.display = "none";
    }
    /**
     * Set new position for the view
     * Inputs are coordinates : x and y
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * Get current position of the view
     */
    async getPosition() {
        return this._position;
    }
    _initAction() {
        // this._dashboardArea.div = select("#viewArea");
        this._dashboardArea.dash = select(this.element);
        this._dashboardArea.dash.classed("DS-viewArea", true)
            .on("click", (event) => {
            if (event.detail === 1) {
                this._onClickAction.bind(this)(event);
            }
            else if (event.detail === 2) {
                this._dblClickAction.bind(this)(event);
            }
        })
            .on("contextmenu", this._onContextMenu.bind(this));
    }
    _onClickAction(event) {
        if (this._contextMenu.showing && this._contextMenu.showing !== "keep") {
            this._contextMenu.showing = false;
            selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
            select("#subContextMenuDiv").remove();
        }
    }
    _onContextMenu(event) {
        let clickedElem, viewDiv, popupDiv, mousePos;
        this._selectedQuery = 8;
        //parseInt($("#selectQuery")[0].selectedIndex);
        event.preventDefault();
        if (this._contextMenu.showing) {
            event.preventDefault();
            this._contextMenu.showing = false;
            selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
        }
        if (event.composedPath()[0].nodeName !== this.typeVis) {
            this._contextMenu.showing = true;
            clickedElem = select(event.composedPath()[0]);
            if (clickedElem.classed("IC-node") || clickedElem.classed("GM-node")) {
                event.preventDefault();
                viewDiv = this._findParentDiv(clickedElem);
                mousePos = pointer(event, viewDiv.node());
                popupDiv = viewDiv.append("div")
                    .attr("class", "DS-popup medium-size")
                    .style("left", mousePos[0] + "px")
                    .style("top", mousePos[1] + "px");
                if (clickedElem.classed("IC-node"))
                    this._execCtxMenuIris(popupDiv, clickedElem, viewDiv.node());
                else if (clickedElem.classed("GM-node"))
                    this._execCtxMenuGlyphMatrix(popupDiv, clickedElem, viewDiv.node());
            }
            if (this._selectedQuery !== 8) {
                if (clickedElem.classed("NE-node")
                    || clickedElem.classed("NE-edge")
                    || clickedElem.classed("CV-node")) {
                    event.preventDefault();
                    viewDiv = this._findParentDiv(clickedElem);
                    mousePos = pointer(event, viewDiv.node());
                    popupDiv = viewDiv.append("div")
                        .attr("class", "DS-popup medium-size")
                        .style("left", mousePos[0] + "px")
                        .style("top", mousePos[1] + "px");
                    this._contextMenu.showing = true;
                    if ((clickedElem.classed("NE-node") || clickedElem.classed("NE-edge")) && this._selectedQuery !== 8)
                        this._execCtxMenuNodeEdge(popupDiv, clickedElem, viewDiv.node());
                    else if (clickedElem.classed("CV-node"))
                        this._execCtxMenuClusterVis(popupDiv, clickedElem, viewDiv.node());
                }
            }
            else {
                event.preventDefault();
                viewDiv = this._findParentDiv(clickedElem);
                mousePos = pointer(event, viewDiv.node());
                popupDiv = viewDiv.append("div")
                    .attr("class", "DS-popup big-size")
                    .style("left", mousePos[0] + "px")
                    .style("top", mousePos[1] + "px");
                this._contextMenu.showing = true;
                if (clickedElem.classed("IC-bars")) {
                    this._execCtxMenuIrisBars(popupDiv, clickedElem, viewDiv.node());
                }
                else if (clickedElem.classed("NE-node") || clickedElem.classed("NE-edge")) {
                    this._execCtxMenuNodeEdgeHAL(popupDiv, clickedElem, viewDiv.node());
                }
                else if (clickedElem.classed("CV-node")) {
                    this._execCtxMenuClusterVisHAL(popupDiv, clickedElem, viewDiv.node());
                }
                else if (clickedElem.classed("PL-title")) {
                    this._execCtxMenuPapersList(popupDiv, clickedElem, viewDiv.node());
                }
                else if (clickedElem.classed('HC-bars')) {
                    this._execCtxMenuHistogram(popupDiv, select(clickedElem.node().parentNode), viewDiv.node());
                }
            }
        }
    }
    _dblClickAction(event) {
        let clickedElem = select(event.composedPath()[0]);
        let viewDiv = this._findParentDiv(clickedElem);
        if (clickedElem.classed("IC-node")) {
            let data = this._contextMenu.vItens[this.DS_Iris_Solo];
            data[0].fActionNode(clickedElem.datum(), viewDiv.node());
        }
    }
    //------------
    _findParentDiv(clickedElem) {
        let nodeElem = clickedElem.node();
        while (nodeElem.parentNode != null && nodeElem.parentNode.className !== "hydrated") {
            // while (nodeElem.parentNode != null && !(nodeElem.parentNode instanceof ShadowRoot)) {  
            nodeElem = select(nodeElem.parentNode).node();
        }
        return select(nodeElem.parentNode);
        // }
    }
    //------------  
    _execCtxMenuNodeEdge(popupDiv, clickedElem, parentId) {
        popupDiv.selectAll("div")
            .data(this._contextMenu.vItens[this.DS_NodeEdge])
            .enter()
            .append("div")
            .on("click", (event, d) => {
            this._contextMenu.showing = false;
            select(this.element.shadowRoot.querySelectorAll(".DS-popup")[0]).remove();
            if (clickedElem.classed("NE-node"))
                d.fActionNode(clickedElem.datum(), parentId);
            // else
            // d.fActionEdge(clickedElem.datum(),parentId);
        })
            .append("label")
            .text(function (d) { return d.label; });
    }
    //------------
    _execCtxMenuNodeEdgeHAL(popupDiv, clickedElem, parentId) {
        console.log("enter here 1");
        if (clickedElem.classed("NE-node")) {
            // Display the main context menu only if a node is clicked
            popupDiv.selectAll("div")
                .data(this._contextMenu.vItens[this.DS_NodeEdge_HAL])
                .enter()
                .append("div")
                .on("click", (event, d) => {
                // let mousePos,
                //     viewDiv,
                //     contextMenuDivRight,
                //     subContextMenuDiv;
                if (typeof (d.submenu) === "undefined") {
                    if (clickedElem.classed("NE-node"))
                        d.fActionNode(clickedElem.datum(), parentId);
                    else
                        d.fActionEdge(clickedElem.datum(), parentId);
                    this._contextMenu.showing = false;
                    select(this.element.shadowRoot.querySelectorAll(".DS-popup")[0]).remove();
                }
            })
                .append("label")
                .text(function (d) { return d.label; });
        }
    }
    //------------  
    _execCtxMenuClusterVis(popupDiv, clickedElem, parentId) {
        popupDiv.selectAll("div")
            .data(this._contextMenu.vItens[this.DS_ClusterVis])
            .enter()
            .append("div")
            .on("click", (event, d) => {
            this._contextMenu.showing = false;
            selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
            d.fActionNode(clickedElem.datum(), parentId);
            console.log("here 1");
        })
            .append("label")
            .text(function (d) { return d.label; });
    }
    //------------
    _execCtxMenuClusterVisHAL(popupDiv, clickedElem, parentId) {
        popupDiv.selectAll("div")
            .data(this._contextMenu.vItens[this.DS_ClusterVis_HAL])
            .enter()
            .append("div")
            .on("click", (event, d) => {
            this._contextMenu.showing = false;
            selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
            d.fActionNode(clickedElem.datum(), parentId);
            console.log("here 2");
        })
            .append("label")
            .text(function (d) { return d.label; });
    }
    //------------  
    _execCtxMenuIris(popupDiv, clickedElem, parentId) {
        popupDiv.selectAll("div")
            .data(this._contextMenu.vItens[this.DS_Iris])
            .enter()
            .append("div")
            .on("click", (event, d) => {
            this._contextMenu.showing = false;
            selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
            d.fActionNode(clickedElem.datum(), parentId);
        })
            .append("label")
            .text(function (d) { return d.label; });
    }
    //------------  
    _execCtxMenuGlyphMatrix(popupDiv, clickedElem, parentId) {
        popupDiv.selectAll("div")
            .data(this._contextMenu.vItens[this.DS_GlyphMatrix])
            .enter()
            .append("div")
            .on("click", (event, d) => {
            this._contextMenu.showing = false;
            selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
            d.fActionNode(clickedElem.datum(), parentId);
        })
            .append("label")
            .text(function (d) { return d.label; });
    }
    //------------
    _execCtxMenuIrisBars(popupDiv, clickedElem, parentNode) {
        popupDiv.selectAll("div")
            .data(this._contextMenu.vItens[this.DS_Papers_List])
            .enter()
            .append("div")
            .on("click", (event, d) => {
            this._contextMenu.showing = false;
            selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
            d.fActionNode(clickedElem.datum(), parentNode);
        })
            .append("label")
            .text(function (d) { return d.label; });
    }
    _execCtxMenuHistogram(popupDiv, clickedElem, parentId) {
        popupDiv.selectAll("div")
            .data(this._contextMenu.vItens[this.DS_Histogram])
            .enter()
            .append("div")
            .on("click", (event, d) => {
            this._contextMenu.showing = false;
            selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
            d.fActionNode(clickedElem.datum(), parentId);
        })
            .append("label")
            .text(function (d) { return d.label; });
    }
    //------------
    _execCtxMenuPapersList(popupDiv, clickedElem, parentId) {
        popupDiv.selectAll("div")
            .data(this._contextMenu.vItens[this.DS_Papers_List])
            .enter()
            .append("div")
            .on("click", (event, d) => {
            this._contextMenu.showing = false;
            selectAll(this.element.shadowRoot.querySelectorAll(".DS-popup")).remove();
            d.fActionNode(clickedElem.datum(), parentId);
        })
            .append("label")
            .text(function (d) { return d.label; });
    }
    _inicContextMenu() {
        this.setItemsContextMenu(this.DS_NodeEdge, [
            // { label: "NodeEdge", fActionNode: _fActionNotImplemented, fActionEdge: _fActionNotImplemented },
            { label: "ClusterVis", fActionNode: this._fActionNodeNE_CV.bind(this), fActionEdge: this._fActionNotImplemented },
            { label: "Iris", fActionNode: this._fActionNodeNE_IC.bind(this), fActionEdge: this._fActionNotApplicable },
            { label: "Histogram", fActionNode: this._fActionNodeNE_HC.bind(this), fActionEdge: this._fActionNotImplemented },
            { label: "GlyphMatrix", fActionNode: this._fActionNodeNE_GM.bind(this), fActionEdge: this._fActionEdgeNE_GM.bind(this) },
            { label: "New Query", fActionNode: this._fActionNodeNE_NQ.bind(this), fActionEdge: this._fActionNotImplemented }
        ]);
        this.setItemsContextMenu(this.DS_ClusterVis, [
            // { label: "NodeEdge", fActionNode: _fActionNotImplemented },
            { label: "ClusterVis", fActionNode: this._fActionNodeCV_CV.bind(this) },
            { label: "Iris", fActionNode: this._fActionNodeCV_IC.bind(this) },
            { label: "Histogram", fActionNode: this._fActionNodeNE_HC.bind(this) },
            { label: "GlyphMatrix", fActionNode: this._fActionNodeCV_GM.bind(this) },
            { label: "List of Papers", fActionNode: this._fActionNodeCV_PL.bind(this) },
            { label: "New Query", fActionNode: this._fActionNodeCV_NQ.bind(this), fActionEdge: this._fActionNotImplemented }
        ]);
        this.setItemsContextMenu(this.DS_Iris, [
            { label: "NodeEdge", fActionNode: this._fActionNotImplemented.bind(this) },
            { label: "ClusterVis", fActionNode: this._fActionNodeIC_CV.bind(this) },
            { label: "Iris", fActionNode: this._fActionNodeIC_IC.bind(this) },
            { label: "GlyphMatrix", fActionNode: this._fActionNodeIC_GM.bind(this) },
            { label: "Histogram", fActionNode: this._fActionNodeIC_HC.bind(this) },
            { label: "List of Papers", fActionNode: this._fActionNodeIC_PLOnName.bind(this) }
        ]);
        this.setItemsContextMenu(this.DS_GlyphMatrix, [
            // { label: "NodeEdge", fActionNode: _fActionNotImplemented },
            { label: "ClusterVis", fActionNode: this._fActionNodeGM_CV.bind(this) },
            { label: "Iris", fActionNode: this._fActionNodeGM_IC.bind(this) },
            { label: "GlyphMatrix", fActionNode: this._fActionNodeGM_GM.bind(this) },
            { label: "Histogram", fActionNode: this._fActionNodeNE_HC.bind(this) },
            { label: "List of Papers", fActionNode: this._fActionNodeGM_PL.bind(this) }
        ]);
        this.setItemsContextMenu(this.DS_Iris_Solo, [
            { label: "Iris", fActionNode: this._fActionNodeIC_IC_SameView.bind(this) }
        ]);
        this.setItemsContextMenu(this.DS_Papers_List, [
            // { label: "List of Papers", fActionNode: this._fActionNodeIC_PL.bind(this) },
            // { label: "Histogram", fActionNode: this._fActionNodeIC_HCCluster.bind(this) },
            { label: "New Query", fActionNode: this._fActionNodeLP_NQ.bind(this), fActionEdge: this._fActionNotImplemented }
        ]);
        if (this._canNodeRedirectCorese) {
            this.setItemsContextMenu(this.DS_NodeEdge_HAL, [
                // { label: "NodeEdge", fActionNode: _fActionNotImplemented, fActionEdge: _fActionNotImplemented },
                { label: "ClusterVis", fActionNode: this._fActionNodeNE_CV.bind(this), fActionEdge: this._fActionNotImplemented },
                { label: "Iris", fActionNode: this._fActionNodeNE_IC.bind(this), fActionEdge: this._fActionNotApplicable.bind(this) },
                { label: "GlyphMatrix", fActionNode: this._fActionNodeNE_GM.bind(this), fActionEdge: this._fActionEdgeNE_GM.bind(this) },
                { label: "Histogram", fActionNode: this._fActionNodeNE_HC.bind(this), fActionEdge: this._fActionNotImplemented },
                { label: "List of Papers", fActionNode: this._fActionNodeNE_PL.bind(this), fActionEdge: this._fActionEdgeNE_PL.bind(this) },
                // { label: "Corese Browser", fActionNode: this._fActionNodeNE_CI.bind(this), fActionEdge: _fActionNotImplemented },
                // {
                //     label: "New Query", fActionNode: _fActionNodeNE_NQ, fActionEdge: _fActionNotImplemented,
                //     styleSheet: _stylesheet, submenu: true
                // },
            ]);
        }
        else {
            this.setItemsContextMenu(this.DS_NodeEdge_HAL, [
                // { label: "NodeEdge", fActionNode: _fActionNotImplemented, fActionEdge: _fActionNotImplemented },
                { label: "ClusterVis", fActionNode: this._fActionNodeNE_CV.bind(this), fActionEdge: this._fActionNotImplemented },
                { label: "Iris", fActionNode: this._fActionNodeNE_IC.bind(this), fActionEdge: this._fActionNotApplicable },
                { label: "GlyphMatrix", fActionNode: this._fActionNodeNE_GM.bind(this), fActionEdge: this._fActionEdgeNE_GM.bind(this) },
                { label: "Histogram", fActionNode: this._fActionNodeNE_HC.bind(this), fActionEdge: this._fActionNotImplemented },
                { label: "List of Papers", fActionNode: this._fActionNodeNE_PL.bind(this), fActionEdge: this._fActionEdgeNE_PL.bind(this) },
                { label: "New Query", fActionNode: this._fActionNodeNE_NQ.bind(this), fActionEdge: this._fActionNotImplemented },
            ]);
        }
        this.setItemsContextMenu(this.DS_ClusterVis_HAL, [
            // { label: "NodeEdge", fActionNode: _fActionNotImplemented },
            { label: "ClusterVis", fActionNode: this._fActionNodeCV_CV.bind(this) },
            { label: "Iris", fActionNode: this._fActionNodeCV_IC.bind(this) },
            { label: "GlyphMatrix", fActionNode: this._fActionNodeCV_GM.bind(this) },
            { label: "Histogram", fActionNode: this._fActionNodeCV_HC.bind(this) },
            { label: "List of Papers", fActionNode: this._fActionNodeCV_PL.bind(this) }
        ]);
    }
    async _fActionNotApplicable() {
        alert("Not applicable!!");
    }
    async _fActionNotImplemented() {
        alert("Not implemented!!");
    }
    //=======================
    // Actions GM: GlyphMatrix
    //=======================
    async _fActionNodeGM_CV(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.cluster);
    }
    //---------------
    async _fActionNodeGM_IC(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.iris);
    }
    //---------------
    async _fActionNodeGM_GM(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.glyphMatrix);
    }
    //---------------
    async _fActionNodeGM_PL(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.paperlist, false, undefined, true);
    }
    //=======================
    // Actions CV: ClusterVis
    //=======================
    async _fActionNodeCV_CV(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.cluster);
    }
    //---------------
    async _fActionNodeCV_IC(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.iris);
    }
    //---------------
    async _fActionNodeCV_GM(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.glyphMatrix);
    }
    //---------------
    async _fActionNodeCV_PL(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.paperlist, false, undefined, true);
    }
    //---------------
    async _fActionNodeCV_HC(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.histogram, false, undefined, true);
    }
    async _fActionNodeCV_NQ(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.followupQuery, false);
    }
    //---------------
    async _fActionNodeNE_CI(node, parentNode) {
        // const data = _subGraph.allPapersList(node, _data);              // Get a data structure that has url in it (for this test example)
        // const baseUrl = _stylesheet.browser.url
        // const uriUrl = node.labels[1]                                   // Url parameter for the redirection.
        // // Check if the clicked node is an URI and can be linked to the given browser
        // if (this.isURI(uriUrl)) {
        //     window.open(baseUrl + uriUrl);                              // Opens a new window with the given URL
        // } else {
        //     alert("Cette entitée ne posséde pas d'entrée en ligne")
        // }
    }
    //---------------
    async _fActionEdgeNE_PL(edge, parentNode) {
        this._showChart(edge, parentNode.id, state.typeChart.paperlist, false, undefined);
    }
    async _fActionNodeNE_CV(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.cluster, false, undefined);
    }
    //---------------
    async _fActionNodeNE_IC(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.iris, false);
    }
    //---------------
    async _fActionNodeNE_GM(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.glyphMatrix, false);
    }
    //---------------
    async _fActionNodeNE_PL(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.paperlist, false);
    }
    async _fActionNodeNE_HC(node, parentNode) {
        this._showChart(node, parentNode.id, state.typeChart.histogram, false);
    }
    async _fActionNodeNE_NQ(node, parentNode, parentChart) {
        this._showChart(node, parentNode.id, state.typeChart.followupQuery, false);
    }
    async _fActionEdgeNE_GM(edge, parentId) {
    }
    //=======================
    // Actions IC: Iris
    //=======================
    //---------------
    async _fActionNodeIC_CV(nodeIris, parentNode) {
        let vOrder = await parentNode.getVOrder();
        let sourceNode = await parentNode.getSourceObject();
        let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
        this._showChart(targetNode, parentNode.id, state.typeChart.cluster, true);
    }
    async _fActionNodeIC_IC(nodeIris, parentNode) {
        let vOrder = await parentNode.getVOrder();
        let sourceNode = await parentNode.getSourceObject();
        let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
        this._showChart(targetNode, parentNode.id, state.typeChart.iris, true, targetNode);
    }
    //---------------
    async _fActionNodeIC_GM(nodeIris, parentNode) {
        let vOrder = await parentNode.getVOrder();
        let sourceNode = await parentNode.getSourceObject();
        let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
        this._showChart(targetNode, parentNode.id, state.typeChart.glyphMatrix, true, targetNode);
    }
    async _fActionNodeIC_IC_SameView(nodeIris, parentNode) {
        let vOrder = await parentNode.getVOrder();
        let sourceNode = await parentNode.getSourceObject();
        let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
        this._showChart(targetNode, parentNode.id, state.typeChart.iris, true, targetNode);
    }
    //---------------
    async _fActionNodeIC_PL(nodeIris, parentNode) {
        let sourceNode = await parentNode.getSourceObject();
        this._showChart(sourceNode, parentNode.id, state.typeChart.paperlist, true);
    }
    //---------------
    async _fActionNodeIC_PLOnName(nodeIris, parentNode) {
        let vOrder = await parentNode.getVOrder();
        let node = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
        this._showChart(node, parentNode.id, state.typeChart.paperlist, false, undefined);
    }
    //---------------
    async _fActionNodeIC_HC(nodeIris, parentNode) {
        let vOrder = await parentNode.getVOrder();
        let sourceNode = await parentNode.getSourceObject();
        let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
        this._showChart(sourceNode, parentNode.id, state.typeChart.histogram, true, targetNode);
    }
    async _fActionNodeIC_HCCluster(nodeIris, parentNode) {
        let vOrder = await parentNode.getVOrder();
        let sourceNode = await parentNode.getSourceObject();
        let targetNode = await parentNode.dataVisToNode(vOrder[nodeIris.indexData]);
        this._showChart(targetNode, parentNode.id, state.typeChart.histogram, true, targetNode);
    }
    // Listing paper
    async _fActionNodeLP_NQ(node, parentNode, parentChart) {
        this._showChart(node, parentNode.id, state.typeChart.followupQuery, false);
    }
    /**
     * This function allows to create a new view from current view.
     * After create a new view , it will be added to the dashboard with a generated title
     */
    async _showChart(node, parentId, typeChart, isFromEdge = false, secondNode = null, isFromCluster = false, isFromHC = false, newQuery = null) {
        let title, chartNode, viewChild, link, convertData;
        var parentPosition = await this.getPosition();
        var childId = "chart-" + state.indexChart;
        let _viewChild = select(this._dashboard.shadowRoot.querySelector(".graph")).append("mge-view")
            .attr("x", parentPosition.x + 30)
            .attr("y", parentPosition.y + 30)
            .attr("dataset-name", "data-" + state.indexQueryData)
            .attr("type-vis", typeChart)
            .attr("id-view", childId);
        chartNode = await _viewChild.node().getChart();
        await chartNode.setData(node, state._data[this.datasetName], secondNode, isFromEdge, isFromCluster, isFromHC);
        convertData = await chartNode.setData();
        viewChild = _viewChild.node();
        if (newQuery)
            title = newQuery.name;
        else
            title = await this.generateTitle(node, convertData, typeChart, parentId, isFromEdge, secondNode, isFromCluster, isFromHC);
        await viewChild.setTitle(title);
        link = await this._dashboard._addLink(this.element, viewChild);
        await this._dashboard.addChart(parentId, {
            id: childId, title: title, typeChart: viewChild.typeVis, hidden: false,
            x: viewChild.x, y: viewChild.y, view: viewChild, link: link
        });
        await this._dashboard.refreshLinks();
        if (typeChart == state.typeChart.histogram) {
            if (node.cluster) {
                alert("Not implemented!!");
                return;
            }
        }
        return _viewChild;
    }
    componentDidRender() {
        this._inicContextMenu();
        this._initAction();
        this.selLinkPai = select(this._dashboard.shadowRoot.querySelector(".F-" + this.idView));
        this.selLinkFilhos = selectAll(this._dashboard.shadowRoot.querySelectorAll(".P-" + this.idView));
        this.selConect = select(this._dashboard.shadowRoot.querySelector("." + this.idView));
        this._position.x = this.x;
        this._position.y = this.y;
        this._center.cx = this._position.x + this._dimView.width / 2;
        this._center.cy = this._position.y + this._dimView.height / 2;
    }
    componentDidLoad() {
        this.viewDiv = select(this.element.shadowRoot.querySelector("#" + this.idView + "-g"))
            .attr("width", this.width)
            .attr("height", this.height)
            .style("left", this._position.x + "px")
            .style("top", this._position.y + "px")
            .style("position", "absolute")
            // .style("border-style", "groove")
            // .style("border-width", "0.5px")
            .style("box-shadow", "0 2px 4px rgb(0 0 0 / 20%")
            .on("mouseover", this._onMouseOverContent.bind(this))
            .on("mouseout", this._onMouseOutContent.bind(this));
        this.buildChart(this.viewDiv);
        this.mover = this.element.shadowRoot.querySelector("#" + this.idView + '-t');
        this.cont = this.element.shadowRoot.querySelector("#" + this.idView + "-g");
        this.dragElement(this.mover);
        this.setResizable();
    }
    render() {
        return (h(Host, null,
            h("div", { id: this.idView + "-g" },
                h("div", { class: "resizer resizer-i resizer-autohide" }),
                h("div", { class: "resizer resizer-r" }),
                h("div", { class: "resizer resizer-b" }))));
    }
};
__decorate([
    Element()
], MgeView.prototype, "element", void 0);
__decorate([
    Prop()
], MgeView.prototype, "width", void 0);
__decorate([
    Prop()
], MgeView.prototype, "height", void 0);
__decorate([
    Prop()
], MgeView.prototype, "typeVis", void 0);
__decorate([
    Prop()
], MgeView.prototype, "idView", void 0);
__decorate([
    Prop()
], MgeView.prototype, "datasetName", void 0);
__decorate([
    Prop()
], MgeView.prototype, "titleView", void 0);
__decorate([
    Prop()
], MgeView.prototype, "x", void 0);
__decorate([
    Prop()
], MgeView.prototype, "y", void 0);
__decorate([
    Prop()
], MgeView.prototype, "idDash", void 0);
__decorate([
    Watch("x")
], MgeView.prototype, "validateName", null);
__decorate([
    Watch("height"),
    Watch("width")
], MgeView.prototype, "updateDimview", null);
__decorate([
    Prop({ mutable: true })
], MgeView.prototype, "_center", void 0);
__decorate([
    Prop({ mutable: true })
], MgeView.prototype, "_position", void 0);
__decorate([
    Prop({ mutable: true })
], MgeView.prototype, "_barTitleHeight", void 0);
__decorate([
    Prop({ mutable: true })
], MgeView.prototype, "_dimView", void 0);
__decorate([
    Prop({ mutable: true })
], MgeView.prototype, "_top", void 0);
__decorate([
    Prop({ mutable: true })
], MgeView.prototype, "_content", void 0);
__decorate([
    Prop({ mutable: true })
], MgeView.prototype, "_filter", void 0);
__decorate([
    Prop({ mutable: true })
], MgeView.prototype, "_chart", void 0);
__decorate([
    Prop({ mutable: true })
], MgeView.prototype, "viewDiv", void 0);
__decorate([
    Method()
], MgeView.prototype, "_refreshBarTitle", null);
__decorate([
    Method()
], MgeView.prototype, "generateTitle", null);
__decorate([
    Method()
], MgeView.prototype, "getChart", null);
__decorate([
    Method()
], MgeView.prototype, "setCenter", null);
__decorate([
    Method()
], MgeView.prototype, "getCenter", null);
__decorate([
    Method()
], MgeView.prototype, "idChart", null);
__decorate([
    Method()
], MgeView.prototype, "refresh", null);
__decorate([
    Method()
], MgeView.prototype, "setTitle", null);
__decorate([
    Method()
], MgeView.prototype, "setVisible", null);
__decorate([
    Method()
], MgeView.prototype, "setPosition", null);
__decorate([
    Method()
], MgeView.prototype, "getPosition", null);
__decorate([
    Method()
], MgeView.prototype, "_showChart", null);
MgeView = __decorate([
    Component({
        tag: 'mge-view',
        styleUrl: 'mge-view.css',
        shadow: true,
    })
], MgeView);
export { MgeView };
