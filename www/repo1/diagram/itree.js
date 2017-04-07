pj.require('/shape/circle.js','/shape/arrow.js',function (circlePP,arrowPP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');

//item.set('graph',graphP.instantiate());
//item.set('__data',Object.create(dataP));
item.set('arrowP',arrowPP.instantiate().__hide());
item.set('circleP',circlePP.instantiate().__hide());
item.arrowP.headGap = 9;
item.arrowP.tailGap = 9;
item.circleP.dimension = 15;
item.circleP.__draggable = true;
item.arrowP.__draggable = false;
item.vSpacing = 50;
item.hSpacing = 50;
debugger;
item.set('nodes',pj.Array.mk());
item.set('edges',pj.Array.mk());

item.circleP.set('__nonRevertable',pj.lift({incomingEdge:1}));
item.arrowP.set('__nonRevertable',pj.lift({fromNode:1,toNode:1}));

var descendants = function (node) {
  var d = node.descendants;
  if (!d) {
    d = node.set('descendants',pj.Array.mk());
  }
  return d;
}

item.addNode = function () {
  
}
item.computeDescendants = function () {
  debugger;
  var nodes = this.nodes;
  var edges = this.edges;
  //  because of deletions, some nodes may have been set to null. Fix up nodes accordingly
  var newNodes = [];
  nodes.forEach(function (node) {
    if (node) {
      newNodes.push(node);
    }
  });
  this.nodes = nodes = 
  edges.forEach(function (edge) {
    var toNodeIndex = edge.toNode;
    var fromNodeIndex = edge.fromNode;
    var fromNode = nodes[fromNodeIndex];
    var toNode = nodes[toNodeIndex];
    descendants(fromNode).push(toNodeIndex);
    toNode.parentNode = fromNodeIndex;
    toNode.myIndex = toNodeIndex;
  });
}

item.buildSimpleTree = function () {
var i;
for (i=0;i<3;i++) {
  this.nodes.push(this.circleP.instantiate().__show());
}
for (i=0;i<2;i++) {
  this.edges.push(this.arrowP.instantiate().__show());
}

this.nodes[1].__moveto(geom.Point.mk(-0.5 * this.hSpacing,this.vSpacing));
this.nodes[2].__moveto(geom.Point.mk(0.5 * this.hSpacing,this.vSpacing));
this.nodes[1].incomingEdge = 0;
this.nodes[2].incomingEdge = 1;

this.edges[0].fromNode = 0;
this.edges[0].toNode = 1;

this.edges[1].fromNode = 0;
this.edges[1].toNode = 2;
this.computeDescendants();
}

item.update = function () {
  var nodes = this.nodes;
  this.edges.forEach(function (edge) {
     debugger;
    var end0 = nodes[edge.fromNode].__getTranslation();
    var end1 = nodes[edge.toNode].__getTranslation();
    console.log('to',end1.x,end1.y);
    edge.setEnds(end0,end1);
    edge.update();
  });
  this.__draw();
}

item.circleP.__delete = function () {
  ui.confirm('Are you sure you wish to delete this subtree?',function () {
    var diagram = this.__parent;
    var root = diagram.nodes[0];
    if (root === this) {
      diagram.remove();
    } else {
      diagram.deleteSubtree(this,true);
    }
    ui.setSaved(false);
    pj.root.__draw();
  });
}

item.circleP.__dragStep = function (pos) {
  this.__moveto(pos);
 var tree = this.__parent.__parent;
 tree.update();
}

var addDescendant = function (diagram,node) {
  //var node = pj.selectedNode;
  debugger;
  var edges = diagram.edges;
  var newEdge = diagram.arrowP.instantiate().__show();
  var newNode=  diagram.circleP.instantiate().__show();
  diagram.edges.push(newEdge);
  diagram.nodes.push(newNode);
  var nodePos = node.__getTranslation();
  var newPos = nodePos.plus(geom.Point.mk(0,diagram.vSpacing));
  newNode.__moveto(newPos);
  newEdge.fromNode = pj.numericalSuffix(node.__name);
  newEdge.toNode = pj.numericalSuffix(newNode.__name);
  newNode.incomingEdge = pj.numericalSuffix(newEdge.__name);
  descendants(node).push(newEdge.toNode);
  diagram.positionNodes();
  diagram.update();
  debugger;
  node.__select('svg');
}

item.positionRelative = function () {
  var nodes = this.nodes;
  var edges = this.edges
  var rootNode = nodes[0];
  rootNode.set('relPosition',geom.Point.mk(0,0));
  var hSpacing = this.hSpacing;
  var vSpacing = this.vSpacing;
  var recurse = function (rootLabel) {
    var node = nodes[rootLabel];
    var children = node.descendants;
    if (!children || (children.length === 0)) {
       node.width = 0;
       return 0;
    }
    var totalWidth = 0;
    children.forEach(function (child) {
      var wd = recurse(child);
      totalWidth += wd + hSpacing;
    });
    totalWidth -= hSpacing;
    node.width = totalWidth;
    var xpos = -0.5*totalWidth;
    var ypos = vSpacing;
    children.forEach(function (child) {
      var childNode = nodes[child];
      var childWidth = childNode.width;
      var vxpos = xpos + 0.5 * childWidth;
      childNode.set('relPosition',geom.Point.mk(vxpos,ypos));
      xpos += childWidth + hSpacing;
    });
    return totalWidth;
  }
  recurse(0);
  
}

item.positionNodes = function () {
  debugger;
  this.positionRelative();
  // now generate absolute  positions
  var graphData = this.graphData;
  var nodes = this.nodes;
  var edges = this.edges;
  var recurse  = function (rootLabel,position) {
    var node = nodes[rootLabel];
    var myPosition = position.plus(node.relPosition);
    debugger;
    node.__moveto(myPosition.x);
    var children = node.descendants;
    if  (!children || (children.length === 0)) {
      return;
    }
    children.forEach(function (childIndex) {
      recurse(childIndex,myPosition);
    });
  }
  recurse(0,geom.Point.mk(0,0));
}

item.deleteSubtree = function (node,topCall) {
  var children = node.descendants;
  var nodes = this.nodes;
  if  (children && (children.length > 0)) {
    children.forEach(function (childIndex) {
      var child = nodes[childIndex];
      this.deleteSubtree(child);
    });
  }
  node.remove();
}

item.circleP.__actions = [{title:'add descendant',action:addDescendant}];


item.__activeTop = true;

item.__topActions = [{id:'test1',title:'test test',action:function () {alert(2266);}}];

return item;
});
