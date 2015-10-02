
(function () {
var svg = pj.svg;
var ui = pj.ui;

var item = svg.Element.mk('<g/>');
item.set("shaft",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
item.__adjustable = 1;
//item.__controlThePrototype = 1;
//item.set("shaft",item.LineP.instantiate());
item.shaft.__unselectable = 1;
item.shaft.show();
item.stroke = "blue";
item.headLength = 15;
item.headWidth = 10;
item.headPadding = 0; // arrow head falls short of e1 by this amount
//.set("HeadP",item.LineP.instantiate());
item['stroke-width'] = 2;
item.set("HeadP",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));

item.set("head0",item.HeadP.instantiate());
item.set("head1",item.HeadP.instantiate());
item.head0.show();
item.head1.show();
item.head0.__unselectable = 1;
item.head1.__unselectable = 1;
item.set("end0",pj.geom.Point.mk(0,0));
item.set("end1",pj.geom.Point.mk(200,200));
item.customControlsOnly = 1;
item.listenForUIchange = function (ev) {
  if (ev.id === 'UIchange') {
    pj.updateRoot();
    pj.root.draw();
    pj.tree.refresh();
  }
}
item.addListener('UIchange','listenForUIchange');

item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}
item.update = function () {
  var e0 = this.end0,e1 = this.end1;
  var hw = Number(this.head0['stroke-width']);
  /*this.shaft.x1 = e0.x;
  this.shaft.y1 = e0.y;
  this.shaft.x2 = e1.x;
  this.shaft.y2 = e1.y;*/
  var d = e1.difference(e0).normalize();
  var e1p = e1.difference(d.times(this.headPadding));
  this.shaft.setEnds(e0,e1p);
  this.head0.stroke = this.head1.stroke = this.shaft.stroke = this.stroke; 
  this.head0['stroke-width'] = this.head1['stroke-width'] = this.shaft['stroke-width'] = this['stroke-width'];
  var n = d.normal().times(0.5*this.headWidth);
  var sh = e1p.difference(d.times(this.headLength)); //  point on shaft where head projects
  var e1he = e1p.plus(d.times(0.0*hw));
  var h0 = sh.plus(n);
  var h1 = sh.difference(n);
  this.head0.setEnds(e1he,h0);
  this.head1.setEnds(e1p,h1);
}
 
item.controlPoints = function () {
  console.log('HEAD0zz',this.head0.end2());
  return [this.head0.end2(),this.end0,this.shaft.end2()]
}

item.updateControlPoint = function (idx,pos) {
  var toAdjust,event,end;
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
    this.draw();
    return;
  }
  var proto =  Object.getPrototypeOf(this);
  if (proto && proto.__inWs()) { //(proto.__sourcePath === this.__sourcePath)) {
    toAdjust = proto;
  } else {
    toAdjust = this;
  }
  var e0 = this.end0,e1 = this.end1; 
  var d = e1.difference(e0).normalize();
  var n = d.normal();
  var e1p = e1.difference(d.times(this.headPadding));
  var h2shaft = pos.difference(e1p);
  var  cHeadWidth = h2shaft.dotp(n) * 2.0;
  var cHeadLength = -h2shaft.dotp(d);
  console.log(this.headWidth,cHeadWidth);
  toAdjust.headWidth = Math.max(0,cHeadWidth);
  toAdjust.headLength = Math.max(0,cHeadLength); 
  pj.updateRoot();
  pj.root.draw();
  //var points = this.controlPoints();
  //ui.updateCustomBoxes(points);
  return this.head0.end2();
}
var hideEnds = function (line) {
  ui.hide(line,['x1','x2','y1','y2']);
}
ui.hide(item,['head0','head1','LineP','end0','end1']);
hideEnds(item.shaft);  
hideEnds(item.HeadP);
ui.watch(item,['stroke','stroke-width']);
pj.returnValue(undefined,item);
})();
