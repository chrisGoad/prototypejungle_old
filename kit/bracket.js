core.require('/arrow/multiIn.js','/shape/textPlain.js','/shape/rectangle.js',function (multiInPP,textPP,rectPP) {
  
let item = svg.Element.mk('<g/>');

item.numLevels = 2;
item.height = 200;
item.width = 300;
item.bracketWidth = 530;//computed
item.textUp = 10;
item.textPad = 0;
item['font-size'] = 8;
item.editMode = true;
item.resizable = true;
item.isKit = true;
item.textWidth = 60;
item.hideAdvancedButtons = true;

item.addNode  = function (layerNum,right) {
  debugger;
  let lastLayer = layerNum === this.numLevels;
  let nodes = this.nodes;
  let newNode = svg.Element.mk('<g/>');
  newNode.unselectable = true;
  newNode.lastLayer = lastLayer;
  let firstLayer = layerNum === 0;
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
    debugger;
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
  // later add texts
}
  
item.initialize = function () {
  debugger;
  this.multiInP = core.installPrototype('multiInP',multiInPP);
  this.multiInP.vertical = false;
  this.textP = core.installPrototype('textP',textPP);
  this.rectP = core.installPrototype('rectP',rectPP);
  /*this.set('nodes', core.ArrayNode.mk());
  this.rootLeft = this.addNode(1);
  this.rootRight = this.addNode(1);
  this.rootLeft.right = false;
  this.rootRight.right = true;*/
}

item.addDescendants = function (node,layerNum) {
  debugger;
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
  debugger;
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
  let right = node.right;
  let bracket = node.bracket;
  let pos = bracket.singleEnd;
  let wd = node.lastLayer?1.5*this.bracketWidth:this.bracketWidth;
  bracket.singleEnd.copyto(pos);
  let top = pos.plus(Point.mk(right?wd:-wd,-0.25 * height));
  let bottom = pos.plus(Point.mk(right?wd:-wd,0.25 * height));
  //let wbnds = winner.bounds();
  //let mhww = -0.5*wbnds.extent.x;
  if (winner) {
    if (node.firstLayer) {
      debugger;
      node.winner.moveto(right?Point.mk(0,this.textUp):Point.mk(0,-this.textUp)) 
    } else {
      node.winner.moveto(pos.plus(right?this.textOffsetR:this.textOffsetL));
    }
  }
  
  if (lastLayer) {
    debugger;
    let topText = node.topText;
    let topBnds = topText.bounds();
    let htopX = Point.mk(0.5*topBnds.extent.x,0);
    topText.moveto(top.plus(right?this.textOffsetR.difference(htopX):this.textOffsetL.plus(htopX)));
    let bottomText = node.bottomText;
    let bottomBnds = bottomText.bounds();
    let hbottomX = Point.mk(0.5*bottomBnds.extent.x,0);
    bottomText.moveto(bottom.plus(right?this.textOffsetR.difference(hbottomX):this.textOffsetL.plus(hbottomX)));
  }
  if (this.editMode) {
    texts.forEach((txti) => {
      txti.show();
      if (txti.text === '') {
        txti.text = 'blank';
      }
    });
  } else {
    texts.forEach((txti) => {
      let txt = txti.text;
      if ((txt === 'winner') || (txt === 'entry') || (txt === 'blank'))  {
        txti.hide();
      } else {
        txti.show();
      }
    });
  }
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
  debugger;
  if ((this.numLevels) !== (this.builtLevels)) {
    if (this.nodes) {
      this.nodes.remove();
    }
    this.set('background',this.rectP.instantiate().show());
    this.background.unselectable = true;
    this.set('nodes',core.ArrayNode.mk());
    this.rootLeft = this.addNode(0,0);
    this.rootRight = this.addNode(0,1);
    this.rootLeft.bracket.singleEnd.copyto(Point.mk(0,0));
    this.rootRight.bracket.singleEnd.copyto(Point.mk(0,0));  
    this.rootLeft.right = false;
    this.rootRight.right = true;
    this.addDescendants(this.rootRight,1);
    this.addDescendants(this.rootLeft,1);
    this.set('textOffsetR',Point.mk(0,0));
    this.set('textOffsetL',Point.mk(0,0));
    this.firstUpdate = false;
    this.builtLevels = this.numLevels;
  }
  this.bracketWidth = this.width/(2 * (this.numLevels+1)+1.0);
  this.background.width = this.width;
  this.background.height = this.height;
  this.textOffsetL.copyto(Point.mk(this.textPad,-this.textUp));
  this.textOffsetR.copyto(Point.mk(-this.textPad,-this.textUp));
  core.setProperties(this.textP,this,['font-size']);
  this.layout(this.rootRight,this.height);
  this.layout(this.rootLeft,this.height);
}

item.setFieldType('editMode','boolean');


item.popInstructions = function () {
  debugger;
  editor.popInfo('way back when <b>upon</b> the river<br/> the boat sank');
}

item.selectKit = function () {
  this.__select('svg');
}

item.actions = function (node) {
  let rs = [];
  if (!node) return;
  rs.push({title:'Select Kit Root',action:'selectKit'});
  rs.push({title:'Bracket Instructions',action:'popInstructions'});
   
  return rs;
 
}


return item;
});
     
