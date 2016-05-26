// Component for a set  of bars - the core of bar graph, which includes axes and labels as well

'use strict';

pj.require('../rectangle1.js',
           function (erm,rectangleP) {

var item = pj.svg.Element.mk('<g/>');
item.set('sample',rectangleP.instantiate());

pj.returnValue(undefined,item);
});
//})()

