
(function () {
  var lib = __pj__.setIfMissing("chart");
  var om = __pj__.om;
  var geom = __pj__.geom;
  
om.install(["http://s3.prototypejungle.org/pj/repo0/chart/Marks",
            "http://s3.prototypejungle.org/pj/repo0/chart/Axes",
            "http://s3.prototypejungle.org/pj/repo0/chart/Linear",
            "http://s3.prototypejungle.org/pj/repo0/chart/Ordinal"],function () {
  lib.set("Chart",om.DNode.mk()).namedType();
   
  lib.Chart.set("marks",lib.Marks.instantiate());
  lib.Chart.marks.template.style.fillStyle = "steelblue";
  lib.Chart.set("xScale",lib.Ordinal.instantiate()).extent = 400;
  lib.Chart.set("yScale",lib.Linear.instantiate()).extent = 200;
  lib.Chart.setf("xField", "x");
  lib.Chart.setf("yField", "y");
  lib.Chart.set("xAxis",lib.Axes.instantiate());
  lib.Chart.set("yAxis",lib.Axes.instantiate());
  lib.Chart.yAxis.tickInterval = 10;
  lib.Chart.__about__ = '<p>The approach to charting  used here follows the priniciples used in <a href="http://trifacta.github.io/vega">Vega</a> and its predecessors. The full source code for  charts can be found at <a href="https://github.com/chrisGoad/prototypejungle/tree/master/www/gen/chart">GitHub</a></p><p>Everything about the chart can be modified. To edit fonts, sizes,  positions, and colors of axes, ticks, captions, or  bars, click on the item of interest, and edit either the individual or the prototype. <span class="codeWord">xScale/extent</span> and <span class="codeWord">yScale/extent</span> determine the overall x and y dimensions of the graph, and the source of data can be viewed at <span class="codeWord">dataSource/link</span> and changed at <span class="codeWord">dataSource/url</span> (<a href="http://prototypejungle.org/data/chart/bardata1.js">http://prototypejungle.org/data/chart/bardata1.js</a> is available as another sample; bardata0.js is the initial data source).</p><p>Note that the scheme employed by Vega, in which pararmeters of the chart appear in a JSON file, and can be edited there, corresponds to editing prototypes in the PrototypeJungle context. There is nothing comparable in Vega, however, to editing individual bars, ticks, captions, etc,  whose practical utility might be to highlight aspects of the data.</p>';

  lib.Chart.update = function () {
    var om = __pj__.om;
    var geom = __pj__.geom;
    if  (!this.dataSource){
      this.set("dataSource",om.DataSource.mk("http://prototypejungle.org/data/chart/bardata0.js"));
    }
    this.setf("xField", "x");
    this.xScale.setf("field",this.xField,1);
    this.yScale.setf("field",this.yField,1);
    this.xAxis.scale = this.xScale;
    this.xAxis.orientation = "horizontal";
     this.marks.xScale = this.xScale;
    this.marks.yScale = this.yScale;
    this.yAxis.scale = this.yScale;
    this.yAxis.orientation = "vertical";
    this.marks.data = this.xAxis.data = this.yAxis.data =
    this.xScale.data = this.yScale.data = this.dataSource.data;
    this.xScale.update();
    this.yScale.update();
    this.xAxis.update();
    this.xAxis.moveto(geom.Point.mk(0,this.yScale.extent));
    this.yAxis.update();
    this.marks.update();
  }

 om.save(lib.Chart);
});

})();
  
  
  
  

  

    
    
    
