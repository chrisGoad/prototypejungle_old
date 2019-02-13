
core.require('/timeline/timeline.js','/timeline/philosophers.json',function (diagramP,data) {
let diagram = diagramP.instantiate();
diagram.set('data',data);
diagram.buildFromData();
return diagram;
});


 