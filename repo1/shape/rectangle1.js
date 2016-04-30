// Arrow

'use strict';

(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

item.set("main",svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" stroke="black" '+
   ' stroke-width="2" fill="#eeeeee"/>'));
item.main.__unselectable = 1;
item.main.__show();
item.width = 100;
item.height = 100;
item.fill = 'red';
item.stroke = 'green';

item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));

item.update = function () {
  var main = this.main;
  pj.transferState(this.main,this);
  main.x = -0.5*this.width;
  main.y = -0.5*this.height;
 // main.__show();
}

item.__adjustable = 1;
// support for the resizer 
item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
  var event;
  this.width= extent.x;
  this.height = extent.y;
  this.update();
  event = pj.Event.mk('extentChange',this);
  event.emit();
}
 

item.__updateControlPoint = function (idx,pos) {
 
}

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);

pj.returnValue(undefined,item);
})();
