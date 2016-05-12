//pj.require('lib/text_layout.js','lib/grid_layout.js',function (erm,layout,grid_layout) {
pj.require('../../text/textarea1.js','../../lib/grid_layout.js',function (erm,textareaP,grid_layout) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;

var item = pj.svg.Element.mk('<g/>');
item.markType = '[N|S],N';
item.__updateLast = 1; // after the charts
item.set({width:300,height:200});

//item.leftColumn = 0.6; // fraction of total width for left/title
//item.set("headingParams",pj.Object.mk());
item.headingWidthFraction = 0.8;
item.headingGap = 20;
item.paddingTop = 10;
item.paddingBottom = 10;
item.paddingSides = 10;
item.__draggable = 1;
//item.lineSep = 10;
//item.rectSpacing = 60;
item.set("rect",svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" stroke="black" '+
   ' stroke-width="2" fill="#eeee99"/>'));
item.rect.__unselectable = 1;
item.set("colorSpotP",svg.Element.mk(
  '<rect x="-10" y="-10" width="20" height="20" fill="red" stroke="black"'+
   ' stroke-width="3" visibility="hidden"/>'));

   
item.colorSpotP.__setExtent = item.colorSpotP.__adjustExtent;
item.set('textarea',textareaP.instantiate());

//item.set('grid',grid_layout.Grid.mk());
debugger;
pj.di = 1;
item.set('grid',grid_layout.Grid.instantiate());
item.grid.__draggable = 1;

item.set("textP",svg.Element.mk('<text font-size="25" text-anchor="middle"  visibility="hidden"/>'));
item.textP.__setExtent = item.textP.__adjustExtent;

//item.textP.__adjustable = 1;
//item.colorSpotP.__undraggable = 1;
//item.colorSpotP.__adjustable = 1;
//item.draggable = 1;


item.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}

item.__setExtent = function (extent) {
  this.width = extent.x;
  this.layout(extent.y);
}


/* emits an event whenever there is a color change. The event has the 
 * form {name:"colorChange" node:<theLegend> index:<index among the categories>}
 */
item.listenForChange = function (ev) {
  var node = ev.node;
  if ((ev.property === 'fill') &&
    (this.colorSpotP.isPrototypeOf(node))) {
      var chart = this.forChart;
      var category = node.forCategory;
      //this.colors[category] = node.fill;
      if (chart) {
         chart.setColorOfCategory(category,node.fill);
      }
    return;
  }
}

item.addListener("UIchange","listenForChange");

item.text = 'Test Heading  a a a a a a a  a a a a a a a a  a a a  a  b b';


  item.layout = function (height) {
    var textHeight = this.textarea.height;
    var gridHeight = this.grid.height;
    var heightExceptPaddingBottom =  this.paddingTop + textHeight + this.headingGap + gridHeight;
    if (height === undefined) {
      var totalHeight = heightExceptPaddingBottom + this.paddingBottom;
      this.height = totalHeight;
      var hht = totalHeight/2;
      this.textarea.__moveto(0,-hht + this.paddingTop + textHeight/2);
      this.grid.__moveto(0,hht - this.paddingBottom - gridHeight/2);
    } else {
      this.paddingBottom = Math.max(0,height - heightExceptPaddingBottom);
      this.height = heightExceptPaddingBottom + this.paddingBottom;
    }
    this.rect.__adjustExtent(geom.Point.mk(this.width,this.height));
  }
  
item.grid.__dragVertically = 1;
item.textarea.__dragVertically = 1;

item.grid.__stopDrag = function () {
  debugger;
  var y = this.__getTranslation().y;
  var hGridHt = this.height/2;
  var legend = this.__parent;
  var top = -legend.height/2;
  var textHt = legend.textarea.height;
  var newHeadingGap = Math.max(0,y - (top + legend.paddingTop + textHt + hGridHt));
  legend.headingGap = newHeadingGap;
  legend.layout();
}


item.textarea.__stopDrag = function () {
  var y = this.__getTranslation().y;
  var legend = this.__parent;
  var top = -legend.height/2;
  var hTextHt = legend.textarea.height/2;
  var newPaddingTop = Math.max(0,y - (top + hTextHt ));
  legend.paddingTop = newPaddingTop;
  legend.layout();
}
var heightBeenFixed = 0;
item.updateCount = 0;

item.update = function () {
  debugger;
  var firstUpdate = this.updateCount++ === 0;
  
  var textarea = this.textarea;
  var thisHere = this;
  this.updateCount++;
  console.log('Updating legend ',this.height);
  if (this.forChart) {
    this.data = this.forChart.getData();
  }
  var dt = this.getData();
  if (!dt) return;//not ready
 
  //var columns = this.grid.columns;
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
  var newGrid = 0;
  if (this.__newData || (this.grid.columns.length === 0)) { // the latter clause in the || will obtain when first loaded
    var columns = pj.resetArray(this.grid,'columns');
    newGrid = 1;
    this.rect.__draw(); // the is in the background, so should be drawn first
    names = grid_layout.GridColumn.mk();
    names.leftJustify = 1;
    colorSpots = grid_layout.GridColumn.mk();
    this.grid.pushColumn(names);
    this.grid.pushColumn(colorSpots);
    var ln = categories.length;
    for (var i=0;i<ln;i++) {
      var cti = categories[i];
      addLine(categories[i],captions[cti],"black");
    }
    this.grid.width = this.width - 2*this.paddingSides;
    this.grid.layout(1);
    textarea.text = dt.title;
    textarea.sidePadding = 0;
    textarea.width =  this.width - 2*this.paddingSides;
    textarea.beenControlled = 1;
    textarea.update();
  }  else {
    //colorSpots = columns[0].elements;
    //colorSpots.forEach(function (spot) { // text needs centering
    //  spot.center();
    //});
    this.grid.layout(1);
    textarea.beenControlled = 1;
    textarea.update();
  }
  var maxElementWidth = Math.max(this.grid.width,textarea.width);
  this.width = Math.max(this.width,maxElementWidth+2*this.paddingSides);
  var textHeight = textarea.height;
  var gridHeight = this.grid.height;
  this.layout();
  return;
}

item.nthColorSpot = function (n) {
  return this.grid.columns[1].elements[n];
}


item.setColorOfCategory = function (category,color,setChartColorToo) { // onlyOverride is for initialization
  var dt = this.getData();
  if (!dt) return;
  var cats = dt.categories;
  var idx = cats.indexOf(category);
  if (idx<0) return;
  var cr = this.nthColorSpot(idx);
  cr.setColor(color);
  cr.__draw();
  if (0 && setChartColorToo) {
    var chart = this.getChart();
    if (chart) {
     chart.setColorOfCategory(category,color);
    }
  }
}    

 
item.setColorsFromChart = function () {
  debugger;
  var chart = this.forChart;
  if (!chart) {
    return;
  }
  var thisHere = this;
  this.getData().categories.forEach(function (category) {
    var color = chart.colorOfCategory(category);
    //var color = thisHere.colors[category];
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
pj.returnValue(undefined,item);

});


