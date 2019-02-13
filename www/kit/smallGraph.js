
core.require('/container/circle.js','/arrow/arrow.js',function (circlePP,arrowPP) {

let dataString = `{
"vertices":[{"id":"L","position":[-50,0]},
            {"id":"R","position":[50,0]}],
"edges":[{"label":"a","end0":"L","end1":"R"}]
}`;


let item = svg.Element.mk('<g/>');

item.vertexP = core.installPrototype('circle',circlePP);
item.vertexP.dimension = 40;
let arrowP = item.edgeP = core.installPrototype('arrow',arrowPP);
arrowP.labelSep = 15;
arrowP.radius = 0.93;
arrowP.clockwise = false;
arrowP.stroke = 'black';
arrowP.headWidth = 15;
arrowP['stroke-width'] = 3;
arrowP.headGap = 5;
arrowP.tailGap = 5;

item.set('__internalDataString',dataString);
item.initialize = function () {
  graph.buildFromData(this);
}

item.isKit = true;
return item;
});


 