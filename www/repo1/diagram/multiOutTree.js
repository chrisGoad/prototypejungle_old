pj.require('/text/textbox.js','/shape/rectangle.js','/shape/multiInArrow.js',function (textboxPP,rectanglePP,connectorPP) {
  debugger;
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
//ar item = graphP.instantiate();
let item = pj.svg.Element.mk('<g/>');

item.paddingLeft = 10;
item.paddingRight = 10;
item.vSpacing = 5;
item.leafWidth = 300;
debugger;
item.set('nodeP', pj.svg.Element.mk('<g/>'))
//item.nodeP.set('text', svg.Element.mk('<text font-size="18" font-family="Verdana" font="arial" fill="black" visibility="hidden" stroke-width="0" text-anchor="middle"/>'));
let textP = item.nodeP.set('text', textboxPP.instantiate().__hide());
textP.multiline = true;
textP['font-size'] = 10;
textP.lineSep = 1;
textP.width = 150;
textP.height = 20;
textP.__role = 'text';
//item.nodeP.set('bracket',rectanglePP.instantiate().__hide());
item.nodeP.set('connector',connectorPP.instantiate().__hide());
item.nodeP.set('descendants',pj.Array.mk());
item.nodeP.connector.width = 50;
item.nodeP.connector['stroke-width'] = 2;
item.nodeP.connector.pointsTo = 'left';
item.nodeP.connector.includeHead = false;

//item.nodeP.connector.__setExtent(geom.Point.mk(10,50));

item.addChild = function (parent,text) {
  let rs =  this.nodeP.instantiate();
  //rs.set('text',this.textP.instantiate());
  //rs.set('bracket',this.bracketP.instantiate());
  //rs.set('descendants',pj.Array.mk());
  rs.text.width = this.leafWidth;
  rs.text.__show();
  rs.text.__setText(text);
  //rs.text.update();
  parent.descendants.push(rs);
  parent.connector.__show();
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
      if (!childData.d) {
        child.text.width = thisHere.leafWidth; 
      }
      thisHere.buildFromDataR(child,childData);
    });
  }
}

item.buildFromData = function (data) {
  this.setRootText(data.text);
  this.buildFromDataR(this.rootNode,data);
}

item.computeDimensions = function (node) {
 // debugger;
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
    node.height = totalHeight;// - this.vSpacing; // vertical spacing not needed at top or bottom
    node.width = textBnds.width + this.paddingLeft + this.paddingRight + node.connector.width + maxWidth;
    let inEnds = node.connector.inEnds;
    let ln = inEnds.length;
    if  (ln > d.length) {
       //for (let i=d.length;i<ln;i++) {
      //  inEnds.pop();
     // }
     inEnds.length = d.length;
      debugger;
      node.connector.inCount = d.length;
    } else {
      for (let i=ln;i<d.length;i++) {
        inEnds.push(geom.Point.mk(0,0));
      }
    }
  } else {
    node.height = textBnds.height;
    node.width = textBnds.width + this.paddingLeft + this.paddingRight + node.connector.width;
  }
}

// origins of nodes are at left end and centered vertically

item.setPositions = function (node) {
 // node.__moveto(pos);
 debugger;
 console.log('setPositions');
  let textBnds = node.text.__getBBox();
  let thisHere = this;
  if (!textBnds) {
    return;
  }
    console.log('textbnds',textBnds.width);
  let connector = node.connector;
   //node.bracket.__setExtent(textBnds);
   node.text.__moveto(geom.Point.mk(this.paddingLeft + (textBnds.width)/2,0));
   connector.end1.copyto(geom.Point.mk(this.paddingLeft + textBnds.width + this.paddingRight,0));
  //node.connector.__moveto(geom.Point.mk(this.paddingLeft + textBnds.width + this.paddingRight + node.connector.width/2,0));
  let leftx = this.paddingLeft + textBnds.width + this.paddingRight +  node.connector.width;
  let inEnds = connector.inEnds;
 /* outEnds[0].copyto(geom.Point.mk(leftx,0));
  outEnds[1].copyto(geom.Point.mk(leftx,30));
   if (outEnds.length > 2) {
       outEnds[2].copyto(geom.Point.mk(leftx,60));

   }
  connector.update();
*/
 let wd = node.connector.width;
  
 // node.connector.__setExtent(geom.Point.mk(wd,node.height));
  let d = node.descendants;
  if (d.length > 0) {
    if (node.__childBeenMoved) { // leave children where they are
      for (let i=0;i<d.length;i++) {
        let n = d[i];
        thisHere.setPositions(n);
        let cpos = n.__getTranslation();
        console.log('cpos',cpos.x,cpos.y);
        inEnds[i].copyto(cpos);
      }
    } else {
      let topy = -node.height/2;
      for (let i=0;i<d.length;i++) {
        let n = d[i];
          let cy = topy + n.height/2;
          thisHere.setPositions(n);
          n.__moveto(geom.Point.mk(leftx,cy));
          inEnds[i].copyto(geom.Point.mk(leftx,cy));
          topy += n.height + thisHere.vSpacing;
      }
    }
  }
  connector.update();

}

item.firstUpdate = true;
item.update = function () {
  console.log('UPDATING');
  if (this.rootNode && this.firstUpdate) {
    debugger;
    this.computeDimensions(this.rootNode);
    this.setPositions(this.rootNode);
    if (this.rootNode.__element) {
      //this.firstUpdate = false;
    }
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


item.__dragStep = function (text,pos) {
  debugger;
  let node = text.__parent;
  let bnds = text.__getBBox();
  let nposx = pos.x - bnds.width/2;
  let parent = node.__parent.__parent;
  let cpos = node.__getTranslation();
  let localPos = geom.toLocalCoords(node,geom.Point.mk(pos.x,pos.y));
  localPos.x = cpos.x;
  node.__moveto(localPos);
 // text.__moveto(geom.Point.mk(this.paddingLeft + (bnds.width)/2,0));// has no effect ; bug
  parent.__childBeenMoved = true;
  let idx = node.__name;
  let inEnds = parent.connector.inEnds;
  inEnds[idx].copyto(localPos);
  parent.connector.update();
}
/*
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

item.addDescendant = function (diagram,text) {
  debugger;
  let node = text.__parent;
  diagram.addChild(node,'text');
  //node.connector.update();
  diagram.update();
}

item.__actions = function (item) {
  if (item.__role === 'text') {
    return [{title:'add child',action:'addDescendant'}];//,{title:'move up',action:'moveUp'},
           // {title:'move down',action:'moveDown'},
          //  {title:'Reposition Subtree',action:'reposition'}];
  }
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
