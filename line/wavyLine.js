//Wavy line

core.require('/line/line0.js',function (lineP) {

let item = lineP.instantiate();

// adjustable parameters
item.waveLength = 20;
item.waveAmplitude = 10; 
item.cornerFraction = 0.4; // the fraction of the wave taken up by  corners
/* end adjustable parameters */


item.update = function () {
  let thisHere = this;
  let e0 = this.end0,e1 = this.end1;
  let v = e1.difference(e0);
  let hln = v.length();
  let halfWaveCount = Math.round(2*hln/(this.waveLength));
  const p2str = function (letter,point,after) {
    return letter+' '+point.x+' '+point.y+after;
  }
  const pathForHalfWave = function (startPoint,endPoint,up) {
    let delta = endPoint.difference(startPoint);
    let a = 0.5 * thisHere.waveAmplitude;
    let distToP1 = ((1 - thisHere.cornerFraction)/2);
    let n = (delta.normal().normalize()).times(1/1.3);
    if (up) {
      n = n.minus();
    }
    let deltaToP1 = delta.times(distToP1).plus(n.times(a));
    let p1 = startPoint.plus(deltaToP1);
    let c1 = startPoint.plus(deltaToP1.times(1.3));
    let deltaToP2 = delta.times(-distToP1).plus(n.times(a));
    let p2 = endPoint.plus(deltaToP2);
    let c2 = endPoint.plus(deltaToP2.times(1.3));
    let path = p2str('L',p1,' ') +
        p2str('C',c1,',')+
        p2str(' ',c2,',') + p2str(' ',p2,' ') +  p2str('L',endPoint,' ');
    return path;
  }
  let hwc = halfWaveCount;
  let hwDelta = v.times(1/hwc);
  let current = e0;
  let path = p2str('M',e0,' ');
  for (let i=0;i<hwc;i++) {
    let next = current.plus(hwDelta);
    path += pathForHalfWave(current,next,i%2===0);
    current = next;
  }
  this.d = path;
  if (this.text  && this.__parent.updateText) {
    this.__parent.updateText(this.text);
  }
}

ui.hide(item,['end0','end1','d','stroke-opacity','stroke-linecap','fill']);

return item;
});