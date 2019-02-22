//multiOutArrow


core.require('/shape/elbow.js','/arrow/solidHead.js',function (elbowPP,arrowHeadPP) {
let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.pointsTo = 'right'; // if set to 'left' in settings then the arrow is pointed the other way (see __updatePrototype)

item.stroke = "black";
item['stroke-width'] = 2;
item.headLength = 10;
item.headWidth = 8;
item.stroke = "black";
item.elbowWidth = 10;
item.joinX = 25; // distance from join to end1
item.set('singleEnd',Point.mk(-50,0)); 
item.set("ends",core.ArrayNode.mk());
item.ends.push(Point.mk(0,-10));
item.ends.push(Point.mk(0,10));
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

item.set("shafts",core.ArrayNode.mk());

item.set('direction',Point.mk(1,0));

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

// new ends are always placed between the last two ends
item.initializeNewEnds = function () {
  let currentLength = this.ends.length;
  let numNew = this.outCount - currentLength;
  let ends = this.ends;  
  let eTop = ends[currentLength-2];
  let eBottom = ends[currentLength-1];
  this.end1x = (1 || (this.pointsTo === 'left'))?Math.max(eTop.x,eBottom.x):Math.min(eTop.x,eBottom.x);
  this.e01 = this.end1x - this.singleEnd.x;
  if (numNew <= 0) {
    this.outCount = currentLength; // removing ends not supported
    return;
  }
  ui.unselect();
  ends.pop();
  let topY = eTop.y;
  let obottomY = eBottom.y;
  let interval = (obottomY - topY)/(numNew+1);
  let cy = topY+interval;
  for (let i=currentLength;i<this.outCount;i++) {
    ends.push(Point.mk(this.end1x,cy));
    cy += interval;
  }
  ends.push(eBottom);
}

item.pointsToRight = function () {
 let e0 = this.ends[0];
 return e0.x > this.singleEnd.x;
 
}
item.update = function () {
  let i;
  this.initializeNewEnds();
  this.buildShafts();
  this.buildArrowHeads();
  let {singleEnd,ends,shafts,arrowHeads} = this;
  let ln = ends.length;

  core.setProperties(this.elbowP,this,['stroke-width','stroke','elbowWidth']);
  let toRight = this.pointsToRight();

  for (i=0;i<ln;i++) {
    let end1 = ends[i];
    let arrowHead = arrowHeads['h'+i];
    if (arrowHead.solidHead) {
      arrowHead.fill = this.stroke;
    } else {
      core.setProperties(arrowHead,this,['stroke','stroke-width']);
    }
    core.setProperties(arrowHead,this,['headLength','headWidth']);
    let shaftEnd = arrowHead.solidHead ?end1.plus(this.direction.times((toRight?-0.5:0.5)*this.headLength)):end1;
    let shaft = shafts[i];
    shaft.end1.copyto(singleEnd);
    shaft.end0.copyto(shaftEnd);
    shaft.elbowPlacement = 1-this.elbowPlacement;
    shaft.update();
    shaft.draw();
    arrowHead.headPoint.copyto(end1);
    //arrowHead.direction.copyto(this.direction);
    arrowHead.direction.copyto(this.direction.times(toRight?1:-1));

    arrowHead.update();
  }
}


item.controlPoints = function () {
  let e0 = this.singleEnd;
  this.joinX = this.e01 * this.elbowPlacement;
  let joinPoint = Point.mk(this.singleEnd.x+this.joinX,e0.y);
  let headControlPoint = this.arrowHeads.h0.controlPoint(); 
  let rs = [joinPoint,headControlPoint];
  if (this.includeEndControls) {
    rs.push(e0);
    this.ends.forEach(function (inEnd) {rs.push(inEnd)});
  }
  return rs;
}

item.updateControlPoint = function (idx,pos) {
  if (idx === 0) {
    this.joinX = this.ends[0].x - pos.x;
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
    let arrowHead = this.arrowHeads.h0;
    let params = arrowHead.updateControlPoint(pos,true);
    let toAdjust = ui.whatToAdjust;
    toAdjust.headWidth = params[0];
    toAdjust.headLength = params[1];
    ui.updateInheritors(toAdjust);
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



ui.hide(item,['helper','head','shaft','singleEnd','end1','direction','shafts','ends','joinX','e01','end0x',
              'elbowP','arrowHeadP','arrowHeadPName','arrowHeads','outConnections','vertices','inConnection',
              'elbowWidth','end1x','includeEndControls','numHeads']);

return item;

});
