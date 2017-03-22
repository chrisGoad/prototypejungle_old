//pj.require([['axisP','chart/component/axis1.js'],['coreP','chart/core/scatter1.js']],function (erm,item) {
//pj.require('./component/axis.js','./core/timeline.js','../lib/axis_utils.js',function (erm,axisP,coreP,axisUtils) {
pj.require('/shape/rectangle.js','/timeline/axis.js',function (rectangleP,axisP) {
var ui=pj.ui;
var geom=pj.geom;
//var data=pj.data;

var item = pj.svg.Element.mk('<g/>');
item.width = 500;
item.height = 30;
item.__adjustable = true;
item.__draggable = true;

item.firstDate = ' ';
item.lastDate = ' ';
//item.set("core",coreP.instantiate());
//item.core.__unselectable = true;
//item.core.__show();

item.set("bar",rectangleP.instantiate());
item.bar.__unhide();
item.bar.__unselectable = true;


item.update = function () {
  var bar = this.bar;
 
  bar.width = this.width;
  bar.height = this.height;
  var axis = axisP.findAxis();
  var notBlank = function (st) {
    return st !== ' ';
  }
  // now use the data, if any, associated with this span to
  // set its width and x position
  if (axis) {
    var fds = this.firstDate;
    var lds = this.lastDate;
    if (notBlank(fds) && notBlank(lds)) {
      var fd  = Number(fds);
      var ld = Number(lds);
      if (!isNaN(fd) && !isNaN(ld))  {
        var fda = axis.toAxisCoords(fd);
        var lda = axis.toAxisCoords(ld);
        this.width = lda  - fda;
        var atr = axis.__getTranslation();
        var barx = atr.x + (fda + lda)/2;
        var bary = this.__getTranslation().y;
        this.__moveto(barx,bary);
      }
    }
      
    bar.update();

    //code
  }
  return;
  //if (!this.__data) return;
  //pj.dat.throwDataError('bad data');
  //var idata = this.__getData();
  /*
  if (!pj.data.Sequence.isPrototypeOf(idata)) {
    pj.data.throwDataError('Data has the wrong form; data sequence expected');
  }
  if (!idata.numericalDomain()) {
    pj.data.throwDataError('Data has the wrong form: numerical domain expected');
  }
  */
  
  //this.core.__setData(idata,'noUpdate'); // needed for core.dataBounds, which is called in updateAxis
  //axisUtils.updateAxis(this);
  //this.core.update();

}


item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
  var event;
  if (this.width !== extent.x) {
    debugger;
  }
  this.width= extent.x;
  this.height = extent.y;
  this.update();
  
}
/**
 * Set accessibility and notes for the UI
*/

return item;
});