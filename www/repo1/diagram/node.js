pj.require('/shape/circle.js',function (circlePP) {
var ui=pj.ui,geom=pj.geom,svg=pj.svg,dat=pj.data;
var item = pj.svg.Element.mk('<g/>');
item.fill = 'red';
item.stroke = 'black';
item['stroke-width'] = 2;


item.__adjustable = true;
item.__draggable = true;
item.__cloneable = true;

item.set('content',circlePP.instantiate());
item.content.__unselectable = true;


item.update = function () {
  debugger;
  pj.setProperties(this.content,this,['fill','stroke','stroke-width']);
  this.content.update();
}; 

item.__getExtent = function () {
  return this.content.__getExtent();
}

item.__setExtent = function (extent,nm) {
  this.content.__setExtent(extent,nm);
}

ui.hide(item,['content']);
return item;
});
