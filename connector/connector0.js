// common code for line-like connectors, with attached text

core.require('/text/attachedText.js',function (textItemP) {

let item = svg.Element.mk('<g/>');

/*adjustable parameters  */
item.set('end0',Point.mk(-50,0));
item.set('end1',Point.mk(50,0));
/* end adjustable parameters */

item.role = 'edge';
item.text = '';
//item.initialize = function ()
//item.lineP = core.installPrototype('line',core.ObjectNode.mk());
item.__deleteLevel = true; // deletes from the interface propogate to here
let textPropertyValues = core.lift(dom.defaultTextPropertyValues);
textPropertyValues.lineSep = 20;
let textProperties = Object.getOwnPropertyNames(textPropertyValues);
item.set('textProperties',textPropertyValues);
item.textProperties.__hideInUI = true;
item.textProperties.__setFieldType('stroke','svg.Rgb');

item.setEnds = function (e0,e1) {
  this.end0.copyto(e0);
  this.end1.copyto(e1);
}

item.updateText = function (text,e0,e1) {
  this.text = text;
  if (!this.textItem) {
    this.set('textItem',textItemP.instantiate());
    this.textItem.neverselectable = true;
  }
  core.setProperties(this.textItem,this.textProperties,textProperties);
  this.textItem.update();
}

item.update = function () {
  if (!this.shaft) {
    this.set("shaft",this.lineP.instantiate());
    if (this.shaft.initialize) {
       this.shaft.initialize();
    }
    this.shaft.neverselectable = true;
    this.shaft.text = '';
    this.shaft.role = 'line';
    this.shaft.show();
  }
  this.shaft.setEnds(this.end0,this.end1);
  let shaftProperties = this.shaftProperties;
  if (shaftProperties) {
    core.setProperties(this.shaft,this,shaftProperties);
  }
  this.shaft.update();
  let proto = Object.getPrototypeOf(this);
  if (this.text) {
    this.textProperties.__hideInUI = false;
    proto.textProperties.__hideInUI = false;
    this.updateText(this.text);
  } else {
    this.textProperties.__hideInUI = true;
  }
   
}
// the next two functions support dragging the ends around. See https://prototypejungle.org/doc/code.html#controllers

item.controlPoints = function () {
  return [this.end0,this.end1];
}

item.updateControlPoint = function (idx,rpos) {
  switch (idx) {
    case 0:
      if (this.end0vertex) {
        graph.mapEndToPeriphery(this,this.end0,this.end0vertex,'end0connection',rpos);
      } else {
        this.end0.copyto(rpos);
      }
      break;
    case 1:
      if (this.end1vertex) {
        graph.mapEndToPeriphery(this,this.end1,this.end1vertex,'end1connection',rpos);
      } else {
        this.end1.copyto(rpos);
      }
      break;
  }
  this.update();
  this.draw();
}

// used in swapping. See https://prototypejungle.org/doc/code.html#roles

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['stroke','stroke-width','text'],own);
  if (src.textItem) {
    if (!this.textItem) {
      this.set('textItem',textItemP.instantiate());
      this.textItem.neverselectable = true;
    }
    this.textItem.transferState(src.textItem,own);
  }
    
}

ui.hide(item,['end0','end1','text','textItem']);

// support for the use of this item as an edge
// See https://prototypejungle.org/doc/code.html#graph
graph.installEdgeOps(item);

return item;
});

