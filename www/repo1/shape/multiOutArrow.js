
'use strict';

pj.require('/shape/elbow.js','/shape/arrowHead.js',function (elbowPP,arrowHeadPP) {
const geom = pj.geom,svg = pj.svg,ui = pj.ui;
let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.pointsTo = 'right'; // if set to 'left' in settings then the arrow is pointed the other way (see __updatePrototype)
item.solidHead = true;
item.stroke = "black";
item['stroke-width'] = 4;
item.headLength = 20;
item.headWidth = 16;
item.elbowWidth = 10;
item.joinX = 25; // distance from join to end1
item.set('end0',geom.Point.mk(-50,0)); // will be flipped if direction -left
item.set("outEnds",pj.Array.mk());
item.outEnds.push(geom.Point.mk(0,-10));
item.outEnds.push(geom.Point.mk(0,10));
item.set("arrowHeads",pj.Array.mk());

/* end adjustable parameters */


item.set('elbowP',elbowPP.instantiate());
let elbowP = item.elbowP;



item.set('arrowHeadP',arrowHeadPP.instantiate());
let arrowHeadP = item.arrowHeadP;
arrowHeadP.__hide();
item.__role = 'multiOut';
//ui.setupAsMultiOut(item);
debugger;
item.outCount = item.outEnds.length;
item.includeEndControls = true;
item.__adjustable = true;
item.__cloneable = true;
item.__cloneResizable = true;
item.__customControlsOnly = true;
item.__draggable = false;
item.__defaultSize = geom.Point.mk(60,30);

/*
item.set('head',arrowHeadP.instantiate());
item.head.__unselectable = true;
*/

item.set("shafts",pj.Array.mk());

item.set('direction',geom.Point.mk(1,0));

item.elbowPlacement = 0.5;
item.buildShafts = function () {
  let ln = this.outEnds.length;
  let lns = this.shafts.length;
  let i;
  for (i=lns;i<ln;i++) {
    let shaft = this.elbowP.instantiate();
    shaft.__unselectable = true;
    this.shafts.push(shaft);
  }
}

item.buildArrowHeads= function () {
  let ln = this.outEnds.length;
  let lns = this.arrowHeads.length;
  let i;
  for (i=lns;i<ln;i++) {
    let arrowHead = this.arrowHeadP.instantiate();
    arrowHead.__unselectable = true;
    arrowHead.__show();
    this.arrowHeads.push(arrowHead);
  }
}

// new ends are always placed between the last two ends
item.initializeNewEnds = function () {
  debugger;
  let currentLength = this.outEnds.length;
  let numNew = this.outCount - currentLength;
  let outEnds = this.outEnds;  
  let eTop = outEnds[currentLength-2];
  let eBottom = outEnds[currentLength-1];
  this.end1x = Math.min(eTop.x,eBottom.x);
  this.e01 = this.end1x - this.end0.x;
  this.flip = this.e01 < 0;
  if (numNew <= 0) {
    this.inCount = currentLength; // removing ends not supported
    return;
  }
  ui.unselect();
  outEnds.pop();
  let topY = eTop.y;
  let obottomY = eBottom.y;
  let interval = (obottomY - topY)/(numNew+1);
  let cy = topY+interval;
  for (let i=currentLength;i<this.inCount;i++) {
    outEnds.push(geom.Point.mk(this.end1x,cy));
    cy += interval;
  }
  outEnds.push(eBottom);
}
// used in installing settings
item.__updatePrototype = function () {
  if (this.pointsTo === 'left') {
    this.end0.x = -this.end0.x;
    this.direction.x = -this.direction.x;
  }
}
item.update = function () {
  let i;
  //this.head.switchHeadsIfNeeded();
  this.initializeNewEnds();
  this.buildShafts();
  this.buildArrowHeads();
  let end0 = this.end0;
  let outEnds = this.outEnds;
  let shafts = this.shafts;
  let arrowHeads = this.arrowHeads;
  let ln = outEnds.length;
  pj.setProperties(this.arrowHeadP,this,['solidHead','stroke','stroke-width','headLength','headWidth']);
  pj.setProperties(this.elbowP,this,['stroke-width','stroke','elbowWidth']);//,'elbowPlacement']);

  for (i=0;i<ln;i++) {
    let end1 = outEnds[i];
    let arrowHead = arrowHeads[i];
    debugger;
    let shaftEnd = this.solidHead ?end1.plus(this.direction.times((this.flip?-0.5:-0.5)*this.headLength)):end1;
    let shaft = shafts[i];
    if (this.flip) {
      shaft.end1.copyto(end0);
      shaft.end0.copyto(shaftEnd);
    } else {
      shaft.end0.copyto(end0);
      shaft.end1.copyto(shaftEnd);
    }
   // let elbowPlacement = Math.max(flip?this.joinX/(end0.x - end1.x):(1 - (this.joinX)/(end1.x - end0.x)),0);
    shaft.elbowPlacement = this.flip?(1-this.elbowPlacement):this.elbowPlacement;
    shaft.update();
    shaft.__draw();
    arrowHead.headPoint.copyto(end1);
    arrowHead.direction.copyto(this.direction);
    debugger;
    arrowHead.switchHeadsIfNeeded();
    arrowHead.update();
    debugger;
  }
  //this.head.headPoint.copyto(end1);
  //this.head.direction.copyto(this.direction);
  //this.head.update();
}


item.__controlPoints = function () {
  debugger;
  let e0 = this.end0;
  this.joinX = this.e01 * this.elbowPlacement;
  let joinPoint = geom.Point.mk(this.end0.x+this.joinX,e0.y);
  let headControlPoint = this.arrowHeads[0].controlPoint(); 
  let rs = [joinPoint,headControlPoint];
  if (this.includeEndControls) {
    rs.push(e0);
    this.outEnds.forEach(function (inEnd) {rs.push(inEnd)});
  }
  return rs;
}

item.__updateControlPoint = function (idx,pos) {
  if (idx === 0) {
    this.joinX = this.outEnds[0].x - pos.x;
    //this.joinX = pos.x - this.end0.x;
    this.elbowPlacement = Math.max(0,1 - (this.joinX)/(this.e01));
    //this.end1.y = pos.y;
  } else if (idx === 2) {
    this.end0.copyto(pos);
  } else if (idx == 1) {
    debugger;
    let arrowHead = this.arrowHeads[0];
    let params = arrowHead.updateControlPoint(pos,true);
    let toAdjust = ui.whatToAdjust;
    toAdjust.headWidth = params[0];
    toAdjust.headLength = params[1];
    
    //arrowHead.update();
    //arrowHead.__draw();
    ui.adjustInheritors.forEach(function (x) {
      x.update();
      x.__draw();
   });
    //return;
  } else {
    this.outEnds[idx-3].copyto(pos);
  }
  this.update();
  this.__draw();
}


item.__setExtent = function (extent) {
  debugger;
  let outEnd0 = this.outEnds[0];
  let outEnd1 = this.outEnds[1];
  let endIn = this.end0;
  let flip = (outEnd0.x < endIn.x)?1:-1;
  outEnd0.x = outEnd1.x =  -flip*extent.x/2;
  outEnd0.y = -extent.y/2;
  outEnd1.y = extent.y/2;
  endIn.x =flip*extent.x/2;
  endIn.y = 0;
  this.joinX = flip*extent.x/2;
}

item.updateConnectedEnd = function (whichEnd,vertex,connectionType) {
  let toRight = this.end0.x < this.outEnds[0].x;
  console.log('toRight',toRight);
 // let direction = geom.Point.mk(toRight?-1:1,0);
  let tr = this.__getTranslation();
  let end,direction;
  if (whichEnd === 'in') {
    end = this.end0;
    direction = geom.Point.mk(toRight?1:-1,0);
  } else {
    end = this.outEnds[whichEnd];
    direction = geom.Point.mk(toRight?-1:1,0);
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
ui.hide(item,['helper','head','shaft','end0','end1','direction','shafts','outEnds','joinX','flip','e01','end0x',
              'elbowP','arrowHeadP','arrowHeads','outConnections','outVertices','inConnection']);
item.__setFieldType('solidHead','boolean');

return item;

});