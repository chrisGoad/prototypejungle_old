
pj.require('chart/bar1.js','text/textarea1.js','example/data/metal_densities.js',function (erm,graphP,textareaP,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  item.graph.setData(data);
  var gExtent = item.graph.extent;
  item.set("legend",textareaP.instantiate());
  // these layout operations would normally be done interactively,
  // but I wished this particular example to be easily inspectable at the code level.
  item.legend.forChart = item.graph;
  item.legend.width = 700;
  item.legend.height = 30;
  item.legend.textP['font-size'] = 40;
  item.legend.moveto((item.legend.width-gExtent.x)/2-30,-gExtent.y/2-180);
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|example/bar_chart.js
*/
