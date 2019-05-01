core.require('/arrow/multiIn.js','/shape/textPlain.js',function (multiInPP,textPP) {
  
let item = svg.Element.mk('<g/>');

item.numLevels = 2;
item.height = 140;
item.width = 200;
item.bracketWidth = 50;
item.textUp = 4;
item.textPad = 5;
item['font-size'] = 8;
item.editMode = true;
item.resizable = true;
item.isKit = true;


item.addNode  = function (layerNum,right) {
  let nodes = this.nodes;
  let newNode = svg.Element.mk('<g/>');
  newNode.unselectable = true;
  newNode.right = right;
  nodes.push(newNode);
  let bracket = this.multiInP.instantiate().show();
  bracket.unselectable = true;
  bracket.ends.push(Point.mk(0,0));
  newNode.set('bracket',bracket);
  newNode.set('winner',this.textP.instantiate().show());
  newNode.winner.text = 'winner';
  if (layerNum === this.numLevels) {
    newNode.set('topText',this.textP.instantiate().show());
    newNode.topText.text = 'entry';
    newNode.set('bottomText',this.textP.instantiate().show());
    newNode.bottomText.text = 'entry';
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
  let top = node.set('topChild',this.addNode(nextLayer,right));
  let bottom = node.set('bottomChild',this.addNode(nextLayer,right));
  if (layerNum === this.numLevels) {
    return;
  }
  this.addDescendants(top,nextLayer);
  this.addDescendants(bottom,nextLayer);
}

  
item.layout = function (node,height) {
  debugger;
  let texts = [node.winner];
  if (node.topText) {
    texts.push(node.topText);
    texts.push(node.bottomText);
  }
  let right = node.right;
  let bracket = node.bracket;
  let pos = bracket.singleEnd;
  let wd = this.bracketWidth;
  bracket.singleEnd.copyto(pos);
  let top = pos.plus(Point.mk(right?wd:-wd,-0.25 * height));
  let bottom = pos.plus(Point.mk(right?wd:-wd,0.25 * height));
  node.winner.moveto(pos.plus(right?this.textOffsetR:this.textOffsetL));
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
    this.set('nodes',core.ArrayNode.mk());
    this.rootLeft = this.addNode(1);
    this.rootRight = this.addNode(1);
    this.rootLeft.bracket.singleEnd.copyto(Point.mk(0,0));
    this.rootRight.bracket.singleEnd.copyto(Point.mk(0,0));  
    this.rootLeft.right = false;
    this.rootRight.right = true;
    this.addDescendants(this.rootRight,2);
    this.addDescendants(this.rootLeft,2);
    this.set('textOffsetR',Point.mk(0,0));
    this.set('textOffsetL',Point.mk(0,0));
    this.firstUpdate = false;
    this.builtLevels = this.numLevels;
  }
  this.bracketWidth = this.width/(2 * this.numLevels);
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
item.actions = function (node) {
  let rs = [];
  if (!node) return;
 
  rs.push({title:'Bracket Instructions',action:'popInstructions'});
   
  return rs;
 
}


return item;
});
     
