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
item.set({width:600,height:50});
item.vPadding = 20;
item.hPadding = 20;
item.showBox = false;
item.multiline = false;
item.data = 'A quick brown fox jumped over the lazy dog';
item.set('box',rectangleP.instantiate());
item.box.__unselectable = 1;
item.box.fill = '#f5f5ff';
item.box.__affixedChild = 1; // dragging the box, drags this item
item.set('textarea',textareaP.instantiate());
item.textarea.__unselectable = 1;

item.textarea.textHt = 10;
item.textarea.textP.__draggable = 1;

item.textarea.textP.startDrag = function (refPoint) {
  debugger;
   var itm = pj.ancestorWithPrototype(this,item);;
   debugger;
   itm.dragStartTr= itm.__getTranslation().copy();
   itm.dragStart = refPoint.copy();
}


item.textarea.textP.dragStep = function (pos) {
  var itm = pj.ancestorWithPrototype(this,item);;
  var relpos = pos.difference(itm.dragStart);
  var newtr = itm.dragStartTr.plus(relpos);
  itm.__moveto(newtr);
}
item.set('__signature',pj.Signature.mk({width:'N',height:'N',data:'S'}));

item.__draggable = 1;
item.__adjustable = 1;
item.__getExtent = function () {
  return pj.geom.Point.mk(
          this.width,this.height);

}

item.__setExtent = function (extent,nm) {
  console.log('setExtent',extent.x,extent.y,nm,this.width);
  this.width = extent.x;
  this.height = extent.y;
  this.update(nm);
}

//item.width = 200;
//item.height = 100;


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
   // var minHt = this.textarea.height + 2 * this.vPadding;
    var needsUpdate = 0;
    if (this.width < minWd) {
      this.width = this.box.width = minWd;
      console.log('prex',minWd);
      needsUpdate = 1;
    }
    //if (this.height < minHt) {
    //  this.height = this.box.height = minHt;
    //  needsUpdate = 1;;
   // }
    if (needsUpdate) {
      console.log("UPDATEBOX");
      this.box.update();
    //this.box.__show();
    }
  }
}

item.addListener("extentChange","listenForExtentChange");

item.update = function (fromSetExtent) {
   if (this.forChart) {
    this.data = this.forChart.getData().title;
  }
  var box = this.box;
  if (this.showBox) {
    box.__show();
  } else {
    box.__hide();
  }
  
  //box.fill = box.fill; // make fill an own property of bo
  var textarea = this.textarea;
  textarea.multiline = this.multiline;
  this.__adjustable = this.multiline;
  var minWd = textarea.width + 2*this.hPadding;
 // var minHt = textarea.height + 2*this.vPadding;
  console.log('updateCount',this.__updateCount)
  if (fromSetExtent) {
    //this.width = Math.max(this.width,minWd);
    //this.height = Math.max(this.height,minHt);
      console.log('wd ht 1',this.width,this.height);
    textarea.__setExtent(geom.Point.mk(this.width+2-2 * this.hPadding,
                                       this.height-2 * this.vPadding),fromSetExtent);
    var textareaHeight = textarea.height;
    var textareaWidth = textarea.width;
    var numLines = textarea.numLines;
    console.log('NUMLINES',numLines);
    if (0 && (numLines === 1 || textarea.cannotBeNarrowed)) {
      this.hPadding = Math.max(0,0.5 * (this.width - textarea.width));
      if (this.hPadding === 0) {
        this.width = textarea.width;
      }
    }
    this.width = textarea.width + 2*this.hPadding;
    this.height = textarea.height + 2*this.vPadding;
   // this.vPadding = Math.max(0,0.5 * (this.height - textarea.height));
   // if (this.vPadding === 0) {
  //    this.height = textarea.height;
  //  }    
   
    //textarea.update();

 // } else if (!this.__updateCount || this.__updateCount < 1) {
  } else if (this.__newData) {
    textarea.width = this.width - 2*this.hPadding;
    textarea.setText(this.data);
    //var minHt = textarea.height + 2*this.vPadding;
    //this.height = Math.max(this.height,minHt);
      console.log('ht 2',this.height);
    } else {
    textarea.update();
  }
  this.width = textarea.width + 2*this.hPadding;
  this.height = textarea.height + 2*this.vPadding;

  box.width = this.width;
  box.height = this.height;
        console.log('ht 3',this.width,this.height);
  debugger;
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

item.__setFieldType('showBox','boolean');
item.__setFieldType('multiline','boolean');

pj.returnValue(undefined,item);

});


