'use strict';

pj.require('/shape/circle.js',function (circleP) {
var svg = pj.svg;
debugger;

var item =  svg.Element.mk('<g/>');
item.set('circle1',circleP.instantiate()).__show();

return item;
});

