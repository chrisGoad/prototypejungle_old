//okok
// solidHead


core.require('/coreExamples/headSupport.js',function (headSup) {
let item =  svg.Element.mk('<path stroke-width = "0"/>');

/*adjustable parameters */
item.headWidth = 10;
item.headLength = 20;
/*end adjustable parameters */


item.role = 'arrowHead';
item.unselectable = true;
item.customControlsOnly = true;
item.solidHead = true;


item.set('headBase0',Point.mk(0,-10));
item.set('headBase1',Point.mk(0,10));
item.set('headPoint',Point.mk(10,0));
item.set('direction',Point.mk(1,0));


item.update  = function () {
  headSup.updateBases(this);

  let p2str = function (letter,point) {
    return letter+' '+point.x+' '+point.y+' ';
  }
  
  let d = p2str('M',this.headBase0);
  d += p2str('L',this.headBase1);
  d += p2str('L',this.headPoint);
  d += p2str('L',this.headBase0);
  this.d = d;
}


item.controlPoint = function () {
  return this.headBase0;
 
}

item.updateControlPoint = function (pos,forMultiOut) {
  return headSup.updateControlPoint(this,pos,forMultiOut);
}


return item;
});

