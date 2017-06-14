pj.require('/shape/circle.js','/shape/arrow.js',function (nodePP,edgePP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
debugger;
//item.set('graph',graphP.instantiate());
//item.set('__data',Object.create(dataP));
item.set('edgeP',edgePP.instantiate().__hide());
item.set('nodeP',nodePP.instantiate().__hide());
item.edgeP.headGap = 9;
item.edgeP.tailGap = 9;
//item.circleP.dimension = 15;
//item.circleP.__draggable = true;
item.edgeP.__draggable = false;
item.vSpacing = 50;
item.hSpacing = 50;
debugger;
item.set('nodes',svg.Element.mk('<g/>'));
item.set('edges',svg.Element.mk('<g/>'));
item.lastNodeIndex = 0;
item.lastEdgeIndex = 0;

item.nodeP.set('__nonRevertable',pj.lift({incomingEdge:1}));
item.edgeP.set('__nonRevertable',pj.lift({fromNode:1,toNode:1}));

var descendants = function (node) {
  var d = node.descendants;
  if (!d) {
    d = node.set('descendants',pj.Array.mk());
  }
  return d;
}

item.addNode = function () {
  var newNode = this.nodeP.instantiate().__show();
  var nm = 'N'+this.lastNodeIndex++;
  this.nodes.set(nm,newNode);
  newNode.update();
  return newNode;
}


item.addEdge = function () {
  var newEdge =this.edgeP.instantiate().__show();
  var nm = 'E'+this.lastEdgeIndex++;
  this.edges.set(nm,newEdge);
  return newEdge;
}


item.computeDescendants = function () {
  debugger;
  var nodes = this.nodes;
  var edges = this.edges;
  //  because of deletions, some nodes may have been set to null. Fix up nodes accordingly
  pj.forEachTreeProperty(edges,function (edge) {
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
  debugger;
var i;
for (i=0;i<3;i++) {
  this.addNode();
}
for (i=0;i<2;i++) {
  this.addEdge();
}

this.nodes.N1.__moveto(geom.Point.mk(-0.5 * this.hSpacing,this.vSpacing));
this.nodes.N2.__moveto(geom.Point.mk(0.5 * this.hSpacing,this.vSpacing));
this.nodes.N1.incomingEdge = 'E0'
this.nodes.N2.incomingEdge = 'E1';

this.edges.E0.fromNode = 'N0';
this.edges.E0.toNode = 'N1';

this.edges.E1.fromNode = 'N0';
this.edges.E1.toNode = 'N2';
this.computeDescendants();
this.positionNodes();
this.update();
}

item.update = function () {
  var nodes = this.nodes;
  var edges = this.edges;
  pj.forEachTreeProperty(edges,function (edge) {
     debugger;
    var end0 = nodes[edge.fromNode].__getTranslation();
    var end1 = nodes[edge.toNode].__getTranslation();
    console.log('to',end1.x,end1.y);
    edge.setEnds(end0,end1);
    edge.update();
  });
  this.__draw();
}

item.nodeP.__delete = function () {
  var thisHere = this;
  ui.confirm('Are you sure you wish to delete this subtree?',function () {
    debugger;
    var diagram = thisHere.__parent.__parent;
    var root = diagram.nodes.N0;
    if (root === thisHere) {
      diagram.remove();
      ui.setSaved(false);
      pj.root.__draw();
      return;
    }
    diagram.deleteSubtree(thisHere,true);
    diagram.positionNodes();
    diagram.update();
    ui.setSaved(false);
    diagram.__draw();
  });
}

item.nodeP.__dragStep = function (pos) {
  this.__moveto(pos);
 var tree = this.__parent.__parent;
 tree.update();
}

var addDescendant = function (diagram,node) {
  //var node = pj.selectedNode;
  debugger;
  var edges = diagram.edges;
  var newEdge = diagram.addEdge();
  var newNode=  diagram.addNode();
  var nodePos = node.__getTranslation();
  var newPos = nodePos.plus(geom.Point.mk(0,diagram.vSpacing));
  newNode.__moveto(newPos);
  newEdge.fromNode = node.__name;
  newEdge.toNode = newNode.__name;
  newNode.incomingEdge = newEdge.__name;
  descendants(node).push(newEdge.toNode);
  diagram.positionNodes();
  diagram.update();
  debugger;
  node.__select('svg');
}

item.positionRelative = function () {
  var nodes = this.nodes;
  var edges = this.edges
  var rootNode = nodes.N0;
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
  recurse('N0');
  
}

item.positionNodes = function () {
  debugger;
  this.positionRelative();
  // now generate absolute  positions
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
  recurse('N0',geom.Point.mk(0,0));
}

item.deleteSubtree = function (node,topCall) {
  var children = node.descendants;
  var nodes = this.nodes;
  var edges = this.edges;
  var nm = node.__name;
  var thisHere = this;
  if  (children && (children.length > 0)) {
    children.forEach(function (childIndex) {
      var child = nodes[childIndex];
      var edge = edges[child.incomingEdge];
      edge.remove();
      thisHere.deleteSubtree(child);
    });
  }
  node.remove();
  if (topCall) {
    var edge = edges[node.incomingEdge];
    edge.remove();
    var parent = this.nodes[node.parentNode];
    var descendants = parent.descendants;
    var idx = descendants.indexOf(nm);
    descendants.splice(idx,1);
  }
}

item.nodeP.__actions = [{title:'add child',action:addDescendant}];


item.__activeTop = true;

//item.__topActions = [{id:'test1',title:'test test',action:function () {alert(2266);}}];

return item;
});
