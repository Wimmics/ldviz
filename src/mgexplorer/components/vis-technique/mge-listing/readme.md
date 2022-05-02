# mge-listing



<!-- Auto Generated Below -->


## Properties

| Property               | Attribute                 | Description                                                   | Type       | Default                                        |
| ---------------------- | ------------------------- | ------------------------------------------------------------- | ---------- | ---------------------------------------------- |
| `_colorsRect`          | --                        | Colors for the different types                                | `string[]` | `["#1f77b4", "#2ca02c", "#d62728", "#ff7d0e"]` |
| `_data`                | `_data`                   | List of items in the data                                     | `any`      | `null`                                         |
| `_grpPapers`           | `_grp-papers`             | Selection that contains all groups of bars                    | `any`      | `null`                                         |
| `_grpPapersList`       | `_grp-papers-list`        | Group representing IRIS                                       | `any`      | `null`                                         |
| `_maxLenghtTitleIndex` | `_max-lenght-title-index` | Maximum length of title                                       | `number`   | `7.8`                                          |
| `_maxNamesLenght`      | `_max-names-lenght`       | Maximum length of names                                       | `number`   | `87`                                           |
| `_names`               | `_names`                  | Selection that contains the names of the members of a cluster | `any`      | `null`                                         |
| `_papersListPanel`     | `_papers-list-panel`      | represents the panel associated with the graph                | `any`      | `null`                                         |
| `datasetName`          | `dataset-name`            | The dataset name being used                                   | `string`   | `"[]"`                                         |
| `height`               | `height`                  | represents the height of the paper's list chart               | `number`   | `350`                                          |
| `width`                | `width`                   | represents the width of the paper's list chart                | `number`   | `350`                                          |


## Events

| Event       | Description | Type               |
| ----------- | ----------- | ------------------ |
| `idevent`   |             | `CustomEvent<any>` |
| `testevent` |             | `CustomEvent<any>` |


## Methods

### `dataVisToNode(index: any) => Promise<any>`



#### Returns

Type: `Promise<any>`



### `setBox(_: any) => Promise<any>`

Set box size for the chart includes the content
input is a object includes height and width
If no arguments, It will return the value of box

#### Returns

Type: `Promise<any>`



### `setData(_: any, globalData: any, secondNode: any, isFromEdge?: boolean, isFromCluster?: boolean, isFromHC?: boolean) => Promise<any>`

This function is to set the data to the listing papers chart
If no arguments, It will return the value of data

#### Returns

Type: `Promise<any>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
