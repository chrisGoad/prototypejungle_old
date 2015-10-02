


pj.require('example/simple_bar_chart.js','example/sample_data0.js',function (erm,graphP,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  item.graph.setData(data);
  //item.graph.__isPart = 1;
  //item.__isAssembly = 1;
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/chartsd?source=http://prototypejungle.org/sys/repo3|example/external_data.js
*/
