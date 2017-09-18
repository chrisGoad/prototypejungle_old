pj.require('/text/textbox.js','/shape/rectangle.js','/shape/multiInArrow.js',function (textboxPP,rectanglePP,connectorPP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
//ar item = graphP.instantiate();
let item = pj.svg.Element.mk('<g/>');

item.paddingLeft = 10;
item.paddingRight = 10;
item.vSpacing = 10;
item.leafWidth = 30;
//item.set('nodeP', pj.svg.Element.mk('<g/>'));
//let textP = item.nodeP.set('text', svg.Element.mk('<text font-size="18" font-family="Verdana" font="arial" fill="black" visibility="hidden" stroke-width="0" text-anchor="middle"/>'));
//debugger;
let textP = ui.installPrototype('textbox',textboxPP);
item.textP = textP;
textP.__draggableInDiagram = true;
debugger;
let connectorP = ui.installPrototype('connector',connectorPP);
item.connectorP = connectorP;
//let conntectorP = 
//item.nodeP.text = textP;
//let textP = item.nodeP.set('text', textboxPP.instantiate().__hide());
//let textP = item.nodeP.set('text', textboxPP.instantiate().__hide());
textP.multiline = false;
textP.__role = 'vertex';
textP['font-size'] = 10;
textP.lineSep = 1;
textP.width = 15;
textP.height = 10;
textP.vPadding = 0;
//item.nodeP.set('bracket',rectanglePP.instantiate().__hide());

/*
item.nodeP.set('connector',connectorPP.instantiate().__hide());
item.nodeP.set('descendants',pj.Array.mk());
*/
connectorP.width = 50;
connectorP['stroke-width'] = 2;
connectorP.pointsTo = 'left';
connectorP.includeHead = false;


//item.nodeP.connector.__setExtent(geom.Point.mk(10,50));
// note we need to build nodes from installed prototypes to support the replace prototype machinery
item.newNode = function (text) {
  let rs = pj.svg.Element.mk('<g/>');
  rs.set('text',textP.instantiate());
  rs.set('connector',connectorP.instantiate());
  rs.set('descendants',pj.Array.mk());
  return rs;
}
item.addChild = function (parent,text) {
  //let rs =  this.nodeP.instantiate();
  let rs = this.newNode();
  //rs.set('bracket',this.bracketP.instantiate());
  //rs.set('descendants',pj.Array.mk());
  rs.text.width = this.leafWidth;
  rs.text.__show();
  rs.text.__setText(text);
  rs.text.update();
  parent.descendants.push(rs);
  parent.connector.__show();
  return rs;
}



item.setRootText = function (text) {
  if (!this.rootNode) {
    this.set('rootNode',this.newNode());
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
    node.width = textBnds.width + this.paddingLeft + this.paddingRight + node.connector.width + maxWidth;
    let inEnds = node.connector.inEnds;
    let ln = inEnds.length;
    if  (ln > d.length) {
       //for (let i=d.length;i<ln;i++) {
      //  inEnds.pop();
     // }
     inEnds.length = d.length;
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
    connector.update();
  }
}

item.firstUpdate = true;
item.update = function () {
  console.log('UPDATING');
  if (this.rootNode && this.firstUpdate) {
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
/*
 item.set('__diagramTransferredProperties',graphP.__diagramTransferredProperties.concat(pj.lift(
                ['incomingEdge','parentVertex','descendants__','relPosition__','vertexActions','__delete','__dragStep'])));
item.__diagramTransferredProperties.__const = true;
*/




item.__delete = function (text) {
  if (text.__role !== 'vertex') {
    ui.alert('Only nodes, not connectors, can be deleted');
    return;
  }
  var thisHere = this;
  let node = text.__parent;
  const doDelete =  function () {
    node.remove();
    ui.setSaved(false);
    thisHere.update();
    thisHere.__draw();
  };
  if (node.descendants.length > 0) {
     ui.confirm('Are you sure you wish to delete this subtree?',doDelete);
  } else {
    doDelete();
  }
}


item.__dragStep = function (text,pos) {
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

item.addDescendant = function (diagram,text) {
  let node = text.__parent;
  diagram.addChild(node,'text');
  //node.connector.update();
  diagram.update();
  diagram.__draw();
  debugger;
  svg.main.fitContentsIfNeeded();
}

// down means move later in the array (farther down the screen)
item.moveUpOrDown = function (diagram,text,up) {
  let node = text.__parent;
  let parentDescendants = node.__parent;
  let parent = parentDescendants.__parent;
  parent.__childBeenMoved = false;
  let idx = parentDescendants.indexOf(node);
  let switchIndex;
  if (up) {
    if (idx === 0) {
      return;
    }
    switchIndex = idx - 1;
  } else {
    let ln = parentDescendants.length;
    if (ln === idx+1) {
      return;
    }
    switchIndex = idx + 1;
  }
  let switchNode = parentDescendants[switchIndex];
  parentDescendants[idx] = switchNode;
  switchNode.__name = idx;
  parentDescendants[switchIndex] = node;
  node.__name = switchIndex;
  diagram.update();
  ui.updateControlBoxes();//!ui.nowAdjusting);

}


item.moveUp= function (diagram,text) {
  item.moveUpOrDown(diagram,text,true);
}


item.moveDown= function (diagram,text) {
  debugger;
  item.moveUpOrDown(diagram,text,false);
}

const repositionR = function (node) {
  node.__childBeenMoved = false;
  let descendants = node.descendants;
  descendants.forEach(repositionR);
}


item.reposition = function (diagram,text) {
  repositionR(text.__parent);
  diagram.update();
}


item.__actions = function (item) {
  if (item.__role === 'vertex') {
    return [{title:'add child',action:'addDescendant'},
            {title:'move up',action:'moveUp'},
            {title:'move down',action:'moveDown'},
            {title:'Reposition Subtree',action:'reposition'}];
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
