//multiOut


//core.require('/shape/c.js','/shape/u.js','/arrow/solidHead.js',function (elbowPPH,elbowPPV,arrowHeadPP) {
core.require('/shape/twoBends.js','/arrow/solidHead.js',function (elbowPP,arrowHeadPP) {
let item = svg.Element.mk('<g/>');

/* adjustable parameters */
//item.pointsDown = true; 
item.includeArrows = false;
item.vertical = false;
item.stroke = "black";
item['stroke-width'] = 2;
item.headLength = 10;
item.headWidth = 8;
item.stroke = "black";
item.elbowWidth = 10;
item.joinY = 25; // distance from join to end1
item.set('singleEnd',item.vertical?Point.mk(0,-15):Point.mk(-15,0));
item.set("ends",core.ArrayNode.mk());
item.ends.push(item.vertical?Point.mk(0,15):Point.mk(15,0));
//item.ends.push(item.vertical?Point.mk(10,15):Point.mk(15,10));
item.set("arrowHeads", core.ArrayNode.mk());
item.arrowHeads.unselectable = true;
/* end adjustable parameters */

item.set('elbowP',elbowPP.instantiate().hide());
item.arrowHeadP = core.installPrototype('arrowHead',arrowHeadPP);

let arrowHeadP = item.arrowHeadP;
arrowHeadP.hide();
item.arrowHeadPName = arrowHeadP.__name; //needed to make swap prototype do the right thing;dangling pointer to old prototype if arrowHeadP is used directly
item.role = 'multiOut';
item.outCount = item.ends.length;
item.includeEndControls = true;

item.set("shafts",core.ArrayNode.mk());

item.set('direction',Point.mk(0,0));

item.elbowPlacement = 0.5;
item.buildShafts = function () {
  this.elbowP.vertical = !this.vertical;
  let ln = this.ends.length;
  let lns = this.shafts.length;
  let i;
  for (i=lns;i<ln;i++) {
    let shaft = this.elbowP.instantiate().show();
    shaft.unselectable = true;
    this.shafts.push(shaft);
  }
}
item.buildArrowHeads= function () {
  let ln = this.ends.length;
  let arrowHeads = this.arrowHeads;
  let lns = arrowHeads.length;
  let arrowHeadP = core.root.prototypes[this.arrowHeadPName];
  for (let i=lns;i<ln;i++) {
    let arrowHead = arrowHeadP.instantiate();
    arrowHead.unselectable = true;
    arrowHead.show();
    arrowHeads.push(arrowHead);
  }
}

// new ends are always placed between the last two ends, if there are two
item.initializeNewEnds = function () {
  let vertical = this.vertical;
  let currentLength = this.ends.length;
  let numNew = this.outCount - currentLength;
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

item.pointsPositive = function () { // down for vertical; right for horizontal
 let e0 = this.ends[0];
 return this.vertical? e0.y  < this.singleEnd.y : e0.x < this.singleEnd.x;
 
}
item.update = function () {
  let i;
  let vertical = this.vertical;
  this.direction.copyto(vertical?Point.mk(0,1):Point.mk(1,0));
  this.initializeNewEnds();
  this.buildShafts();
  if (this.includeArrows) {
    this.buildArrowHeads();
  }
  let {singleEnd,ends,shafts,arrowHeads} = this;
  let ln = ends.length;
  core.setProperties(this.elbowP,this,['stroke-width','stroke','elbowWidth']);

  core.setProperties(this.elbowP,this,['stroke-width','stroke','elbowWidth']);
  let positiveDir = this.pointsPositive();
  let end0 = ends[0];
  let depth =vertical? -(singleEnd.y - end0.y)/2 :  -(singleEnd.x - end0.x)/2;
  for (i=0;i<ln;i++) {
    let end1 = ends[i];
    if (this.includeArrows) {
      let arrowHead = arrowHeads[i];
      if (arrowHead.solidHead) {
        arrowHead.fill = this.stroke;
      } else {
        core.setProperties(arrowHead,this,['stroke','stroke-width']);
      }
      core.setProperties(arrowHead,this,['headLength','headWidth']);
    }
    let shaftEnd = (this.includeArrows && arrowHead.solidHead) ?end1.plus(this.direction.times((positiveDir?0.5:-0.5)*this.headLength)):end1;
    let shaft = shafts[i];
    shaft.depth = depth;
    shaft.end0.copyto(singleEnd);
    shaft.end1.copyto(shaftEnd);
    shaft.elbowPlacement = this.elbowPlacement;
    shaft.update();
    shaft.draw();
    if (this.includeArrows) {
      arrowHead.headPoint.copyto(end1);
      arrowHead.direction.copyto(this.direction.times(positiveDir?-1:1));
      arrowHead.update();
    }
  }
}

item.removeEnd = function (idx) {
  let ends = this.ends;
  if (idx >= ends.length) {
    error('out of bounds in removeEnd');
  }
  ends[idx].remove();
  this.shafts[idx].remove();
  this.arrowHeads[idx].remove();
  this.vertices.splice(idx,1);
  this.outCount = ends.length;
}
  

item.controlPoints = function () {
  let e0 = this.singleEnd;
//  this.joinX = this.e01 * this.elbowPlacement;
//  let joinPoint = Point.mk(this.singleEnd.x+this.joinX,e0.y);
  let headControlPoint = this.arrowHeads[0].controlPoint(); 
  let rs = [headControlPoint];
  if (this.includeEndControls) {
    rs.push(e0);
    this.ends.forEach(function (inEnd) {rs.push(inEnd)});
  }
  return rs;
}

item.updateControlPoint = function (idx,pos) {
  let vertical = this.vertical;
  if (idx === 110) {
    this.joinV = vertical? this.ends[0].x - pos.x : this.ends[0].y - pos.y;
    this.elbowPlacement = Math.max(0,1 - (this.joinV)/(this.e01));
    if (!this.singleVertex) {
      if (vertical) {
        this.singleEnd.y = pos.y;
      } else {
        this.singleEnd.x = pos.x;
      }
    }
  } else if (idx === 1) {
     if (this.singleVertex) {
      graph.mapEndToPeriphery(this,this.singleEnd,this.singleVertex,'outConnection',pos);
    } else {
      this.singleEnd.copyto(pos);
    }
  } else if (idx === 0) {
    let params = this.arrowHeads[0].updateControlPoint(pos,true);
    let ln = this.ends.length;
    for (let i=0;i<ln;i++) {
      let arrowHead = this.arrowHeads[i];
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
