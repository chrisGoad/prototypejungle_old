'use strict';

pj.require('../../text/textarea1.js','../../lib/grid_layout.js',function (erm,textareaP,grid_layout) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;
var item = pj.svg.Element.mk('<g/>');
item.markType = '[N|S],N';
item.__updateLast = true; // after the charts
item.set({width:1,height:100});//width will be set by layout of the grid

item.vPadding = 10;
item.hPadding = 10;
item.__adjustable = true;
item.__draggable = true;
item.fill = '#f5f5ff';
item.set("rect",svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" stroke="black" '+
   ' stroke-width="2" />'));
item.rect.fill = item.fill;
item.rect.__unselectable = true;
item.showBox = false;
item.set("colorSpotP",svg.Element.mk(
  '<rect x="-10" y="-10" width="20" height="20" fill="red" stroke="black"'+
   ' stroke-width="3" visibility="hidden"/>'));

item.set('grid',grid_layout.Grid.instantiate());
item.grid.__draggable = false;
item.grid.__adjustable = false;
item.grid.__unselectable = true;

item.set("textP",svg.Element.mk('<text font-size="18" text-anchor="middle"  visibility="hidden"/>'));


item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
  //this.width = extent.x;
  this.layout(extent.x,extent.y);
}


/* emits an event whenever there is a color change. The event has the 
 * form {name:"colorChange" node:<theLegend> index:<index among the categories>}
 */
item.listenForChange = function (ev) {
  var node = ev.node;
  if (ev.property === 'fill') {
    if (this.colorSpotP.isPrototypeOf(node)) {
      var chart = this.forChart;
      var category = node.forCategory;
      //this.colors[category] = node.fill;
      if (chart) {
         chart.setColorOfCategory(category,node.fill);
      }
      return;
    } else if (node === this) {
      this.rect.fill = node.fill;
      this.__draw();
    }
  }
}

item.__addListener("UIchange","listenForChange");

item.layout = function (width,height) {
  var modified = true;
  if (height !== undefined) {
    modified = true;
    this.grid.height = height - 2*this.vPadding;
    this.height = height;
  }
  if (width !== undefined) {
    modified = true;
    this.grid.width = width- 2*this.hPadding;
    this.width = width;
  }
  if (modified) {
   this.grid.layout(true,true);
  }
  this.rect.__setExtent(geom.Point.mk(this.width,this.height));
}

item.update = function () {
  var firstUpdate = this.updateCount++ === 0;
  var thisHere = this;
  console.log('Updating legend ',this.height);
  if (this.forChart) {
    this.__data = this.forChart.__getData();
  }
  var dt = this.__getData();
  if (!dt) return;//not ready
  if (this.showBox) {
    this.rect.__show();
  } else {
    this.rect.__hide();
  }
  var names,colorSpots;
  function addLine(category,caption,color) {
    var txt = thisHere.textP.instantiate().__unhide();
    txt.text = caption==='abc'?'aaa':caption;
    names.push(txt);
    txt.center();
    var rct = thisHere.colorSpotP.instantiate().__unhide();
    rct.forCategory = category;
    pj.ui.melt(rct,'fill');
    colorSpots.push(rct);
  }
  var categories = dt.categories;
  var captions = dt.categoryCaptions;
  var newGrid = false;
  if (this.__newData || (this.grid.columns.length === 0)) { // the latter clause in the || will obtain when first loaded
    var columns = pj.resetArray(this.grid,'columns');
    newGrid = true;
    this.rect.__draw(); // the is in the background, so should be drawn first
    names = grid_layout.GridColumn.mk();
    names.leftJustify = true;
    colorSpots = grid_layout.GridColumn.mk();
    this.grid.pushColumn(names);
    this.grid.pushColumn(colorSpots);
    var ln = categories.length;
    for (var i=0;i<ln;i++) {
      var cti = categories[i];
      addLine(categories[i],captions[cti],"black");
    }
    this.layout(this.width,this.height);
   } else {
    this.grid.layout(true);
  }
  this.width = this.grid.width+2*this.hPadding;
  this.height = this.grid.height+2*this.vPadding;
  this.rect.__setExtent(geom.Point.mk(this.width,this.height));
  this.layout();
  return;
}

item.nthColorSpot = function (n) {
  return this.grid.columns[1].elements[n];
}


item.setColorOfCategory = function (category,color) { 
  var dt = this.__getData();
  if (!dt) return;
  var cats = dt.categories;
  var idx = cats.indexOf(category);
  if (idx<0) return;
  var cr = this.nthColorSpot(idx);
  cr.setColor(color);
  cr.__draw();
}    

 
item.setColorsFromChart = function () {
  var chart = this.forChart;
  if (!chart) {
    return;
  }
  var thisHere = this;
  this.__getData().categories.forEach(function (category) {
    var color = chart.colorOfCategory(category);
    thisHere.setColorOfCategory(category,color);
  })
}


/**
 * Set accessibility and notes for the UI
*/
ui.hide(item.grid,['bottomPadding','topPadding','leftPadding','rightPadding']);

ui.hide(item,['colors','forChart','headingGap','draggable','customControlsOnly','markType','text','width',
  'heading','headingParams','height','hlineSep',
   'leftColumn','lineHeight','lineMaxWidth',
   'lineSpacing','minLineSpacing','rectSpacing']);
ui.hide(item.rect,['height','width','x','y'])
ui.hide(item.colorSpotP,['x','y']);
item.__setFieldType('showBox','boolean');

pj.returnValue(undefined,item);

});


