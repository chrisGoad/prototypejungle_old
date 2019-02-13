

core.require(function () {

let item = svg.Element.mk('<polyline/>');

/*adjustable parameters  */
item.set('points',core.ArrayNode.mk());
item.stroke = 'black';
item['stroke-width'] = 4;
/* end adjustable parameters */

item.customControlsOnly = true;
item.resizable = true;

item.setEnds = function (p0,p1) {
  this.end0.copyto(p0);
  this.end1.copyto(p1);
}

item.update = function () {
  let e0 = this.end0;
  let e1 = this.end1;
  this.setAttribute('x1',e0.x);
  this.setAttribute('y1',e0.y);
  this.setAttribute('x2',e1.x);
  this.setAttribute('y2',e1.y);
}

item.controlPoints = function () {
  return [this.end0,this.end1];
}



item.updateControlPoint = function (idx,rpos) {
  switch (idx) {
    case 0:
      if (this.end0vertex) {
        graph.mapEndToPeriphery(this,0,rpos);
      } else {
        this.end0.copyto(rpos);
      }
      break;
    case 1:
      if (this.end1vertex) {
        graph.mapEndToPeriphery(this,1,rpos);
      } else {
        this.end1.copyto(rpos);
      }
      break;
  }
  this.draw();
}

item.dropControlPoint = function (idx,droppedOver) {
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
  this.draw();
  ui.unselect();
}


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['stroke','stroke-width'],own);
}

ui.hide(item,['end0','end1']);

graph.installEdgeOps(item);


return item;
});

