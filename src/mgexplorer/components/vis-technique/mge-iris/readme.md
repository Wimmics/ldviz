# mge-iris



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description                                                                         | Type     | Default     |
| ----------------- | ------------------- | ----------------------------------------------------------------------------------- | -------- | ----------- |
| `_cfgIndexAttr`   | `_cfg-index-attr`   | Contains the indexes of the attributes that can be configured in the graph          | `any`    | `undefined` |
| `_colorsBars`     | `_colors-bars`      | colors for the different types                                                      | `any`    | `undefined` |
| `_dataVis`        | `_data-vis`         | Vector of visible data. Points to the elements of model.data                        | `any`    | `undefined` |
| `_fishEyeArea`    | `_fish-eye-area`    | Contains the attribute of the fish eye area                                         | `any`    | `undefined` |
| `_focusArea`      | `_focus-area`       | Contains the attribute of the focused area                                          | `any`    | `undefined` |
| `_grpBars`        | `_grp-bars`         | Selection that contains all groups of bars                                          | `any`    | `undefined` |
| `_grpIris`        | `_grp-iris`         | Group representing IRIS                                                             | `any`    | `undefined` |
| `_hiddenArea`     | `_hidden-area`      | Contains the attribute of the hidden area                                           | `any`    | `undefined` |
| `_indexFirstData` | `_index-first-data` | Index in the "dataVis" vector where the first element of the data vector is located | `any`    | `undefined` |
| `_innerRadius`    | `_inner-radius`     | (calculated) radius of the circle where the centroid is inserted                    | `any`    | `undefined` |
| `_irisPanel`      | `_iris-panel`       | The dataset name being used                                                         | `any`    | `undefined` |
| `_maxHeightBar`   | `_max-height-bar`   | (calculated) distance occupied by the bars                                          | `any`    | `undefined` |
| `_minArea`        | `_min-area`         | Contains the attribute of the minimum area                                          | `any`    | `undefined` |
| `_nbOfTypesDoc`   | `_nb-of-types-doc`  | number of types of documents in the base                                            | `any`    | `undefined` |
| `_numMaxBars`     | `_num-max-bars`     | Maximum number of the bars                                                          | `any`    | `undefined` |
| `_numTotalBars`   | `_num-total-bars`   | Total number of the bars                                                            | `any`    | `undefined` |
| `_orders`         | `_orders`           | The orders of typesDocs                                                             | `any`    | `undefined` |
| `_outerRadius`    | `_outer-radius`     | (calculated) Outernal circle radius where the graph is drawn                        | `any`    | `undefined` |
| `_pDesloc`        | `_p-desloc`         | Percentage of center displacement                                                   | `any`    | `undefined` |
| `_vOrder`         | `_v-order`          | Indirect ordering vector                                                            | `any`    | `undefined` |
| `datasetName`     | `dataset-name`      | The dataset name being used                                                         | `string` | `"[]"`      |
| `height`          | `height`            | represents the height of the Iris chart                                             | `number` | `350`       |
| `width`           | `width`             | represents the width of the Iris chart                                              | `number` | `350`       |


## Methods

### `_getTheRightOrder(i: any) => Promise<any>`

_getTheRightOrder

Returns the order in which we need to display the types of documents

#### Returns

Type: `Promise<any>`



### `acSortExecAttribute(ascending: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `acSortExecText() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `acSortExecType() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `addIrisChart(idDiv: any, divTag: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `dataVisToNode(index: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `getSourceObject() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `getVOrder() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `putBarsOnIris() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setBox(_: any) => Promise<any>`

Set box size for the chart includes the content
input is a object includes height and width
If no arguments, It will return the value of box

#### Returns

Type: `Promise<any>`



### `setConfigCentroid(titulo: any, tituloGrau: any, textoBarra: any) => Promise<void>`

Configure the data that will be printed in the centroid and the text of the bar (Label only)

#### Returns

Type: `Promise<void>`



### `setData(_: any, globalData: any) => Promise<any>`



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



### `setpInnerRadius(_: any) => Promise<any>`

Set value of Percentage relative to graph width for _innerRadius calculation
If no arguments, It will return the value of pInnerRadius

#### Returns

Type: `Promise<any>`



### `setpMaxHeightBar(_: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `setpOuterRadius(_: any) => Promise<any>`

Set value of Percentage relative to graph width for _OuterRadius calculation
If no arguments, It will return the value of pOuterRadius

#### Returns

Type: `Promise<any>`



### `updateTextSize() => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
