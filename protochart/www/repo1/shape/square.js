// Square

'use strict';

(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

item.set("main",svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" stroke="black" '+
   ' stroke-width="2" fill="#eeeeee"/>'));

item.main.__unselectable = true;
item.main.__show();
item.dimension = 100;
item.fill = 'red';
item.stroke = 'green';
item.extentEvent = pj.Event.mk('extentChange');

item.set('__signature',pj.Signature.mk({dimension:'N',fill:'S',stroke:'S','stroke-width':'N'}));

item.setColor = function (color) {
  this.fill = color;
  this.main.fill = color;
}

item.update = function () {
  var main = this.main;
  if (this.hasOwnProperty('dimension')) {
    var dim = this.dimension;
    main.width = dim;
    main.height = dim;
    main.x = main.y = -0.5*dim;
  }
  pj.setPropertiesFromOwn(main,this,['fill','stroke','stroke-width']);
 // main.__show();
}

item.__adjustable = true;
item.__draggable = true;
// support for the resizer 
item.__getExtent = function () {
  var dim = this.dimension;
  return geom.Point.mk(dim,dim);
}


item.__ownsExtent = function () {
  return this.hasOwnProperty('dimension')
}

item.__setExtent = function (extent,nm) {
  var event,ext;
  console.log('nm',nm);
  pj.adjustee = this;//for debugging
  if ((nm === 'c01') || (nm === 'c21')) {
    ext = extent.x;
  } else if (nm === 'c12')  {
    ext = extent.y;
  } else {
    ext = Math.max(extent.x,extent.y);
  }
  this.dimension = ext;
  this.update();
  this.extentEvent.node = this;
  //event = pj.Event.mk('extentChange',this);
  this.extentEvent.emit();
}
 


ui.hide(item,['main']);

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);

pj.returnValue(undefined,item);
})();
