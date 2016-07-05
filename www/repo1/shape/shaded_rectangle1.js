// Arrow

'use strict';

(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

var linearGradient = svg.Element.mk('<linearGradient/>');
linearGradient.id = "G0";
var stop0 =  svg.Element.mk('<stop offset="0%" stop-color="rgb(20,20,20)" />');
var stop1 =  svg.Element.mk('<stop offset="10%"  stop-color="blue" stop-opacity="1" />');
var stop2 =  svg.Element.mk('<stop offset="50%"  stop-color="rgb(100,100,200)" stop-opacity="1" />');
var stop3 =  svg.Element.mk('<stop offset="90%"  stop-color="blue" stop-opacity="1" />');
var stop4 =  svg.Element.mk(' <stop offset="100%" stop-color="rgb(20,20,20)" />');
linearGradient.addChildren([stop0,stop1,stop2,stop3,stop4]);

var defs = svg.Element.mk('<defs/>');
defs.push(linearGradient);
var rect = svg.Element.mk('<rect x="0" y="50" width="50" height="100" stroke="black" fill="url(#G0)"/>');
item.set('main',svg.Element.mk('<g/>').addChildren([defs,rect]));

//item.set('main',svg.Element.mk('<rect x="0" y="50" width="50" height="100" stroke="black" fill="url(#G0)"/>'));
/*item.set("main",svg.Element.mk(
   `<g>
   <defs>
    <linearGradient id="G0">
      <stop offset="0%" stop-color="rgb(20,20,20)" stop-opacity="1" />
      <stop offset="20%"  stop-color="blue" stop-opacity="1" />
       <stop offset="50%"  stop-color="rgb(100,100,200)" stop-opacity="1" />
     <stop offset="80%"  stop-color="blue" stop-opacity="1" />
      <stop offset="100%" stop-color="rgb(20,20,20)" stop-opacity="1" />
    </linearGradient>
  </defs>
<rect x="0" y="50" width="50" height="100" stroke="black" fill="url(#G0)"/>
</g>`
));
*/
item.main.__unselectable = 1;
item.main.__show();
item.width = 100;
item.height = 100;
item.fill = 'rgb(0,00,255)';

item.shinyness = 200;
var shine = function (color,shinyness) {
  debugger;
  var rgb = svg.parseRgb(color);
  var bump = function (c) {
    return Math.min(255,c+shinyness);
  }
  return 'rgb('+bump(rgb.r)+','+bump(rgb.g)+','+bump(rgb.b)+')';
}
stop1['stop-color'] = item.fill;
stop2['stop-color'] = shine(item.fill,item.shinyness);

stop3['stop-color'] = item.fill;
item.stroke = 'green';
item.extentEvent = pj.Event.mk('extentChange');

item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));

item.setColor = function (color) {
  this.fill = color;
  //this.main.fill = color;
}

item.update = function () {
  if (this.hasOwnProperty('fill')) {
    stop1['stop-color'] =this.fill;
    stop2['stop-color'] = shine(this.fill,this.shinyness);
    stop3['stop-color'] = this.fill;
  }
  //return;
  //var main = this.main;
  //pj.transferState(this.main,this,'ownOnly');
  rect.x = -0.5*this.width;
  rect.y = -0.5*this.height;
  rect.width = this.width;
  rect.height = this.height;
 // main.__show();
}

item.__adjustable = 1;
item.__draggable = 1;
// support for the resizer 
item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
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

ui.hide(item,['main']);

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);

pj.returnValue(undefined,item);
})();
