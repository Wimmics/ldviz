# mge-query



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                                       | Type                                          | Default                                |
| -------------- | --------------- | ------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| `_dashboard`   | `_dashboard`    | represents the current dashboard                  | `any`                                         | `undefined`                            |
| `_view`        | `_view`         | represents the view includes this follow-up query | `any`                                         | `undefined`                            |
| `cloneStatus`  | --              |                                                   | `{ isClone: boolean; isFirstTime: boolean; }` | `{isClone: false, isFirstTime: false}` |
| `data`         | --              |                                                   | `any[]`                                       | `[]`                                   |
| `form`         | `form`          |                                                   | `any`                                         | `null`                                 |
| `globalParams` | `global-params` | Represents the panel associated with the graphic  | `any`                                         | `null`                                 |
| `height`       | `height`        |                                                   | `number`                                      | `350`                                  |
| `queriesList`  | `queries-list`  | List of predifined queries                        | `any`                                         | `null`                                 |
| `query`        | `query`         | represents the current selected query             | `any`                                         | `undefined`                            |
| `width`        | `width`         |                                                   | `number`                                      | `350`                                  |


## Methods

### `cloneQuery() => Promise<void>`

Clone function will be call to create a new clone component
This function will be run after click clone button

#### Returns

Type: `Promise<void>`



### `displayGraphics() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setBox(box: any) => Promise<void>`

Set box size for the chart includes the content
input is a object includes height and width

#### Returns

Type: `Promise<void>`



### `setClone() => Promise<void>`

Set type of follow-up query to clone follow-up query
It will update value in cloneStatus of element

#### Returns

Type: `Promise<void>`



### `setCloneData(query: any) => Promise<void>`

With clone follow-up query, this function will be clone all of data from parent element
variable isFirstTime of cloneStatus of this element will be changed to false after cloning data

#### Returns

Type: `Promise<void>`



### `setData(_: any, oldData: any) => Promise<any[]>`

This function is to set the data to the selected data from parent 
If no arguments, It will return the value of data

#### Returns

Type: `Promise<any[]>`



### `setInitial() => Promise<void>`

With initial query, this function will be set variable isInitial to true
This way will help to distinguish the initial point or a follow-up query

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name          | Description                                            |
| ------------- | ------------------------------------------------------ |
| `--font-size` | Size of text in this component. `14px` is the default. |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
