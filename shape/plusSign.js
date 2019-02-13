// Arrow

'use strict';

core.require(function () {
var svg = core.svg;
var ui = core.ui;
var geom =  core.geom;
var item = svg.Element.mk('<g/>');

item.set("__contents",
  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="1"/>'));

item.roundOneEnd = false;
item.roundTop = false;
item.__contents.__unselectable = true;
item.__contents.__show();
item.__dimension = 100;
item.innerDimensionFraction = 0.2;
//item.cornerRadius = 10;  
item.fill = 'blue';
item.stroke = 'green';
item['stroke-width'] = 2;

item.extentEvent = core.Event.mk('extentChange');

item.set('__signature',core.Signature.mk({__dimension:'N',fill:'S',stroke:'S','stroke-width':'N'}));

var sqrt2 = Math.sqrt(2);


item.setColor = function (color) {
  this.fill = color;
  this.__contents.fill = color;
}
item.update = function () {
  var d,cr;
  var hodim = 0.5 * this.__dimension;
  var hidim = hodim  * this.innerDimensionFraction;
  var mhodim = -hodim;
  var mhidim = -hidim;
  var d = 'M '+mhodim+' '+mhidim+' ';// left prong outer top
  d += 'H '+mhidim+' ';// left prong inner top
  d += 'V '+mhodim+' ';// top prong outer left
  d += 'H '+hidim+' ';// top prong outer right
  d += 'V '+mhidim+' ';// top pronb inner right
  d += 'H '+hodim+' ';// right prong outer top
  d += 'V '+hidim+' ';// right prong outer bottom
  d += 'H '+hidim+' ';// rignt prong inner bottom
  d += 'V '+hodim+' ';// bottom prong outter right
  d += 'H '+mhidim+' ';//bottom prong outer left
  d+=  'V '+hidim+' ';//bottome prong inner left
  d += 'H '+mhodim+' ';//left prong outer bottom
  d += 'V '+mhidim+' ';//left prong outer top

  this.__contents.d = d;
  core.transferState(this.__contents,this);
}

item.__adjustable = true;
item.__draggable = true;
// support for the resizer 
item.__getExtent = function () {
  return geom.Point.mk(this.__dimension,this.__dimension);
}

item.__setExtent = function (extent) {
  var event;
  this.__dimension= Math.max(extent.x,extent.y);
  this.update();
  this.extentEvent.node = this;
  //event = core.Event.mk('extentChange',this);
  this.extentEvent.emit();
}
 
/*
item.__controlPoints = function () {
  var hw = this.width/2;
  var mhh = -this.height/2;
  var cr = this.cornerRadius;
  var cext = cr/sqrt2;
  if (this.roundOneEnd) {
    return [core.geom.Point.mk(hw-cext,mhh)]
  } else {
    return [core.geom.Point.mk(cext-hw+cext,mhh)]
  }
}

item.__updateControlPoint = function (idx,pos) {
  var hw = this.width/2;
  if (this.roundOneEnd) {
    ext = hw - pos.x;
  } else {
    var ext = pos.x + hw;
  }
  this.cornerRadius  = ext * sqrt2;
  this.update();
  this.__draw();
}
  
*/
//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);
return item;
});
