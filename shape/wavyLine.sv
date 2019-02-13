
//Wavy line


core.require(function () {


let item =   svg.Element.mk('<path fill="none" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="5"/>');

/* adjustable parameters */
item.set('end0',Point.mk(0,0));
item.set('end1', Point.mk(50,0));
item.halfWaveCount = 15;
item.waveAmplitude = 1; // as a fraction of the wave length
item.cornerFraction = 0.4; // the fraction of the wave taken up by  corners
item.stroke = 'black';
item['stroke-width'] = 2;
item.radiusFactor = 0.6;
/* endadjustable parameters */



//ui.setupAsEdge(item);
item.role = 'line';//'edge';
item.customControlsOnly = true;


item.adjustable = true;
item.draggable = true;
item.defaultSize = Point.mk(50,0);

let sqrt2 = Math.sqrt(2);


item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
  this.update();
}

item.update = function () {
  let cr;
  let thisHere = this;
  let e0 = this.end0,e1 = this.end1;
  let v = e1.difference(e0);
  let ln = e1.length();
  let d = v.times(1/ln);
  const p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  const pathForHalfWave = function (startPoint,endPoint,up,first) {
    let delta = endPoint.difference(startPoint);
    let a = 0.5 * thisHere.waveAmplitude;
    let distToP1 = ((1 - thisHere.cornerFraction)/2);
    let n = delta.normal();
    if (up) {
      n = n.minus();
    }
    let deltaToP1 = delta.times(distToP1).plus(n.times(a));
    let p1 = startPoint.plus(deltaToP1);
    let c1 = startPoint.plus(deltaToP1.times(1.3));
    let deltaToP2 = delta.times(-distToP1).plus(n.times(a));
    let p2 = endPoint.plus(deltaToP2);
    let c2 = endPoint.plus(deltaToP2.times(1.3));
     let path = p2str('L',p1,' ')+
        p2str('C',c1,',')+
        p2str(' ',c2,',') + p2str(' ',p2,' ') +  p2str('L',endPoint,' ')
     return path;
  }
  let hwc = this.halfWaveCount;
  let hwDelta = v.times(1/hwc);
  let current = e0;
  let path = p2str('M',e0,' ');
  for (let i=0;i<hwc;i++) {
    let next = current.plus(hwDelta);
    path += pathForHalfWave(current,next,i%2===0);
    current = next;
  }
  this.d = path;
}

item.controlPointss = function () {
  return  [this.end0,this.end1];
}

item.holdsControlPointt = function (idx,headOfChain) {
  return true;
  if (idx === 0) {
    return this.hasOwnProperty('headWidth')
  }
  return headOfChain;
}


item.updateControlPointt = function (idx,rpos) {  
  let graph = ui.containingGraph(this);
  let tr = this.getTranslation();
  let pos = rpos.plus(tr);
  switch (idx) {
    case 0:
      if (this.end0vertex) {
        graph.mapEndToPeriphery(this,0,pos);
      } else {
        this.end0.copyto(rpos);
      }
      break;
    case 1:
      if (this.end1vertex) {
        graph.mapEndToPeriphery(this,1,pos);
      } else {
        this.end1.copyto(rpos);
      }
      break;
  }
  this.update();
  this.draw();
}


item.connectedd = function (idx) {
  if (idx === 0) {
    return !!(this.end0vertex)
  }
  if (idx === 1) {
    return !!(this.end1vertex);
  }
  return false;
}

item.dropControlPointt = function (idx,droppedOver) {
  if (!droppedOver) {
    return;
  }
  let graph = ui.containingGraph(this);
  if (idx === 0) {
    graph.connect(this,0,droppedOver);
  } else if (idx === 1) {
    graph.connect(this,1,droppedOver);
  }
  graph.updateEnds(this);
  this.update();
  this.draw();
  ui.unselect();
}


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['unselectable','stroke','stroke-width'],own);
}

//graph.installEdgeOps(item);

//item.setupAsEdge(item);

ui.hide(item,['end0','end1','d','stroke-linecap']);

return item;
});
