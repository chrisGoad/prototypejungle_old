 /* utilities for laying out grids */
 
'use strict';

(function () {
var svg = pj.svg;
var ui = pj.ui;
var geom = pj.geom;
var item = pj.Object.mk(); 


item.set('GridColumn',svg.Element.mk('<g/>'));
item.set('Grid',svg.Element.mk('<g/>'));


item.Grid.topPadding = 0;
item.Grid.vSpacing = 10;
item.Grid.bottomPadding  = 0;

item.GridColumn.__unselectable = true;
item.GridColumn.mk = function (ia) {
  var rs = item.GridColumn.instantiate();
  var a = ia?ia:pj.Array.mk();
  rs.set('elements',a);
  return rs;
}


item.GridColumn.push = function (element) {
  this.elements.push(element);
}


item.GridColumn.maxWidth = function () {
  var rs = 0;
  this.elements.forEach(function(element) {
    var width = element.__getExtent().x;
    if (width > rs) {
      rs = width;
    }
  });
  return rs;
}

item.GridColumn.inGrid = function () {
  return this.__parent.__parent;
}

// maximum height of the contents of the nth row
item.Grid.rowHeight = function (n) {
  var maxHeight = 0;
  this.columns.forEach(function (column) {
    var height = column.elements[n].__getExtent().y;
    if (height > maxHeight) {
      maxHeight = height;
    }
  });
  return maxHeight;
}

item.Grid.columnWidth = function (n) {
  return this.columns[n].maxWidth();
}

item.GridColumn.layout = function (rowHeights,maxWidth) {
  var i;
  var grid = this.inGrid();
  var elements = this.elements;
  var totalHeight = 0;
  rowHeights.forEach(function(height) {
    totalHeight += height;
  });
  var  numRows = rowHeights.length;
  totalHeight += grid.topPadding + (numRows-1)*grid.vSpacing +
                 grid.bottomPadding;
  var hht = totalHeight/2;
  var cy = -hht + grid.topPadding + rowHeights[0]/2;
  for (i=0;i<numRows;i++) {
    if (this.leftJustify) {
      var width = elements[i].__getExtent().x;
      var cx = (width-maxWidth)/2;
    } else {
      cx = 0;
    }
    elements[i].__moveto(cx,cy);
    if (i < numRows-1) {
      cy += (rowHeights[i]+rowHeights[i+1])/2 + grid.vSpacing;
    }
  }
}

item.Grid.leftPadding = 0;
item.Grid.minHSpacing = 20;// a
item.Grid.hSpacing = item.Grid.minHSpacing;
item.Grid.rightPadding = 0;

item.Grid.layout = function (widthFixed,heightFixed) {
  var i;
  var rowHeights = [];
  var columnWidths = [];
  var columns = this.columns;
  var numColumns = columns.length;
  var numRows = columns[0].elements.length;
  var totalHeight = 0;
  this.vSpacing = Math.max(this.vSpacing,0);
  for (var i=0;i<numRows;i++) {
    var ht = this.rowHeight(i);
    totalHeight += ht;
    rowHeights.push(ht);
  }
  totalHeight += this.topPadding + (numRows-1)*this.vSpacing + this.bottomPadding;
   if (heightFixed) {
    var extraHeight = this.height - totalHeight;
    console.log('extraHeight',extraHeight);
    this.vSpacing = Math.max(0,this.vSpacing + (extraHeight/(numRows-1)));
  } else {
    this.height = totalHeight;
  }
  var totalWidth = 0;
  var columns = this.columns;
  columns.forEach(function (column) {
    var width = column.maxWidth();
    columnWidths.push(width);
    totalWidth += width;
  });
  totalWidth += this.leftPadding + (numColumns-1)*this.minHSpacing +
                 this.rightPadding;
  if (widthFixed) {
    var extraWidth = this.width - totalWidth;
    console.log('extraWidth',extraWidth);
    if (extraWidth > 0) {
      this.hSpacing = this.minHSpacing + (extraWidth/(numColumns-1));
    } else {
      this.width = totalWidth;
    }
  } else {
    this.width = totalWidth;
  }
  var hwd = this.width/2;
  var cx = -hwd + this.leftPadding +columnWidths[0]/2;

  for (i=0;i<numColumns;i++) {
    columns[i].layout(rowHeights,columnWidths[i]);
    columns[i].__moveto(cx,0);
    
    if (i < numColumns-1) {
      cx += (columnWidths[i]+columnWidths[i+1])/2 + this.hSpacing;
    }
  }
 // var ev = pj.Event.mk('grid',this);
 // ev.emit();
}

item.Grid.__getExtent = function () {
  return geom.Point.mk(this.width,this.height);
}


item.Grid.__setExtent = function (xt) {
  this.width = xt.x;
  this.height = xt.y;
  this.layout(true,true);
}

item.Grid.set('columns',pj.Array.mk());

item.Grid.pushColumn = function (col) {
  this.columns.push(col);
}


ui.hide(item.Grid,['columns','__dragVertically']);
ui.freeze(item.Grid,['bottomPadding','hSpacing','vSpacing','height','width']);


 pj.returnValue(undefined,item);
})();
