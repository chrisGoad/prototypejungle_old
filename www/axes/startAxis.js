
core.require('/axes/axis.js',function (axisP) {
var item = svg.Element.mk('<g/>');
var axis =  item.set('axis1',axisP.instantiate());
axis.coverargeLB = 100;
axis.coverageUB = 300;
axis.width = 1000;
axis.update();
return item;
});
