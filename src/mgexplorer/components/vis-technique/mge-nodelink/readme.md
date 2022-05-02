# mge-nodelink



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description                                       | Type     | Default     |
| ----------------- | ------------------- | ------------------------------------------------- | -------- | ----------- |
| `_grpNodeEdge`    | `_grp-node-edge`    | The group represents the entire graphic           | `any`    | `null`      |
| `_nodeEdgeLegend` | `_node-edge-legend` | Represents the legend associated with the graphic | `any`    | `null`      |
| `_nodeEdgePanel`  | `_node-edge-panel`  | Represents the panel associated with the graphic  | `any`    | `null`      |
| `_view`           | `_view`             |                                                   | `any`    | `undefined` |
| `datasetName`     | `dataset-name`      | The dataset name being used                       | `string` | `"[]"`      |
| `height`          | `height`            | represents the height of the nodelinks chart      | `number` | `350`       |
| `width`           | `width`             | represents the width of the nodelinks chart       | `number` | `350`       |


## Events

| Event       | Description                              | Type               |
| ----------- | ---------------------------------------- | ------------------ |
| `idevent`   | Action to send id of view                | `CustomEvent<any>` |
| `testevent` | Action to send data to object annotation | `CustomEvent<any>` |


## Methods

### `acChangeAttrSize(atributo: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `acChangeCharge(value: any) => Promise<void>`

This function will change the value of charge on force layout. This function will be called when adjust Charge slider in filter panel

#### Returns

Type: `Promise<void>`



### `acChangeGravity(value: any) => Promise<void>`

This function will change the value of gravity on force layout. This function will be called when adjust Gravity slider in filter panel

#### Returns

Type: `Promise<void>`



### `acChangeLinkDistance(value: any) => Promise<void>`

This function will change the value of links distance on force layout. This function will be called when adjust LinkDistance slider in filter panel

#### Returns

Type: `Promise<void>`



### `acSelectByName(nome: any) => Promise<void>`

This function will hightlight node and all related links by name of selected node. This function will be called when used text search in filter panel

#### Returns

Type: `Promise<void>`



### `acSelectByNameCluster(nomeCluster: any) => Promise<void>`

This function will hightlight all nodes in a cluster. This function will be called when used text search in filter panel

#### Returns

Type: `Promise<void>`



### `addNodeLinkChart(idDiv: any, divTag: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getCharge() => Promise<any>`

This function will get the `charge` attribute of force layout in node-links chart

#### Returns

Type: `Promise<any>`



### `getColorBreaks() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `getColorScale() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `getGravity() => Promise<any>`

This function will get the `gravity` attribute of force layout in node-links chart

#### Returns

Type: `Promise<any>`



### `getLinkDistance() => Promise<any>`

This function will get the `distance` attribute of links in force layout in node-links chart

#### Returns

Type: `Promise<any>`



### `getQtEdges() => Promise<any>`

This function will get the total number of edges

#### Returns

Type: `Promise<any>`



### `getQtNodes() => Promise<any>`

This function will get the total number of nodes

#### Returns

Type: `Promise<any>`



### `indexAttrSize(_: any) => Promise<number>`

Changes the attribute that will be used to map the size

#### Returns

Type: `Promise<number>`



### `resetHighSearch() => Promise<void>`

This function will remove hightlight effect on all of nodes and links. This function will be called when clear text inside text search

#### Returns

Type: `Promise<void>`



### `setBox(_: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `setData(_: any, globalData: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `setLegend(_: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `setPanel(_: any) => Promise<any>`



#### Returns

Type: `Promise<any>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
