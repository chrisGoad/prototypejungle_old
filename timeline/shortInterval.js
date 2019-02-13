

core.require('/timeline/onAxisSupport.js','/line/line.js',function (axisSup,lineP,textP) {

let item = svg.Element.mk('<g/>');

item.set('vline',lineP.instantiate()).show();
item.set('hline',lineP.instantiate()).show();

/*adjustable parameters  */
item.lineOffset = 20; // offset from axis
/* end adjustable parameters */
//item.height = 20;
item.vline.stroke = 'black';
item.vline['stroke-width'] = 4;
item.hline.stroke = 'black';
item.hline['stroke-width'] = 4;
/* end adjustable parameters */

item.hline.unselectable = true;
item.draggableInKit = true;
item.vline.unselectable = true;

item.role = 'event';
item.actionSubject = true;
item.resizable = true;

//item.adjustInstanceOnly = true;
item.defaultWidth = 120;

item.imageLastUpdate = false;
item.update = function (options) {
  let axis = axisSup.findAxis(this);
  let data = this.dataX;
 
  let box = this.box;
  let x;
  //let xt = this.getExtent();
  //box.setExtent(xt);
  box.update();
  let xt = box.getExtent(); // the box might decide its extent in update
  this.width = xt.x;
  this.height = xt.y;
  let vline = this.vline;
  let hline = this.hline;
  let bbnds = box?box.bounds():undefined;
  let yoff = bbnds?0.5*xt.y:0;
  let tr = this.getTranslation();
  let intervalhWidth;
  let dataLB = this.dataXlb;
  let dataUB = this.dataXub;
  if ((dataLB === undefined) || (dataUB === undefined)) {
    intervalhWidth = 0.5*this.defaultWidth;
  } else {
    intervalhWidth = 0.5*axisSup.widthRelAxis(axis,dataLB,dataUB);
    x = axisSup.positionRelAxis(axis,dataLB,dataUB);
    this.moveto(geom.Point.mk(x,tr.y));
  }
 // if (data !== undefined) {
 //     x = axisSup.positionRelAxis(axis,data);
 //     this.moveto(geom.Point.mk(x,tr.y));
//    } 
  if (Math.abs(tr.y)  < yoff) {
    vline.hide();
    return;
  }
  vline.show();
  let above = true;
  if (tr.y + yoff > 0) {
    yoff = -yoff;
    above = false;
  }
  vline.show();
  let hlinePos = - tr.y  + (above?- this.lineOffset:axis.textOffset + this.lineOffset);
  let vend0 = geom.Point.mk(0,yoff);
  let vend1 = geom.Point.mk(0,hlinePos);
  vline.setEnds(vend0,vend1);
  vline.__update();
  vline.draw();
  let hend0 = geom.Point.mk(-intervalhWidth,hlinePos);
  let hend1 = geom.Point.mk(intervalhWidth,hlinePos);
  hline.setEnds(hend0,hend1);
  hline.__update();
  hline.draw();
 
}



return item;
});

