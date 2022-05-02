# mge-history



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description                                               | Type     | Default                                   |
| ------------------ | -------------------- | --------------------------------------------------------- | -------- | ----------------------------------------- |
| `_dashboard`       | `_dashboard`         | The parent dashboard                                      | `any`    | `undefined`                               |
| `_grpHistory`      | `_grp-history`       | Group representing history tree                           | `any`    | `null`                                    |
| `_grpNodes`        | `_grp-nodes`         | Group representing nodes in the tree                      | `any`    | `null`                                    |
| `_historydata`     | --                   |                                                           | `any[]`  | `[]`                                      |
| `_htdata`          | `_htdata`            |                                                           | `any`    | `undefined`                               |
| `_leftText`        | `_left-text`         | Distance from the text to the left coordinate of the node | `number` | `18`                                      |
| `_nodeMargin`      | `_node-margin`       | Margin css of the node                                    | `number` | `1`                                       |
| `_nodoHeight`      | `_nodo-height`       | Space height for each node without the margins            | `number` | `14`                                      |
| `_rectHeight`      | `_rect-height`       | The height symbol                                         | `number` | `this._nodoHeight - this._nodeMargin * 2` |
| `_treeLayout`      | `_tree-layout`       | The tree layout to stored tree data                       | `any`    | `tree().size([0, this._nodoHeight])`      |
| `_vNodes`          | --                   | Vector with objects of all nodes                          | `any[]`  | `[]`                                      |
| `height`           | `height`             | represents the height of the history panel                | `number` | `250`                                     |
| `historyTreePanel` | `history-tree-panel` | Represents the panel associated with the graphic          | `any`    | `null`                                    |
| `typeVis`          | `type-vis`           |                                                           | `string` | `undefined`                               |
| `width`            | `width`              | represents the width of the history panel                 | `number` | `350`                                     |


## Methods

### `addHistoryTreeChart(idDiv: any, divTag: any) => Promise<void>`

The initial function to create all of elements in the history treechart
In this function, it will set Geometric attributes of the graph
create actions on graph and manage all of the interaction on the graph

#### Returns

Type: `Promise<void>`



### `setBox(_: any) => Promise<any>`

Set box size for the chart includes the content
input is a object includes height and width
If no arguments, It will return the value of box

#### Returns

Type: `Promise<any>`



### `setData(_: any) => Promise<any>`

This function is to set the data to the chart
If no arguments, It will return the value of data

#### Returns

Type: `Promise<any>`



### `setTree(newTree: any) => Promise<void>`

This function is to set the data to the tree history data

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
