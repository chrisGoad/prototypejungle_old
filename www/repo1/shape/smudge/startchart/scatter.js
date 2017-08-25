
//pj.require('../chart/bar1.js','../data/metal_densities.js',function (erm,graphP,data) {
//pj.require('../chart/bar1.js','https://prototypejungle.org/sys/repo1/data/metal_densities.js',function (erm,graphP,data) {
//pj.require('../chart/scatter.js','[TcYg4ep5s5TrvfxG5CWr11vjZZu1]/data/trade_balance.json',function (erm,graphP,data) {
//pj.require('../chart/scatter.js','[TcYg4ep5s5TrvfxG5CWr11vjZZu1]/data/metal_densities.json',function (erm,graphP,data) {
pj.require('../chart/scatter.js','[TcYg4ep5s5TrvfxG5CWr11vjZZu1]/data/temperature.json',function (erm,graphP,data) {
  var item = pj.svg.Element.mk('<g/>');
  item.set("graph",graphP.instantiate());
  debugger;

//  pj.error('TEST');
  item.graph.__setData(data,'noUpdate');
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
