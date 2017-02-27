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
item.circleP.__draggable = false;
item.circleP.dimension = 40;
item.circleP.update();
item.circleP.__hide();
item.set('vertices',pj.Spread.mk(item.circleP));
item.set('edges',pj.Spread.mk());

item.vertices.bind = function () {
  debugger;
  var data = this.__data;
  var n = data.length;
  var i;
  for (i=0;i<n;i++) {
    var circle =  this.selectMark(i);
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
  debugger;
  if (!(this.__data && this.arrowP)) {
    return;
  }
  this.arrowP.includeEndControls = false;
  this.arrowP.__draggable = false;
  if (!this.edges.masterPrototype) {
    //this.set('edges',pj.Spread.mk(this.arrowP));
    //this.edges.set('masterPrototype',this.arrowP);
    this.edges.masterPrototype = this.arrowP;

  }
  this.vertices.__setData(this.__data.vertices);
  this.edges.__setData(this.__data.edges);
}

return item;
});
