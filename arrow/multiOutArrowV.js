//multiOutArrow


core.require('/shape/u.js','/arrow/solidHead.js',function (elbowPP,arrowHeadPP) {
let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.pointsDown = true; 

item.stroke = "black";
item['stroke-width'] = 2;
item.headLength = 10;
item.headWidth = 8;
item.stroke = "black";
item.elbowWidth = 10;
item.joinY = 25; // distance from join to end1
item.set('singleEnd',Point.mk(0,-15)); 
item.set("ends",core.ArrayNode.mk());
item.ends.push(Point.mk(0,15));
//item.ends.push(Point.mk(10,0));
item.set("arrowHeads", svg.Element.mk('<g/>'));
item.arrowHeads.unselectable = true;
/* end adjustable parameters */

item.set('elbowP',elbowPP.instantiate()).hide();
item.arrowHeadP = core.installPrototype('arrowHead',arrowHeadPP);

let arrowHeadP = item.arrowHeadP;
arrowHeadP.hide();
item.arrowHeadPName = arrowHeadP.__name; //needed to make swap prototype do the right thing;dangling pointer to old prototype if arrowHeadP is used directly
item.role = 'multiOut';
item.outCount = item.ends.length;
item.includeEndControls = true;
item.vertical = true;

item.set("shafts",core.ArrayNode.mk());

item.set('direction',Point.mk(0,1));

item.elbowPlacement = 0.5;
item.buildShafts = function () {
  let ln = this.ends.length;
  let lns = this.shafts.length;
  let i;
  for (i=lns;i<ln;i++) {
    let shaft = this.elbowP.instantiate().show();
    shaft.unselectable = true;
    this.shafts.push(shaft);
  }
}
item.numHeads = 0;
item.buildArrowHeads= function () {
  let arrowHeads = this.arrowHeads;
  let arrowHeadP = core.root.prototypes[this.arrowHeadPName];
  let ln = this.ends.length;
  let lns = this.numHeads;
  let i;
  for (i=lns;i<ln;i++) {
    let arrowHead = arrowHeadP.instantiate();
    arrowHead.unselectable = true;
    arrowHead.show();
    let nm = 'h'+this.numHeads++;
    arrowHeads.set(nm,arrowHead);
  }
}

// new ends are always placed between the last two ends, if there are two
item.initializeNewEnds = function () {
  let currentLength = this.ends.length;
  let numNew = this.outCount - currentLength;
  let ends = this.ends;  
  let eRight = ends[currentLength-1];
  let eLeft;
  if (ends.length < 2) {
    this.end1y = eRight.y;
  } else {
    eLeft = ends[currentLength-2];
    eRight = ends[currentLength-1];
    this.end1y= Math.max(eLeft.y,eRight.y);
  }
  this.e01 = this.end1y - this.singleEnd.y;

  if (numNew <= 0) {
    this.outCount = currentLength; // removing ends not supported
    return;
  }
  ui.unselect();
  let cx,interval;
  let rightX = eRight.x;
  ends.pop();
  if (ends.length < 2) {
    cx = rightX - 5;
    interval = 10;
  }  else {
    let leftX = eLeft.x;
    interval = (rightX - leftX)/(numNew+1);
    cx = leftX+interval;
  }
  for (let i=currentLength;i<this.outCount;i++) {
    ends.push(Point.mk(cx,this.end1y));
    cx += interval;
  }
  ends.push(eRight);
}

item.pointsDown = function () {
 let e0 = this.ends[0];
 return e0.y  < this.singleEnd.y;
 
}
item.update = function () {
  let i;
  this.initializeNewEnds();
  this.buildShafts();
  this.buildArrowHeads();
  let {singleEnd,ends,shafts,arrowHeads} = this;
  let ln = ends.length;

  core.setProperties(this.elbowP,this,['stroke-width','stroke','elbowWidth']);
  let down = this.pointsDown();
  let end0 = ends[0];
  let depth =(singleEnd.y - end0.y)/2;
  for (i=0;i<ln;i++) {
    let end1 = ends[i];
    let arrowHead = arrowHeads['h'+i];
    if (arrowHead.solidHead) {
      arrowHead.fill = this.stroke;
    } else {
      core.setProperties(arrowHead,this,['stroke','stroke-width']);
    }
    core.setProperties(arrowHead,this,['headLength','headWidth']);
    let shaftEnd = arrowHead.solidHead ?end1.plus(this.direction.times((down?0.5:-0.5)*this.headLength)):end1;
    let shaft = shafts[i];
    shaft.depth = depth;
    shaft.end1.copyto(singleEnd);
    shaft.end0.copyto(shaftEnd);
    shaft.elbowPlacement = this.elbowPlacement;
    shaft.update();
    shaft.draw();
    arrowHead.headPoint.copyto(end1);
    //arrowHead.direction.copyto(this.direction);
    arrowHead.direction.copyto(this.direction.times(down?-1:1));

    arrowHead.update();
  }
}


item.controlPoints = function () {
  let e0 = this.singleEnd;
//  this.joinX = this.e01 * this.elbowPlacement;
//  let joinPoint = Point.mk(this.singleEnd.x+this.joinX,e0.y);
  let headControlPoint = this.arrowHeads.h0.controlPoint(); 
  let rs = [headControlPoint];
  if (this.includeEndControls) {
    rs.push(e0);
    this.ends.forEach(function (inEnd) {rs.push(inEnd)});
  }
  return rs;
}

item.updateControlPoint = function (idx,pos) {
  if (idx === 110) {
    this.joinX = this.ends[0].x - pos.x;
    this.elbowPlacement = Math.max(0,1 - (this.joinX)/(this.e01));
    if (!this.singleVertex) {
      this.singleEnd.y = pos.y;
    }
  } else if (idx === 1) {
     if (this.singleVertex) {
      graph.mapEndToPeriphery(this,this.singleEnd,this.singleVertex,'outConnection',pos);
    } else {
      this.singleEnd.copyto(pos);
    }
  } else if (idx === 0) {
    let params = this.arrowHeads.h0.updateControlPoint(pos,true);
    let ln = this.ends.length;
    for (let i=0;i<ln;i++) {
      let arrowHead = this.arrowHeads['h'+i];
      arrowHead.headWidth = params[0];
      arrowHead.headLength = params[1];
      arrowHead.update();
      arrowHead.draw();
    };
    return;
  } else {
    let eidx = idx-2;
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
  if (idx === 1) {
    return !!(this.singleVertex);
  } else if (idx > 1) {
    let vertices = this.vertices;
    if (vertices) {
      return  !!(vertices[idx-2]);
    }
  }
  return false;
}

item.dropControlPoint = function (idx,droppedOver) {
  debugger;
  if (!droppedOver) {
    return;
  }
  if (idx === 1) {
    graph.connectMultiSingleVertex(this,droppedOver);
  } else if (idx > 1) {
    graph.connectMultiVertex(this,idx-2,droppedOver);
  }
  graph.updateMultiEnds(this);
  this.update();
  this.draw();
  ui.unselect();
}



ui.hide(item,['helper','head','shaft','singleEnd','end1','direction','shafts','ends','joinX','e01','end0x',
              'elbowP','arrowHeadP','arrowHeadPName','arrowHeads','outConnections','vertices','inConnection',
              'elbowWidth','end1x','includeEndControls','numHeads']);

return item;

});
