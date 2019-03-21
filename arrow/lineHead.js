// line head 

core.require('/arrow/headSupport.js',function (headSup) {

let item = svg.Element.mk('<g/>');
/*adjustable parameters */
item.headWidth = 10;
item.headLength = 20;
item.stroke = "black";
item['stroke-width'] = 2;
item.solidHead = false;
/*end adjustable parameters */

item.role = 'arrowHead';
item.unselectable = true;


item.set('headBase0',Point.mk(0,-10));
item.set('headBase1',Point.mk(0,10));
item.set('headPoint',Point.mk(10,0));
item.set('direction',Point.mk(1,0));
item.set("headP",
      svg.Element.mk(`<line x1="-10" y1="0" x2="0" y2="20" visibility="hidden" 
        stroke="black"  stroke-linecap="round" stroke-width="2"/>`));


item.set("head0",item.headP.instantiate());
item.set("head1",item.headP.instantiate());
item.head0.show();
item.head1.show();
item.head0.neverselectable = true;
item.head1.neverselectable = true;


item.update= function () {
  headSup.updateBases(this);
  this.head0.setEnds(this.headBase0,this.headPoint);
  this.head1.setEnds(this.headBase1,this.headPoint);
  this.headP.stroke = this.stroke;
  this.headP['stroke-width'] = this['stroke-width'];
}



item.controlPoint = function () {
  return this.headBase0;
 
}

item.updateControlPoint = function (pos,forMultiOut) {
  return headSup.updateControlPoint(this,pos,forMultiOut);
}



return item;
});

