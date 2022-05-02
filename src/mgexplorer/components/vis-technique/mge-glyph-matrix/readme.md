# mge-glyph-matrix



<!-- Auto Generated Below -->


## Properties

| Property            | Attribute             | Description                                                             | Type     | Default           |
| ------------------- | --------------------- | ----------------------------------------------------------------------- | -------- | ----------------- |
| `_cellCoordScale`   | `_cell-coord-scale`   | Scale is used to determine the coordinates of cells and legend elements | `any`    | `scaleBand()`     |
| `_cellGlyph`        | `_cell-glyph`         | keeps data on the different types of documents (attributes)             | `any`    | `NumericGlyph(0)` |
| `_dragListenerL`    | `_drag-listener-l`    | Listener of legends                                                     | `any`    | `null`            |
| `_dragListenerM`    | `_drag-listener-m`    | Listener of Matrix                                                      | `any`    | `null`            |
| `_grpBarsLL`        | `_grp-bars-l-l`       | Select with all groups from left side legend bar                        | `any`    | `null`            |
| `_grpBarsTL`        | `_grp-bars-t-l`       | Select with all groups from top side legend bar                         | `any`    | `null`            |
| `_grpLeftLegend`    | `_grp-left-legend`    | Select with left side legend bar                                        | `any`    | `null`            |
| `_grpLines`         | `_grp-lines`          | Contains lines with cells in each line                                  | `any`    | `null`            |
| `_grpMatrix`        | `_grp-matrix`         | Select with matrix chart                                                | `any`    | `null`            |
| `_grpMatrixGlyph`   | `_grp-matrix-glyph`   | keeps data on the different types of documents (attributes)             | `any`    | `null`            |
| `_grpOverview`      | `_grp-overview`       | The group represents the matrix overview                                | `any`    | `null`            |
| `_grpTopLegend`     | `_grp-top-legend`     | Select with top side legend bar                                         | `any`    | `null`            |
| `_idClipLeft`       | `_id-clip-left`       | Left legend clipping area id                                            | `any`    | `undefined`       |
| `_idClipMatrix`     | `_id-clip-matrix`     | Matrix clipping area id                                                 | `any`    | `undefined`       |
| `_idClipTop`        | `_id-clip-top`        | Top legend clipping area id                                             | `any`    | `undefined`       |
| `_indexAttrLegend`  | `_index-attr-legend`  | The index of the attribute will be printed in the legend (node)         | `number` | `0`               |
| `_indexAttrSort`    | `_index-attr-sort`    | Attribute index used for sorting                                        | `number` | `0`               |
| `_matrixGlyphPanel` | `_matrix-glyph-panel` | Group represents the entire chart                                       | `any`    | `null`            |
| `_matrixHeight`     | `_matrix-height`      | Matrix area height (calculated)                                         | `number` | `0`               |
| `_matrixWidth`      | `_matrix-width`       | Matrix area width (calculated)                                          | `number` | `0`               |
| `_overviewScale`    | `_overview-scale`     | Scale is used to set the coordinates of the overview cursor             | `any`    | `scaleLinear()`   |
| `_vOrder`           | `_v-order`            | Indirect ordering vector                                                | `any`    | `null`            |
| `datasetName`       | `dataset-name`        | The dataset name being used                                             | `string` | `"[]"`            |
| `height`            | `height`              | represents the height of the matrix chart                               | `number` | `350`             |
| `width`             | `width`               | represents the width of the matrix chart                                | `number` | `350`             |


## Events

| Event       | Description | Type               |
| ----------- | ----------- | ------------------ |
| `idevent`   |             | `CustomEvent<any>` |
| `testevent` |             | `CustomEvent<any>` |


## Methods

### `_calcHeightCell() => Promise<any>`

_calcHeightCell

Calculate cell height/width. So is the comment bar

#### Returns

Type: `Promise<any>`



### `_calcVisibleLines() => Promise<void>`

_calcVisibleLines

Determines limits for visible lines

#### Returns

Type: `Promise<void>`



### `_limCoord(coord: any) => Promise<any>`

_limCoord

Limit the coordinate value

#### Returns

Type: `Promise<any>`



### `_onMouseEnterNode(event: any, d: any) => Promise<void>`

_onMouseOverNode

#### Returns

Type: `Promise<void>`



### `_onMouseLeaveNode(event: any, d: any) => Promise<void>`

_onMouseOutNode

#### Returns

Type: `Promise<void>`



### `acChangeAttrLegend(_: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `acChangeVisibleLines(qtLines: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `acSortExec(_: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `addMatrixGlyph(idDiv: any, divTag: any) => Promise<void>`

The initial function to create all of elements in the Matrix Glyph chart
In this function, it will set Geometric attributes of the graph
create actions on graph and manage all of the interaction on the graph

#### Returns

Type: `Promise<void>`



### `cellColorsMap(colors: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `debug() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getMaxVisibleLines() => Promise<number>`



#### Returns

Type: `Promise<number>`



### `getMinVisibleLines() => Promise<number>`



#### Returns

Type: `Promise<number>`



### `getVisibleLines() => Promise<number>`



#### Returns

Type: `Promise<number>`



### `glyph(_: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `indexAttrCellColor(_: any) => Promise<number>`



#### Returns

Type: `Promise<number>`



### `indexAttrLegend(_: any) => Promise<number>`



#### Returns

Type: `Promise<number>`



### `indexAttrSort(_: any) => Promise<number>`



#### Returns

Type: `Promise<number>`



### `pFontHeight(_: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `pLegendWidth(_: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `setBox(_: any) => Promise<any>`

Set box size for the chart includes the content
input is a object includes height and width
If no arguments, It will return the value of box

#### Returns

Type: `Promise<any>`



### `setData(_: any, globalData: any) => Promise<any>`

This function is to set the data to the chart
If no arguments, It will return the value of data

#### Returns

Type: `Promise<any>`



### `setPanel(_: any) => Promise<any>`

This function is required in all techniques
It is called internally in conectChart

#### Returns

Type: `Promise<any>`



### `setTTMatrixCell(_: any) => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
