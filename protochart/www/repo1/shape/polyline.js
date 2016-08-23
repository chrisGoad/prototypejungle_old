// Arrow

'use strict';

(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

item.set("main",svg.Element.mk(
  '<polyline fill="none" points="0,0,40,50" stroke="blue" stroke-width="4"' +
    ' visibility="hidden"/>'));

item.main.__unselectable = true;
item.main.__show();
item.width = 100;
item.height = 100;
item.fill = 'red';
item.stroke = 'green';
item.extentEvent = pj.Event.mk('extentChange');

//item.set('__signature',pj.Signature.mk({points:['geom.Point'],height:'N',fill:'S',stroke:'S','stroke-width':'N'}));
item.set('__signature',pj.Signature.mk({stroke:'S','stroke-width':'N'}));
item.main.set('__signature',pj.Signature.mk({stroke:'S','stroke-width':'N'}));

item.setColor = function (color) {
  this.stroke = color;
  this.main.stroke = color;
}

item.update = function () {
  if (!this.points) {
    return;
  }
  var main = this.main;
  pj.transferState(this.main,this);
  var svgPoints = svg.toSvgPoints(this.points);
  this.main.points = svgPoints;
 
 // main.__show();
}


ui.hide(item,['main']);

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);

pj.returnValue(undefined,item);
})();
