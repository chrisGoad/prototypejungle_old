// line, implemented as a graph edge with text


core.require('/line/line.js','/text/attachedText.js',function (linePP,textItemP) {
alert('obsolete:shape/line');
let item = svg.Element.mk('<g/>');
//item.set('content', svg.Element.mk('<line/>')); // the line itself
// a textItem is added if item.text is non-empty; see update
//item.content.unselectable = true;
/*adjustable parameters  */
item.set('end0',Point.mk(-50,0));
item.set('end1',Point.mk(50,0));
item.stroke = 'black';
item['stroke-width'] = 2;
/* end adjustable parameters */

item.role = 'edge';
item.customControlsOnly = true;

item.text = '';
//item.lineP = core.installPrototype(linePP);
item.lineP = core.installPrototype('line',core.ObjectNode.mk());


item.setEnds = function (e0,e1) {
  this.end0.copyto(e0);
  this.end1.copyto(e1);
}

item.update = function () {
  if (!this.shaft) {
    this.set("shaft",this.lineP.instantiate());
    this.shaft.unselectable = true;
    this.shaft.role = 'line';
    this.shaft.show();
  }
  this.shaft.setEnds(this.end0,this.end1);
  this.shaft.update();
  if (this.text) {
    if (!this.textItem) {
      this.set('textItem',textItemP.instantiate());
      this.textItem.unselectable = true;
    }
    this.textItem.update();
  }
}
// the next two functions support dragging the ends around. See https://protopedia.org/doc/code.html#controllers

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
  this.update();
  this.draw();
}

// used in swapping. See https://protopedia.org/doc/code.html#roles

item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['stroke','stroke-width','text'],own);
  if (src.textItem) {
    if (!this.textItem) {
      this.set('textItem',textItemP.instantiate());
      this.textItem.unselectable = true;
    }
    this.textItem.transferState(src.textItem,own);
  }
    
}

ui.hide(item,['end0','end1','text']);

// support for the use of this item as an edge
// See https://protopedia.org/doc/code.html#graph
graph.installEdgeOps(item);


return item;
});

