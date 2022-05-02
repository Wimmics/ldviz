# mge-view



<!-- Auto Generated Below -->


## Properties

| Property          | Attribute           | Description                                                                     | Type                                 | Default                     |
| ----------------- | ------------------- | ------------------------------------------------------------------------------- | ------------------------------------ | --------------------------- |
| `_barTitleHeight` | `_bar-title-height` | Title bar height                                                                | `number`                             | `15`                        |
| `_center`         | --                  | View center point                                                               | `{ cx: number; cy: number; }`        | `{ cx: 0, cy: 0 }`          |
| `_chart`          | `_chart`            | Chart associated with view                                                      | `any`                                | `undefined`                 |
| `_content`        | `_content`          | Div that represents the content includes chart of a view                        | `any`                                | `undefined`                 |
| `_dimView`        | --                  | View dimensions                                                                 | `{ width: number; height: number; }` | `{ width: 10, height: 10 }` |
| `_filter`         | `_filter`           | Div that represents the filter panel of a view                                  | `any`                                | `undefined`                 |
| `_position`       | --                  | View current position                                                           | `{ x: number; y: number; }`          | `{ x: 0, y: 0}`             |
| `_top`            | `_top`              | Div that represents the header part of a view                                   | `any`                                | `undefined`                 |
| `datasetName`     | `dataset-name`      | The dataset name being used                                                     | `string`                             | `"[]"`                      |
| `height`          | `height`            | represents the height of the view displayed by the window                       | `number`                             | `400`                       |
| `idDash`          | `id-dash`           | Id of dashboard which is containing this view                                   | `string`                             | `undefined`                 |
| `idView`          | `id-view`           | represents ID of the view                                                       | `string`                             | `undefined`                 |
| `titleView`       | `title-view`        | The title of the view                                                           | `string`                             | `"[]"`                      |
| `typeVis`         | `type-vis`          | represents type of visualization technique displayed via content of the view    | `string`                             | `undefined`                 |
| `viewDiv`         | `view-div`          | Div that represents the view included                                           | `any`                                | `undefined`                 |
| `width`           | `width`             | represents the width of the view displayed by the window                        | `number`                             | `400`                       |
| `x`               | `x`                 | x-coordinate (The horizontal value in a pair of coordinates) of view's position | `number`                             | `0`                         |
| `y`               | `y`                 | y-coordinate (The vertical value in a pair of coordinates) of view's position   | `number`                             | `0`                         |


## Methods

### `_refreshBarTitle() => Promise<void>`

Refresh bar title width when we resize the windown

#### Returns

Type: `Promise<void>`



### `_showChart(node: any, parentId: any, view: any, isFromEdge?: boolean, secondNode?: any, isFromCluster?: boolean, isFromHC?: boolean) => Promise<any>`

This function allows to create a new view from current view.
After create a new view , it will be added to the dashboard with a generated title
view: information on view to be created (from state)

#### Returns

Type: `Promise<any>`



### `getCenter() => Promise<{ cx: number; cy: number; }>`

Get current center position of the view

#### Returns

Type: `Promise<{ cx: number; cy: number; }>`



### `getChart() => Promise<any>`

Get the selection of the visualization technique element which containing in this view

#### Returns

Type: `Promise<any>`



### `getPosition() => Promise<{ x: number; y: number; }>`

Get current position of the view

#### Returns

Type: `Promise<{ x: number; y: number; }>`



### `idChart() => Promise<string>`

Get ID of the view

#### Returns

Type: `Promise<string>`



### `refresh() => Promise<void>`

this function allows to Refresh position of the view

#### Returns

Type: `Promise<void>`



### `setCenter(x: any, y: any) => Promise<void>`

Set new center point for the view
Inputs are coordinates (x and y) of new center position

#### Returns

Type: `Promise<void>`



### `setDatasetName(value: any) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setPosition(x: any, y: any) => Promise<void>`

Set new position for the view
Inputs are coordinates : x and y

#### Returns

Type: `Promise<void>`



### `setTitle(_: any) => Promise<void>`

This function allows to set new title for the view

#### Returns

Type: `Promise<void>`



### `setVisible(status: any) => Promise<void>`

Set visible for all contents in view
if input status is true, the content wil be visible
if input status is false, the content will be hidden

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
