// load a bar chart, set some properties, and bind data
(function (pj) {
    var om = pj.om;
    var draw = pj.draw;
    var itemUrl = "http://s3.prototypejungle.org/sys/repo0/chart/BarChart";
    var cnv = draw.initCanvas($('#canvas'));
    cnv.bkColor = "white";
    cnv.fitFactor = 0.7;
    draw.installAsRoot(itemUrl,cnv,function (rs) {
      // modify the height of the all of the labels
      // by changing the relevant prototype
      rs.LabelP.style.height= 20;
      // adjust offsets
      rs.xAxis.textOffset=30;
      rs.yAxis.textOffset=40;
      // bind data
      rs.setData({value:[{x:1,y:26},{x:2,y:12},{x:3,y:40},{x:4,y:14}]});
      rs.update();
      cnv.fitContents();
      cnv.refresh();
    });
})(prototypeJungle);
