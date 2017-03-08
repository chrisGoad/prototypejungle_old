//"title":"The Cayley graph for dihedral group D3",

pj.require('/diagram/graph.js','/shape/arcArrow.js','/data/cayley_d3.js',function (graphP,arrowPP,dataP) {

var dataa = pj.lift({"vertices":[{"id":"iL","position":[-87,50]},{"id":"iT","position":[0,-100]},{"id":"iR",
"position":[87,50]},
              {"id":"oL","position":[-173,100]},{"id":"oT","position":[0,-200]},{"id":"oR"
,"position":[173,100]}],
  "edges":[{"label":"a","end0":"iL","end1":"iR"},{"label":"a","end0":"iR","end1":"iT"},
{"label":"a","end0":"iT","end1":"iL"},
           {"label":"a","end0":"oL","end1":"oR"},{"label":"a","end0":"oR","end1":"oT"},
{"label":"a","end0":"oT","end1":"oL"},
           {"label":"b","end0":"oL","end1":"iL"},{"label":"b","end0":"iL","end1":"oL"},
           {"label":"b","end0":"oR","end1":"iR"},{"label":"b","end0":"iR","end1":"oR"},
           {"label":"b","end0":"oT","end1":"iT"},{"label":"b","end0":"iT","end1":"oT"}
           ]        
});

//var data = {"vertices":[{"id":"iL","position":[-87,50]},{"id":"iT","position":[0,-100]}],
//  "edges":[{"label":"a","end0":"iL","end1":"iT"}]        
//};

var item = pj.svg.Element.mk('<g/>');
item.set('graph',graphP.instantiate());
item.graph.set('__data',Object.create(dataP));//.instantiate());
var arrowP = item.graph.set('arrowP',arrowPP.instantiate().__hide());
arrowP.labelSep = 15;
arrowP.radius = 0.93;
arrowP.clockwise = false;
//var arrowP = item.arrowP;
arrowP.stroke = 'black';
arrowP.headWidth = 15;
arrowP['stroke-width'] = 3;
arrowP.headGap = 25;
arrowP.tailGap = 25;
var circleP = item.graph.circleP;
circleP.fill = 'red';
item.update = function () {
   item.graph.update();

 //item.graph.__setData(data);
}
/*item.graph.update = function () {
  
}
item.graph.__show();


item.graph.__setData(data);
*/
return item;
});


 