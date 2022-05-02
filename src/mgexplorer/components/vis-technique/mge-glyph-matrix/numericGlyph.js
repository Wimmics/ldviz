/**
* numericGlyph
*
*/
const NumericGlyph = function (id) {
  
  var _selectedGlyph = id,     // Índice do glifo criado
      _vIndexMapAttr = null,   // Vetor que contem os indices dos atributos a serem mapeados para o glifo
	  _vMaxValuesAttr = null,  // Vetor com os valores máximos de cada atributo do glifo
	  _vMinValuesAttr = null,  // Vetor com os valores mínimos de cada atributo do glifo
	  _maxValueAttr = 0,       // Valor máximo considerando todos os atributos
	  _minValueAttr = 0,       // Valor mínimo considerando todos os atributos
	  
	  _widthCell = 0,          
	  _xCenterCell = 0,        
	  _yCenterCell = 0,
	  _glyphScale = d3.scaleLinear(),
	  
	  _widthTooltip = 0,
	  _heightTooltip = 0,
	  _xCenterTooltip = 0,        
	  _yCenterTooltip = 0,
	  _glyphScaleTooltip = d3.scaleLinear(),
	  
	  _drawPolyline = d3.line()
			.x (function(d) { return d.x})
			.y (function(d) { return d.y}),
	  
	  _data = null;            // Dados associados ao glifo
	  
    function glyphNone() {}
    function glyphCircle() {}
    function glyphTwoCircle() {}
	function glyphTwinBars() {}	
	function glyphStar() {}
	
  var _vGlyphs = [glyphNone,glyphCircle,glyphTwoCircle, glyphTwinBars,glyphStar];
  
// Atributos privados dos glifos
  var _circleColor =  "black",
      _twoCircleColor = ["black","white"], 
	  _twinBarsColor = ["black","white"],
	  _starColor = [ "black"],
	  _starBkColor = [ "gray"],
	  _starOpacity = 0.6,
	  _vGlyphScale = null,     // GlyphTwinBars - Escala em X para as barras (uma para cada dupla)
	  _twinBarsYScale = d3.scaleBand();         // Escala em Y usada para desenhar barras
	
// ---------------- Acoes de inicializacao	  


//--------------------------------- Funcoes privadas
    function _calcMaxMin() {
	    var i,j,k;
		
		_vMaxValuesAttr = d3.range (_vIndexMapAttr.length);
		_vMinValuesAttr = d3.range (_vIndexMapAttr.length);
		
		for (i=0; i< _vMaxValuesAttr.length; i++) {
			_vMaxValuesAttr[i] = Number.MIN_VALUE;
			_vMinValuesAttr[i] = Number.MAX_VALUE;
		}

		for (i=0; i< _data.matrix.length; i++)	
			for ( j=0; j< _data.matrix[i].length; j++)
				if (_data.matrix[i][j].exist) {
					for (k=0; k< _vIndexMapAttr.length; k++) {
						if (_data.matrix[i][j].values[_vIndexMapAttr[k]] > _vMaxValuesAttr[k])
							_vMaxValuesAttr[k] = _data.matrix[i][j].values[_vIndexMapAttr[k]];
						if (_data.matrix[i][j].values[_vIndexMapAttr[k]] < _vMinValuesAttr[k])
							_vMinValuesAttr[k] = _data.matrix[i][j].values[_vIndexMapAttr[k]];							
					}				
				}
				
		_maxValueAttr = d3.max(_vMaxValuesAttr);
		_minValueAttr = d3.min(_vMinValuesAttr);
	}
	
	function _fCalcCenter( widthCell) {
	  _widthCell = widthCell;
	  _xCenterCell = widthCell/2;
	  _yCenterCell = widthCell/2;		
	}
	
	function _fCalcCenterTooltip( widthTooltip, heightTooltip) {
	  _widthTooltip = widthTooltip;
	  _heightTooltip = heightTooltip;	  
	  _xCenterTooltip = widthTooltip/2;
	  _yCenterTooltip = heightTooltip/2;		
	}	
	
//================================= GLYPHS	  

//----- GLYPH-NONE
	
	glyphNone.data = function(_) {
	
	}

	glyphNone.draw = function(_) {

	
	}	
	
    glyphNone.calcScale = function(_) {
	
	}
	
//----- GLYPH-CIRCLE
            // Utiliza apenas um atributo (index=0)
            // Só funciona para valores positivos			
	 
	glyphCircle.indexMapAttr = function(_) {
	  if (!arguments.length)
	     return _vIndexMapAttr;	 
	  _vIndexMapAttr = _;
	  return glyphCircle;
	}
	
	 	//---------------------	 
	glyphCircle.data = function(_) { 
	  if (!arguments.length)
	     return _data;	 
	  _data = _;

      _calcMaxMin();	  
	  return glyphCircle;  
	}

	 	//---------------------		
	glyphCircle.draw = function( cells) {  
		cells.append("g")
			.append("circle")
				.attr("cx", _xCenterCell )
				.attr("cy", _yCenterCell )
				.style("fill", _circleColor)
				.attr("r",function(d) { 
								return _glyphScale(d.values[ _vIndexMapAttr[0]]);
							});		  
	}

	 	//---------------------		
    glyphCircle.calcScale = function( widthCell) {
		var maxRange = widthCell/2;

		if (maxRange > 2)
			maxRange -= 1;
		
		_fCalcCenter(widthCell);					
		_glyphScale.range( [0,maxRange]).domain( [0,_vMaxValuesAttr[0]]);	
	}

	 	//---------------------		
    glyphCircle.color = function(_) {
	  if (!arguments.length)
	     return _circleColor;	 
	  _circleColor = _;
 
	  return glyphCircle;	
	}

//----- GLYPH-TWOCIRCLE
            // Utiliza apenas dois atributos (index=0,1)
            // Só funciona para valores positivos. Mostra a diferença entre os atributos	
	glyphTwoCircle.indexMapAttr = function(_) {
	  if (!arguments.length)
	     return _vIndexMapAttr;	 
	  _vIndexMapAttr = _;

	  return glyphTwoCircle;
	}

	 	//---------------------	 
	glyphTwoCircle.data = function(_) { 
	  if (!arguments.length)
	     return _data;	 
	  _data = _;

      _calcMaxMin();	  
	  return glyphTwoCircle;  
	}

    glyphTwoCircle.calcScale = function( widthCell) {
		var maxRange = widthCell/2,
		    maxValue;

		if (maxRange > 2)
			maxRange -= 1;
		
		_fCalcCenter(widthCell);
		if (_vMaxValuesAttr[0] > _vMaxValuesAttr[1])
		   maxValue = _vMaxValuesAttr[0];
		else
		   maxValue = _vMaxValuesAttr[1];		
		_glyphScale.range( [0,maxRange]).domain( [0,maxValue]);	
	}

	glyphTwoCircle.draw = function( cells) { 
		var group = cells.append("g");
		
		group.append("circle")
				.attr("cx", _xCenterCell )
				.attr("cy", _yCenterCell )
				.style("fill", _twoCircleColor[0])
				.attr("r",function(d) { 
							if (d.values[ _vIndexMapAttr[0]] > d.values[ _vIndexMapAttr[1]])
								return _glyphScale(d.values[ _vIndexMapAttr[0]]);
							else
								return _glyphScale(d.values[ _vIndexMapAttr[1]]);
							});	
		group.append("circle")
				.attr("cx", _xCenterCell )
				.attr("cy", _yCenterCell )
				.style("fill", function (d) {
								if (d.values[ _vIndexMapAttr[0]] == d.values[ _vIndexMapAttr[1]]) 
								   return _twoCircleColor[0];
								else
								   return _twoCircleColor[1];								
							})
				.attr("r",function(d) { 
							if (d.values[ _vIndexMapAttr[0]] < d.values[ _vIndexMapAttr[1]])
								return _glyphScale(d.values[ _vIndexMapAttr[0]]);
							else
								return _glyphScale(d.values[ _vIndexMapAttr[1]]);
							});							
	}
	
    glyphTwoCircle.color = function(_) {
	  if (!arguments.length)
	     return _twoCircleColor;	 
	  _twoCircleColor = _;
 
	  return glyphTwoCircle;	
	}

//----- GLYPH-TWINBARS
            // Os atributos devem ser informados em pares [0e,0d,1e,1d] 
			// É usada para comparar cada par de atributos
			// É usada uma escada para cada par de atributos
            // Só funciona para valores positivos.
			
	glyphTwinBars.indexMapAttr = function(_) {
	  if (!arguments.length)
	     return _vIndexMapAttr;	 
	  _vIndexMapAttr = _;
	  _vGlyphScale = d3.range(_vIndexMapAttr.length/2).map(function (d,i) { return d3.scale.linear()});	 
	  return glyphTwinBars;
	}
			
	 	//---------------------	 
	glyphTwinBars.data = function(_) { 
	  if (!arguments.length)
	     return _data;	 
	  _data = _;

      _calcMaxMin();	  
	  return glyphTwinBars;  
	}
	
	 	//---------------------	 	
	glyphTwinBars.draw = function( cells) { 
		var i,
		    group = cells.append("g").attr("transform", function(d, i) { return "translate(" + _xCenterCell +",0)"; });
			
		_vIndexMapAttr.forEach (function (d,i) {
				var index = Math.floor(i/2);
				group.append("rect")				
					.attr("x", function (d) { return (i%2==0) ? -_vGlyphScale[index](d.values[ _vIndexMapAttr[i] ]) : 0})
					.attr("y", _twinBarsYScale(index))
					.attr("width", function (d) { return _vGlyphScale[index](d.values[ _vIndexMapAttr[i] ]) })
					.attr("height", _twinBarsYScale.rangeBand()-1)
					.style("fill",_twinBarsColor[ i%2]);				
		
		});  
	}
	
	 	//---------------------	 	
    glyphTwinBars.calcScale = function( widthCell) {
		var i,maxPar,maxImpar,maxRange = widthCell/2;

		if (maxRange > 2)
			maxRange -= 1;
		
		_fCalcCenter(widthCell);
		
		_vGlyphScale.forEach( function(d,i) {
			var max;
			if (_vMaxValuesAttr[2*i] > _vMaxValuesAttr[2*i+1])
			   max = _vMaxValuesAttr[2*i];
			else
			   max = _vMaxValuesAttr[2*i+1];
			d.range([0,maxRange]).domain([0,max]);				   
		});
		
		_twinBarsYScale.rangeBands([0, widthCell],0,0.35).domain(d3.range(_vGlyphScale.length));
	}

//----- GLYPH-STAR
            // Deve possuir pelo menos 3 atributos 
	glyphStar.indexMapAttr = function(_) {
	  if (!arguments.length)
	     return _vIndexMapAttr;	 
	  _vIndexMapAttr = _;

	  return glyphStar;
	}

	 	//---------------------	 
	glyphStar.data = function(_) { 
	  if (!arguments.length)
	     return _data;	 
	  _data = _;

      _calcMaxMin();	  
	  return glyphStar;  
	}

	 	//---------------------	 	
    glyphStar.calcScale = function( widthCell) {
		var maxRange = widthCell/2,
		    minValue = _minValueAttr,
			maxValue = _maxValueAttr;

	  if (minValue > 0)  
	     minValue = 0;
		 
	  if (maxValue < 0)  
	     minValue = 0;			
			
		if (maxRange > 2)
			maxRange -= 1;
		
		_fCalcCenter(widthCell);	
		_glyphScale.range( [0,maxRange]).domain( [minValue,maxValue]);	
	
	}
	 	//---------------------	 	
    glyphStar.calcScaleTooltip = function( widthTooltip, heightTooltip) {
		var maxRange = heightTooltip/2,
		    minValue = _minValueAttr,
			maxValue = _maxValueAttr;

	  if (minValue > 0)  
	     minValue = 0;
		 
	  if (maxValue < 0)  
	     minValue = 0;			
			
		if (maxRange > 2)
			maxRange -= 1;  // Desconta a margem
		
		_fCalcCenterTooltip(widthTooltip,heightTooltip);	
		_glyphScaleTooltip.range( [0,maxRange]).domain( [minValue,maxValue]);	
	
	}	
	 	//---------------------
	glyphStar.draw = function( cells) { 
		var group = cells.append("g").attr("transform", function(d, i) { return "translate(" + _xCenterCell +"," + _yCenterCell + ")"; });
		var angSector = 2 * Math.PI / _vIndexMapAttr.length;
		
		group.each( function (d,i) {          
           var element = d3.select(this); 
		   var vData=[], xExtremo,yExtremo;
		   
		   element.append("circle")
			.attr("cx",0).attr("cy",0).attr("r",(_widthCell-2)/2)
			.style("fill","none")
			.style("stroke",_starColor[0])
			.style("stroke-width",0.2);


		   _vIndexMapAttr.forEach (function (d,i) {
				vData.push( {x:_glyphScale(element.data()[0].values[ _vIndexMapAttr[i] ]) * Math.cos(i * angSector ), 
							 y:_glyphScale(element.data()[0].values[ _vIndexMapAttr[i] ]) * Math.sin(i * angSector )} );
				xExtremo = (_widthCell-2)/2 * Math.cos(i * angSector );							 
				yExtremo = (_widthCell-2)/2 * Math.sin(i * angSector );
				
				element.append("line")				
					.attr("x1", 0)
					.attr("y1", 0)
					.attr("x2", xExtremo)
					.attr("y2", yExtremo)
//					.attr("x2", function (d) { return vData[i].x})  // Implementação anterior:  não desenha os eixos
//					.attr("y2", function (d) { return vData[i].y})
					.style("stroke",_starColor[0])
					.style("stroke-width",0.2 );
				
		   });
		   
		   element.append("path")
				  .attr("d", _drawPolyline(vData))
				  .attr("fill",_starBkColor[0])
				  .style("opacity", _starOpacity);		   
		});
		
/*		_vIndexMapAttr.forEach (function (d,i) {
				group.append("line")				
					.attr("x1", 0)
					.attr("y1", 0)
					.attr("x2", function (d) { return _glyphScale(d.values[ _vIndexMapAttr[i] ]) * Math.cos(i * angSector )})
					.attr("y2", function (d) { return _glyphScale(d.values[ _vIndexMapAttr[i] ]) * Math.sin(i * angSector )})
					.style("stroke", _starColor[0]);
		
		});
*/		
	}

	glyphStar.drawTooltip = function( grpGlyphTooltip, cell) { 
		var grpStarGlyph = grpGlyphTooltip.append("g").attr("transform", function() { return "translate(" + _xCenterTooltip +"," + _yCenterTooltip + ")"; });
//		grpStarGlyph.append("circle").attr("r",50);
		var angSector = 2 * Math.PI / _vIndexMapAttr.length;
		var xExtremo,yExtremo,angulo,valor;
		
		var vData=[];

		grpStarGlyph.append("circle")
			.attr("cx",0).attr("cy",0).attr("r",(_heightTooltip)/2)
			.style("fill","none")
			.style("stroke",_starColor[0])
			.style("stroke-width",0.2);
			
		_vIndexMapAttr.forEach (function (d,i) {
				vData.push( {x:_glyphScaleTooltip( cell.values[ _vIndexMapAttr[i] ]) * Math.cos(i * angSector ), 
							 y:_glyphScaleTooltip( cell.values[ _vIndexMapAttr[i] ]) * Math.sin(i * angSector )} );	
							 
				xExtremo = (_heightTooltip)/2 * Math.cos(i * angSector );							 
				yExtremo = (_heightTooltip)/2 * Math.sin(i * angSector );
				valor = cell.values[ _vIndexMapAttr[i]]; 
//				grpStarGlyph.append("text").text(cell.values[ _vIndexMapAttr[i] ])

				angulo = i*angSector;
				if (angulo==0) {
					grpStarGlyph.append("text").text(valor)
						.attr("x",xExtremo+3).attr("y",yExtremo+3)
						.style( "text-anchor","start");
					grpStarGlyph.append("text").text("  " + _data.edges[_vIndexMapAttr[i]])
						.attr("x",xExtremo+20).attr("y",yExtremo+3)
						.attr("class","MG-Tooltip-Attr")
						.style("text-anchor","start")
						.style( "fill","gray");						
				}
				else if (angulo < Math.PI/2) {
						grpStarGlyph.append("text").text(valor)
							.attr("x",xExtremo+3).attr("y",yExtremo+10)
							.style( "text-anchor","start");
						grpStarGlyph.append("text").text("  " + _data.edges[_vIndexMapAttr[i]])
							.attr("x",xExtremo+20).attr("y",yExtremo+10)
							.attr("class","MG-Tooltip-Attr")
							.style("text-anchor","start")
							.style("fill","gray");							
				}
				else if (angulo == Math.PI/2) {
						grpStarGlyph.append("text").text(valor)
							.attr("x",xExtremo-3).attr("y",yExtremo+10)
							.style( "text-anchor","start");
						grpStarGlyph.append("text").text("  " + _data.edges[_vIndexMapAttr[i]])
							.attr("x",xExtremo+17).attr("y",yExtremo+10)
							.attr("class","MG-Tooltip-Attr")
							.style("text-anchor","start")
							.style("fill","gray");							
				}
				else if (angulo < Math.PI) {
						grpStarGlyph.append("text").text(valor)
							.attr("x",xExtremo-3).attr("y",yExtremo+6)
							.style( "text-anchor","end");
						grpStarGlyph.append("text").text(_data.edges[_vIndexMapAttr[i]] + "  ")
							.attr("x",xExtremo-20).attr("y",yExtremo+6)
							.attr("class","MG-Tooltip-Attr")
							.style("text-anchor","end")
							.style("fill","gray");							
				}
				else if (angulo == Math.PI) {
						grpStarGlyph.append("text").text( valor)
							.attr("x",xExtremo-3).attr("y",yExtremo+3)
							.style( "text-anchor","end");
						grpStarGlyph.append("text").text(_data.edges[_vIndexMapAttr[i]] + "  ")
							.attr("x",xExtremo-23).attr("y",yExtremo+3)
							.attr("class","MG-Tooltip-Attr")
							.style("text-anchor","end")
							.style("fill","gray");							
				}
				else if (angulo < 3*Math.PI/2) {
						grpStarGlyph.append("text").text(valor)
							.attr("x",xExtremo-3).attr("y",yExtremo)
							.style( "text-anchor","end");
						grpStarGlyph.append("text").text(_data.edges[_vIndexMapAttr[i]] + "  ")
							.attr("x",xExtremo-20).attr("y",yExtremo)
							.attr("class","MG-Tooltip-Attr")
							.style("text-anchor","end")
							.style("fill","gray");							
				}
				else if (angulo == 3*Math.PI/2) {
						grpStarGlyph.append("text").text(valor)
							.attr("x",xExtremo-3).attr("y",yExtremo-3)
							.style( "text-anchor","start");
						grpStarGlyph.append("text").text("  " + _data.edges[_vIndexMapAttr[i]])
							.attr("x",xExtremo+17).attr("y",yExtremo-3)
							.attr("class","MG-Tooltip-Attr")
							.style("text-anchor","start")
							.style("fill","gray");							
				}
				else {
						grpStarGlyph.append("text").text(valor)
							.attr("x",xExtremo+3).attr("y",yExtremo-3)
							.style( "text-anchor","start");	
						grpStarGlyph.append("text").text("  " + _data.edges[_vIndexMapAttr[i]])
							.attr("x",xExtremo+20).attr("y",yExtremo-3)
							.attr("class","MG-Tooltip-Attr")
							.style("text-anchor","start")
							.style("fill","gray");							
				}
				
				grpStarGlyph.append("circle").attr("cx",vData[i].x).attr("cy",vData[i].y).attr("r",2);
							 
				grpStarGlyph.append("line")				
					.attr("x1", 0)
					.attr("y1", 0)
					.attr("x2", xExtremo)					
					.attr("y2", yExtremo)					
//					.attr("x2", function (d) { return vData[i].x})  // Implementação anterior:  não desenha os eixos
//					.attr("y2", function (d) { return vData[i].y})
					.style("stroke", _starColor[0])
					.style("stroke-width",0.2);							 
		   });
		   
		   grpStarGlyph.append("path")
				  .attr("d", _drawPolyline(vData)+"Z")
				  .attr("fill",_starBkColor[0])
				  .style("opacity", _starOpacity)
				  .style("stroke","black")
				  .style("stroke-width",1.5);		   	
	}
	
//------------------
	
    return _vGlyphs[_selectedGlyph]; 
  };

export default NumericGlyph;