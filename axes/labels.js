/* An evenly spaced set of labels.
*/


//(function () {
core.require(function () {


var item = svg.Element.mk('<g/>');

item.width = 1000;
item.height = 500;
item.centerLabels = true;
// possible orientation values: 'horizontal' and 'vertical'
item.orientation = 'horizontal'; 
//label prototype
//var labelP = svg.Element.mk('<text font-size="25" fill="black" text-anchor="middle"/>');
item.set('labelP', svg.Element.mk('<text font-size="16" font-family="Arial" fill="black" text-anchor="middle"/>').hide());
//item.labelP.setExtent = item.labelP.__adjustExtent;
item.resizable = true;
item.labelGap = 10;// along the direction of the item(horizontal or vertical)
item.labelSep = Point.mk(0,0); // the whole label set is displaced by this much;


item.set("labels",codeRoot.Spread.mk());
item.labels.unselectable = true;
item.unselectable = true;

item.labels.generator = function (parent,name,data,index) {
  var labels = this.__parent;
  var label = labels.labelP.instantiate().show();
  parent.set(name,label);
  var gap = labels.labelGap;
  var  labelHeight,labelWidth,labelBBox,x,y;
  label.setText(data);
  labelBBox = label.getBBox();
  labelWidth= labelBBox.width;
  labels.maxLabelWidth = Math.max(item.maxLabelWidth,labelWidth);
  labelHeight = label["font-size"];
  if (labels.orientation === 'vertical') { // label's left is at zero in the vertical case
    x = labelWidth/2;
    y = index * gap;
  }  else {
    x = index * gap;
    y =0;
  }
  label.moveto(x,y);
  label.show();
  return label;
}


item.update = function () {
  let  thisHere = this,
    horizontal = this.orientation === 'horizontal',
    categories,cnt,max;
  if (!this.data) return;
  if (!this.__element) return;
  // this is something that should not be inherited
  if (!this.hasOwnProperty('labelSep')) {
    this.set("labelSep",this.labelSep.copy());
  }
  var L = this.data.length;
  this.maxLabelWidth = 0;
  if (horizontal) {
    this.labelGap = this.width/(L-1);
  } else {
    this.labelGap = this.height/(L-1);
  }
  this.labelP.center();
  this.labels.masterPrototype = this.labelP;
  this.labels.moveto(this.labelSep);
  this.labelP.editPanelName = 'Prototype for all labels on this axis'
  this.labels.setData(this.data);
  if (horizontal) {  // prevent labels from crowding
    var crowding =this.maxLabelWidth/this.labelGap;
    if (crowding > 0.9) {
      var   fontSize = this.labelP['font-size'];
      this.labelP['font-size'] = Math.floor(fontSize * 0.9/crowding);
      this.update();
    }
  }
}


item.labelP.dragStart = function (refPoint) {
  var itm = this.__parent.__parent.__parent;
  itm.dragStart = refPoint.copy();
  itm.startLabelSep = itm.labelSep.copy();
}


item.labelP.dragStep = function (pos) {
  var itm = this.__parent.__parent.__parent;
  var diff = pos.difference(itm.dragStart);
  itm.labelSep.copyto(itm.startLabelSep.plus(diff));
  itm.labels.moveto(itm.labelSep);
}

item.reset = function () {
  this.labels.reset();
}

/**
 * Set accessibility and notes for the UI
*/
 
ui.hide(item,['width','height','orientation',
  'labelGap','labelSep','maxLabelWidth']);
ui.hide(item.labelP,['text','text-anchor','y']);
ui.hide(item.labels,['byCategory']);
//core.returnValue(undefined,item);
return item;
});
//)();

