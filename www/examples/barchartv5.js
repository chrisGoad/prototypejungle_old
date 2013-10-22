// load a bar chart, set sa property, and bind data
// load a bar chart, set some properties, load and bind data
(function (pj) {
   $('document').ready(function () {
      var om = pj.om;
      var draw = pj.draw;
      var itemUri = "http://s3.prototypejungle.org/sys/repo0/chart/variants/BarChart/v5";
      var dataUrl = 'http://s3.prototypejungle.org/sys/repo0/data/bardata1.json'
      var cnv = draw.initCanvas($('#canvas'));
      cnv.bkColor = "white";
      cnv.fitFactor = 0.7;
      draw.installAsRoot(itemUri,cnv,function (rs) {
        // load and bind data
        prototypeJungle.om.loadData(dataUrl,function (e,d) {
           if (d) {
            rs.setData(d);
            rs.update();
            cnv.fitContents();
           } else {
            alert(e.message);
           }
         }); 
      });
   });
})(prototypeJungle);