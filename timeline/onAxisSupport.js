// onAxisSupport

core.require(function () {
var item = core.ObjectNode.mk();

// convention: axis is named "axis" in the containing diagram
item.findAxis = function (x) {
  let diagram = core.containingKit(x);
  if (diagram) {
    return diagram.axis;
  }
}
// support for drawings with axes, in which shapes may have associated data

item.positionRelAxis = function (axis,dataLB,dataUB) {
  //let axis = iaxis?iaxis:ui.findAxis();
  let data;
  if (dataUB !== undefined) {
    data  = (dataLB + dataUB)/2;
  } else {
    data = dataLB;
  }
  let width = axis.width;
  let center = axis.getTranslation().x;
  let fractionAlong = (data - axis.coverageLB)/(axis.coverageUB - axis.coverageLB);
  return (center - 0.5*width) + fractionAlong * width;
}


item.widthRelAxis = function (axis,dataLB,dataUB) {
  let fraction = (dataUB - dataLB)/(axis.coverageUB - axis.coverageLB);
  return fraction * axis.width;
  return (center - 0.5*width) + fractionAlong * width;
}

return item;
});