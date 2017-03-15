// Arrow
++OBSOLETE++

'use strict';
pj.require(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;

var item = svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" rx="10" ry="5" stroke="green" '+
   ' stroke-width="2" fill="red"/>');
item.__cloneable = true;
item.__cloneResizable = false;
item.__adjustable = true;
item.__draggable = true;

item.width = 200;
item.height = 100;
item.cornerRadius = 20;
//item.cornerRadius = 10;  
item.fill = 'blue';
item.stroke = 'black';
item['stroke-width'] = 2;
//item.radiusFactor = 0.6;

item.extentEvent = pj.Event.mk('extentChange');

item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));

var sqrt2 = Math.sqrt(2);


item.setColor = function (color) {
  this.fill = color;
  this.__contents.fill = color;
}


item.__domMap =
  {transfers:svg.commonTransfers.concat(['width','height']),
   mapping:
     function (itm,element) {
       element.setAttribute('x',-0.5*itm.width);
       element.setAttribute('y',-0.5*itm.height);
       element.setAttribute('rx',itm.cornerRadius);
       element.setAttribute('ry',itm.cornerRadius);

    }
}
item.update = function () {
  return;
 
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
 
 
item.__controlPoints = function () {
  var hw = this.width/2;
  var mhh = -this.height/2;
  var cr = this.cornerRadius;
  var cext = cr/sqrt2;
  //if (this.roundOneEnd) {
  //  return [pj.geom.Point.mk(hw-cext,mhh)]
  //} else {
    return [pj.geom.Point.mk(-hw+cext,mhh)]
  //}
}

item.__updateControlPoint = function (idx,pos) {
  var hw = this.width/2;
  if (this.roundOneEnd) {
    ext = hw - pos.x;
  } else {
    var ext = pos.x + hw;
  }
  var toAdjust = ui.whatToAdjust?ui.whatToAdjust:this;// we might be adjusting the prototype

  toAdjust.cornerRadius  = ext * sqrt2;
 // this.update();
  this.__draw();
}
  

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);
return item;
});
