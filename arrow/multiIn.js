//multiIn

core.require('/shape/twoBends.js','/arrow/solidHead.js',function (elbowPP,arrowHeadPP) {
  
core.standsAlone(['/shape/twoBends.js','/arrow/solidHead.js']);  // suitable for loading into code editor

let item = svg.Element.mk('<g/>');

/* adjustable parameters */
//item.pointsDown = true; 
item.vertical = true;
item.includeArrow = false;
item.stroke = "black";
item['stroke-width'] = 2;
item.headLength = 10;
item.headWidth = 8;
item.stroke = "black";
item.elbowWidth = 10;
item.joinY = 25; // distance from join to end1
item.controlOnlyJoin = false;
item.set('singleEnd',item.vertical?Point.mk(0,15):Point.mk(15,0));
item.set("ends",core.ArrayNode.mk());
item.ends.push(item.vertical?Point.mk(0,-15):Point.mk(-15,0));
/* end adjustable parameters */

item.set('singleDirection',Point.mk(0,0));
item.set('armDirections',core.ArrayNode.mk());
item.armDirections.push(Point.mk(0,-1));
item.role = 'multiIn';
item.inCount = item.ends.length;
item.includeEndControls = true;

item.set("shafts",core.ArrayNode.mk());

item.set('direction',Point.mk(0,0));

item.elbowPlacement = 0.5;
// each prototype of this multiIn should have its own associated elbow prototype

item.buildShafts = function () {
  let proto = Object.getPrototypeOf(this);
  if (!proto.elbowP) {
    proto.elbowP = core.installPrototype('elbowP',elbowPP);
  }
  this.elbowP.vertical = !this.vertical;
  let ln = this.ends.length;
  let lns = this.shafts.length;
  let i;
  for (i=lns;i<ln;i++) {
    let shaft = this.elbowP.instantiate().show();
    shaft.neverselectable = true;
    this.shafts.push(shaft);
  }
}

item.initializeDirections = function () {
  let ln = this.inCount;
  let dln = this.armDirections.length;
  for (let i=dln;i<ln;i++) {
    this.armDirections.push(this.vertical?Point.mk(0,1):Point.mk(1,0));
  }
}

// new ends are always placed between the last two ends, if there are two
item.initializeNewEnds = function () {
  this.inCount = Math.max(this.inCount,this.ends.length);
  this.initializeDirections();
  let vertical = this.vertical;
  let currentLength = this.ends.length;
  let numNew = this.inCount - currentLength;
  let ends = this.ends;  
  let eLast = ends[currentLength-1];
  let eFirst;
  if (ends.length < 2) {
    this.end1y = eLast.y;
  } else {
    eFirst = ends[currentLength-2];
    eLast = ends[currentLength-1];
    this.end1v= vertical?Math.max(eFirst.y,eLast.y):Math.max(eFirst.x,eLast.x)
  }
  this.e01 = this.end1v - (vertical?this.singleEnd.y:this.singleEnd.x);

  if (numNew <= 0) {
    this.outCount = currentLength; // removing ends not supported
    return;
  }
  ui.unselect();
  let cv,interval;
  let lastV = vertical?eLast.x:eLast.y;
  ends.pop();
  if (ends.length < 2) {
    cv = lastV - 5;
    interval = 10;
  }  else {
    let firstV = vertical?eFirst.x:eFirst.y;
    interval = (lastV - firstV)/(numNew+1);
    cv = firstV+interval;
  }
  for (let i=currentLength;i<this.outCount;i++) {
    ends.push(vertical?Point.mk(cv,this.end1v):Point.mk(this.end1v,cv));
    cv += interval;
  }
  ends.push(eLast);

}



item.singlePointsPositive = function () { // down for vertical; right for horizontal
 let e0 = this.ends[0];
 return this.vertical? e0.y  < this.singleEnd.y : e0.x < this.singleEnd.x;
 
}
item.armPointsPositive = function (n,midPoint) { // the nth arm
 let end = this.ends[n];
 return this.vertical? end.y  > midPoint.y : end.x > midPoint.x;
}

item.update = function () {
  let i;
  let vertical = this.vertical;
  this.direction.copyto(vertical?Point.mk(0,1):Point.mk(1,0));
  this.initializeNewEnds();

  this.buildShafts();
  let {singleEnd,ends,shafts} = this;
  let ln = ends.length;
  
  if (this.includeArrow && (!this.head)) {
    let proto = Object.getPrototypeOf(this);
    if (!proto.arrowHeadP) {
      proto.arrowHeadP = core.installPrototype('arrowHead',arrowHeadPP);
    }
    this.set('head',this.arrowHeadP.instantiate()).show();
    this.head.neverselectable = true;
  }
  if ((!this.includeArrow) && (this.head)) {
    this.head.remove();
    this.head = undefined;
  }
  
  let head = this.head;

  core.setProperties(this.elbowP,this,['stroke-width','stroke','elbowWidth']);
  let positiveDir = this.singlePointsPositive();
  this.singleDirection.copyto(vertical?Point.mk(0,positiveDir?1:-1):Point.mk(positiveDir?1:-1,0));
  let end0 = ends[0];
  let  ep = this.elbowPlacement;
  let depth =vertical? -(singleEnd.y - end0.y)*ep :  -(singleEnd.x - end0.x)*ep;
  this.depth = depth;
  let  middle = vertical?Point.mk(singleEnd.x,singleEnd.y+depth):Point.mk(singleEnd.x+depth,singleEnd.y);
  this.middle = middle;
  for (i=0;i<ln;i++) {
    let app = this.armPointsPositive(i,middle);
    this.armDirections[i].copyto(vertical?Point.mk(0,app?1:-1):Point.mk(app?1:-1,0));
    if (head) {
      if (head.solidHead) {
        head.fill = this.stroke;
      } else {
        core.setProperties(head,this,['stroke','stroke-width']);
      }
      core.setProperties(head,this,['headLength','headWidth']);
    }
    let shaft = shafts[i];
    shaft.depth = depth;
    let shaftEnd = (head && head.solidHead)?singleEnd.plus(this.direction.times((positiveDir?-0.5:0.5)*this.headLength)):singleEnd;
    shaft.end0.copyto(shaftEnd);
    shaft.end1.copyto(ends[i]);
    //shaft.elbowPlacement = this.elbowPlacement;
    shaft.update();
    shaft.draw();
  }
  if (head) {
    head.headPoint.copyto(singleEnd);
    head.direction.copyto(this.direction.times(positiveDir?1:-1));
    head.update();
  }
}

item.removeEnd = function (idx) {
  let ends = this.ends;
  if (idx >= ends.length) {
    error('out of bounds in removeEnd');
  }
  ends[idx].remove();
  this.shafts[idx].remove();
  this.vertices.splice(idx,1);
  this.outCount = ends.length;
}
  

item.controlPoints = function () {
  let e0 = this.singleEnd;
  if (this.controlOnlyJoin) {
    if (this.inCount < 2) {
      return [];
    }
    let oe = this.ends[0];
    let d = this.vertical? e0.y - oe.y : e0.x - oe.x;
    let ep = this.elbowPlacement;
    return [e0.plus(this.vertical?Point.mk(0,-ep*d):Point.mk(ep * d,0))];
  }
  let rs = [];
  if (this.includeEndControls) {
    rs.push(e0);
    this.ends.forEach(function (inEnd) {rs.push(inEnd)});
  }
  if (this.head) {
    rs.push(this.head.controlPoint());
  }    
  return rs;
}



item.connected = function (idx) {
  if (idx === 0) {
    return !!(this.singleVertex);
  } else if (idx <= this.count) {
    let vertices = this.vertices;
    if (vertices) {
      return  !!(vertices[idx-1]);
    }
  }
  return false;
}


item.updateControlPoint = function (idx,pos) {
  let vertical = this.vertical;
  let idxOff=(this.head)?1:0;
  if (this.controlOnlyJoin) {
    let se = this.singleEnd;
    let e0 = this.ends[0];
    let td =  vertical? e0.y - se.y:e0.x - se.x;
    let d = vertical? pos.y - se.y  :pos.x - se.x;
    this.elbowPlacement = Math.min(0.9,Math.max(0.1,d/td));
  } else  if (idx === 0) {
     if (this.singleVertex) {
      graph.mapEndToPeriphery(this,this.singleEnd,this.singleVertex,'outConnection',pos);
    } else {
      this.singleEnd.copyto(pos);
    }
  } else if (idx <= this.inCount) {
    let eidx = idx-1;
    if (this.vertices && this.vertices[eidx]) {
       graph.mapEndToPeriphery(this,this.ends[eidx],this.vertices[eidx],'inConnections',pos,eidx);
    } else {
      this.ends[eidx].copyto(pos);
    }
  } else if (this.head && (idx === this.inCount+1)) {
    let head = this.head;
    let params = head.updateControlPoint(pos,true);
    head.headWidth = params[0];
    head.headLength = params[1];
    head.updateAndDraw();
    return;
  }
  this.update();
  this.draw();
}


item.dropControlPoint = function (idx,droppedOver) {
  if (!droppedOver) {
    return;
  }
  if (idx === 0) {
    graph.connectMultiSingleVertex(this,droppedOver);
  } else if (idx <= this.inCount) {
    graph.connectMultiVertex(this,idx-1,droppedOver);
  }
  graph.updateMultiEnds(this);
  this.update();
  this.draw();
  ui.unselect();
}

item.setFieldType('includeArrow','boolean');


ui.hide(item,
  ['helper','head','shaft','singleEnd','end1','direction','shafts','ends','joinX','e01','end0x',
   'elbowP','arrowHeadP','arrowHeadPName','arrowHeads','outConnections','vertices',
   'inConnection','armDirections','controlOnlyJoin','depth','end1v','end1y','headLength',
   'headWidth','outCount','singleDirection','vertical','inConnections','joinY',
   'elbowWidth','end1x','includeEndControls','numHeads']);

return item;

});
