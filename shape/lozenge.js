//lozenge.js

core.require(function () {

let item =  svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="2"/>');

/* adjustable parameters */
item.height = 50;
item.width = 50;
item.cornerCurviness = 0;
item.stroke = "black";
item.fill = "transparent";
item['stroke-width'] = 1;
/* end adjustable parameters */

item.role = 'vertex';
item.resizable = true;
item.setComputedProperties(['d']);

item.update = function () {
  let p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  let width = 0.5*this.width;
  let height = 0.5*this.height;
  let left = geom.Point.mk(-width,0);
  let top = geom.Point.mk(0,-height);
  let right = geom.Point.mk(width,0);
  let bottom = geom.Point.mk(0,height);
  if (this.cornerCurviness === 0) { // special case: no curves
    let path = p2str('M',right,' ');
    path += p2str('L',top,' ');
    path += p2str('L',right,' ');
    path += p2str('L',bottom,' ');
    path += p2str('L',left,' ');
    this.d = path;

  }
  // right hand rule, starting with right
  let LineSegment = geom.LineSegment;
  let segment0 = LineSegment.mk(right,top);
  let fractionFromCorner = 0.5*this.cornerCurviness;
  let segment1 = LineSegment.mk(top,left);
  let segment2 = LineSegment.mk(left,bottom);
  let segment3 = LineSegment.mk(bottom,right);
  let seg0end0 = segment0.pointAlong(fractionFromCorner);
  let seg0end1 = segment0.pointAlong(1 - fractionFromCorner);
  let seg1end0 = segment1.pointAlong(fractionFromCorner);
  let seg1end1 = segment1.pointAlong(1 - fractionFromCorner);
  let seg2end0 = segment2.pointAlong(fractionFromCorner);
  let seg2end1 = segment2.pointAlong(1 - fractionFromCorner);
  let seg3end0 = segment3.pointAlong(fractionFromCorner);
  let seg3end1 = segment3.pointAlong(1 - fractionFromCorner);
  let path = p2str('M',seg0end0,' ');
  path += p2str('L',seg0end1,' ');
  //path += p2str('L',seg1end0,' ');
  path += p2str('C ',top,',');
  path += p2str('',top,',');
  path += p2str('',seg1end0,' ');
  path += p2str('L',seg1end1,' ');
  path += p2str('C ',left,',');
  path += p2str('',left,',');
  path += p2str('',seg2end0,' ');
  path += p2str('L',seg2end1,' ');
  path += p2str('C ',bottom,',');
  path += p2str('',bottom,',');
  path += p2str('',seg3end0,' ');  
  path += p2str('L',seg3end1,' ');
  path += p2str('C ',right,',');
  path += p2str('',right,',');
  path += p2str('',seg0end0,' ');  
  this.d = path;
}

ui.hide(item,['d']);
graph.installLozengePeripheryOps(item);

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,ui.stdTransferredProperties,own);
}

return item;
});

