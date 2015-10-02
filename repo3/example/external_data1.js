


pj.require('example/simple_bar_chart.js',function (erm,graphP) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  //item.dataSource = 'http://prototypejungle.org/sys/repo3/example/sample_data0.js'
  item.dataSource = 'example/sample_data0.js'
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/chartsd?source=http://prototypejungle.org/sys/repo3|example/external_data1.js
*/
