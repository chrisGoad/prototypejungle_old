//okok


core.require(function () {


let item = svg.Element.mk('<path fill="transparent" stroke="blue"  stroke-opacity="1" stroke-linecap="round" stroke-width="5"/>');

/* adjustable parameters */
item.set('end0',Point.mk(-25,0));
item.set('end1', Point.mk(25,0));
item.stroke = 'black';
item['stroke-width'] = 2;
//end adjustable parameters
item.adjustableProperties = ['stroke','stroke-width'];

item.role = 'line';
item.customControlsOnly = true;

item.resizable = true;

item.setEnds = function (p0,p1) {
  this.setPointProperty('end0',p0);
  this.setPointProperty('end1',p1);
}


item.controlPoints = function () {
  return [this.end0,this.end1];
}
item.updateControlPoint = function (idx,rpos) {
  switch (idx) {
    case 0:
      this.setPointProperty('end0',rpos);
      break;
    case 1:
      this.setPointProperty('end1',rpos);
      break;
  }
  this.update();
  this.draw();
}


item.fromParent = function () {
  if (!this.neverselectable) {
    return;
  }
  let props = this.adjustableProperties;
  let parent= this.__parent;
  core.setProperties(this,parent,props);
}

item.transferState = function (line,src,own) { //own = consider only the own properties of src
  core.setProperties(line,src,['unselectable','neverselectable','stroke','stroke-width'],own);
}

ui.hide(item,['end0','end1','d']);

return item;
});