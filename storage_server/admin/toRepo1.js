

/*
Utility for updating  Repo1


cd ~/storage_server_dev; node admin/toRepo1.js
 
*/
var files = [
     
      //'test/two_arrows.js','test/arrow.js','shape/arrow1.js',
      'test/insert_chart.html','test/config.js',
      'chart/component/axis1.js','test/axis.js',
      'chart/component/labels1.js',
      'chart/core/bar1.js',
      'lib/color_utils.js',
      'lib/text_layout.js',
      'test/core_bar.js',
      'data/metal_densities.js',
      'chart/bar1.js',
      'test/bar.js',
      'text/textarea1.js',
      /*'test/labels.js','example/data/labels0.js','test/core_bar.js',
      'chart/component/legend1.js','test/legend.js',
       'lib/text_layout.js','text/textarea1.js','test/textarea.js', 'example/bar_chart_components.js', 
        'chart/scatter1.js','chart/core/scatter1.js','test/core_scatter.js','test/scatter.js',      
      'chart/bar1.js','chart/line1.js','test/bar.js','test/bar_categories.js','test/core_bar_categories.js','test/line.js',
       'chart/column1.js','test/column.js',
       'chart/core/line1.js','test/core_line.js',
      'lib/color_utils.js',
       'example/data/metal_densities.js',
       'example/data/trade_balance.js',
       'example/data/trade_balanceN.js',
       'example/data/graph0.js','example/data/figure2.js',
       'example/two_rectangles.js','example/two_arrows.js','example/standalone.html',
       'example/simple_bar_chart.js','example/bar_chart.js','example/external_data0.js',
       'example/external_data1.js','example/sample_data0.js','example/figure2.js',
       'example/bar_categories.js',
       'example/bar_chart_slow.js',
       'nonfunctional/lines1.js',
     'test/graph.js','graph/def.js','graph/svg.js'*/
     ];

var srcdir = "/home/ubuntu/xfer_repo1/";
var dstdir = "sys/repo1/";
var jst = "application/javascript";
var htt = "text/html";

var fs = require('fs');
var s3 = require('../s3');
var util = require('../ssutil.js');
s3.setBucket("openchart.net");

var toS3 = function (fl,cb) {
    var mxa = 0;
    var fpth = srcdir+fl;
    var dpth = dstdir+fl;
    var ctp = (fl.indexOf('.js')>0)?jst:htt;
    console.log("Reading from ",fpth, "saving to ",dpth,' content type',ctp);
    var vl = fs.readFileSync(fpth).toString();
    s3.save(dpth,vl,{contentType:ctp,encoding:"utf8",maxAge:mxa,dontCount:1},cb);
  }
//toS3(files[0]);

 util.asyncFor(toS3,files,function () {
    console.log("DONE UPDATING S3");
  },1);




