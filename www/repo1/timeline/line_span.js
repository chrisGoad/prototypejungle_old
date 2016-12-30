//pj.require([['axisP','chart/component/axis1.js'],['coreP','chart/core/scatter1.js']],function (erm,item) {
//pj.require('./component/axis.js','./core/timeline.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
pj.require('/timeline/axis.js',function (axisP) {
var svg=pj.svg;
var geom=pj.geom;
//var data=pj.data;

var item = pj.svg.Element.mk('<g/>');
item.width = 500;
item.height = 30;
item.__adjustable = true;
item.__adjustInstanceOnly = true; //not the prototypes
item.__draggable = true;

item.firstDate = ' ';
item.lastDate = ' ';
//item.set("core",coreP.instantiate());
//item.core.__unselectable = true;
//item.core.__show();

item.datesUpdatedByUser = false;

item.set("spanLine",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="0" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));


item.startLineHeight = 20;
    
item.set("startLine",
  svg.Element.mk('<line x1="-10" y1="0" x2="0" y2="0" \
    stroke="black"  stroke-linecap="round" stroke-width="2"/>'));
item.spanLine.__unselectable = true;

item.set('label', svg.Element.mk('<text font-size="20" font-family="Arial" fill="black" text-anchor="middle"/>'));

//item.text = 'Texty';

item.label.__draggable = true;

item.label.setText('hoob');

item.set('labelPosition',geom.Point.mk(20,-10));


item.label.dragStep = function (pos) {
  var spanLine = this.__parent.spanLine;
  var lineSpan = this.__parent;
  var x = spanLine.x1;
  var y = spanLine.y1;
  var bbox = this.__bounds();
  var cp = pos.difference(lineSpan.__getTranslation());//this.__getTranslation();

  console.log('cp',pos.x,pos.y,'xy',x,y,'diff',cp.x-x,cp.y-y);
  var toAdjust = Object.getPrototypeOf(this.__parent);
  toAdjust.labelPosition.copyto(cp.difference(bbox.extent.times(0.5).plus(geom.Point.mk(x,y))));
  toAdjust.__updateVisibleInheritors();
}

/*
item.label.__stopDragg = function () {
  var spanLine = this.__parent.spanLine;
  var x = spanLine.x1;
  var y = spanLine.y1;
  var bbox = this.__bounds();
  var cp = this.__getTranslation();
  console.log('cp',cp.x,cp.y,'xy',x,y,'diff',cp.x-x,cp.y-y);
  var toAdjust = Object.getPrototypeOf(this.__parent);
  toAdjust.labelPosition = cp.difference(bbox.extent.times(0.5).plus(geom.Point.mk(x,y)));
};
*/

item.moveStartLineAndLabel = function () {
  var x = this.spanLine.x1;
  var y = this.spanLine.y1;
  this.startLine.x1 = this.startLine.x2 = x;
  this.startLine.y2 = -item.startLineHeight;
  var bbox = this.label.__bounds();
  if (bbox) {
    this.label.__moveto(geom.Point.mk(x,y).plus(bbox.extent.times(0.5).plus(this.labelPosition)));
  } else {
    console.log('DOOOV');
    debugger;
  }
}
item.update = function () {
  if (pj.updateSource && (pj.updateSource.node === this)) {
    this.datesUpdatedByUser = true;
  }
  var axis = axisP.findAxis();
  var notBlank = function (st) {
    return st !== ' ';
  }
  //this.label.setText(this.text);
  var line = this.spanLine;
  // now use the data, if any, associated with this span to
  // set its width and x position
  if (axis && this.datesUpdatedByUser) {
    var atr = axis.__getTranslation();
    var fds = this.firstDate;
    var lds = this.lastDate;
    if (notBlank(fds) && notBlank(lds)) {
      var fd  = Number(fds);
      var ld = Number(lds);
      if (!isNaN(fd) && !isNaN(ld))  {
        var fda = axis.toAxisCoords(fd);
        var lda = axis.toAxisCoords(ld);
        var length= lda - fda;
        this.width  = length;
        line.x1 = -length/2;
        line.x2 = length/2;
        var atr = axis.__getTranslation();
        var linex = atr.x + (fda + lda)/2;
        var liney = this.__getTranslation().y;
        this.__moveto(linex,liney);
        this.moveStartLineAndLabel();
      }
      return;
    }
  }
  atr = axis.__getTranslation();
  var hw = this.width/2;
  line.x1 = -hw
  line.x2 = hw;
  var lx = this.__getTranslation().x;
  var axisLeft = atr.x -0.5 * axis.width;
  console.log('axis width',axis.width);
  console.log('x1 ',(lx+line.x1 - axisLeft)/axis.width);
  console.log('x2 ',(lx+line.x2 - axisLeft)/axis.width);;

  this.firstDate = axis.axisCoordsToDate(lx+line.x1 - axisLeft);
  this.lastDate = axis.axisCoordsToDate(lx+line.x2 - axisLeft);
  this.moveStartLineAndLabel();
}



item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {

  this.width= extent.x;
  //this.height = extent.y;
  this.__updateVisibleInheritors();
  
}
/**
 * Set accessibility and notes for the UI
*/

return item;
});