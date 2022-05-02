import * as d3 from "d3";

//--------------

function _addIconeEdge(svgTooltip) {
    svgTooltip.append("circle")
        .attr("cx", 21)
        .attr("cy", 9)
        .attr("r", 3)
        .style("fill", "blue");

    svgTooltip.append("line")
        .attr("x1", 21)
        .attr("y1", 9)
        .attr("x2", 9)
        .attr("y2", 26)
        .style("stroke", "blue");

    svgTooltip.append("circle")
        .attr("cx", 9)
        .attr("cy", 26)
        .attr("r", 3)
        .style("fill", "blue");
}

//---------- Public functions

function normalNodeTooltips (data, indexAttrTitle, vIndexAttr, stAdjacent) {
    let _data = data,
        _indexAttrTitle = indexAttrTitle,    // Index of the attribute that will be printed in the tooltip title
        _vIndexAttr = vIndexAttr,          // Vector with the index of the attributes that will be printed
        _stAdjacent = stAdjacent,          // String representing the meaning of adjacent nodes
        _divTooltip = null,
        _svgTooltip = null;
    let objNormal = {};

    objNormal.create = function (divTooltip, node, event) {
        let y = 54,
            height = 50,
            width;

        width = 22 + node.labels[_indexAttrTitle].length * 7;

        if (width < 90)
            width = 90;
        _divTooltip = divTooltip;
        _svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", height);
        _svgTooltip.append("text")      // Title
            .attr("x", 5)
            .attr("y", 12)
            .text(node.labels[_indexAttrTitle]);

        _svgTooltip.append("text")    // n co-authors
            .attr("x", 5)
            .attr("y", 26)
            .text(node.grau + " " + _stAdjacent);

        let totalPubs = 0;
        // console.log(node)
        _vIndexAttr.forEach(d => {
            totalPubs += node.values[d > 1000 ? d - 1000 : d]
        })

        _svgTooltip.append("text")    // total n publications
            .attr("x", 5)
            .attr("y", 50)
            .text("Number of Items: " + totalPubs);

        _divTooltip.style("top", (event.layerY + 20) + "px")
            .style("left", (event.layerX + 5) + "px")
            .style("display", "block");

    };

    objNormal.remove = function () {
        _divTooltip.style("display", "none");
        _svgTooltip.remove();
        _svgTooltip = null;
    };

    return objNormal;
};

//------------------ Tooltip Normal Edge
function normalEdgeTooltips (data, indexAttrTitle, vIndexAttr) {
    let _data = data,
        _indexAttrTitle = indexAttrTitle,
        _vIndexAttr = vIndexAttr,
        _divTooltip = null,
        _svgTooltip = null;

    let objNormalEdge = {};

    objNormalEdge.create = function (divTooltip, edge) {
        let y = 54,
            attNodeSrc, attNodeTgt,
            height = _vIndexAttr.length * 14 + 49,
            width, widthSrc, widthTgt;

        if (_indexAttrTitle >= 1000) {
            attNodeSrc = edge.source.values[_indexAttrTitle - 1000];
            attNodeTgt = edge.target.values[_indexAttrTitle - 1000];
        } else {
            attNodeSrc = edge.source.labels[_indexAttrTitle];
            attNodeTgt = edge.target.labels[_indexAttrTitle];
        }

        widthSrc = 34 + attNodeSrc.length * 7;
        widthTgt = 22 + attNodeTgt.length * 7;

        if (widthSrc > widthTgt)
            width = widthSrc;
        else
            width = widthTgt;

        if (width < 90)
            width = 90;

        _divTooltip = divTooltip;

        _svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", height);

        //----- Edge icon
        _addIconeEdge(_svgTooltip);

        // --------------

        _svgTooltip.append("text")
            .attr("x", 34)
            .attr("y", 12)
            .text(attNodeSrc);

        _svgTooltip.append("text")
            .attr("x", 22)
            .attr("y", 30)
            .text(attNodeTgt);

        _vIndexAttr.forEach(function (d, i) {
            if (d >= 1000) {
                _svgTooltip.append("text")
                    .attr("x", 8)
                    .attr("y", i * 14 + y)
                    .text(_data.edges.valueTitle[d - 1000] + ": " + edge.values[d - 1000]);
            } else {
                _svgTooltip.append("text")
                    .attr("x", 8)
                    .attr("y", i * 14 + y)
                    .text(_data.edges.labelTitle[d] + ": " + edge.labels[d]);
            }
        });

        _divTooltip.style("top", (d3.event.layerY + 20) + "px")
            .style("left", d3.event.layerX + "px")
            .style("display", "block");
    };

    objNormalEdge.remove = function () {
        _divTooltip.style("display", "none");
        _svgTooltip.remove();
        _svgTooltip = null;
    };
    return objNormalEdge;
};


export {normalNodeTooltips, normalEdgeTooltips}