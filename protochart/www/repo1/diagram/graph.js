pj.require('../shape/circle.js','../shape/arc_arrow.js',function (errorMessage,circlePP,arrowPP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg;
var item = pj.svg.Element.mk('<g/>');
item.scaling = 1; // scaling between positions of vertices and image placement of circles
item.set("circleP",circlePP.instantiate());
item.set('arrowP',arrowPP.instantiate());
item.arrowP.labelSep = 10;
item.arrowP.__hide();
//item.arrowP.labelText.__hide();
item.circleP.__adjustable = true;
item.circleP.__draggable = false;
item.circleP.dimension = 40;
item.circleP.update();
item.circleP.__hide();
item.set('vertices',pj.Spread.mk(item.circleP));
item.set('edges',pj.Spread.mk(item.arrowP));

item.vertices.bind = function () {
  debugger;
  var data = this.data;
  var n = data.length;
  for (i=0;i<n;i++) {
    var circle =  this.selectMark(i);
    var pos = data[i].position;
    var position = geom.Point.mk(pos[0],pos[1]);
    circle.update();
    circle.__moveto(position);
  }
}


item.edges.bind = function () {
  debugger;
  var data = this.data;
  var vertices = this.parent().data.vertices;
  var positionsById = {};
  vertices.forEach(function (vertex) {
    var pos = vertex.position;
    positionsById[vertex.id] = geom.Point.mk(pos[0],pos[1]);
  });
  var n = data.length;
  for (i=0;i<n;i++) {
    var edge = data[i];
    var arrow =  this.selectMark(i);
    var pos0 = positionsById[edge.end0];
    var pos1 = positionsById[edge.end1];
    arrow.setEnds(pos0,pos1);
    arrow.label = edge.label;
    arrow.__update();
  }
}
   
item.update = function () {
  debugger;
  this.vertices.setData(this.data.vertices,'doUpdate');
  this.edges.setData(this.data.edges,'doUpdate');
}

pj.returnValue(undefined,item);

});
