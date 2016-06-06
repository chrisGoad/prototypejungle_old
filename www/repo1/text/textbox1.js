//pj.require('lib/text_layout.js','lib/grid_layout.js',function (erm,layout,grid_layout) {
pj.require('../text/textarea1.js','../shape/rectangle1.js',function (erm,textareaP,rectangleP) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;
/* the box is always enlarged enough vertically to contain the text. */
var item = pj.svg.Element.mk('<g/>');
//item.__adjustable = 1;
//item.__draggable = 1;
item.markType = '[N|S],N';
item.__updateLast = 1; // after the charts
item.set({width:300,height:200});
item.set('box',rectangleP.instantiate());
item.box.__affixedChild = 1; // dragging the box, drags this item
item.set('textarea',textareaP.instantiate());
item.textarea.__draggable = 0;

item.set('__signature',pj.Signature.mk({width:'N',height:'N',data:'S'}));

item.__draggable = 1;
item.__adjustable = 1;
item.__getExtent = function () {
  return pj.geom.Point.mk(
          this.width,this.height);

}

item.__setExtent = function (extent) {
  console.log('setExtent');
  this.width = extent.x;
  this.height = extent.y;
  this.update(1);
}

item.width = 200;
item.height = 100;
item.vPadding = 20;
item.hPadding = 20;
item.data = 'A quick brown fox jumped over the lazy dog';

item.listenForExtentChange = function (ev) {
  var node = ev.node;
  console.log('extentChange');
  if (node === this.box) {
    console.log('from box')
    this.width = this.box.width;
    this.height = this.box.height;
    this.update(1);
  } else if (node === this.textarea) {
    //codetem.listenToTextarea = function () {
    console.log('listenToTheTextarea');
    var minWd = this.textarea.width + 2 * this.hPadding;
    var minHt = this.textarea.height + 2 * this.vPadding;
    var needsUpdate = 0;
    if (this.width < minWd) {
      this.width = this.box.width = minWd;
      console.log('prex',minWd);
      needsUpdate = 1;
    }
    if (this.height < minHt) {
      this.height = this.box.height = minHt;
      needsUpdate = 1;;
    }
    if (needsUpdate) {
      console.log("UPDATEBOX");
      this.box.update();
    //this.box.__show();
    }
  }
}

item.addListener("extentChange","listenForExtentChange");

item.update = function (fromSetExtent) {
  var box = this.box;
  var textarea = this.textarea;
  var minWd = textarea.width + 2*this.hPadding;
  var minHt = textarea.height + 2*this.vPadding;
  console.log('updateCount',this.__updateCount)
  if (fromSetExtent) {
    this.width = Math.max(this.width,minWd);
    this.height = Math.max(this.height,minHt);
      console.log('ht 1',this.height);

  } else if (!this.__updateCount || this.__updateCount < 1) {
    textarea.width = this.width - 2*this.hPadding;
    textarea.setText(this.data);
    var minHt = textarea.height + 2*this.vPadding;
    this.height = Math.max(this.height,minHt);
      console.log('ht 2',this.height);

  } else {
    textarea.update();
  }
  box.width = this.width;
  box.height = this.height;
        console.log('ht 3',this.height);

  box.update();
  return;
}

/*
item.listenToTextarea = function () {
  console.log('listenToTextarea');
  var minWd = this.textarea.width + 2 * this.hPadding;
  var minHt = this.textarea.height + 2 * this.vPadding;
  var needsUpdate = 0;
  if (this.width < minWd) {
    this.width = this.box.width = minWd;
    console.log('prex',minWd);
    needsUpdate = 1;
  }
  if (this.height < minHt) {
    this.height = this.box.height = minHt;
    needsUpdate = 1;;
  }
  if (needsUpdate) {
    console.log("UPDATEBOX");
    this.box.update();
    //this.box.__show();
  }
  return;
  this.box.width = this.textarea.width;
  this.box.height = this.textarea.height;
  console.log('listenToTextArea')
  this.box.update();
  this.box.__show();
}
*/
/**
 * Set accessibility and notes for the UI
*/
//ui.hide(item.grid,['bottomPadding','topPadding','leftPadding','rightPadding']);

pj.returnValue(undefined,item);

});


