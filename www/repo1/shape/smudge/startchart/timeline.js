
//pj.require('../chart/bar1.js','../data/metal_densities.js',function (erm,graphP,data) {
//pj.require('../chart/bar1.js','https://prototypejungle.org/sys/repo1/data/metal_densities.js',function (erm,graphP,data) {
//pj.require('../chart/bar1.js','https://prototypejungle.firebaseio.com/twitter:14822695/s/data/metal_densities.json?callback=pj.returnData',function (erm,graphP,data) {
//pj.require('../chart/bar1.js','https://prototypejungle.firebaseio.com/twitter:14822695/s/data/trade_balance.json?callback=pj.returnData',function (erm,graphP,data) {
//pj.require('../chart/bar.js','[TcYg4ep5s5TrvfxG5CWr11vjZZu1]/data/trade_balance.json',function (erm,graphP,data) {
pj.require('../chart/timeline.js','../../data/enlightenment.js',function (erm,timelineP,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("timeline",timelineP.instantiate());
  item.timeline.__setData(data,'noUpdate');
  //item.set('title',text.instantiate());
  //item.title.text = 'A simple simple bar chart';
 // barGraph.xdata = barGraph.setData(data);
 // item.update = function () {
 //   this.barGraph.outerUpdate();
 // }
  pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|test/bar.js
*/
