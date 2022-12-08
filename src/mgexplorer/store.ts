import { createStore } from "@stencil/store";


const { state } = createStore({
	hasImportData: false,
	indexChart: 0,
	indexQueryData:0,
	zIndex: 0,
	
	ATN_ShortName: 0,   // ATN: Node attribute
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
	ATN_qtItems: 7,
	ATN_qtNodes: 8,

	ATE_QtPublicacoes: 1000,   // ATE: Attribute edge
	ATE_QtJournals: 1001,
	ATE_QtBooks: 1002,
	ATE_QtProceedings: 1003,

	TC_NodeEdge: 0,   // Technique
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

	_historydata:[],
	_annotationdata: [],
	_querydata: [],

	indexAnnotation:1,
	objectview:"",

	formData: {},
	savedData: {},
	selectedViews:[],

	GLYPH_STAR:4,
	_data: {},
	_queries: {},
	globalParams: null,
	queriesList: null,
	urlQuery: null,
	views: {
		"nodelink": { component: "mge-nodelink", title: 'Graph view' },
		"barchart": { component: "mge-barchart", title: 'Distribution view' },
		"cluster": { component: "mge-clustervis", title: 'Cluster view' },
		"glyphmatrix": {component: "mge-glyph-matrix", title: 'Pairwise relationship view' },
		"iris": { component: "mge-iris", title: 'Egocentric view' },
		"listing": {component: "mge-listing", title: 'Listing view' },
		"query": { component: "mge-query", title: d => d + ' Query' },
		"history": { component: "mge-history", title: 'Exploration History' },
		"annotation": { component: "mge-annotation", title: 'Annotation' }
  	},
	_id_parent:null,
	selectedobj: null,
	annotations: {},

	_hceres: true
});

export default state;