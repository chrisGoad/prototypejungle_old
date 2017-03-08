pj.require('/shape/circle.js','/shape/arcArrow.js',function (circlePP,arrowPP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
item.scaling = 1; // scaling between positions of vertices and image placement of circles
item.set("circleP",circlePP.instantiate());
//item.set('arrowP',arrowPP.instantiate());
//item.arrowP.labelSep = 15;
//item.arrowP.clockwise = false;
//item.arrowP.label = 'label';
//item.arrowP.__hide();
//item.arrowP.labelText.__hide();
item.circleP.__adjustable = true;
item.circleP.__draggable = true;
item.circleP.dimension = 40;
item.circleP.update();
item.circleP.__hide();
item.set('vertices',pj.Spread.mk(item.circleP));
item.set('edges',pj.Spread.mk());

item.copyEdge  = function (edge) {
  var rs = pj.Object.mk();
  pj.setProperties(rs,edge,['label','end0','end1']);
  return rs;
}


item.copyVertex  = function (vertex) {
  var rs = pj.Object.mk();
  rs.id = vertex.id;
  rs.set('position',vertex.position.__copy());
  return rs;
}

item.copyData = function (data) {
  debugger;
  var rs = pj.Object.mk();
  rs.set('edges',data.edges.__copy(this.copyEdge));
  rs.set('vertices',data.vertices.__copy(this.copyVertex));
  return rs;
}

item.vertices.bind = function () {
  debugger;
  var data = this.__data;
  var n = data.length;
  var i;
  for (i=0;i<n;i++) {
    var circle =  this.selectMark(i);
    circle.vertexId = data[i].id;
    var pos = data[i].position;
    var position = geom.toPoint(pos);//geom.Point.mk(pos[0],pos[1]);
    circle.update();
    circle.__moveto(position);
  }
}


item.edges.bind = function () {
  var data = this.__data;
  var vertices = this.__parent.__data.vertices;
  var positionsById = {};
  var i;
  vertices.forEach(function (vertex) {
    var pos = vertex.position;
    positionsById[vertex.id] = geom.toPoint(pos);//geom.Point.mk(pos[0],pos[1]);
  });
  var n = data.length;
  for (i=0;i<n;i++) {
    var edge = data[i];
    var arrow =  this.selectMark(i);
    var pos0 = positionsById[edge.end0];
    var pos1 = positionsById[edge.end1];
    arrow.setEnds(pos0,pos1);
    arrow.label = edge.label;
    arrow.labelSide = edge.labelSide;
    arrow.__show();
    arrow.__update();
  }
}


// just do one update once the data is available
item.update = function () {
  debugger;
  if (!(this.__data && this.arrowP)) {
    return;
  }
  var data = this.__data;
 // var data = this.modifiedData?this.modifiedData:this.__data;
  if (this.beenUpdated) {
    this.edges.update();
    this.vertices.update();
    return;
    //code
  }
  this.beenUpdated = true;;
  this.arrowP.includeEndControls = false;
  this.arrowP.__draggable = false;
  if (!this.edges.masterPrototype) {
    //this.set('edges',pj.Spread.mk(this.arrowP));
    //this.edges.set('masterPrototype',this.arrowP);
    this.edges.masterPrototype = this.arrowP;

  }
  this.vertices.__setData(data.vertices);
  this.edges.__setData(data.edges);
}


item.edgesOfVertex = function (vertexId) {
  var edges = this.__data.edges;
  var edgesIn = [];
  var edgesOut = [];
  var ln = edges.length;
  for (var i=0;i<ln;i++) {
    var edge = edges[i];
    if (edge.end0 === vertexId) {
      edgesOut.push(i);
    }
    if (edge.end1 === vertexId) {
      edgesIn.push(i);
    }
  };
  return [edgesOut,edgesIn];
}

item.circleP.__dragStep = function (pos) {
//var dragStep = function (pos) {
   console.log('CIRCLE DRAG');
   debugger;
   this.__moveto(pos);
   var graph = this.__parent.__parent.__parent;
   var vertexData = graph.__data.vertices;
   var vertexIndex = pj.numericalSuffix(this.__name);
   var position = vertexData[vertexIndex].position;
   position[0] = pos.x;
   position[1] = pos.y;
   graph.edges.update();
   graph.vertices.update();
   if (graph.__data.__sourceUrl) {
     graph.set('__data',graph.copyData(graph.__data));
     graph.edges.__data = graph.__data.edges;
     graph.vertices.__data = graph.__data.vertices;
   }
   //graph.set('__data',pj.Object.mk());
   
   return;
   var edges = graph.edges;
   var edgesOutIn = graph.edgesOfVertex(this.vertexId);
   var edgesOut = edgesOutIn[0];
   var edgesIn = edgesOutIn[1];
   var forEdge = function(index,isIn) {
     var arrow = edges.selectMark(index);
     var endToMove = isIn?arrow.end1:arrow.end0;
     endToMove.copyto(pos);
     arrow.update();
     arrow.__draw();
   }
   edgesOut.forEach(function  (index) {forEdge(index,false);});
   edgesIn.forEach(function  (index) {forEdge(index,true);});
   /*function (index) {
    var arrow = edges.selectMark(index);
    arrow.end0.copyto(pos);
    arrow.update();
    arrow.__draw();
  });*/
  // now move the subtree rooted 
  //itm.labelSep.copyto(itm.startLabelSep.plus(diff));
  //itm.labels.__moveto(itm.labelSep);
}
return item;
});
