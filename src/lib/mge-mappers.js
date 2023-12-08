/**
 * LibCav
 *
 */


//=========================== sort
function sort() {

    let _vData = null,             // array with data to be sorted (dataNodes [] or dataEdges [])
        _vOrder = null,            // Ordering Vector
        _vLabelConfigSort = null,  // Configuration vector of sort. Each element contains
        //  { ascending: true or false, desempate:[ "indexAttr":x, value: true or false, ascending: true or false]
        _vValueConfigSort = null,
        _indexAttrSort = 0,          // Index of the attribute to be classified index + 1000 indicates VALUE Ex: 1001
        _labelAttrSort = 0,          // Index adjusted for label (equal to _indexAttrSort)
        _valueAttrSort = 0,		  // Index set to value (_indexAttrSort-1000)

        // --- Function that performs labeling for LABEL
        _fLabelSort = function (a, b) {
            if (_vLabelConfigSort[_labelAttrSort].ascending)
                return d3.ascending(_vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
            else
                return d3.descending(_vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
        },

        // --- Function that performs rating for VALUE
        _fValueSort = function (a, b) {
            if (_vValueConfigSort[_valueAttrSort].ascending)
                return d3.ascending(_vData[a].values[_valueAttrSort], _vData[b].values[_valueAttrSort]);
            else
                return d3.descending(_vData[a].values[_valueAttrSort], _vData[b].values[_valueAttrSort]);
        },

        // --- Function that performs rating for VALUE with tiebreaker
        _fValueSortDesempate = function (a, b) {
            var i, attrSortConfig, result;

            attrSortConfig = _vValueConfigSort[_valueAttrSort];

            for (i = 0; i < attrSortConfig.vDesempate.length; i++) {
                if (attrSortConfig.vDesempate[i].numeric) {
                    if (attrSortConfig.vDesempate[i].ascending) {
                        result = d3.ascending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
                    } else {
                        result = d3.descending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
                    }
                } else {
                    if (attrSortConfig.vDesempate[i].ascending) {
                        result = d3.ascending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                    } else {
                        result = d3.descending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                    }

                }

                if (result !== 0)
                    return result;
            }

            return result;
        },

        // --- Function that performs the classification for LABEL with tie breaker

        _fLabelSortDesempate = function (a, b) {
            let i, attrSortConfig, result;

            attrSortConfig = _vLabelConfigSort[_labelAttrSort];

            for (i = 0; i < attrSortConfig.vDesempate.length; i++) {
                if (attrSortConfig.vDesempate[i].numeric) {
                    if (attrSortConfig.vDesempate[i].ascending) {
                        result = d3.ascending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
                    } else {
                        result = d3.descending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
                    }
                } else {
                    if (attrSortConfig.vDesempate[i].ascending) {
                        result = d3.ascending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                    } else {
                        result = d3.descending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                            _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                    }

                }

                if (result !== 0)
                    return result;
            }

            return result;
        };



    //--------------------------------- Public functions
    let obj = {};

    // Initializes the classification functions for each attribute
    obj.inic = function (qtLabel, qtValue) {
        let i;
        _vLabelConfigSort = [];
        for (i = 0; i < qtLabel; i++) {
            _vLabelConfigSort.push({ fSortOrder: _fLabelSort, vDesempate: null, ascending: true, desempate: false });
        }

        _vValueConfigSort = [];
        for (i = 0; i < qtValue; i++) {
            _vValueConfigSort.push({ fSortOrder: _fValueSort, vDesempate: null, ascending: false, desempate: false });
        }
        return obj;
    };

    //---------------------
    obj.data = function (_) {
        _vData = _;
        _vOrder = d3.range(_vData.length);
        return obj;
    };

    //---------------------
    obj.getVetOrder = function () {
        return _vOrder;
    };

    //---------------------
    obj.config = function (indexAttr, numeric, ascending, vDesempate) {
        if (vDesempate === undefined) {
            if (numeric) { // For numerical attributes
                _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSort, vDesempate: null, ascending: ascending, desempate: false };
            } else {
                _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSort, vDesempate: null, ascending: ascending, desempate: false };
            }
        } else {
            vDesempate.unshift({ indexAttr: indexAttr, numeric: numeric, ascending: ascending });
            if (numeric) { // For numerical attributes
                _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSortDesempate, vDesempate: vDesempate, ascending: ascending, desempate: false };
            } else {
                _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSortDesempate, vDesempate: vDesempate, ascending: ascending, desempate: false };
            }
        }
        return obj;
    };

    //---------------------
    obj.exec = function (indexAttrSort) {
        _indexAttrSort = indexAttrSort;

        if (_indexAttrSort < 1000) {
            _labelAttrSort = _indexAttrSort;
            _vOrder.sort(function (a, b) {
                return _vLabelConfigSort[_labelAttrSort].fSortOrder.call(obj, a, b);
            })
        } else {
            _valueAttrSort = _indexAttrSort - 1000;
            _vOrder.sort(function (a, b) {
                return _vValueConfigSort[_valueAttrSort].fSortOrder(a, b);
            });
        }
    };

    return obj;
};

//=========================== Returns subgraphs
function subGraph() {

    //--------------
    // graphEdges: original edges of the graph
    // vNodes: resulting nodes of the selection (in clusterVis: the nodes in the selected cluster)
    // vEdges: resulting edges of the subsetting interaction
    function _addEdges(vNodes, vEdges, graphEdges) {
        let idNodes = vNodes.map(d => d.idOrig)
        graphEdges.forEach(d => {
            if (idNodes.includes(d.src) && idNodes.includes(d.tgt)) {
                let edge = {...d}
                edge.src = idNodes.indexOf(d.src)
                edge.tgt = idNodes.indexOf(d.tgt)
                vEdges.push(edge)
            }
        })
        vNodes.forEach(d => d.id = idNodes.indexOf(d.idOrig) )
    }
    //--------------- Adds the edges in the array of edges

    function _addEdgesMatrix(vNodes, vMatrix, graphEdges) {
        let vEdges = [];   // Auxiliary variable to temporarily store the set of edges

        _addEdges(vNodes, vEdges, graphEdges)

        vEdges.forEach(d => {
                vMatrix[d.src].push({ "x": d.tgt, "y": d.src, "exist": true, "labels": d.labels, "values": d.values });
                vMatrix[d.tgt].push({ "x": d.src, "y": d.tgt, "exist": true, "labels": d.labels, "values": d.values });
            }
        )                
    }

    //--------------------------------- Public functions
    let obj = {};

    /*---------------------------------
        * Returns the graph in the ClusterVis format of the graph contained in the node of type Cluster
        */
    obj.clusterClusterVis = function (clusterNode, graphData) {

        let result = getClusterVisDataModel(graphData)
        // Includes all cluster node nodes
        clusterNode.cluster.forEach(node => result.nodes.dataNodes.push(getClusterVisNode(node)) )

        _addEdges(result.nodes.dataNodes, result.edges.dataEdges, graphData.edges.dataEdges);
        return result;
    };

    /*---------------------------------
        * Node and its adjacent ClusterVis
        */
    obj.normalClusterVis = function (normalNode, graphData) {
        console.log("normalClusterVis() = ", normalNode)
        let result = getClusterVisDataModel(graphData)
        
        // Include the selected node 
        result.nodes.dataNodes.push(getClusterVisNode(normalNode))

        graphData.edges.dataEdges.forEach(d => {
            if (d.src !== normalNode.idOrig && d.tgt !== normalNode.idOrig) return
            let index = d.src === normalNode.idOrig ? d.tgt : d.src
            let node = getClusterVisNode(graphData.nodes.dataNodes[index])
            node.values = {...d.values}

            result.nodes.dataNodes.push(node)
        });

        
        // Includes only edges between selected nodes
        _addEdges(result.nodes.dataNodes, result.edges.dataEdges, graphData.edges.dataEdges)

        // create clusters for each node
        let idNodes = result.nodes.dataNodes.map(d => d.idOrig)
        result.nodes.dataNodes.forEach(d => {
            d.cluster = result.edges.dataEdges
                .filter(e => e.src === idNodes.indexOf(d.idOrig) || e.tgt === idNodes.indexOf(d.idOrig))
                .map(e => e.src === idNodes.indexOf(d.idOrig) ? e.target : e.source)
        })

        console.log(result)

        return result;
    };

    /*---------------------------------
        * Node and its adjacent Iris
        */
    obj.normalIris = function (normalNode, graphData) {
        
        let result = getIrisDataModel(normalNode, graphData)

        graphData.edges.dataEdges.forEach(d => {
            if (d.src !== normalNode.idOrig && d.tgt !== normalNode.idOrig) return
            let index = d.src === normalNode.idOrig ? d.tgt : d.src
            let src = d.src === normalNode.idOrig ? d.src : d.tgt
            let tgt = d.src === normalNode.idOrig ? d.tgt : d.src

            let node = getIrisNode(graphData.nodes.dataNodes[index])
            node.edge = {
                src: src,
                tgt: tgt,
                labels: d.labels,
                values: [...d.values]
            }
            result.children.data.push(node)
        });

        return result;
    };

    /*---------------------------------
        * Node and its adjacent Iris
        */
    obj.allPapersList = function (normalNode, graphData) {
        let result = getPaperListDataModel(normalNode, graphData.nodes, false)

        result.root.data.documents = graphData.items.filter(d => d.authors.some(a => a.id === normalNode.idOrig))

        graphData.edges.dataEdges.forEach(d => {
            if (d.src != normalNode.idOrig && d.tgt != normalNode.idOrig ) return;
            
            let index = d.src === normalNode.idOrig ? d.tgt : d.src 
            result.children.data.push(getPaperListNode(graphData.nodes.dataNodes[index]))
        })

        return result;
    };

    obj.duoPapersList = function (firstNode, secondNode, graphData) {

        let result = getPaperListDataModel(firstNode, graphData.nodes, false)

        result.children.data.push(getPaperListNode(secondNode));
        
        result.root.data.documents = graphData.items.filter(d => d.authors.some(a => a.id === firstNode.idOrig) && d.authors.some(a => a.id === secondNode.idOrig))

        result.root.data.documents.forEach(doc => {
            doc.authors.forEach(a => {
                let node = i_findNormalNode(a.id, graphData);
                if (isTheFirstOccurenceAuthor(node.id, result.children.data)) {
                    result.children.data.push(getPaperListNode(node))
                }
            })
        })

        return result;                
    };

    obj.clusterPapersList = function (sourceNode, graphData) {

        let result = getPaperListDataModel(sourceNode, graphData.nodes, true)

        
        sourceNode.cluster.forEach(node => {
            if (node.idOrig !== sourceNode.idOrig) 
                result.children.data.push(getPaperListNode(node))
        })

        let idNodes = sourceNode.cluster.map(d => d.idOrig)
        idNodes.push(sourceNode.idOrig)
        console.log(graphData.items)
        console.log(sourceNode, idNodes)
        result.root.data.documents = graphData.items.filter(d => d.authors.some(a => a.id === sourceNode.idOrig) && idNodes.every(a => d.authors.some(x => x.id === a)))
        //d.authors.every(a => idNodes.includes(a.id)))

        result.root.data.documents.forEach((doc) => {
            doc.authors.forEach(author => {
                // check if author is not part of the cluster
                // if not include its information in the 'others' array
                if (isTheFirstOccurenceAuthor(author.id, result.children.data) && isTheFirstOccurenceAuthor(author.id, result.children.others)) { 
                    let node = i_findNormalNode(author.id, graphData)
                    result.children.others.push(getPaperListNode(node))
                }
            })
        })

        return result
    };

    /*---------------------------------
        * Cluster MatrixGlyph
        to-do : verify why it is not working (the data appear to be right, but the visual is filling the cells in the diagonal)
        the problem might be in the visualization side
        */
    obj.clusterMatrixGlyph = function (clusterNode, graphData) {
        let result = getGlyphMatrixDataModel(graphData)

        // Includes all cluster node nodes
        result.nodes.dataNodes = clusterNode.cluster.map(node => getPaperListNode(node)) // the nodes in the GlyphMatrix have the same format as the ones in the PaperList

        result.nodes.dataNodes.forEach( (_,i) => result.matrix[i] = [] )

        _addEdgesMatrix(result.nodes.dataNodes, result.matrix, graphData.edges.dataEdges)

        return result;
    };

    /*---------------------------------
        * Edges between 2 clusters
        * ------- not being used; has to be fixed before use --------------
        */
    obj.edgesBtClustersMatrixGlyph = function (edge, graphData) {
        let i, idClusterA, idClusterB, nodeSrc, nodeTgt, qtNodes, qtEdges,
            vEdges = [];   // Auxiliary variable to temporarily store the set of edges
        let result = {
            nodes: {
                labelTitle: graphData.nodes.labelTitle,
                valueTitle: graphData.nodes.valueTitle,
                imageTitle: graphData.nodes.imageTitle,
                dataNodes: []
            },
            edges: graphData.edges.valueTitle,
            matrix: []
        };

        idClusterA = edge.source.idCluster;
        idClusterB = edge.target.idCluster;


        // Includes nodes belonging to distinct clusters connected by an edge
        for (i = 0; i < graphData.edges.qtEdges; i++) {
            nodeSrc = i_findNormalNode(graphData.edges.dataEdges[i].src);
            nodeTgt = i_findNormalNode(graphData.edges.dataEdges[i].tgt);
            if (nodeSrc == null || nodeTgt == null)
                alert("Node not found!");
            if (nodeSrc.idCluster === idClusterA && nodeTgt.idCluster === idClusterB ||
                nodeSrc.idCluster === idClusterB && nodeTgt.idCluster === idClusterA) {
                vEdges.push({
                    src: graphData.edges.dataEdges[i].src,
                    tgt: graphData.edges.dataEdges[i].tgt,
                    labels: graphData.edges.dataEdges[i].labels,
                    values: graphData.edges.dataEdges[i].values
                });
                i_addNode(nodeSrc, result.nodes.dataNodes);
                i_addNode(nodeTgt, result.nodes.dataNodes);
            }
        }


        // Initializes the matrix of edges
        result.nodes.dataNodes.forEach(
            function (d, i) {
                result.matrix[i] = [];
            }
        );

        //------- Adjust the ids to conform to the indices
        qtNodes = result.nodes.dataNodes.length;
        qtEdges = vEdges.length;

        for (i = 0; i < qtEdges; i++) {
            for (j = 0; j < qtNodes; j++) {
                if (result.nodes.dataNodes[j].id === vEdges[i].src) {
                    vEdges[i].src = j;
                    break;
                }
            }
            for (j = 0; j < qtNodes; j++) {
                if (result.nodes.dataNodes[j].id === vEdges[i].tgt) {
                    vEdges[i].tgt = j;
                    break;
                }
            }
        }

        result.nodes.dataNodes.forEach(function (node, k) {
            node.id = k;
        });

        vEdges.forEach(
            function (d) {
                result.matrix[d.src].push({ "x": d.tgt, "y": d.src, "exist": true, "labels": d.labels, "values": d.values });
                result.matrix[d.tgt].push({ "x": d.src, "y": d.tgt, "exist": true, "labels": d.labels, "values": d.values });
            }
        );

        return result;

        //---- Search for the node that has the id passed as an argument
        function i_findNormalNode(id) {
            let i;
            for (i = 0; i < graphData.nodes.qtNodes; i++) {
                if (graphData.nodes.dataNodes[i].id === id)
                    return graphData.nodes.dataNodes[i];
            }
            return null;
        }

        //---- Adds a node in vNode if it does not already exist
        function i_addNode(node, vNodes) {
            let achei, i;

            achei = false;
            for (i = 0; i < vNodes.length; i++) {
                if (node.id === vNodes[i].id) {
                    achei = true;
                    break;
                }
            }
            if (!achei) {
                vNodes.push({
                    id: node.id,
                    labels: node.labels,
                    values: node.values,
                    images: node.images
                });

            }
        }
    };

    /*---------------------------------
        * Node and its adjacent MatrixGlyph
        */
    obj.normalMatrixGlyph = function (normalNode, graphData) {
        console.log(normalNode)

        let result = getGlyphMatrixDataModel(graphData)
        result.nodes.dataNodes.push(getPaperListNode(normalNode))

        graphData.edges.dataEdges.forEach(d => {
            if (d.src != normalNode.idOrig && d.tgt != normalNode.idOrig ) return;
            
            let index = d.src === normalNode.idOrig ? d.tgt : d.src 
            result.nodes.dataNodes.push(getPaperListNode(graphData.nodes.dataNodes[index]))
        })

        result.nodes.dataNodes.forEach( (_,i) => result.matrix[i] = [] )

        _addEdgesMatrix(result.nodes.dataNodes, result.matrix, graphData.edges.dataEdges);

        return result;
    };

    obj.normalListDocs = function (normalNode, graphData) {
        let result = {
        };

        return result;
    };
    //---------------------------	  
    return obj;
};

/////// ------------------------- auxiliary functions -------------------------- ///////////

//---- Returns true if the document isn't already stored
function isTheFirstOccurenceAuthor(id, tab) {
    return tab.length === 0 || !tab.find(d => d.id === id)
}

//---- Search for the node that has the id passed as an argument
function i_findNormalNode(id, data) {
    return data.nodes.dataNodes.find(d => d.id === id)
}

function getPaperListDataModel(node, nodes, cluster) {
    return {
        root: {
            labelTitle: nodes.labelTitle,
            valueTitle: nodes.valueTitle,
            imageTitle: nodes.imageTitle,
            data: {
                id: node.id,
                idOrig: node.idOrig,
                labels: node.labels,
                values: node.values,
                images: node.images,
                documents: [],
            }
        },
        children: {
            labelTitle: nodes.labelTitle,
            valueTitle: nodes.valueTitle,
            imageTitle: nodes.imageTitle,
            cluster: cluster,
            data: [getPaperListNode(node)],        // Data of the child nodes and the edge that binds it to the root
            others: []
        },
    }
}

function getPaperListNode(d) {
    return {
        id: d.id,
        idOrig: d.idOrig,
        labels: d.labels,
        values: d.values,
        images: d.images,
    }
}

function getClusterVisDataModel(graphData) {
    return {
        nodes: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            dataNodes: []
        },
        edges: {
            labelTitle: graphData.edges.labelTitle,
            valueTitle: graphData.edges.valueTitle,
            dataEdges: []
        }
    }
}

function getClusterVisNode(d) {
    return { id: d.id, idOrig: d.idOrig, labels: d.labels, values: d.values, images: d.images, cluster: [] }
}

function getIrisDataModel(node, graphData) {
    return {
        root: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            data: getIrisNode(node)
        },
        children: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            data: []           // Data of the child nodes and the edge that binds it to the root
        },
        edges: {
            labelTitle: graphData.edges.labelTitle,
            valueTitle: graphData.edges.valueTitle,
            data: [] // Data of the other edges (that do not bind to the root (MISSING IMPLEMENTATION))
        }
    }
}

function getIrisNode(node) {
    return {
        id: node.id,
        idOrig: node.idOrig,
        labels: node.labels,
        values: node.values,
        images: node.images
    }
}

function getGlyphMatrixDataModel(graphData) {
    return {
        nodes: {
            labelTitle: graphData.nodes.labelTitle,
            valueTitle: graphData.nodes.valueTitle,
            imageTitle: graphData.nodes.imageTitle,
            dataNodes: []
        },
        edges: graphData.edges.valueTitle,
        matrix: []
    }
}

export { sort, subGraph }
