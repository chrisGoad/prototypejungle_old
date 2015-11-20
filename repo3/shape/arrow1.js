// Arrow
(function () {
var svg = pj.svg;
var ui = pj.ui;

var item = svg.Element.mk('<g/>');
item.set("shaft",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
item.shaft.__unselectable = 1;
item.shaft.__show();
item.stroke = "blue";
item.headLength = 15;
item.headWidth = 10;
item.headGap = 2; // arrow head falls short of e1 by this amount
item.includeEndControls = 1;

item['stroke-width'] = 2;
item.set("HeadP",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
item.set("head0",item.HeadP.instantiate());
item.set("head1",item.HeadP.instantiate());
item.head0.__show();
item.head1.__show();
item.head0.__unselectable = 1;
item.head1.__unselectable = 1;
item.set("end0",pj.geom.Point.mk(0,0));
item.set("end1",pj.geom.Point.mk(100,0));
item.__customControlsOnly = 1;

item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

item.computeEnd1 = function () {
  var e0 = this.end0,e1 = this.end1;
  var d = e1.difference(e0).normalize();
  return e1.difference(d.times(this.headGap));
}

item.setColor = function (c) {
  this.stroke = c;
}
item.update = function () {
  var e0 = this.end0,e1 = this.end1;
  var hw = Number(this.head0['stroke-width']);
  var d = e1.difference(e0).normalize();
  var e1p = this.computeEnd1();
  var n,sh,e1he,h0,h1;
  this.shaft.setEnds(e0,e1p);
  this.head0.stroke = this.head1.stroke = this.shaft.stroke = this.stroke; 
  this.head0['stroke-width'] = this.head1['stroke-width'] = this.shaft['stroke-width'] = this['stroke-width'];
  n = d.normal().times(0.5*this.headWidth);
  sh = e1p.difference(d.times(this.headLength)); //  point on shaft where head projects
  e1he = e1p.plus(d.times(0.0*hw));
  h0 = sh.plus(n);
  h1 = sh.difference(n);
  this.head0.setEnds(e1he,h0);
  this.head1.setEnds(e1p,h1);
}
 
item.__controlPoints = function () {
  var rs =  [this.head0.end2()];
  if (this.includeEndControls) {
    rs.push(this.end0);
    rs.push(this.computeEnd1());
  }
  return rs;
}

item.__holdsControlPoint = function (idx,headOfChain) {
  if (idx === 0) {
    return this.hasOwnProperty('headWidth')
  }
  return headOfChain;
}


item.__updateControlPoint = function (idx,pos) {
  var event,toAdjust,e0,d,n,e1p,h2shaft,cHeadWidth,cHeadLength;
  if (idx > 0) {
    if (idx == 1) {
      end = this.end0;
    } else {
      end = this.end1;
    }
    end.copyto(pos);
    event = pj.Event.mk('moveArrowEnd',end);
    event.emit();
    this.update();
    this.__draw();
    return;
  }

  /*var proto =  Object.getPrototypeOf(this);
  if (proto && proto.__inWs()  && !this.hasOwnProperty('headWidth') && (ui.nowAdjusting === 'proto')) { //(proto.__sourcePath === this.__sourcePath)) {
    toAdjust = proto;
  } else {
    pj.tree.setWhatToAdjust('selected');
    toAdjust = this;
  }*/
  toAdjust = ui.whatToAdjust;
  e0 = this.end0,e1 = this.end1; 
  d = e1.difference(e0).normalize();
  n = d.normal();
  
  e1p = e1.difference(d.times(this.headGap));
  h2shaft = pos.difference(e1p);
  cHeadWidth = h2shaft.dotp(n) * 2.0;
  cHeadLength = -h2shaft.dotp(d);
  toAdjust.headWidth = Math.max(0,cHeadWidth);
  toAdjust.headLength = Math.max(0,cHeadLength); 
  pj.updateRoot();
  pj.root.__draw();
  return this.head0.end2();
}

ui.hide(item,['HeadP','shaft','includeEndControls']);
ui.hide(item,['head0','head1','LineP','end0','end1']);

pj.returnValue(undefined,item);
})();
