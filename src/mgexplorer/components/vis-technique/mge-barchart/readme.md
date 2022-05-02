# mge-barchart



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description                                                                | Type     | Default     |
| ---------------- | ------------------ | -------------------------------------------------------------------------- | -------- | ----------- |
| `_barPanel`      | `_bar-panel`       | represents the panel associated with the graph                             | `any`    | `undefined` |
| `_cfgIndexAttr`  | `_cfg-index-attr`  | Contains the indexes of the attributes that can be configured in the graph | `any`    | `undefined` |
| `_colorsBars`    | `_colors-bars`     | colors for the different types                                             | `any`    | `undefined` |
| `_documentTypes` | `_document-types`  | keeps data on the different types of documents (attributes)                | `any`    | `undefined` |
| `_grpHistogram`  | `_grp-histogram`   | Group representing Histogram                                               | `any`    | `undefined` |
| `_histogramData` | `_histogram-data`  | keeps the count of documents per year and type                             | `any`    | `undefined` |
| `_innerRadius`   | `_inner-radius`    | (calculated) radius of the circle where the centroid is inserted           | `any`    | `undefined` |
| `_maxHeightBar`  | `_max-height-bar`  | (calculated) distance occupied by the bars                                 | `any`    | `undefined` |
| `_nbOfTypesDoc`  | `_nb-of-types-doc` | Number of types of documents in the base                                   | `any`    | `undefined` |
| `_outerRadius`   | `_outer-radius`    | (calculated) Outernal circle radius where the graph is drawn               | `any`    | `undefined` |
| `_vOrder`        | `_v-order`         | Indirect ordering vector                                                   | `any`    | `undefined` |
| `datasetName`    | `dataset-name`     | The dataset name being used                                                | `string` | `"[]"`      |
| `height`         | `height`           | represents the height of the Histogram chart                               | `number` | `350`       |
| `width`          | `width`            | represents the width of the Histogram chart                                | `number` | `350`       |


## Methods

### `acSortExecAttribute() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `acSortExecText() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `dataVisToNode(index: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `getSourceObject() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `setBox(_: any) => Promise<any>`

Set box size for the chart includes the content
input is a object includes height and width
If no arguments, It will return the value of box

#### Returns

Type: `Promise<any>`



### `setData(_: any, globalData: any, secondNode: any, isFromEdge?: boolean, isFromCluster?: boolean, isFromHC?: boolean) => Promise<any>`

This function is to set the data to the chart
If no arguments, It will return the value of data

#### Returns

Type: `Promise<any>`



### `setIndexAttrBar(_: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `setPanel(_: any) => Promise<any>`

This function is required in all techniques
It is called internally in conectChart

#### Returns

Type: `Promise<any>`



### `setpMaxHeightBar(_: any) => Promise<any>`



#### Returns

Type: `Promise<any>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
