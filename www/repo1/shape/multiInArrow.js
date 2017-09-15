
'use strict';

pj.require('/shape/elbow.js','/shape/arrowHead.js',function (elbowPP,arrowHeadP) {
const geom = pj.geom,svg = pj.svg,ui = pj.ui;
let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.pointsTo = undefined; // if set to 'left' in settings then the arrow is pointed the other way (see __updatePrototype)
item.solidHead = true;
item.includeHead = true;
item.stroke = "black";
item['stroke-width'] = 4;
item.headLength = 20;
item.headWidth = 16;
item.elbowWidth = 10;
item.joinX = 25; // distance from join to end1
item.set('end1',geom.Point.mk(60,0)); // will be flipped if direction -left
item.set("inEnds",pj.Array.mk());
item.inEnds.push(geom.Point.mk(0,-15));
//item.inEnds.push(geom.Point.mk(0,10));
/* end adjustable parameters */

item.set('elbowP',elbowPP.instantiate());
let elbowP = item.elbowP;
item.__role = 'multiIn';
//ui.setupAsMultiIn(item);
item.inCount = item.inEnds.length;
item.includeEndControls = true;
item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__customControlsOnly = true;
item.__draggable = false;
item.__defaultSize = geom.Point.mk(60,30);

if (item.includeHead) {
  item.set('head',arrowHeadP.instantiate());
  item.head.__unselectable = true;
}

item.set("shafts",pj.Array.mk());

item.set('direction',geom.Point.mk(1,0));

item.elbowPlacement = 0.5;
item.buildShafts = function () {
  let ln = this.inEnds.length;
  let lns = this.shafts.length;
  let i;
  if (ln < lns) {
    for (i = lns;i>ln;i--) {
      let shaft = this.shafts[i-1];
      shaft.remove();
    }
    //this.shafts.length = ln;
  } else {
    for (i=lns;i<ln;i++) {
      let shaft = this.elbowP.instantiate();
      shaft.__unselectable = true;
      this.shafts.push(shaft);
    }
  }
}


// new ends are always placed between the last two ends
item.initializeNewEnds = function () {
  let currentLength = this.inEnds.length;
  let numNew = this.inCount - currentLength;
  if (numNew == 0) {
    return;
  }
  let inEnds = this.inEnds;
  if (currentLength === 1) { // special case for initialization of version dropped in the UI
    inEnds.push(geom.Point.mk(0,15));
    this.flip = this.pointsTo === 'left';
    this.end0x = 0;
    this.e01 = this.end1.x - this.end0x;
    return;
  }
  let eTop = inEnds[currentLength-2];
  let eBottom = inEnds[currentLength-1];
  this.end0x = Math.min(eTop.x,eBottom.x);
  this.e01 = this.end1.x - this.end0x;
  this.flip = this.e01 < 0;
  if (numNew <= 0) {
    this.inCount = currentLength; // removing ends not supported
    return;
  }
  ui.unselect();
  inEnds.pop();
  let topY = eTop.y;
  let obottomY = eBottom.y;
  let interval = (obottomY - topY)/(numNew+1);
  let cy = topY+interval;
  for (let i=currentLength;i<this.inCount;i++) {
    inEnds.push(geom.Point.mk(this.end0x,cy));
    cy += interval;
  }
  inEnds.push(eBottom);
}
// used in installing settings
item.__updatePrototype = function () {
  if (this.pointsTo === 'left') {
    this.end1.x = -this.end1.x;
    this.direction.x = -this.direction.x;
  }
}
item.update = function () {
  console.log('multInArrow Update');
  debugger;
  let i;
  if (this.includeHead) {
    this.head.switchHeadsIfNeeded();
  }
  this.initializeNewEnds();
  this.buildShafts();
  let end1 = this.end1;
  let inEnds = this.inEnds;
  let shafts = this.shafts;
  let ln = inEnds.length;
  let shaftEnd = (this.includeHead && this.solidHead) ?this.head.computeEnd1((this.flip?-0.5:-0.5)*this.headLength):end1;
  pj.setProperties(elbowP,this,['stroke-width','stroke','elbowWidth']);//,'elbowPlacement']);
  for (i=0;i<ln;i++) {
    let end0 = inEnds[i];
    let shaft = shafts[i];
    if (this.flip) {
      shaft.end1.copyto(end0);
      shaft.end0.copyto(shaftEnd);
    } else {
      shaft.end0.copyto(end0);
      shaft.end1.copyto(shaftEnd);
    }
    //pj.setProperties(shaft,this,['stroke-width','stroke','elbowWidth']);//,'elbowPlacement']);
   // let elbowPlacement = Math.max(flip?this.joinX/(end0.x - end1.x):(1 - (this.joinX)/(end1.x - end0.x)),0);
    shaft.elbowPlacement = this.flip?(1-this.elbowPlacement):this.elbowPlacement;
    shaft.update();
    shaft.__draw();
  }
  if (this.includeHead) {
    this.head.headPoint.copyto(end1);
 // this.head.direction.copyto(this.direction.times(this.flip?-1:1));
    this.head.direction.copyto(this.direction);
    pj.setProperties(this.head,this,['solidHead','stroke','stroke-width','headLength','headWidth']);
    this.head.update();
  }
}


item.__controlPoints = function () {
  let e1 = this.end1;
  this.joinX = this.e01 * this.elbowPlacement;
  let joinPoint = geom.Point.mk(this.end0x+this.joinX,e1.y);
  let headControlPoint = this.includeHead?this.head.controlPoint():e1;
  let rs =  [joinPoint,headControlPoint]
  if (this.includeEndControls) {
    rs.push(e1);
    this.inEnds.forEach(function (inEnd) {rs.push(inEnd)});
  }
  return rs;
}

item.__updateControlPoint = function (idx,pos) {
  if (idx === 0) {
    this.joinX = this.end1.x - pos.x;
    this.elbowPlacement = Math.max(0,1 - (this.joinX)/(this.e01));
    this.end1.y = pos.y;
  } else if (idx === 2) {
    this.end1.copyto(pos);
  } else if (idx == 1) {
    this.head.updateControlPoint(pos);
    ui.adjustInheritors.forEach(function (x) {
      x.update();
      x.__draw();
    });
    return;
  } else {
    this.inEnds[idx-3].copyto(pos);
  }
  this.update();
  this.__draw();
}


item.__setExtent = function (extent) {
  debugger;
  let inEnd0 = this.inEnds[0];
  let inEnd1 = this.inEnds[1];
  if (!inEnd1) {
    return;
  }
  let endOut = this.end1;
  let flip = (inEnd0.x < endOut.x)?1:-1;
  inEnd0.x = inEnd1.x =  -flip*extent.x/2;
  inEnd0.y = -flip*extent.y/2;
  inEnd1.y = flip*extent.y/2;
  endOut.x =flip*extent.x/2;
  endOut.y = 0;
  this.joinX = flip*extent.x/2;
}

item.updateConnectedEnd = function (whichEnd,vertex,connectionType) {
  let toRight = this.end1.x > this.inEnds[0].x;
  console.log('toRight',toRight);
 // let direction = geom.Point.mk(toRight?-1:1,0);
  let tr = this.__getTranslation();
  let end,direction;
  if (whichEnd === 'out') {
    end = this.end1;
    direction = geom.Point.mk(toRight?-1:1,0);
  } else {
    end = this.inEnds[whichEnd];
    direction = geom.Point.mk(toRight?1:-1,0);
  }
  if (connectionType === 'periphery') {
    let ppnt = vertex.peripheryAtDirection(direction);
    end.copyto(ppnt.intersection.difference(tr));
  } else {
    let split = connectionType.split(',');
    let side = Number(split[1]);
    let fractionAlong = Number(split[2]);
    let pnt = vertex.alongPeriphery(side,fractionAlong);
    end.copyto(pnt);
  }
}
ui.hide(item,['helper','head','shaft','end0','end1','direction','shafts','inEnds','joinX','flip','e01','end0x']);
item.__setFieldType('solidHead','boolean');

return item;

});
