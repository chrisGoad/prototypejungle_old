
//Wavy line


core.require('/line/decoLine.js',function (dlineP) {


let item = svg.Element.mk('<g/>');

/* adjustable parameters */
item.set('end0',Point.mk(0,0));
item.set('end1', Point.mk(50,0));
item.set('center',dlineP.instantiate()).show();
item.set('left',svg.Element.mk('<line/>'));
item.set('right',svg.Element.mk('<line/>'));

item.height = 4;

item.halfWaveCount = 6;
item.waveAmplitude = 0.4; // as a fraction of the wave length
item.cornerFraction = 0.2; // the fraction of the wave taken up by  corners
item.cornerPosition = 1.0;
item.stroke = 'black';
item['stroke-width'] = .1;
item.radiusFactor = 0.6;
item.text = '';
/* end adjustable parameters */

item.role = 'line';
item.customControlsOnly = false;


item.adjustable = false;
item.draggable = false;


const setLineEnds = function (line,e0,e1) {
  let element = line.__element;
  if (element) {
    element.setAttribute('x1',e0.x);
    element.setAttribute('y1',e0.y);
    element.setAttribute('x2',e1.x);
    element.setAttribute('y2',e1.y);
  }
}

item.setSideEnds = function (e0,e1) {
  let ht = this.height;
  let dir = e1.difference(e0);
  let nh = dir.normal().normalize().times(ht/2);
  let mh = nh.minus();
  //setLineEnds(this.left,e0.plus(nh),e1.plus(nh));
  setLineEnds(this.left,e0,e1);
  setLineEnds(this.right,e0.difference(nh),e1.difference(nh));
 // setLineEnds(this.right,e0,e1);
}

item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
  this.center.setEnds(p0,p1);
  this.update();
}
item.update = function () {
  this.left['stroke-width'] = this['stroke-width'];
 
  this.center.update();
  this.setSideEnds(this.end0,this.end1);
}


item.transferState = function (src,own) { //own = consider only the own properties of src
  return;
  core.setProperties(this,src,['unselectable','stroke','stroke-width'],own);
}



//ui.hide(item.content,['d','stroke-linecap']);
ui.hide(item,['end0','end1']);

return item;
});