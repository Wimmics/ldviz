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

function matrixCell(data, glyph, indexAttrTitle) {
        let _data = data,
            _glyph = glyph,
            _indexAttrTitle = indexAttrTitle,
            _divTooltip = null,
            _svgTooltip = null;

        let objMatrixGlyphCell = {};

        objMatrixGlyphCell.create = function (divTooltip, cell, event) {
            let height = 190,
                width,
                attNodeSrc, attNodeTgt, widthSrc, widthTgt,
                grpGlyphTooltip;

            if (_indexAttrTitle >= 1000) {
                attNodeSrc = _data.nodes.dataNodes[cell.x].values[_indexAttrTitle - 1000];
                attNodeTgt = _data.nodes.dataNodes[cell.y].values[_indexAttrTitle - 1000];
            } else {
                attNodeSrc = _data.nodes.dataNodes[cell.x].labels[_indexAttrTitle];
                attNodeTgt = _data.nodes.dataNodes[cell.y].labels[_indexAttrTitle];
            }

            widthSrc = 270;
            widthTgt = 270;


            if (widthSrc > widthTgt)
                width = widthSrc;
            else
                width = widthTgt;

            if (width < 130)
                width = 130;

            _divTooltip = divTooltip;

            _svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", height);

            //----- Edge Icon
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

            grpGlyphTooltip = _svgTooltip.append("g")
                .attr("transform", "translate(0,60)");

            _glyph.calcScaleTooltip(width, 100); // Tooltip height and diameter
            _glyph.drawTooltip(grpGlyphTooltip, cell);

            _divTooltip.style("top", (event.layerY + 20) + "px")
                .style("left", event.layerX + "px")
                .style("display", "block");

        };

        objMatrixGlyphCell.remove = function () {
            _divTooltip.style("display", "none");
            _svgTooltip.remove();
            _svgTooltip = null;
        };

        return objMatrixGlyphCell;
    };

export {matrixCell}