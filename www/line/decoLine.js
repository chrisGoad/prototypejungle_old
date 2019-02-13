//okok

core.require('/line/utils.js',function (utils) {


let item = svg.Element.mk('<path  fill="transparent" stroke-opacity="1" stroke-linecap="round"/>');

utils.setup(item);

/* adjustable parameters */
item.waveLength = 40;
item.waveAmplitude = 0.2; // as a fraction of the wave length
item.wavesToSkip = 0;
/* end adjustable parameters */
//item.adjustableProperties = utils.adjustableProperties.concat(['waveLength','waveAmplitude','wavesToSkip']);

item.cornerFraction = 0.2; // the fraction of the wave taken up by  corners
item.cornerPosition = 1.0;
item.radiusFactor = 0.6;




item.setEnds =  function (p0,p1) {
  utils.setEnds(this,p0,p1);
}

item.update = function () {
  //utils.fromParent(this);
  let thisHere = this;
  let e0 = this.end0,e1 = this.end1;
  let v = e1.difference(e0);
  let ln = v.length();
  const p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  
  const pathForHalfWave = function (startPoint,endPoint,up) {
    let delta = endPoint.difference(startPoint);
    let a = 0.5 * thisHere.waveAmplitude;
    let distToP1 = thisHere.cornerPosition;
    let distToP2 = (thisHere.cornerPosition + (thisHere.cornerFraction));
    
    let n = delta.normal();
    if (up) {
      n = n.minus();
    }
    let deltaToP1 = delta.times(distToP1).plus(n.times(a));
    let p1 = startPoint.plus(deltaToP1);
    let c1 = startPoint.plus(deltaToP1.times(1.3));
    let p2 = endPoint;
    let c2 = endPoint.plus(Point.mk(thisHere.cornerFraction,thisHere.cornerFraction*thisHere.waveAmplitude));
    let path = p2str('L',p1,' ') +
        p2str('C',c1,',')+
        p2str(' ',c2,',') + p2str(' ',p2,' ') +  p2str('L',endPoint,' ');
    return path;
  }
  let hwc = Math.round(2*ln/this.waveLength);
  let hwDelta = v.times(1/hwc);
  let current = e0;
  let path = p2str('M',e0,' ');
  for (let i=0;i<hwc-this.wavesToSkip;i++) {
    let next = current.plus(hwDelta);
    path += pathForHalfWave(current,next,true);//i%2===0);
    current = next;
  }
  path += p2str('L',e1,' ');
  this.d = path;
  if (this.text  && this.__parent.updateText) {
    this.__parent.updateText(this.text);
  }
}

item.controlPoints = function () {
  return utils.controlPoints(this);
}

item.updateControlPoint = function (idx,rpos) {
   utils.updateControlPoint(this,idx,rpos);
}

ui.hide(item,['d','end0','end1','cornerFraction','cornerPosition','fill','radiusFactor','stroke-linecap','stroke-opacity']);

return item;
});