import { createStore } from "@stencil/store";
const { state } = createStore({
    hasImportData: false,
    indexChart: 0,
    indexQueryData: 0,
    zIndex: 0,
    ATN_ShortName: 0,
    ATN_AuthorName: 1,
    ATN_Category: 2,
    ATN_LinhaPesq: 3,
    ATN_Area: 4,
    ATN_QtLinhaPesq: 1001,
    ATN_QtPublicacoes: 1003,
    ATN_QtJournals: 1004,
    ATN_QtBooks: 1005,
    ATN_QtProceedings: 1006,
    ATN_ConnectComp: 1007,
    ATN_Degree: 1011,
    ATE_QtPublicacoes: 1000,
    ATE_QtJournals: 1001,
    ATE_QtBooks: 1002,
    ATE_QtProceedings: 1003,
    TC_NodeEdge: 0,
    TC_ClusterVis: 1,
    TC_Iris: 2,
    TC_GlyphMatrix: 3,
    TC_Iris_Solo: 4,
    TC_PapersList_Solo: 5,
    TC_NodeEdge_HAL: 6,
    TC_ClusterVis_HAL: 7,
    TC_Histogram: 8,
    MG_WidthChart: 350,
    MG_HeightChart: 350,
    headerTitle: " connections ",
    headerParameter: "  ",
    GLYPH_STAR: 4,
    _data: {},
    selectedobj: null,
    globalParams: null,
    queriesList: null,
    existingQuery: null,
    typeChart: {
        "nodeLinks": "mge-nodelink",
        "histogram": "mge-barchart",
        "cluster": "mge-clustervis",
        "glyphMatrix": "mge-glyph-matrix",
        "iris": "mge-iris",
        "paperlist": "mge-listing",
        "followupQuery": "mge-query",
        "history": "mge-history"
    },
    annotations: {}
});
export default state;
