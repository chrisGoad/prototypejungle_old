//multiOut


core.require('/shape/twoBends.js','/arrow/solidHead.js',function (elbowPP,arrowHeadPP) {


let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.includeArrows = true;
item.vertical = true;
item.stroke = "black";
item['stroke-width'] = 2;
item.headLength = 10;
item.headWidth = 8;
item.elbowWidth = 10;
item.set('singleEnd',item.vertical?Point.mk(0,-15):Point.mk(-15,0));
item.set("ends",core.ArrayNode.mk());
item.ends.push(item.vertical?Point.mk(0,15):Point.mk(15,0));
/* end adjustable parameters */

item.set('armDirections',core.ArrayNode.mk());
item.armDirections.push(Point.mk(0,-1));
item.set("arrowHeads", core.ArrayNode.mk());
item.arrowHeads.neverselectable = true;
item.role = 'multiOut';
item.outCount = item.ends.length;
item.includeEndControls = true;

item.initializePrototype = 	function () {
  core.assignPrototypes(this,'elbowP',elbowPP,'arrowHeadP',arrowHeadPP);
}

    
item.set("shafts",core.ArrayNode.mk());


item.elbowPlacement = 0.5;

item.buildShafts = function () {
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

item.buildArrowHeads= function () {
  let ln = this.ends.length;
  let arrowHeads = this.arrowHeads;
  let lns = arrowHeads.length;
  for (let i=lns;i<ln;i++) {
    let arrowHead = this.arrowHeadP.instantiate();
    arrowHead.neverselectable = true;
    arrowHead.show();
    arrowHeads.push(arrowHead);
  }
}

item.removeArrowHeads = function () {
  let arrowHeads = this.arrowHeads;
  let ln = arrowHeads.length;
  if (ln > 0) {
    arrowHeads.remove();
    this.set('arrowHeads',core.ArrayNode.mk());
  }
}



item.initializeDirections = function () {
  let ln = this.outCount;
  let dln = this.armDirections.length;
  for (let i=dln;i<ln;i++) {
    this.armDirections.push(this.vertical?Point.mk(0,1):Point.mk(1,0));
  }
}


// new ends are always placed between the last two ends, if there are two
item.initializeNewEnds = function () {
  this.outCount = Math.max(this.outCount,this.ends.length);
  this.initializeDirections();
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

item.singlePointsPositive = function () { // down for vertical; right for horizontal
 let e0 = this.ends[0];
 return this.vertical? e0.y  < this.singleEnd.y : e0.x < this.singleEnd.x;
}


item.armPointsPositive = function (n,midPoint) { // the nth arm
 let end = this.ends[n];
 return this.vertical? end.y  > midPoint.y : end.x > midPoint.x;
}


item.set('singleDirection',Point.mk(0,-1));

item.update = function () {
  let i;
  let vertical = this.vertical;
  this.initializeNewEnds();
  this.buildShafts();
  if (this.includeArrows) {
    this.buildArrowHeads();
  } else {
    this.removeArrowHeads();
  }
  let {singleEnd,ends,shafts,arrowHeads} = this;
  let ln = ends.length;
  let positiveDir = this.singlePointsPositive();
  this.singleDirection.copyto(vertical?Point.mk(0,positiveDir?1:-1):Point.mk(positiveDir?1:-1,0));
  let end0 = ends[0];
  let depth =vertical? -(singleEnd.y - end0.y)/2 :  -(singleEnd.x - end0.x)/2;
  let  middle = vertical?Point.mk(singleEnd.x,singleEnd.y+depth):Point.mk(singleEnd.x+depth,singleEnd.y);

  for (i=0;i<ln;i++) {
    let app = this.armPointsPositive(i,middle);
    this.armDirections[i].copyto(vertical?Point.mk(0,app?1:-1):Point.mk(app?1:-1,0));
    let arrowHead;
    let end1 = ends[i];
    if (this.includeArrows) {
      arrowHead = this.arrowHeads[i];
      if (arrowHead.solidHead) {
        arrowHead.fill = this.stroke;
      } else {
        core.setProperties(arrowHead,this,['stroke','stroke-width']);
      }
      core.setProperties(arrowHead,this,['headLength','headWidth']);
    }
    let shaftEnd = (this.includeArrows && arrowHead.solidHead) ?end1.plus(this.armDirections[i].times(-this.headLength)):end1;
    let shaft = this.shafts[i];
    core.setProperties(shaft,this,['stroke-width','stroke','elbowWidth']);
    shaft.depth = depth;
    shaft.end0.copyto(singleEnd);
    shaft.end1.copyto(shaftEnd);
    shaft.elbowPlacement = this.elbowPlacement;
    shaft.update();
    shaft.draw();
    if (this.includeArrows) {
      arrowHead.headPoint.copyto(end1);
      arrowHead.direction.copyto(this.armDirections[i]);
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
  if (this.includeArrows) {
    this.arrowHeads[idx].remove();
  }
  this.vertices.splice(idx,1);
  this.outCount = ends.length;
}
  

item.controlPoints = function () {
  let rs = [this.singleEnd];
  this.ends.forEach(function (inEnd) {rs.push(inEnd)});
  if (this.includeArrows) {
    rs.push(this.arrowHeads[0].controlPoint()); 
  }
  return rs;
}



item.connected = function (idx) {
  let ln = this.ends.length;
  if (idx === 0) {
    return !!(this.singleVertex);
  } else if (idx <= ln) {
    let vertices = this.vertices;
    if (vertices) {
      return  !!(vertices[idx-1]);
    }
  }
  return false;
}


item.updateControlPoint = function (idx,pos) {
  let vertical = this.vertical;
  let ln = this.ends.length;
  let idxBase = this.includeArrows?0:-1;
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
  } else if (idx === 0) {
     if (this.singleVertex) {
      graph.mapEndToPeriphery(this,this.singleEnd,this.singleVertex,'outConnection',pos);
    } else {
      this.singleEnd.copyto(pos);
    }
  } else if (idx <= ln) {
    let eidx = idx - 1;
    if (this.vertices && this.vertices[eidx]) {
       graph.mapEndToPeriphery(this,this.ends[eidx],this.vertices[eidx],'inConnections',pos,eidx);
    } else {
      this.ends[eidx].copyto(pos);
    }
  } else {
    let params = this.arrowHeads[0].updateControlPoint(pos,true);
    for (let i=0;i<ln;i++) {
      let arrowHead = this.arrowHeads[i];
      arrowHead.headWidth = params[0];
      arrowHead.headLength = params[1];
      arrowHead.update();
      arrowHead.draw();
    }
    return;
  }
  this.update();
  this.draw();
}

item.dropControlPoint = function (idx,droppedOver) {
  if (!droppedOver) {
    return;
  }
  let ln = this.ends.length;
  if (idx === 0) {
    graph.connectMultiSingleVertex(this,droppedOver);
  } else if (idx <= ln) {
    graph.connectMultiVertex(this,idx-1,droppedOver);
  }
  graph.updateMultiEnds(this);
  this.update();
  this.draw();
  ui.unselect();
}


item.setFieldType('includeArrows','boolean');

ui.hide(item,['helper','head','shaft','singleEnd','end1','shafts','ends','joinX','e01','end0x',
              'elbowP','arrowHeadP','arrowHeadPName','arrowHeads','outConnections','vertices','inConnection',
              'end1x','includeEndControls','numHeads','singleDirection',
              'end1v','vertical','armDirections']);

return item;

});
