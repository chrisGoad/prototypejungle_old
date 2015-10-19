
pj.require('chart/bar1.js','chart/component/legend1.js','data/trade_balance.js',
  function (erm,graphP,legendP,data) {
    debugger;
    var item = pj.svg.Element.mk('<g/>');
    item.set("graph",graphP.instantiate());
    item.set("legend",legendP.instantiate());
    item.graph.setData(data);
    item.legend.forChart = item.graph;
    item.update = function () {
      this.graph.update();
      this.legend.update();
      if (!this.legend.positioned) {
        this.legend.moveto(20  +0.5 * this.legend.width -0.5 * this.graph.extent.x,-20 -0.5 * (this.graph.extent.y + this.legend.height));
        this.legend.positioned = 1;
      }
    }
    pj.returnValue(undefined,item);
});
/*
http://prototypejungle.org/uid?source=http://prototypejungle.org/sys/repo3|example/bar_categories.js
*/
