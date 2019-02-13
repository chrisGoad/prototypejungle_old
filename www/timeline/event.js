// event

//core.require('/shape/line.js','/text/textbox.js',function (lineP,textP) {
core.require('/timeline/onAxisSupport.js','/line/line.js',function (axisSup,lineP,textP) {

//let item = svg.Element.mk('<line/>');
let item = svg.Element.mk('<g/>');

item.set('vline',lineP.instantiate()).show();
//item.set('outline',textP.instantiate()).show();
//item.outline.unselectable = true;
//item.line.unselectable = true;
/*adjustable parameters  */
item.width = 100;
//item.height = 20;
item.draggableInKit = true;
item.vline.stroke = 'black';
item.vline['stroke-width'] = 4;
/* end adjustable parameters */

item.role = 'event';
//item.cloneMe = true; 
item.actionSubject = true;// the outline is what is selected but the axisPoint is the object to be acted on
//item.customControlsOnly = true;
item.resizable = true;

//item.outlineOnly = true;
//item.line.unselectable = true;
//item.outline.unselectable = true;
//item.isTextBox = true;
item.adjustInstanceOnly = true;

item.imageLastUpdate = false;

item.update = function (options) {
  let axis = axisSup.findAxis(this);
  let data = this.dataX;
  let box = this.box;
  let x;
  box.update();
  let xt = box.getExtent(); // the box might decide its extent in update
  this.width = xt.x;
  this.height = xt.y;
  let vline = this.vline;
  let bbnds = box?box.bounds():undefined;
  let yoff = bbnds?0.5*xt.y:0;
  let tr = this.getTranslation();
  if (data !== undefined) {
      x = axisSup.positionRelAxis(axis,data);
      this.moveto(geom.Point.mk(x,tr.y));
  } 
  let vend0 = geom.Point.mk(0,yoff);
  let vend1 = geom.Point.mk(0,-tr.y);//hlinePos);
  vline.setEnds(vend0,vend1);
  vline.__update();
  vline.draw();
}




return item;
});

