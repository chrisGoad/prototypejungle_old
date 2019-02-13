// curved head 

core.require('/arrow/headSupport.js',function (headSup) {

let item = svg.Element.mk('<g/>');
/*adjustable parameters */
item.headWidth = 10;
item.headLength = 20;
item.stroke = "black";
item['stroke-width'] = 1;
item.solidHead = true;
item.curvedIn = true;
item.role = 'arrowHead';
/*end adjustable parameters */

item.customControlsOnly = true;

item.set('headBase0',Point.mk(0,-15));
item.set('headBase1',Point.mk(0,15));
item.set('headPoint',Point.mk(20,0));
item.set('direction',Point.mk(1,0));
item.set("curve", svg.Element.mk('<path stroke-linecap = "round" fill="black" />'));

item.curve.neverselectable = true;

item.generatePath = function (left) {
   
   var p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  let curve  = this.curve;
  let hb = left?this.headBase1:this.headBase0;
  let hp = this.headPoint;
  let vc = hp.difference(hb);
  let nrm = vc.normal();
  let toSide1,toSide2;
  if (this.curvedIn) {
    toSide1 = 0.1;
    toSide2 = 0.1;
  } else {
    toSide1 = -0.1;
    toSide2 = -0.1;
  }
  let cp1 = hb.plus(vc.times(0.3)).plus(nrm.times(left?toSide1:-toSide1));
  let cp2 = hp.plus(vc.times(-0.5)).plus(nrm.times(left?toSide2:-toSide2));
  let showControlPoints = 0;
  let d = left?'':curve.d;
  if (showControlPoints) { //mostly for debugging
      d += p2str('M',hb,' ');
    d += p2str('L',cp1,' ');
    d += p2str('M',cp2,' ');
    d += p2str('L',hp,' ');
  } else {
    if (left) {
      d += p2str('M',hb,' ');
      d += p2str('C',cp1,',');
      d += p2str('',cp2,',');
      d += p2str('',hp,'');
    } else {
      d += p2str('M',hp,' ');
      d += p2str('C',cp2,',');
      d += p2str('',cp1,',');
      d += p2str('',hb,' ');
      if (this.solidHead) {
        d += p2str('L',this.headBase1,' ');
      }
      
    }
  }
  curve.d = d;
}

  
item.update= function () {
  headSup.updateBases(this);
  this.curve.stroke = this.stroke;
  this.curve.fill  = (this.solidHead)?this.fill:"transparent";
  this.curve['stroke-width'] = this['stroke-width'];
  this.generatePath(true);
  this.generatePath(false);
  this.draw();
}



item.controlPoint = function () {
  return this.headBase0;
}

item.updateControlPoint = function (pos,forMultiOut) {
  return headSup.updateControlPoint(this,pos,forMultiOut);
}

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['unselectable','solidHead'],own);
}


return item;
});

