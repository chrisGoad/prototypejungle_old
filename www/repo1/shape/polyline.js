// Arrow

'use strict';

(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

item.set("__contents",svg.Element.mk(
  '<polyline fill="none" points="0,0,40,50" stroke="blue" stroke-width="4"' +
    ' visibility="hidden"/>'));

item.__contents.__unselectable = true;
item.__contents.__show();
item.width = 100;
item.height = 100;
item.fill = 'red';
item.stroke = 'green';
item['stroke-width'] = 4;
item.extentEvent = pj.Event.mk('extentChange');

//item.set('__signature',pj.Signature.mk({points:['geom.Point'],height:'N',fill:'S',stroke:'S','stroke-width':'N'}));
item.set('__signature',pj.Signature.mk({stroke:'S','stroke-width':'N'}));
item.__contents.set('__signature',pj.Signature.mk({stroke:'S','stroke-width':'N'}));

item.setColor = function (color) {
  this.stroke = color;
  this.__contents.stroke = color;
}

item.update = function () {
  if (!this.points) {
    return;
  }
  pj.transferState(this.__contents,this);
  var svgPoints = svg.toSvgPoints(this.points);
  this.__contents.points = svgPoints;
 
}


ui.hide(item,['__contents']);

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);

pj.returnValue(undefined,item);
})();
