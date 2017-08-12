
// graph support; the basic operations on vertices are dispatched to the containing diagram
// support for drawings with axes, in which shapes may have associated data

ui.findAxis = function () {
  if (ui.Axis) {
    return ui.Axis;
  }
  let rs;
  pj.forEachDescendant(pj.root,
    (node) => {if (node.__role === 'axis') rs = node});
  ui.Axis = rs;
  return rs;
}

const imagePositionRelAxis = function (data,iaxis) {
  let axis = iaxis?iaxis:ui.findAxis();
  if (!axis) {
    return;
  }
  let width = axis.width;
  let center = axis.__getTranslation().x;
  let fractionAlong = (data - axis.coverageLB)/(axis.coverageUB - axis.coverageLB);
  return (center - 0.5*width) + fractionAlong * width;
}


const widthRelAxis = function (dataLB,dataUB,iaxis) {
  let axis = iaxis?iaxis:ui.findAxis();
  if (!axis) {
    return;
  }
  let fraction = (dataUB - dataLB)/(axis.coverageUB - axis.coverageLB);
  return fraction * axis.width;
  return (center - 0.5*width) + fractionAlong * width;
}

ui.adjustRelAxis = function (node) {
  debugger;
  alert('adjustrelaxis');
  let dataXstring = node.__dataX;
  if (dataXstring !== undefined) {
    let dataX = Number(datastring);
    if (isNaN(dataX)) {
      node.__dragVertically = false;
    } else {
      let axis = ui.findAxis();
      if (axis) {
        let x = imagePositionRelAxis(dataX,axis);
        if (x !== undefined) {
          node.__moveto(x);
          node.__dragVertically = true;
        }
      }
    }
  return;
  }
  let dataLBstring = node.dataLB
  let dataUBstring = node.dataUB;
  if ((dataLBstring != undefined) && (dataUBstring != undefined)) {
    let axis = ui.findAxis();
    if (axis) {
      let dataLB = Number(dataLBstring);
      let dataUB = Number(dataUBstring);
      if (isNaN(dataLB) || isNaN(dataUB)) {
        node.__dragVertically = false;
      } else {
        let center = (dataLB + dataUB)/2;
        let imcenter = imagePositionRelAxis(center,axis);
        let width = widthRelAxis(dataLB,dataUB,axis);
        node.__moveto(imcenter);
        node.width = width;
        node.__dragVertically = true;
      }
    }
  }
}

//pj.preUpdateHooks.push(ui.adjustRelAxis);
