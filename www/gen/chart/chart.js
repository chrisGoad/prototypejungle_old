//var smudge = __pj__.set("smudge",om.mkDNode());

(function () {
  //var lib = draw.emptyWs("smudge");
  var lib = __pj__.setIfMissing("chart");
  var om = __pj__.om;
  var geom = __pj__.geom;
  
om.install(["/chart/Marks","/chart/Axes"],function () {
  lib.installType("Chart");
  //lib.Chart.set("bounds", geom.Point.mk(400,200));
  //lib.Chart.bounds.setInspectable("x");
  lib.Chart.set("marks",lib.Marks.instantiate());
  lib.Chart.set("xScale",lib.Ordinal.instantiate()).extent = 400;
  lib.Chart.set("yScale",lib.Linear.instantiate()).extent = 200;
  lib.Chart.setf("xField", "x");
  lib.Chart.setf("yField", "y");
  lib.Chart.set("xAxis",lib.Axes.instantiate());
  lib.Chart.set("yAxis",lib.Axes.instantiate());
  lib.Chart.yAxis.tickInterval = 10;
  lib.Chart.__about__ = '<p>The approach to charting  used here follows the priniciples used in <a href="http://trifacta.github.io/vega/Vega">Vega</a> and its predecessors. The source code for  charts can be found at <a href="https://github.com/chrisGoad/prototypejungle/tree/master/www/gen/chart">GItHub</a></p>';

  /*
  lib.Chart.setN("data",[
                           {"x": 1,  "y": 28}, {"x": 2,  "y": 55},
        {"x": 3,  "y": 43}, {"x": 4,  "y": 91},
        {"x": 5,  "y": 81}, {"x": 6,  "y": 53},
        {"x": 7,  "y": 19}, {"x": 8,  "y": 87},
        {"x": 9,  "y": 52}, {"x": 10, "y": 48},
        {"x": 11, "y": 24}, {"x": 12, "y": 49},
        {"x": 13, "y": 87}, {"x": 14, "y": 66},
        {"x": 15, "y": 17}, {"x": 16, "y": 27},
        {"x": 17, "y": 68}, {"x": 18, "y": 16},
        {"x": 19, "y": 49}, {"x": 20, "y": 15}]);
  lib.Chart.setInspectable("data");
  //lib.Chart.yAxis = lib.Axes.mk();
  */
  lib.Chart.set("dataSource0",__pj__.om.DataSource.mk("http://inspectable.org/data/chart/bardata0.js"));
  //lib.Chart.set("dataSource1",__pj__.om.DataSource.mk("http://inspectable.org/data/chart/bardata1.js"));
  lib.Chart.update = function () {
    var om = __pj__.om;
    var geom = __pj__.geom;
    this.setf("xField", "x");

    //this.xScale.set("extent",this.bounds.x);
    //this.yScale.set("extent", this.bounds.y);
    this.xScale.setf("field",this.xField,1);
    this.yScale.setf("field",this.yField,1);
    this.xAxis.scale = this.xScale;
    this.xAxis.orientation = "horizontal";
     this.marks.xScale = this.xScale;
    this.marks.yScale = this.yScale;
    this.data = this.dataSource0.data;
    this.marks.data = this.data;
    this.yAxis.scale = this.yScale;
    this.yAxis.orientation = "vertical";
    /* this.yAxis.extent = this.extent.y; */
     this.xAxis.data = this.yAxis.data = this.xScale.data = this.yScale.data = this.data;
    /* this.xAxis.data = this.xScale.data = this.yScale.data = this.data;*/
     this.xScale.update();
     this.yScale.update();
    this.xAxis.update();
    this.xAxis.moveto(geom.Point.mk(0,this.yScale.extent));
    this.yAxis.update();
    this.marks.update();
  }
  
  
  
  lib.Chart.mk = function () {
    return Object.create(this);
  }
 

 var toSave = lib.Chart;
 om.save(lib.Chart);//,"replicators/ArcSmudge2");
  
  om.genDone(toSave);
});

})();
  
  
  
  

  

    
    
    
