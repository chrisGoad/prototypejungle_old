pj.require('/shape/circle.js','/shape/arcArrow.js',function (circlePP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
item.set("circleP",circlePP.instantiate());

// item.arrowP should be set by the client of this component (allowing diffeent sorts of arrow)
/* the adjustable parameters are those of the circle */
item.circleP.__adjustable = true;
item.circleP.__draggable = true;
item.circleP.dimension = 40;
/*end adjustable parameters*/

item.circleP.update();
item.circleP.__hide();
item.set('vertices',pj.Spread.mk(item.circleP));
item.set('edges',pj.Spread.mk());


item.vertices.bind = function () {
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


item.update = function () {
  if (!(this.__data && this.arrowP)) {
    return;
  }
  var data = this.__data;
  this.arrowP.includeEndControls = false;
  this.arrowP.__draggable = false;
  if (!this.edges.masterPrototype) {
    this.edges.masterPrototype = this.arrowP;
  }
  this.vertices.__setData(data.vertices);
  this.edges.__setData(data.edges);
}


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
  var rs = pj.Object.mk();
  rs.set('edges',data.edges.__copy(this.copyEdge));
  rs.set('vertices',data.vertices.__copy(this.copyVertex));
  return rs;
}

item.circleP.__dragStart = function (refPoint) {
  // not needed, but included for illustration
}

item.circleP.__dragStep = function (pos) {
   var graph = this.__parent.__parent.__parent;
   // update the data , then let the general updater do the work
   var vertexData = graph.__data.vertices;
   var vertexIndex = pj.numericalSuffix(this.__name);
   var position = vertexData[vertexIndex].position;
   position[0] = pos.x;
   position[1] = pos.y;
   graph.update();
   // the data has changed, so we need to dissociate it from an external source, if any
   if (graph.__data.__sourceUrl) {
     graph.set('__data',graph.copyData(graph.__data));
     graph.edges.__data = graph.__data.edges;
     graph.vertices.__data = graph.__data.vertices;
   }
}
return item;
});
