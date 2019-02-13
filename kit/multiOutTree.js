//multiOutTree
//a v|^|
//core.require('/text/textContainer.js','/arrow/multiInArrow.js',function (textboxPP,connectorPP) {
core.require('/shape/textPlain.js','/arrow/multiInArrow.js',function (textboxPP,connectorPP) {
let item = svg.Element.mk('<g/>');

item.paddingLeft = 10;
item.paddingRight = 10;
item.vSpacing = 10;
item.leafWidth = 30;
let textP = core.installPrototype('textbox',textboxPP);
item.textP = textP;
textP.draggableInKit = true;
let connectorP = core.installPrototype('connector',connectorPP);
item.connectorP = connectorP;
connectorP.unselectable = true;
textP.role = 'vertex';
connectorP.width = 50;
connectorP['stroke-width'] = 2;
connectorP.pointsTo = 'left';
connectorP.includeHead = false;


// note we need to build nodes from installed prototypes to support the replace prototype machinery
item.newNode = function () {
  let textProto;
  let rs = svg.Element.mk('<g/>');
  rs.unselectable = true;
  ui.hide(rs,'__childBeenMoved');
  if (this.rootNode) {
    textProto = Object.getPrototypeOf(this.rootNode.text)
  } else {
    textProto = textP;
  }
  rs.set('text',textProto.instantiate());
  rs.text.draggableInKit = true;
  rs.set('connector',connectorP.instantiate());
  rs.set('descendants',core.ArrayNode.mk());
  return rs;
}

item.addChild = function (parent,text,index=0) {
  let rs = this.newNode();
  rs.text.width = this.leafWidth;
  rs.text.show();
  rs.text.text = text;
  rs.text.update();
  parent.descendants.splice(index,0,rs);
  parent.__childBeenMoved = false;
  parent.show();
  parent.connector.show();
  return rs;
}

item.addChildAction = function (node) {
  this.addChild(node.__parent,'text');   
  this.update();
  node.__select('svg');
  this.draw();
  dom.svgMain.fitContentsIfNeeded();
}


item.addSibling = function (text) {
  let node = text.__parent;
  if (node) {
    let parent = node.__parent;
    if (parent) {
      let parentNode = parent.__parent;
      let idx = parentNode.descendants.indexOf(node);
      this.addChild(parentNode,'sibling',idx+1);
      this.update();
      ui.vars.__selectedNode = undefined;
      text.__reselect('svg');
      this.draw();
      dom.svgMain.fitContentsIfNeeded();
    }
  }
}



item.setRootText = function (text) {
  if (!this.rootNode) {
    this.set('rootNode',this.newNode());
  }
  this.rootNode.text.text = text;
  this.rootNode.text.update();
  this.rootNode.text.show();
}

item.buildFromDataR = function (node,data) {
  let thisHere = this;
  let d = data.d;
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

item.buildFromData = function (idata) {
  let node = this;
  let data;
  if (idata) {
    data = core.lift(idata);
    node.set('data',data);
    node.__internalDataString = undefined;
  } else {
    data = core.getData(node);
  }
  if (!data) {
    return;
  }
 
  if (this.rootNode) {
     this.rootNode.remove();
  }
  this.setRootText(data.text);
  this.buildFromDataR(this.rootNode,data);
}

item.computeDimensions = function (node) {
  let d = node.descendants;
  let totalHeight = 0;
  let maxWidth = 0;
  node.text.update();
  let textBnds = node.text.getBBox();
  if (!textBnds) {
    return;
  }
  let thisHere = this;
  if (d.length > 0) {
    d.forEach(function (n) {
                thisHere.computeDimensions(n);
                totalHeight += n.height + thisHere.vSpacing;
                maxWidth = Math.max(n.width,maxWidth);
              });
    node.height = totalHeight - this.vSpacing; // vertical spacing not needed at top or bottom
    node.width = textBnds.width + this.paddingLeft + this.paddingRight + node.connector.width + maxWidth;
    let ends = node.connector.ends;
    let ln = ends.length;
    if  (ln > d.length) {
     ends.length = d.length;
      node.connector.inCount = d.length;
    } else {
      for (let i=ln;i<d.length;i++) {
        ends.push(geom.Point.mk(0,0));
      }
    }
  } else {
    node.height = textBnds.height;
    node.width = textBnds.width + this.paddingLeft + this.paddingRight + node.connector.width;
  }
}

// origins of nodes are at left end and centered vertically

item.setPositions = function (node) {
  let textWidth;
  let textBnds = node.text.bounds();//text.getBBox();
  if (!textBnds) {
    console.log('unexpected null bounds in multiOutTree/setPositions'); //keep
    textWidth = 0;
  } else {
    textWidth = textBnds.extent.x;
  }
  let thisHere = this;
  let connector = node.connector;
  let connectorWidth = connector.width;
  node.text.moveto(geom.Point.mk(this.paddingLeft + (textWidth)/2,0));
  connector.singleEnd.copyto(geom.Point.mk(this.paddingLeft + textWidth + this.paddingRight,0));
  let leftx = this.paddingLeft + textWidth + this.paddingRight +  connectorWidth;
  let ends = connector.ends;
  let d = node.descendants;
  if (d.length > 0) {
    if (node.__childBeenMoved) { // leave children where they are
      for (let i=0;i<d.length;i++) {
        let n = d[i];
        thisHere.setPositions(n);
        let cpos = n.getTranslation();
        ends[i].copyto(cpos);
      }
    } else {
      let topy = -node.height/2;
      for (let i=0;i<d.length;i++) {
        let n = d[i];
          let cy = topy + n.height/2;
          thisHere.setPositions(n);
          n.moveto(geom.Point.mk(leftx,cy));
          ends[i].copyto(geom.Point.mk(leftx,cy));
          topy += n.height + thisHere.vSpacing;
      }
    }
    connector.update();
  }
  node.draw();
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



item.__delete = function (text) {
  if (text.role !== 'vertex') {
    ui.alert('Only nodes, not connectors, can be deleted');
    return;
  }
  var thisHere = this;
  let node = text.__parent;
  const doDelete =  function () {
    node.remove();
    ui.vars.setSaved(false);
    thisHere.update();
    thisHere.draw();
  };
  if (node.descendants.length > 0) {
     editor.confirm('Are you sure you wish to delete this subtree?',doDelete);
  } else {
    doDelete();
  }
}


item.dragStep = function (text,pos) {  
  let node = text.__parent;
  let bnds = text.getBBox();
  let nposx = pos.x - bnds.width/2;
  let parent = node.__parent.__parent;
  let cpos = node.getTranslation();
  let localPos = node.toLocalCoords(Point.mk(pos.x,pos.y));
  localPos.x = cpos.x;
  node.moveto(localPos);
  parent.__childBeenMoved = true;
  let idx = node.__name;
  let ends = parent.connector.ends;
  ends[idx].copyto(localPos);
  parent.connector.update();
}


item.beenMoved = function (text) {
  text.__parent.__parent.__parent.__childBeenMoved = true;
}


item.addDescendant = function (diagram,text) {
  let node = text.__parent;
  diagram.addChild(node,'text');
  diagram.update();
  diagram.draw();
  dom.svgMain.fitContentsIfNeeded();
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
  ui.updateControlBoxes();

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


item.reposition = function (vertex) {
  repositionR(vertex.__parent);
  this.update();
}


item.repositionTree = function () {
  this.reposition(this.rootNode.text);
}

item.selectTree = function () {
  this.__select('svg');
}


item.actions = function (text) {
  let rs = [];
  if (text.role === 'vertex') {
    rs.push({title:'Select Whole Tree',action:'selectTree'});
    rs.push({title:'Add Child',action:'addChildAction'});
    if (!(text.__parent.__parent.isKit)) {
      rs.push({title:'Add Sibling',action:'addSibling'});
    }
    rs.push({title:'Reposition Subtree',action:'reposition'});
  }
  if (text === this) {
    rs.push({title:'Reposition Tree',action:'repositionTree'});
  }
  return rs;
}


item.transferElementState = function (dst,src,own) {
  if (core.hasRole(src,'vertex')) {
    core.setProperties(dst,src, ['draggableInKit'],own,true);       // dontCopy = true
  } 
}

item.isKit = true;

return item;
});
