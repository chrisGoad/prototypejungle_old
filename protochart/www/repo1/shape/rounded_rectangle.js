// Arrow

'use strict';

(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom =  pj.geom;
var item = svg.Element.mk('<g/>');

item.set("main",
  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="1"/>'));

item.roundOneEnd = false;
item.roundTop = false;
item.main.__unselectable = true;
item.main.__show();
item.width = 100;
item.height = 100;
//item.cornerRadius = 10;  
item.fill = 'red';
item.stroke = 'green';
item['stroke-width'] = 2;

item.extentEvent = pj.Event.mk('extentChange');

item.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));

var sqrt2 = Math.sqrt(2);


item.setColor = function (color) {
  this.fill = color;
  this.main.fill = color;
}
item.update = function () {
  var d,cr;
  var hw = this.width/2;
  var hh = this.height/2;
  var mhw = -hw;
  var mhh = -hh;
  if (typeof this.cornerRadius === 'undefined') {
    cr = this.cornerRadius = 0.5 *  Math.min(sqrt2*hw,sqrt2*hh)
  } else { 
    cr = Math.min(this.cornerRadius,sqrt2*hw,sqrt2*hh);
    this.cornerRadius = cr;
  }
  var arcstart = 'A '+cr+' '+cr+' ';
  var cext = cr/sqrt2;
  
  // the path description
  if (this.roundOneEnd ) {
    d = 'M '+mhw+' '+mhh; // upper left
  } else {
    d = 'M '+mhw+' '+(mhh+cext); // upper left
    d += arcstart+'0 0 1 '+(mhw+cext)+' '+mhh;
  }
  d += ' H '+(hw-cext); // to upper right
  d += arcstart+'0 0 1 '+hw+' '+(mhh+cext);
  if (this.roundTop) {
    d += 'V '+hh;
  } else {
    d += ' V '+(hh-cext); // to lower right
    d += arcstart+'0 0 1 '+(hw-cext)+' '+hh;
  }
  if (this.roundOneEnd  || this.roundTop) {
    d += ' H '+mhw;// to lower left
    if (this.roundTop) {
      d += ' V '+(mhh+cext);
    } else {
      d += ' V '+mhh;// to upper right
    }
  } else {
    d += ' H '+(mhw+cext);// to lower left
    d += arcstart+'0 0 1 '+mhw+' '+(hh-cext);
    d += ' V '+(mhh+cext);// to upper right
  }
  //this.BowedLine['stroke-width'] = this.strokeWidth;
  this.main.d = d;
  pj.transferState(this.main,this);
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
  if (this.roundOneEnd) {
    return [pj.geom.Point.mk(hw-cext,mhh)]
  } else {
    return [pj.geom.Point.mk(cext-hw+cext,mhh)]
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
  

//ui.hide(item,['HeadP','shaft','includeEndControls']);
//ui.hide(item,['head0','head1','LineP','end0','end1']);

pj.returnValue(undefined,item);
})();
