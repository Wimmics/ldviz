# mge-clustervis



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description                                                  | Type      | Default     |
| ------------------ | -------------------- | ------------------------------------------------------------ | --------- | ----------- |
| `_clusterVisPanel` | `_cluster-vis-panel` | Represents the panel associated with the graphic             | `any`     | `null`      |
| `_drawLine`        | `_draw-line`         | Generator of splines that makes up the edges                 | `any`     | `undefined` |
| `_grpBars`         | `_grp-bars`          | Selection that contains all groups that store the bars       | `any`     | `null`      |
| `_grpCluster`      | `_grp-cluster`       | Group representing ClusterVis                                | `any`     | `null`      |
| `_grpLinks`        | `_grp-links`         | Selection that contains all groups that store the links      | `any`     | `null`      |
| `_grpRings`        | `_grp-rings`         | Selection that contains all groups that store the rings      | `any`     | `null`      |
| `_innerRadius`     | `_inner-radius`      | (calculated) Internal circle radius where the graph is drawn | `number`  | `0`         |
| `_links`           | `_links`             | Selection that contains the links                            | `any`     | `null`      |
| `_outerRadius`     | `_outer-radius`      | (calculated) Outernal circle radius where the graph is drawn | `number`  | `0`         |
| `_sameScale`       | `_same-scale`        | Indicates that the same scale should be used for all bars    | `boolean` | `false`     |
| `_xClusterCenter`  | `_x-cluster-center`  | Coordinate x of the center of the cluster                    | `number`  | `0`         |
| `_yClusterCenter`  | `_y-cluster-center`  | Coordinate y of the center of the cluster                    | `number`  | `0`         |
| `datasetName`      | `dataset-name`       | The dataset name being used                                  | `string`  | `"[]"`      |
| `height`           | `height`             | represents the height of the Cluster chart                   | `number`  | `350`       |
| `width`            | `width`              | represents the width of the Cluster chart                    | `number`  | `350`       |


## Events

| Event       | Description | Type               |
| ----------- | ----------- | ------------------ |
| `idevent`   |             | `CustomEvent<any>` |
| `testevent` |             | `CustomEvent<any>` |


## Methods

### `_angleToWidth(angle: any, radius: any) => Promise<number>`

_angleToWidth

Calculates the sector width from the angle and a radius
E: width, radius
S: angle in degrees

#### Returns

Type: `Promise<number>`



### `_calcCoordinates(dataNodes: any) => Promise<void>`

_calcCoordinates

Calculates the coordinates of the leaf nodes

#### Returns

Type: `Promise<void>`



### `_calcGeometry(data: any) => Promise<void>`

_calcGeometry

Calculates all geometric parameters for ClusterVis display

#### Returns

Type: `Promise<void>`



### `_getEdges(dados: any, nodes: any) => Promise<any[]>`

_getEdges

Generates a vector with the list of edges in the format: [ {source:Object, target: Object},...]

#### Returns

Type: `Promise<any[]>`



### `_getTree(heightTree: any, dados: any, degree: any, vOrder: any) => Promise<any>`

_getTree

Generates a tree in the format { id:..., chidren[] }

#### Returns

Type: `Promise<any>`



### `_updateMaxRings() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `_widthToAngle(width: any, radius: any) => Promise<number>`

_widthToAngle

Calculates the angle of the occupied sector by a width
E: width, radius
S: angle in degrees

#### Returns

Type: `Promise<number>`



### `acAlteraAnel(indexAnel: any, indexAttr: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `acSameScale(checked: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `acSortExec(_: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `addAttribute(_indexAttr: any, _typeAttr: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `addClusterChart(idDiv: any, divTag: any) => Promise<void>`

The initial function to create all of elements in the cluster chart
In this function, it will set Geometric attributes of the graph
create actions on graph and manage all of the interaction on the graph

#### Returns

Type: `Promise<void>`



### `alteraAttribute(_indexAnel: any, _indexAttr: any, _typeAttr: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `indexAttrSort(_: any) => Promise<number>`



#### Returns

Type: `Promise<number>`



### `obtemRings() => Promise<any[]>`



#### Returns

Type: `Promise<any[]>`



### `removeAnelExterno() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setBox(_: any) => Promise<any>`



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



### `setpInnerRadius(_: any) => Promise<any>`

Set value of Percentage relative to graph width for _innerRadius calculation
If no arguments, It will return the value of pInnerRadius

#### Returns

Type: `Promise<any>`



### `setpOuterRadius(_: any) => Promise<any>`

Set value of Percentage relative to graph width for _OuterRadius calculation
If no arguments, It will return the value of pOuterRadius

#### Returns

Type: `Promise<any>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
