/*
 * One line; no box
 */

'use strict';

pj.require(function () {
var svg = pj.svg,ui = pj.ui,geom = pj.geom;
var item =  svg.Element.mk('<text font-size="18" font-family="Verdana" font="arial" fill="black"  stroke-width="0" text-anchor="middle"/>');

item.__draggable = true;
item.__cloneable = true;
//item.__adjustable = true;
item.text = 'Text';

item.__getText = function () {
  return this.text;
}


item.__setText = function (txt) {
  this.text = txt;
}
item.__isTextBox = true;

item.update = function () {
  this.setText(this.text);
}

item.__getExtent = function () {
  debugger;
    var bnds = this.__getBBox();
    return geom.Point.mk(bnds.width,bnds.height);
}


//ui.hideExcept(item,['textP','lineSep']);
//ui.hide(item.textP,['text-anchor','y']);
//ui.freeze(item.textP,'text');
return item;
});