pj.require('/diagram/graph.js','/shape/arrow.js',function (graphP,arrowPP,dataP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');

item.set('graph',graphP.instantiate());
//item.set('__data',Object.create(dataP));
item.graph.set('arrowP',arrowPP.instantiate().__hide());
item.graph.arrowP.headGap = 9;
item.graph.arrowP.tailGap = 9;
item.graph.circleP.dimension = 15;
item.graph.circleP.__draggable = true;
item.graph.circleP.__quickShift = true;


item.set('tree',pj.lift({children:[
                              {children:[{},{}]},
                              {}]}));

item.buildGraphData = function (tree) {
  var rs = pj.Object.mk();
  rs.set('vertices',pj.Array.mk());
  rs.set('edges',pj.Array.mk());
  var recurse = function (subtree) {
    var vertex = pj.Object.mk();
    vertex.id = rs.vertices.length;
    //if (subtree.fill) {
    //  vertex.fill = subtree.fill;
    rs.vertices.push(vertex);
    var children = subtree.children;
    if (children) {
      var childIds = pj.Array.mk();
      var firstChild = true;
      children.forEach(function (child) {
        var childVertex = recurse(child);
        childIds.push(childVertex.id);
        var edge = pj.Object.mk();
        edge.end0 = vertex.id;
        edge.end1 = childVertex.id;
       // edge.label = 'zz';
        edge.labelSide = firstChild?'right':'left'
        firstChild = false;
        edge.id = rs.edges.length;
        rs.edges.push(edge);
      });
      vertex.set('children',childIds);

    }
    return vertex;
  }
  rs.root = recurse(tree).id;
  return rs;
}

item.vSpacing = 50;
item.hSpacing = 50;
item.positionVerticesRelative = function () {
  var graphData = this.graphData;
  var vertices = graphData.vertices;
  var rootLabel = graphData.root;
  var rootVertex = vertices[rootLabel];
  rootVertex.set('relPosition',geom.Point.mk(0,0));

  //var rootPosition = geom.Point.mk(0,0);
  var hSpacing = this.hSpacing;
  var vSpacing = this.vSpacing;
  var recurse = function (rootLabel) {
    var vertex = vertices[rootLabel];
    var children = vertex.children;
    if (!children || (children.length === 0)) {
       vertex.width = 0;
       return 0;
    }
    var totalWidth = 0;
    children.forEach(function (child) {
      var wd = recurse(child);
      totalWidth += wd + hSpacing;
    });
    totalWidth -= hSpacing;
    vertex.width = totalWidth;
    var xpos = -0.5*totalWidth;
    var ypos = vSpacing;
    children.forEach(function (child) {
      var childVertex = vertices[child];
      var childWidth = childVertex.width;
      var vxpos = xpos + 0.5 * childWidth;
      childVertex.set('relPosition',geom.Point.mk(vxpos,ypos));
      xpos += childWidth + hSpacing;
    });
    return totalWidth;
  }
  recurse(rootLabel);
  
}

item.positionVertices = function () {
  this.positionVerticesRelative();
  // now generate absolute  positions
  var graphData = this.graphData;
  var vertices = graphData.vertices;
  var rootLabel = graphData.root;
  var recurse  = function (rootLabel,position) {
    var vertex = vertices[rootLabel];
    var myPosition = position.plus(vertex.relPosition);
    vertex.set('position',myPosition);
    var children = vertex.children;
    if  (!children || (children.length === 0)) {
      return;
    }
    children.forEach(function (child) {
      recurse(child,myPosition);
    });
  }
  recurse(rootLabel,geom.Point.mk(0,0));
}

/*
item.graph.circleP.__controlPoints = function () {
  //return [this.__getTranslation()];
  return [geom.Point.mk(0,0)];
}



item.graph.circleP.__updateControlPoint = function (idx,pos) {
  debugger;
  console.log('pos',pos);
  this.__moveto(pos);
 this.__draw();
}*/
item.graph.circleP.startDrag = function (refPoint) {
//var startDrag = function (refPoint) {
  console.log('START CIRCLE DRAG');
  var graph = this.__parent.__parent.__parent;
  graph.dragLastPos = refPoint.copy();
  //itm.startLabelSep = itm.labelSep.copy();
}


item.moveSubtreeBy = function (dataVertex,delta) {
  debugger;
  var idx = dataVertex.__name;
 
  var vertexShapes = this.graph.vertices;
  var vertexShape = vertexShapes.selectMark(idx);
  pj.vvv = vertexShape;
  var newPos = vertexShape.__getTranslation().plus(delta);
  dataVertex.position.copyto(newPos);
  vertexShape.__moveto(newPos);
  var dataVertices = this.graphData.vertices;
  var children = dataVertex.children;
  var thisHere = this;
  if (children) {
    children.forEach(function (childIndex) {
      var child = dataVertices[childIndex];
      thisHere.moveSubtreeBy(child,delta);
    })
  }
  
}
item.graph.circleP.dragStep = function (pos) {
//var dragStep = function (pos) {
   console.log('CIRCLE DRAG');
 var graph = this.__parent.__parent.__parent;
 var tree = graph.__parent;
  var idx = this.__name;
  var vertices = graph.__data.vertices;
  var vertex = vertices[idx];
 
  //vertex.position.copyto(pos);
  graph.update();
  graph.__draw();
  var delta = pos.difference(graph.dragLastPos);
  //console.log('diff',diff);
  tree.moveSubtreeBy(vertex,delta);
  pj.ttt = this;
 // this.__moveto(this.__getTranslation().plus(delta));
  graph.dragLastPos.copyto(pos);
  // now move the subtree rooted 
  //itm.labelSep.copyto(itm.startLabelSep.plus(diff));
  //itm.labels.__moveto(itm.labelSep);
}

var firstUpdate = true;
item.update = function () {
  debugger;
  if (!firstUpdate) {
    return;
  }
  var circleP = this.graph.circleP;
  if (0 && !circleP.startDrag) {
    circleP.startDrag = startDrag;
    circleP.dragStep = dragStep;
  }
  if (this.__data  && !this.graphData) {
    debugger;
    this.set('graphData',this.buildGraphData(this.__data));
    this.positionVertices();
    this.graph.__setData(this.graphData);
  } else {
    this.graph.update();
  }
  firstUpdate = false;
}
return item;
});
