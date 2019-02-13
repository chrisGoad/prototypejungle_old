

core.require('/timeline/onAxisSupport.js',function (axisSup) {

//let item = svg.Element.mk('<line/>');
let item = svg.Element.mk('<g/>');

//item.set('line',lineP.instantiate()).show();
//item.set('box',textP.instantiate()).show();
//item.box.unselectable = true;
//item.line.unselectable = true;
/*adjustable parameters  */
//item.width = 100;
//item.height = 20;
item.draggableInKit = true;
//item.line.stroke = 'black';
//item.line['stroke-width'] = 4;
/* end adjustable parameters */

item.roles = 'interval';
item.role = 'interval';
//item.cloneMe = true; 
item.actionSubject = true;// the box is what is selected but the axisPoint is the object to be acted on
//item.customControlsOnly = true;
item.resizable = true;
item.actionSubject = true;

//item.outlineOnly = true;
item.__defaultSize = geom.Point.mk(50,0);
//item.line.__unselectable = true;
//item.box.__unselectable = true;
item.__isTextBox = true;
item.adjustInstanceOnly = true;
item.defaultWidth = 150;
item.height = 100;

item.imageLastUpdate = false;
item.update = function (options) {
  let box = this.box;
  if (this.text) {
    //code
  }
  box.text = this.text;
  //box.unselectable = true;
  let axis = axisSup.findAxis(this);
  let dataLB = this.dataXlb;
  let dataUB = this.dataXub;
  if ((dataLB === undefined) || (dataUB === undefined)) {
    box.setWidth(this.defaultWidth);
    //this.box.width = this.width;
    //this.box.height = this.height;
    //this.box.update();
    //this.width = this.box.width;
    //this.height = this.box.height;
    //return;
  } else {
    let width = axisSup.widthRelAxis(axis,dataLB,dataUB);
    let tr = this.getTranslation();
    box.setWidth(width);
    let x = axisSup.positionRelAxis(axis,dataLB,dataUB);
    this.moveto(geom.Point.mk(x,tr.y));
  //let xt = this.getExtent();
  //box.setExtent(xt);
  //box.update();
  }
  this.width = box.width;
  this.height = box.height;
 
 
}



return item;
});

