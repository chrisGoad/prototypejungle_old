// Arrow

'use strict';

pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" stroke="green" '+
   ' stroke-width="2" fill="red"/>');
//var item = svg.Element.mk('<g/>');
item.width = 50;
item.height = 35;
item.fill = 'none';
item.stroke = 'black';
item['stroke-width'] = 2;

item.__cloneable = true;
item.__cloneResizable = false;
item.__adjustable = true;
item.__draggable = true;
/*
 *item.set("__contents",svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" stroke="green" '+
   ' stroke-width="2" fill="red"/>'));
//return item;
item.__contents.__unselectable = true;
item.__contents.__show();
*/

item.extentEvent = pj.Event.mk('extentChange');

item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));

item.setColor = function (color) {
  this.fill = color;
  //this.__contents.fill = color;
}


item.__domMap =
  {transfers:svg.commonTransfers.concat(['width','height']),
   mapping:
     function (itm,element) {
       element.setAttribute('x',-0.5*itm.width);
       element.setAttribute('y',-0.5*itm.height);
    }
}


item.update = function () {
  return;
  var contents = this.__contents;
  pj.transferState(contents,this);//,'ownOnly');
  contents.x = -0.5*this.width;
  contents.y = -0.5*this.height;
  contents.__show();
}

// support for the resizer 
item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
  var path = pj.pathToString(this.__pathOf(pj.root));
  console.log('__setExtent',path,extent.x,extent.y);
  var event;
  this.width= extent.x;
  this.height = extent.y;
  this.update();
  this.extentEvent.node = this;
  //event = pj.Event.mk('extentChange',this);
  this.extentEvent.emit();
}
 

item.__updateControlPoint = function (idx,pos) {
 
}

//ui.hide(item,['__contents']);

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);

//pj.returnValue(undefined,item);
return item;
});
//();
