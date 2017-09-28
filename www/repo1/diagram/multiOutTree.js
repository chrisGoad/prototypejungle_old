'use strict';
pj.require('/text/textbox.js','/shape/rectangle.js','/shape/multiInArrow.js',function (textboxPP,rectanglePP,connectorPP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
let item = pj.svg.Element.mk('<g/>');

item.paddingLeft = 10;
item.paddingRight = 10;
item.vSpacing = 10;
item.leafWidth = 30;
let textP = ui.installPrototype('textbox',textboxPP);
item.textP = textP;
textP.__draggableInDiagram = true;
let connectorP = ui.installPrototype('connector',connectorPP);
item.connectorP = connectorP;
textP.multiline = false;
textP.__role = 'vertex';
textP['font-size'] = 10;
textP.lineSep = 1;
textP.width = 15;
textP.height = 10;
textP.vPadding = 0;

connectorP.width = 50;
connectorP['stroke-width'] = 2;
connectorP.pointsTo = 'left';
connectorP.includeHead = false;


// note we need to build nodes from installed prototypes to support the replace prototype machinery
item.newNode = function (text) {
  let textProto;
  let rs = pj.svg.Element.mk('<g/>');
  ui.hide(rs,'__childBeenMoved');
  if (this.rootNode) {
    textProto = Object.getPrototypeOf(this.rootNode.text)
  } else {
    textProto = textP;
  }
  rs.set('text',textProto.instantiate());
  rs.set('connector',connectorP.instantiate());
  rs.set('descendants',pj.Array.mk());
  return rs;
}
item.addChild = function (parent,text) {
  let rs = this.newNode();
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
              });
    node.height = totalHeight - this.vSpacing; // vertical spacing not needed at top or bottom
    node.width = textBnds.width + this.paddingLeft + this.paddingRight + node.connector.width + maxWidth;
    let inEnds = node.connector.inEnds;
    let ln = inEnds.length;
    if  (ln > d.length) {
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
  let textBnds = node.text.__getBBox();
  let thisHere = this;
  if (!textBnds) {
    return;
  }
  let connector = node.connector;
   node.text.__moveto(geom.Point.mk(this.paddingLeft + (textBnds.width)/2,0));
   connector.end1.copyto(geom.Point.mk(this.paddingLeft + textBnds.width + this.paddingRight,0));
  let leftx = this.paddingLeft + textBnds.width + this.paddingRight +  node.connector.width;
  let inEnds = connector.inEnds;
  let wd = node.connector.width;
  let d = node.descendants;
  if (d.length > 0) {
    if (node.__childBeenMoved) { // leave children where they are
      for (let i=0;i<d.length;i++) {
        let n = d[i];
        thisHere.setPositions(n);
        let cpos = n.__getTranslation();
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
  if (this.rootNode && this.firstUpdate) {
    this.computeDimensions(this.rootNode);
    this.setPositions(this.rootNode);
    if (this.rootNode.__element) {
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


item.addDescendant = function (diagram,text) {
  let node = text.__parent;
  diagram.addChild(node,'text');
  //node.connector.update();
  diagram.update();
  diagram.__draw();
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

item.__diagram = true;

return item;
});
