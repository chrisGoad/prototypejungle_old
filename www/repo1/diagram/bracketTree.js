pj.require('/text/textbox.js','/shape/multiOutArrow',function (textboxPP,connectorPP) {
  debugger;
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
//ar item = graphP.instantiate();
let item = pj.svg.Element.mk('<g/>');

item.paddingLeft = 10;
item.paddingRight = 10;
item.vSpacing = 15;

debugger;
item.set('nodeP', pj.svg.Element.mk('<g/>'))
//item.nodeP.set('text', svg.Element.mk('<text font-size="18" font-family="Verdana" font="arial" fill="black" visibility="hidden" stroke-width="0" text-anchor="middle"/>'));
let textP = item.nodeP.set('text', textboxPP.instantiate().__hide());
textP.multiline = true;
textP['font-size'] = 7;
textP.lineSep = 1;
textP.width = 80;
//item.nodeP.set('bracket',rectanglePP.instantiate().__hide());
item.nodeP.set('connector',connectorPP.instantiate().__hide());
item.nodeP.set('descendants',pj.Array.mk());

item.nodeP.bracket.__setExtent(geom.Point.mk(10,50));

item.addChild = function (parent,text) {
  debugger;
  let rs =  this.nodeP.instantiate();
  //rs.set('text',this.textP.instantiate());
  //rs.set('bracket',this.bracketP.instantiate());
  //rs.set('descendants',pj.Array.mk());
  rs.text.__show();
  rs.text.__setText(text);
  //rs.text.update();
  parent.descendants.push(rs);
  parent.bracket.__show();
  return rs;
}



item.setRootText = function (text) {
  if (!this.rootNode) {
    this.set('rootNode',this.nodeP.instantiate());
  }
  this.rootNode.text.__setText(text);
  this.rootNode.text.update();
  this.rootNode.text.__show();
}

item.buildFromDataR = function (node,data) {
  let d = data.d;
  let thisHere = this;
  if (d) {
    d.forEach(function (childData) {
      let child = thisHere.addChild(node,childData.text);
      thisHere.buildFromDataR(child,childData);
    });
  }
}

item.buildFromData = function (data) {
  this.setRootText(data.text);
  this.buildFromDataR(this.rootNode,data);
}

item.computeDimensions = function (node) {
  debugger;
  let d = node.descendants;
  let totalHeight = 0;
  let maxWidth = 0;
  node.text.update();
  let textBnds = node.text.__getBBox();
  if (!textBnds) {
    return;
  }
  let thisHere = this;
  if (d.length > 0) {
    d.forEach(function (n) {
                thisHere.computeDimensions(n);
                totalHeight += n.height + thisHere.vSpacing;
                maxWidth = Math.max(n.width,maxWidth)
              });//  node.forEach(d.computeRelPositions)?
    node.height = totalHeight - this.vSpacing; // vertical spacing not needed at top or bottom
    node.width = textBnds.width + this.paddingLeft + this.paddingRight + node.bracket.width + maxWidth;
  } else {
    node.height = textBnds.height;
    node.width = textBnds.width + this.paddingLeft + this.paddingRight + node.bracket.width;
  }
}

// origins of nodes are at left end and centered vertically

item.setPositions = function (node) {
 // node.__moveto(pos);
 debugger;
  let textBnds = node.text.__getBBox();
  let thisHere = this;
  if (!textBnds) {
    return;
  }
    console.log('textbnds',textBnds.width);

   //node.bracket.__setExtent(textBnds);
   node.text.__moveto(geom.Point.mk(this.paddingLeft + (textBnds.width)/2,0));
  node.bracket.__moveto(geom.Point.mk(this.paddingLeft + textBnds.width + this.paddingRight + node.bracket.width/2,0));
  let leftx = this.paddingLeft + textBnds.width + this.paddingRight +  node.bracket.width;
  let wd = node.bracket.width;
  node.bracket.__setExtent(geom.Point.mk(wd,node.height));
  let d = node.descendants;
  if (d.length > 0) {
    let topy = -node.height/2;
    d.forEach(
      function (n) {
        let cy = topy + n.height/2;
        thisHere.setPositions(n);
        n.__moveto(geom.Point.mk(leftx,cy));
        topy += n.height + thisHere.vSpacing;
    });
  } 
}

item.update = function () {
  if (this.rootNode) {
    this.computeDimensions(this.rootNode);
    this.setPositions(this.rootNode);
  }
}

var vertexInstanceTransferFunction = function (dest,src) {
  if (src.relPosition__) {
    if (dest.relPosition__) {
      dest.relPosition__.copyto(src.relPosition__);
    } else {
      dest.set('relPosition__',src.relPosition__.copy());
    }
  }
}

//item.set('__diagramTransferredProperties', pj.lift(['end0vertex','end1vertex','end0connection','end1connection']));
debugger;
/*
 item.set('__diagramTransferredProperties',graphP.__diagramTransferredProperties.concat(pj.lift(
                ['incomingEdge','parentVertex','descendants__','relPosition__','vertexActions','__delete','__dragStep'])));
item.__diagramTransferredProperties.__const = true;
*/




item.__delete = function (vertex) {
  if (vertex.__role !== 'vertex') {
    ui.alert('Only nodes, not connectors, can be deleted');
    return;
  }
  var thisHere = this;
  var graph = this.graph;
  ui.confirm('Are you sure you wish to delete this subtree?',function () {
    var root = graph.vertices.V0;
    if (root === vertex) {
      thisHere.remove();
      ui.setSaved(false);
      return;
    }
    thisHere.deleteSubtree(vertex,true);
    thisHere.positionRelative();
    thisHere.positionvertices();
    thisHere.update();
    ui.setSaved(false);
    thisHere.__draw();
});
}

/*
item.__dragStep = function (vertex,pos) {
 var localPos = geom.toLocalCoords(this,pos);
 vertex.__moveto(localPos);
 debugger;
 this.positionvertices(vertex);
 this.update();
}

item.__dragStart = function () {
  this.computeRelativePositions();
}
*/

item.deleteSubtree = function (vertex,topCall) {
  debugger;
  var children = vertex.descendants__;
  var vertices = this.graph.vertices;
  var edges = this.graph.edges;
  var nm = vertex.__name;
  var thisHere = this;
  if  (children && (children.length > 0)) {
    children.forEach(function (childIndex) {
      var child = vertices[childIndex];
      var edge = edges[child.incomingEdge];
      edge.remove();
      thisHere.deleteSubtree(child);
    });
  }
  if (topCall) {
    var parent = this.graph.vertices[vertex.parentVertex];
    var descendants = parent.descendants__;
    var idx = descendants.indexOf(nm);
    descendants.splice(idx,1);
    var edge = edges[vertex.incomingEdge];
    edge.remove();
  
  } 
  vertex.remove();
}
/*
item.__actions = function (item) {
  if (item.__role === 'vertex') {
    return [{title:'add child',action:'addDescendant'},{title:'connect',action:'connectAction'},
                            {title:'Reposition Subtree',action:'reposition'}];
  }
}
*/
item.__diagram = true;

//item.graph.__activeTop = false;
//item.__topActions = [{id:'test1',title:'test test',action:function () {alert(2266);}}];

return item;
});
