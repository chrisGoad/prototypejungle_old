pj.require('lib/text_layout.js',function (erm,layout) {
var geom = pj.geom;
var svg = pj.svg;
var ui = pj.ui;

var item = pj.svg.Element.mk('<g/>');
item.__updateLast = 1; // after the charts
item.set({width:300,height:200});

item.leftColumn = 0.6; // fraction of total width for left/title
item.set("headingParams",pj.Object.mk());
item.headingWidthFraction = 0.8;
item.headingParams.height = 50;
//item.headingParams.hPadding = 10;
//item.headingParams.vPadding = 10;
item.headingParams.lineSep = 5;
item.headingParams.left = 0;
item.headingParams.set('textP', svg.Element.mk('<text font-size="21" text-anchor="middle"/>'));
item.headingParams.textP.__setExtent = item.headingParams.textP.__adjustExtent;

item.headingGap = 20;
item.paddingTop = 30;
item.paddingBottom = 10;
item.__shiftable = 1;
//item.hlineSep = 20;
//item.tlineSep = 10;
//item.minLineSpacing = 10; // in pixels, if there is room
item.lineSep = 10;
item.rectSpacing = 60;
item.set("colorSpotP",svg.Element.mk(
  '<rect x="-10" y="-10" width="20" height="20" fill="red" stroke="black"'+
   ' stroke-width="3"/>'));
item.colorSpotP.__setExtent = item.colorSpotP.__adjustExtent;
item.set("rect",svg.Element.mk(
   '<rect x="0" y="0" width="100" height="50" stroke="black" '+
   ' stroke-width="2" fill="#eeeeee"/>'));
//item.rect.__adjustable = 0;
item.set("heading",svg.Element.mk('<g/>'));
item.heading.__unselectable = 1;
item.set("lines",pj.Array.mk());
item.set("colorSpots",pj.Array.mk());
item.set("textP",svg.Element.mk('<text font-size="25" text-anchor="middle"/>'));
item.textP.__setExtent = item.textP.__adjustExtent;

item.textP.__adjustable = 1;
//item.colorSpotP.__undraggable = 1;
item.colorSpotP.__adjustable = 1;
item.draggable = 1;


item.__adjustable = 1;
item.__customControlsOnly = 1;

item.__controlPoints = function () {
  var hwd = 0.5 * this.width;//-(this.includeBox?0:this.sidePadding);
  var hht = 0.5 * this.height;//-(this.includeBox?0:this.sidePadding);
  return [geom.Point.mk(0,-hht),geom.Point.mk(-hwd,-hht),geom.Point.mk(hwd,-hht)];
}

item.shifterPlacement = function () {
  var hht = 0.5 * this.height;//-(this.includeBox?0:this.sidePadding);
  return geom.Point.mk(0,-hht);
}

item.__updateControlPoint = function (idx,pos) {
  if (idx ===0) {
    return 'drag';
    var hwd = 0.5 * this.width;//-(this.includeBox?0:this.sidePadding);
    var hht = 0.5 * this.height;//-(this.includeBox?0:this.sidePadding);
    var newPosition = geom.Point.mk(pos.x,hht+pos.y);
    //this.__moveto(newPosition);
    return undefined;//pos;// 'drag';
  }
  console.log('pos',pos.x,pos.y);
  var nwd = 2 * Math.abs(pos.x);//+(this.includeBox?0:this.sidePadding));
  this.width = nwd;
  this.update();
  //var points = this.controlPoints();
  //ui.updateCustomBoxes(points);
}
/* emits an event whenever there is a color change. The event has the 
 * form {name:"colorChange" node:<theLegend> index:<index among the categories>}
 */
item.listenForChange = function (ev) {
    debugger;

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

// determine maximum width of the text, and total height
item.measure = function () {
  this.spotExtent = this.colorSpotP.__getExtent();
  var maxHt = this.spotExtent.y;
  var maxWd = 0;
  this.lines.forEach(function (ln) {
    var b = ln.__bounds();
    maxWd  = Math.max(maxWd,b.extent.x);
    maxHt  = Math.max(maxHt,b.extent.y);
 });
  this.lineMaxWidth = maxWd;
  this.lineHeight = maxHt;
}

item.text = 'Test Heading  a a a a a a a  a a a a a a a a  a a a  a  b b';

item.adjustHeading = function () {
  var headingHt = this.headingParams.height;
  var topSectionHeight = headingHt + this.headingGap + this.paddingTop +  0.5 * this.lineHeight;
  var height = this.height = topSectionHeight + this.lines.length*this.lineSpacing + this.paddingBottom;
  //this.heading.__moveto(-0.5*this.headingParams.width,0.5 * (headingHt - height)+this.paddingTop);
  this.heading.__moveto(0,0.5 * (headingHt - height)+this.paddingTop);
  return topSectionHeight;
}
item.adjust = function () { 
  var fontHeight = this.textP["font-size"];
  var csextent = this.spotExtent;
  var cswd = csextent.x;
  var csht = csextent.y;
  var height;// = this.height;
  //var headingGap = this.headingGap;
  var headingHt = this.headingParams.height;
  var lineSpacing = this.lineSpacing;
 // var lineHeight = this.lineHeight;
  var numLines = this.lines.length;
  var width = this.width;
  var lineWidth = this.lineMaxWidth;
  var leftWidth = this.leftColumn * width;
  var leftGap = 0.5 * (leftWidth - lineWidth);
  var rightWidth = (1 - this.leftColumn) * width;
  var rightGap = 0.5*(rightWidth - cswd);

  if (this.getData().title) {
    //var topSectionHeight = this.adjustHeading();
    var topSectionHeight = headingHt + this.headingGap + this.paddingTop +  0.5 * this.lineHeight;
    height = this.height = topSectionHeight + this.lines.length*this.lineSpacing + this.paddingBottom;
  //this.heading.__moveto(-0.5*this.headingParams.width,0.5 * (headingHt - height)+this.paddingTop);
    this.heading.__moveto(0,0.5 * (headingHt - height)+this.paddingTop);
/*       var headingHt = this.headingParams.height;
       var topSectionHeight = headingHt + headingGap + this.paddingTop +
             0.5 * lineHeight;
      height = this.height = topSectionHeight + numLines*lineSpacing + this.paddingBottom;
      this.heading.__moveto(-0.5*this.headingParams.width,0.5 * (headingHt - height)+this.paddingTop);*/
  } else {
    headingHt = 0;
    headingGap = 20;
    topSectionHeight = this.paddingTop;
    height= this.height;

  }
  //var bodyHeight = height - headingHt;
  var yp = -(0.5*this.height) + topSectionHeight;
  var rectX = leftWidth + rightGap + 0.5 * cswd - 0.5 * width;
  for (var i=0;i<numLines;i++) {
     var txt = this.lines[i];
     var tbnds = txt.__bounds();
     var twidth = tbnds.extent.x;
     txt.__moveto(twidth*0.5 + leftGap -0.5*width,yp);
     var cr = this.colorSpots[i];
     cr.__moveto(rectX,yp);//-0.5*csht);
     yp +=  lineSpacing;
  }
  console.log('Height = ',height);
  this.rect.__adjustExtent(pj.geom.Point.mk(width,height));
  return;
}

/*item.getChart = function () {
  var forChart = this.forChart;
  if (forChart) {
    return pj.evalPath(pj.ui.root,forChart);
  }*/

item.updateCount = 0;
item.update = function (top) {
  this.updateCount++;
  console.log('Updating legend ',this.updateCount);
  var chart = this.forChart;
  this.data = chart.getData();
  var dt = this.getData();
  if (!dt) return;//not ready
  
  var headingGap = this.headingGap;
  var captions = dt.categoryCaptions;
  var categories = dt.categories;
  var thisHere = this;
  var wd = 0;
  var ht = thisHere.textP["font-size"];
  var hht = 0.5*ht;
  var lsp = thisHere.lineSpacing;
 
  function addLine(category,caption,color) {
    var txt = thisHere.textP.instantiate().__show();
    txt.text = caption==='abc'?'aaa':caption;
    thisHere.lines.push(txt);
    txt.__draw();
    txt.center();
    var rct = thisHere.colorSpotP.instantiate().__show();
    rct.forCategory = category;
    pj.ui.melt(rct,'fill');
    //pj.ui.watch(rct,'fill');
    thisHere.colorSpots.push(rct);
    rct.__draw();
  }
   if (this.updateCount === 1) {
    pj.resetComputedArray(this,"colorSpots");
    pj.resetComputedArray(this,"lines")
    // we need to do some drawing so that measuring text is possible
    this.colorSpots.__draw();
    this.lines.__draw();
    var ln = categories.length
    for (var i=0;i<ln;i++) {
      var cti = categories[i];
      addLine(categories[i],captions[cti],"black");
    }
   }
  this.measure();
  if (dt.title) {
    var headingParams = this.headingParams;
    var heading = this.heading;
    headingParams.width = this.headingWidthFraction * this.width;
    var headingHt = layout.arrangeWords(headingParams.textP,headingParams,heading,dt.title).y;
    headingParams.height = headingHt;
  } else {
    headingHt = 0;
  }
  this.lineSpacing = this.lineHeight + this.lineSep;
  this.height = headingHt + headingGap + 
                ln * this.lineHeight + 
                (ln-0) * this.lineSep;
  this.rect.height = this.height;//yps+this.paddingBottom-ht;
  this.adjust();
  //if (!this.colors) {
  //  this.set("colors",pj.Object.mk());
  //  pj.svg.stdColorsForCategories(this.colors,dt.categories);
 // }
  this.setColorsFromChart();
  if (typeof top === 'number') {
    var tr = this.getTranslation();
    var dy = top + 0.5 * this.height;
    console.log("DY",dy,tr.y);
    //tr.y = 100;//dy;
    this.__moveto(tr.x,dy);
    //this.__transformToSvg();
  }
  this.__draw();
}


/*
item.headingParams.textP.startDrag = function (refPoint) {
    var itm = this.__parent.__parent.__parent;
    var hdp = itm.headingParams;
    var idx = parseInt(this.__name);
    if (idx === 0) {
      itm.startVpadding = hdp.vPadding;
      itm.startHpadding = hdp.hPadding;
      itm.dragStartY = refPoint.y;
      itm.dragStartX = refPoint.x;
      var tr = itm.getTranslation();
      itm.startTop = tr.y - 0.5*itm.height;
    }
}

item.headingParams.textP.dragStep = function (pos) {
  var itm = this.__parent.__parent.__parent;
  var hdp = itm.headingParams;
  var idx = parseInt(this.__name);
  if (idx === 0) {
    var ydiff = pos.y - itm.dragStartY;
    var xdiff = pos.x - itm.dragStartX;
    hdp.hPadding = itm.startHpadding + xdiff;
    hdp.vPadding = itm.startVpadding + ydiff;
    itm.update(itm.startTop);
  }
}
 
*/

item.setColorOfCategory = function (category,color,setChartColorToo) { // onlyOverride is for initialization
  var dt = this.getData();
  if (!dt) return;
  var cats = dt.categories;
  var idx = cats.indexOf(category);
  if (idx<0) return;
  var cr = this.colorSpots[idx];
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

//ui.watch(item,['rectSpacing','lineSpacing']);
//ui.watch(item,['lineSep','headingWidthFraction','paddingTop','paddingBottom']);
ui.hide(item,['colors','forChart','headingGap','draggable','customControlsOnly','markType','text','width',
  'heading','headingParams','height','hlineSep',
   'leftColumn','lineHeight','lineMaxWidth',
   'lineSpacing','minLineSpacing','rectSpacing']);
ui.hide(item.rect,['height','width','x','y'])
ui.hide(item.colorSpotP,['x','y']);
pj.returnValue(undefined,item);

});


