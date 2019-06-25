core.require('/arrow/multiIn.js','/shape/textPlain.js','/shape/rectangle.js',function (multiInPP,textPP,rectPP) {
  
let item = svg.Element.mk('<g/>');

/*adjustable parameters */
item.numLevels = 3;
item.textUp = 10;
item.height = 300;
item.width = 500;
/* end adjustable parameters */

item.bracketWidth = 530;//computed
item.textPad = 0;
item.resizable = true;
item.isKit = true;
item.textWidth = 60; //computed
item.hideAdvancedButtons = true;

item.addNode  = function (layerNum,right) {
  let lastLayer = layerNum === this.numLevels;
  let nodes = this.nodes;
  let newNode = svg.Element.mk('<g/>');
  newNode.unselectable = true;
  newNode.lastLayer = lastLayer;
  let firstLayer = layerNum === 1;
  newNode.firstLayer = firstLayer;
  newNode.right = right;
  nodes.push(newNode);
  let bracket = this.multiInP.instantiate().show();
  bracket.elbowPlacement = lastLayer?0.3:0.5;
  bracket.unselectable = true;
  bracket.ends.push(Point.mk(0,0));
  newNode.set('bracket',bracket);
  if ((!firstLayer) || (firstLayer && !right)) {
    newNode.set('winner',this.textP.instantiate().show());
    newNode.winner.text = 'name';
    newNode.winner.width = this.textWidth;
    newNode.winner.update();
  }
  if (lastLayer) {
    newNode.set('topText',this.textP.instantiate().show());
    newNode.topText.text = 'name';
    newNode.topText.width = this.textWidth;
    newNode.topText.update();
    newNode.set('bottomText',this.textP.instantiate().show());
    newNode.bottomText.text = 'name';
    newNode.bottomText.width = this.textWidth;
    newNode.bottomText.update();
  }
  newNode.layer = layerNum;
  return newNode;
}
  
item.initialize = function () {
  this.multiInP = core.installPrototype('multiInP',multiInPP);
  this.multiInP.vertical = false;
  this.textP = core.installPrototype('textP',textPP);
  this.rectP = core.installPrototype('rectP',rectPP);
}

item.addDescendants = function (node,layerNum) {
  let right = node.right;
  let nextLayer = layerNum+1;
  let top = node.set('topChild',this.addNode(layerNum,right));
  let bottom = node.set('bottomChild',this.addNode(layerNum,right));
  if (layerNum === this.numLevels) {
    return;
  }
  this.addDescendants(top,nextLayer);
  this.addDescendants(bottom,nextLayer);
}

  
item.layout = function (node,height) {
  let lastLayer = node.lastLayer;
  let texts = [];
  let winner = node.winner;
  if (winner) {
    texts.push(winner);
  }
  if (lastLayer) {
    texts.push(node.topText);
    texts.push(node.bottomText);
  }
  texts.forEach((text) => text.width = this.textWidth);
  let right = node.right;
  let bracket = node.bracket;
  let pos = bracket.singleEnd;
  let wd = node.lastLayer?1.5*this.bracketWidth:this.bracketWidth;
  bracket.singleEnd.copyto(pos);
  bracket.update();
  let top = pos.plus(Point.mk(right?wd:-wd,-0.25 * height));
  let bottom = pos.plus(Point.mk(right?wd:-wd,0.25 * height));
  if (winner) {
    if (node.firstLayer) {
      node.winner.moveto(right?Point.mk(0,this.textUp):Point.mk(0,-this.textUp)) 
    } else {
      node.winner.moveto(pos.plus(right?this.textOffsetR:this.textOffsetL));
    }
  }
  
  if (lastLayer) {
    let topText = node.topText;
    let topBnds = topText.bounds();
    let htopX = Point.mk(0.5*topBnds.extent.x,0);
    topText.moveto(top.plus(right?this.textOffsetR.difference(htopX):this.textOffsetL.plus(htopX)));
    let bottomText = node.bottomText;
    let bottomBnds = bottomText.bounds();
    let hbottomX = Point.mk(0.5*bottomBnds.extent.x,0);
    bottomText.moveto(bottom.plus(right?this.textOffsetR.difference(hbottomX):this.textOffsetL.plus(hbottomX)));
  }
  texts.forEach((txti) => {
    txti.show();
    if (txti.text === '') {
      txti.text = 'blank';
    }
  });
  bracket.ends[0].copyto(top);
  bracket.ends[1].copyto(bottom);
  if (node.topChild) {
    node.topChild.bracket.singleEnd.copyto(top);
    node.bottomChild.bracket.singleEnd.copyto(bottom);
    this.layout(node.topChild,0.5 * height);
    this.layout(node.bottomChild,0.5 * height);
  }
}
  
  
  
  
item.firstUpdate = true;

item.update = function () {
  if ((this.numLevels) !== (this.builtLevels)) {
    if (this.nodes) {
      this.nodes.remove();
    }
    this.set('background',this.rectP.instantiate().show());
    this.background.stroke = "transparent";
    this.background.unselectable = true;
    this.set('nodes',core.ArrayNode.mk());
    this.rootLeft = this.addNode(1,0);
    this.rootRight = this.addNode(1,1);
    this.rootLeft.bracket.singleEnd.copyto(Point.mk(0,0));
    this.rootRight.bracket.singleEnd.copyto(Point.mk(0,0));  
    this.rootLeft.right = false;
    this.rootRight.right = true;
    this.addDescendants(this.rootRight,2);
    this.addDescendants(this.rootLeft,2);
    this.set('textOffsetR',Point.mk(0,0));
    this.set('textOffsetL',Point.mk(0,0));
    this.builtLevels = this.numLevels;
  }
  this.textP.__update();
  this.bracketWidth = this.width/(2 * this.numLevels +1.0);
  this.textWidth =  0.9 * this.bracketWidth;
  this.background.width = this.width;
  this.background.height = this.height;
  this.textOffsetL.copyto(Point.mk(this.textPad,-this.textUp));
  this.textOffsetR.copyto(Point.mk(-this.textPad,-this.textUp));
  this.layout(this.rootRight,this.height);
  this.layout(this.rootLeft,this.height);
  this.background.update();
  this.draw();
  if (this.firstUpdate) {
     dom.svgMain.fitContentsIfNeeded();
  }
  this.firstUpdate = false;
}



ui.hide(item,['background','bracketWidth','builtLevels','firstUpdate','height','hideAdvancedButtons',
              'nodes','textOffsetL','textOffsetR','textPad','width','textWidth']);


item.afterLoad = function () {
  //this.layoutTree(person.nodeOf);
 
  dom.svgMain.fitContents(0.9);

}
return item;
});
     
