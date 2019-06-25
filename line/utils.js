core.require(function () {

let item = core.ObjectNode.mk();

item.setup = function (line) {
  line.set('end0',Point.mk(-25,0));
  line.set('end1', Point.mk(25,0));
  line.stroke = 'black';
  line['stroke-width'] = 2;
  line.role = 'line';
  line.customControlsOnly = true;
  line.resizable = true;
  line.adjustableProperties = this.adjustableProperties;
}

item.setEnds = function (line,p0,p1) {
  line.setPointProperty('end0',p0);
  line.setPointProperty('end1',p1);
}

item.controlPoints = function (line) {
  return [line.end0,line.end1];
}

item.updateControlPoint = function (line,idx,rpos) {
  switch (idx) {
    case 0:
      line.setPointProperty('end0',rpos);
      break;
    case 1:
      line.setPointProperty('end1',rpos);
      break;
  }
  line.update();
  line.draw();
}

item.transferState = function (line,src,own) { //own = consider only the own properties of src
  core.setProperties(line,src,['unselectable','neverselectable','stroke','stroke-width'],own);
}

item.fromParent = function (line) {
  if (!line.unselectable) {
    return;
  }
  let props = line.adjustableProperties;
  let parent= line.__parent;
  core.setProperties(line,parent,props);
}

item.adjustableProperties = ['stroke','stroke-width'];

return item;
});