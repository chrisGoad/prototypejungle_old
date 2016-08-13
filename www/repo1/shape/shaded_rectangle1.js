
'use strict';

(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

var  gradient = svg.Element.mk('<linearGradient/>');
var stop1,stop2,stop3;
//item.set('gradient',linearGradient);
gradient.id = "G0";
gradient.set('stop0',svg.Element.mk('<stop offset="0%" stop-color="rgb(20,20,20)" />'));
gradient.set('stop1',stop1 = svg.Element.mk('<stop offset="10%"  stop-color="blue" stop-opacity="1" />'));
gradient.set('stop2',stop2 = svg.Element.mk('<stop offset="50%"  stop-color="rgb(100,100,200)" stop-opacity="1" />'));
gradient.set('stop3',stop3 = svg.Element.mk('<stop offset="90%"  stop-color="blue" stop-opacity="1" />'));
gradient.set('stop4',svg.Element.mk(' <stop offset="100%" stop-color="rgb(20,20,20)" />'));

var defs = svg.Element.mk('<defs/>');
item.set('defs',defs);
item.defs.set('gradient',gradient);//
//defs.push(linearGradient);
var rect = svg.Element.mk('<rect x="0" y="50" width="50" height="100" stroke="black" fill="url(#G0)"/>');
//item.set('main',svg.Element.mk('<g/>').addChildren([defs,rect]));
item.set('rect',rect);
//item.main.set('defs',defs);
//item.main.set('rect',rect);

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
item.rect.__unselectable = true;
//item.main.__show();
item.width = 100;
item.height = 100;
item.fill = 'rgb(0,00,255)';

item.shinyness = 200;
var shine = function (color,shinyness) {
  var rgb = svg.parseColor(color);
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
  this.update();
  //this.main.fill = color;
}

var count = 0;
item.update = function () {
   var rect = this.rect; 
  if (this.hasOwnProperty('fill')) {
    var gradient = this.defs.gradient;
    var id = 'g'+(count++);
    gradient.id = id;
    gradient.stop1['stop-color'] =this.fill;
    gradient.stop2['stop-color'] = shine(this.fill,this.shinyness);
    gradient.stop3['stop-color'] = this.fill;
    rect.fill = 'url(#'+id+')'
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

item.__adjustable = true;
item.__draggable = true;
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
