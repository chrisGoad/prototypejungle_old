// multiInArrow

core.require('/shape/elbow.js','/arrow/solidHead.js',function (elbowPP,arrowHeadP) {

let item = svg.Element.mk('<g/>');

/* adjustable parameters */

item.stroke = "black";
item['stroke-width'] = 2;
item.headLength = 10;
item.headWidth = 8;
item.includeHead = true;
item.stroke = "black";
item.elbowWidth = 10;
item.joinX = 25; // distance from join to singleEnd
item.set('singleEnd',Point.mk(60,0)); 
item.set("ends",core.ArrayNode.mk());
item.ends.push(Point.mk(0,-15));
item.ends.push(Point.mk(0,15));
/* end adjustable parameters */


item.set('head',arrowHeadP.instantiate());
item.head.unselectable = true;
item.set('elbowP',elbowPP.instantiate()).hide();
let elbowP = item.elbowP;
item.role = 'multiIn';
item.inCount = item.ends.length;
item.includeEndControls = true;


item.set("shafts",core.ArrayNode.mk());

item.set('direction',Point.mk(1,0));

item.elbowPlacement = 0.5;
item.buildShafts = function () {
  let ln = this.ends.length;
  let lns = this.shafts.length;
  let i;
  if (ln < lns) {
    for (i = lns;i>ln;i--) {
      let shaft = this.shafts[i-1];
      shaft.remove();
    }
  } else {
    for (i=lns;i<ln;i++) {
      let shaft = this.elbowP.instantiate().show();
      shaft.unselectable = true;
      this.shafts.push(shaft);
    }
  }
}


// new ends are always placed between the last two ends
item.initializeNewEnds = function () {
  let currentLength = this.ends.length;
  let ends = this.ends;
  let eTop,eBottom;
  const setEnd0x = () => {
    eBottom = ends[currentLength-1];
    if (ends.length === 1) {
      this.end0x = eBottom.x;
    } else {
      eTop = ends[currentLength-2];
        this.end0x = 0?Math.min(eTop.x,eBottom.x):Math.max(eTop.x,eBottom.x);
  }
  }
  this.e01 = this.singleEnd.x - this.end0x;
  let numNew = this.inCount - currentLength;
  if (numNew === 0) {
    setEnd0x();
    return;
  }
  if (currentLength === 1) { // special case for initialization of version dropped in the UI
    ends.push(Point.mk(0,15));
    this.end0x = 0;
    return;
  }
  setEnd0x();
  if (numNew <= 0) {
    this.inCount = currentLength; // removing ends not supported
    return;
  }
  ui.unselect();
  ends.pop();
  let topY = eTop.y;
  let obottomY = eBottom.y;
  let interval = (obottomY - topY)/(numNew+1);
  let cy = topY+interval;
  for (let i=currentLength;i<this.inCount;i++) {
    ends.push(Point.mk(this.end0x,cy));
    cy += interval;
  }
  ends.push(eBottom);
}


item.pointsToRight = function () {
 let e0 = this.ends[0];
 return this.singleEnd.x > e0.x;
 
}


item.computeEnd1 = function (deviation) {
 return this.singleEnd.plus(this.direction.times(deviation));
}

item.update = function () {
  let i;
  this.initializeNewEnds();
  this.buildShafts();
  let {singleEnd,ends,shafts} = this;
  let ln = ends.length;
  let toRight = this.pointsToRight();
  let shaftEnd = (this.includeHead && this.head.solidHead) ?this.computeEnd1((toRight?-0.5:0.5)*this.headLength):singleEnd;
  core.setProperties(elbowP,this,['stroke-width','stroke','elbowWidth']);//,'elbowPlacement']);
  for (i=0;i<ln;i++) {
    let end0 = ends[i];
    let shaft = shafts[i];
    shaft.end1.copyto(end0);
    shaft.end0.copyto(shaftEnd);
    shaft.elbowPlacement = 1-this.elbowPlacement;
    shaft.update();
    shaft.draw();
  }
  if (this.includeHead) {
    this.head.headPoint.copyto(singleEnd);
    this.head.direction.copyto(this.direction.times(toRight?1:-1));
    if (this.head.solidHead) {
      this.head.fill = this.stroke;
    } else {
      core.setProperties(this.head,this,['stroke','stroke-width']);
    }
    core.setProperties(this.head,this,['headLength','headWidth']);
    this.head.update();
  }
}


item.controlPoints = function () {
  let e1 = this.singleEnd;
  this.e01 = e1.x - this.end0x;
  let vertices = this.vertices;
  this.joinX = this.e01 * this.elbowPlacement;
  let joinPoint = Point.mk(this.end0x+this.joinX,e1.y);
  let headControlPoint = this.includeHead?this.head.controlPoint():e1;
  let rs = [joinPoint,headControlPoint];
  if (this.includeEndControls) {
    let ends = this.ends;
    rs.push(e1);
    let ln = this.ends.length;
    for (let i=0;i<ln;i++) {
      rs.push(ends[i]);
    }
  }
  return rs;
}

item.updateControlPoint = function (idx,pos) {
  if (idx === 0) {
    this.joinX = this.singleEnd.x - pos.x;
    this.elbowPlacement = Math.max(0,1 - (this.joinX)/(this.e01));
    if (!this.singleVertex) {
      this.singleEnd.y = pos.y;
    }
  } else if (idx === 2) {
    if (this.singleVertex) {
      graph.mapEndToPeriphery(this,this.singleEnd,this.singleVertex,'outConnection',pos);
    } else {
      this.singleEnd.copyto(pos);
    }
  } else if (idx === 1) {
    this.head.updateControlPoint(pos);
    ui.updateInheritors(ui.whatToAdjust);
    return;
  } else {
    let eidx = idx-3;
    if (this.vertices && this.vertices[eidx]) {
       graph.mapEndToPeriphery(this,this.ends[eidx],this.vertices[eidx],'inConnections',pos,eidx);
    } else {
      this.ends[eidx].copyto(pos);
    }
  }
  this.update();
  this.draw();
}


item.connected = function (idx) {
  if (idx === 2) {
    return !!(this.singleVertex);
  } else if (idx > 2) {
    let vertices = this.vertices;
    if (vertices) {
      return  !!(vertices[idx-3]);
    }
  }
  return false;
}

item.dropControlPoint = function (idx,droppedOver) {
  if (!droppedOver) {
    return;
  }
  if (idx === 2) {
    graph.connectMultiSingleVertex(this,droppedOver);
  } else if (idx > 2) {
    graph.connectMultiVertex(this,idx-3,droppedOver);
  }
  graph.updateMultiEnds(this);
  this.update();
  this.draw();
  ui.unselect();
}


ui.hide(item,['helper','head','shaft','end0','singleEnd','direction','shafts','ends','joinX','e01','end0x',
              'inConnections','vertices','elbowWidth','includeEndControls','includeHead',
              'nowConnected']);

return item;

});
