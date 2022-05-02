/**
* algCluster
*
*/

const AlgCluster = function () {

  return function AlgCluster () {
  
  function _addEdgesBetweenCluster(data) {
	var j,achei,dataEdges = [];

	data.edges.dataEdges.forEach(
	    function (d,i) {
			if ( data.nodes.dataNodes[d.src].idCluster != data.nodes.dataNodes[d.tgt].idCluster) {
				achei = false;
				for (j=0; j<dataEdges.length; j++) {
					if ( data.nodes.dataNodes[dataEdges[j].src].idCluster == data.nodes.dataNodes[d.src].idCluster && 
						data.nodes.dataNodes[dataEdges[j].tgt].idCluster == data.nodes.dataNodes[d.tgt].idCluster ||
						data.nodes.dataNodes[dataEdges[j].src].idCluster == data.nodes.dataNodes[d.tgt].idCluster &&
						data.nodes.dataNodes[dataEdges[j].tgt].idCluster == data.nodes.dataNodes[d.src].idCluster) {
						dataEdges[j].qt++;
						achei = true;
					}				 
				}

				if (!achei) {
					dataEdges.push({
							src: data.nodes.dataNodes[d.src].idCluster + data.nodes.qtNodes, 
							tgt: data.nodes.dataNodes[d.tgt].idCluster + data.nodes.qtNodes, 
							qt:1 , 
							source:data.nodes.dataNodes[d.src].idCluster + data.nodes.qtNodes, 
							target:data.nodes.dataNodes[d.tgt].idCluster + data.nodes.qtNodes, 
							visible:true
							});
				}
			} else {
			// Utiliza só o fonte porque aqui source=target
				data.nodes.dataNodes[data.nodes.dataNodes[d.src].idCluster + data.nodes.qtNodes].qtEdges++;
			}
		}	  
	);
  
	dataEdges.forEach(
	    function (d) {
		  data.edges.dataEdges.push(d);
		}
	);	   
  }
 
//--------------------------------- Funcoes publicas	  
	
    function alg() {}
	
 	//---------------------
    // Acrescenta no objeto data os nodos clusterizados
    //	
	alg.byAttribute = function(data, attr) {
	  var j, achei=false;
	  var dataNodes = null,
	      dataEdges = [];
	  
	  if (data.isCluster===undefined) {  // Caso os dados ainda não tenham sido clusterizados
	  	 data.isCluster = true;
		 data.nodes.qtNodes = data.nodes.dataNodes.length;
		 data.edges.qtEdges = data.edges.dataEdges.length;		 
	  }
	  
	  data.isCluster = true;
	  data.typeCluster = "A";
	  
			// Torna os nodos originais invisiveis ou complementa com os novos atributos
	  for (j=0; j<data.nodes.qtNodes; j++) {
		data.nodes.dataNodes[j].idCluster = -1;
		data.nodes.dataNodes[j].qtNodes = 1;
		data.nodes.dataNodes[j].visible = false;
		data.nodes.dataNodes[j].cluster = false;		
	  }
	  
			// Torna as arestas originais invisiveis
	  for (j=0; j<data.edges.qtEdges; j++) {
		data.edges.dataEdges[j].visible = false;	
	  }	  
	  
			// Remove os nodos clusterizados se houver
	  if (data.nodes.dataNodes.length > data.nodes.qtNodes)
		data.nodes.dataNodes.splice(data.nodes.qtNodes,data.nodes.dataNodes.length-data.nodes.qtNodes);
		
			// Remove as arestas pertencentes a cluster se houver
	  if (data.edges.dataEdges.length > data.edges.qtEdges)
		data.edges.dataEdges.splice(data.edges.qtEdges,data.edges.dataEdges.length-data.edges.qtEdges);	  
	  
	  // Marca os dados como clusterizado
	  
	  if (attr>=1000) {
	    attr -= 1000;
		dataNodes = d3.nest().key( function (d) { return d.values[attr]}).entries(data.nodes.dataNodes);
      } else {
		dataNodes = d3.nest().key( function (d) { return d.labels[attr]}).entries(data.nodes.dataNodes);	  
	  }
		// Inclui os novos atributos nos nodos clusterizados
	  dataNodes.forEach(
	    function(d,i) {
		  d.id = i + data.nodes.qtNodes;
		  d.qtNodes = d.values.length;
		  d.qtEdges = 0;
		  d.idCluster = i;
		  d.visible = true;
		  d.cluster = true;
		  d.values.forEach(
		    function(d) {
				d.idCluster = i;
			}
		  );
		  data.nodes.dataNodes.push(d);
		}
	  );
	  	  
	  data.edges.dataEdges.forEach(
	    function (d,i) {
		  if ( data.nodes.dataNodes[d.src].idCluster != data.nodes.dataNodes[d.tgt].idCluster) {
		     achei = false;
		     for (j=0; j<dataEdges.length; j++) {
			   if ( data.nodes.dataNodes[dataEdges[j].src].idCluster == data.nodes.dataNodes[d.src].idCluster && 
			        data.nodes.dataNodes[dataEdges[j].tgt].idCluster == data.nodes.dataNodes[d.tgt].idCluster ||
					data.nodes.dataNodes[dataEdges[j].src].idCluster == data.nodes.dataNodes[d.tgt].idCluster &&
					data.nodes.dataNodes[dataEdges[j].tgt].idCluster == data.nodes.dataNodes[d.src].idCluster) {
				 dataEdges[j].qt++;
				 achei = true;
                 }				 
			 }

			 if (!achei) {
			   dataEdges.push({	src: data.nodes.dataNodes[d.src].idCluster + data.nodes.qtNodes, 
								tgt: data.nodes.dataNodes[d.tgt].idCluster + data.nodes.qtNodes, 
								qt:1 , 
								source:data.nodes.dataNodes[d.src].idCluster + data.nodes.qtNodes, 
								target:data.nodes.dataNodes[d.tgt].idCluster + data.nodes.qtNodes, 
								visible:true});
			 }
		  } else {
			// Utiliza só o fonte porque aqui source=target
		    data.nodes.dataNodes[data.nodes.dataNodes[d.src].idCluster + data.nodes.qtNodes].qtEdges++;
		  }
		}	  
	  );
	  
	  dataEdges.forEach(
	    function (d) {
		  data.edges.dataEdges.push(d);
		}
	  );	  
	}

 	//---------------------
    // Remove todos os elementos que são cluster
    //	
	alg.byNone = function(data, attr) {
			// Remove os nodos clusterizados se houver
	  if (data.isCluster!=undefined) {
		console.log("--------------");
		console.log(data.isCluster);	  
		data.isCluster = false;
		data.typeCluster = "N";

		if (data.nodes.dataNodes.length > data.nodes.qtNodes) {
			data.nodes.dataNodes.splice(data.nodes.qtNodes,data.nodes.dataNodes.length-data.nodes.qtNodes);
			console.log("splice nodos" + data.nodes.qtNodes + " " + (data.nodes.dataNodes.length-data.nodes.qtNodes));
			console.log(data.nodes);
		}
		
			// Remove as arestas pertencentes a cluster se houver
		if (data.edges.dataEdges.length > data.edges.qtEdges)
			data.edges.dataEdges.splice(data.edges.qtEdges,data.edges.dataEdges.length-data.edges.qtEdges);

			// Torna os nodos originais visiveis ou complementa com os novos atributos
		for (j=0; j<data.nodes.qtNodes; j++) {
			data.nodes.dataNodes[j].idCluster = -1;
			data.nodes.dataNodes[j].qtNodes = 1;
			data.nodes.dataNodes[j].visible = true;
			data.nodes.dataNodes[j].cluster = false;		
		}	

			// Torna as arestas originais visiveis
		for (j=0; j<data.edges.qtEdges; j++) {
			data.edges.dataEdges[j].visible = true;
		}
	  }
	}

 	//---------------------
    // Acrescenta no objeto data os nodos clusterizados
    //	
	alg.byLouvain = function(data) {
		var j, tempNodes,tempEdges,cluster, vKeys,dataNodes;
	  
		if (data.isCluster===undefined) {  // Caso os dados ainda não tenham sido clusterizados
			data.isCluster = true;
			data.nodes.qtNodes = data.nodes.dataNodes.length;
			data.edges.qtEdges = data.edges.dataEdges.length;		 
		}
	  
		data.isCluster = true;
		data.typeCluster = "L";		
	  
			// Torna os nodos originais invisiveis ou complementa com os novos atributos
		for (j=0; j<data.nodes.qtNodes; j++) {
			data.nodes.dataNodes[j].idCluster = -1;
			data.nodes.dataNodes[j].qtNodes = 1;
			data.nodes.dataNodes[j].visible = false;
			data.nodes.dataNodes[j].cluster = false;		
		}
	  
			// Torna as arestas originais invisiveis
		for (j=0; j<data.edges.qtEdges; j++) {
			data.edges.dataEdges[j].visible = false;	
		}	  
	  
			// Remove os nodos clusterizados se houver
		if (data.nodes.dataNodes.length > data.nodes.qtNodes)
			data.nodes.dataNodes.splice(data.nodes.qtNodes,data.nodes.dataNodes.length-data.nodes.qtNodes);
		
			// Remove as arestas pertencentes a cluster se houver
		if (data.edges.dataEdges.length > data.edges.qtEdges)
			data.edges.dataEdges.splice(data.edges.qtEdges,data.edges.dataEdges.length-data.edges.qtEdges);	  

		tempNodes = data.nodes.dataNodes.map ( function(d) { return d.id;} );
		tempEdges = data.edges.dataEdges.map ( function(d) { return { source: d.src, target: d.tgt, weight: 1}; });

		cluster = jLouvain().nodes(tempNodes).edges(tempEdges)();
		vKeys = Object.keys(cluster);
		vKeys.forEach ( function (d) {
			data.nodes.dataNodes[d].idCluster = cluster[d];		
		}); 
		
		dataNodes = d3.nest().key( function (d) { return d.idCluster}).entries(data.nodes.dataNodes);

		dataNodes.forEach(
			function(d,i) {
				d.id = i + data.nodes.qtNodes;
				d.qtNodes = d.values.length;
				d.qtEdges = 0;
				d.idCluster = +d.key;
				d.visible = true;
				d.cluster = true;
				data.nodes.dataNodes.push(d);
			}
		);
		_addEdgesBetweenCluster(data);
	}
	
   	//======== 	
  	return alg; 
  };


}


export default AlgCluster;