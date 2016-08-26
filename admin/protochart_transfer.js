
/*

node admin/protochart_transfer.js

*/
var what = process.argv[2]; // should be core,dom,ui,inspect or rest (topbar,chooser,view,loginout,worker,bubbles)
//var fromDev = process.argv[3] === 'd';
//var toDev = process.argv[4] === 'd';
 
//console.log('fromDev = ',fromDev,'toDev = ',toDev);
var versions = require("./versions.js");
//var util = require('../ssutil.js');

var fs = require('fs');

var transferFile = function (path) {
  var fromFile = 'protochart/www/'+path;
  var toFile = '../protochart/www/'+path;
  console.log('Transfering ',path,'from',fromFile,'to',toFile);
  var cn = ""+fs.readFileSync(fromFile);
  fs.writeFileSync(toFile,cn);
}

var transferFiles = function(fromDir,toDir,paths) {
  paths.forEach(transferFile);
}

/*
var transferFromPJ = function (path) {
  console.log('Transfering from PJ ',path);
  var cn = ""+fs.readFileSync('www/'+path);
  fs.writeFileSync('../protochart/www/'+path,cn);
}

var transferFilesFromPJ = function(paths) {
  paths.forEach(transferFromPJ);
}
*/
transferFiles('www/','www/',[
               'edit.html',
               'upload.html',
               'spectrum.css',
               'style.css',
               'chooser.html',
               //'images/logo.svg',
               //'images/file.ico',
               //'images/folder.ico',
              // 'images/me.jpg',
               'repo1/chart/bar.js',
               'repo1/chart/scatter.js',
               'repo1/chart/line.js',
               'repo1/chart/component/axis.js',
               'repo1/chart/component/labels.js',
               'repo1/chart/core/bar.js',
               'repo1/chart/core/scatter.js',
               'repo1/chart/core/line.js',
               'repo1/example/standalone.html',
               'repo1/startchart/bar.js',
               'repo1/startchart/line.js',
               'repo1/startchart/scatter.js',
               'repo1/startchart/graph.js',
               'repo1/startchart/column.js',
               'repo1/diagram/graph.js',
               'repo1/lib/color_utils.js',
               'repo1/lib/axis_utils.js',
               'repo1/shape/rectangle.js',
               'repo1/shape/square.js',
               'repo1/shape/circle.js',
               'repo1/shape/plus_sign.js',
               'repo1/shape/polyline.js',
               'repo1/shape/rounded_rectangle.js',
               'repo1/shape/arc_arrow.js',
               'repo1/shape/arrow.js',
               'repo1/smudge/bowedline.js',
               'repo1/smudge/bowedlines.js',


              ]);
/*transferFiles('wwwsrc/','www/',[
               'indexd.html',
               'sign_in.html'
              ]);
              */
/*transferFilesFromPJ([
               'js/pjdata-0.9.3.js',
               'js/pjui-0.9.3.js',
               'js/editor-0.9.3.js',
               'js/chooser-0.9.3.js',
               'js/color_picker.js'
               
               ]);
               */
//fs.writeFileSync('../protochart/test.js',"TESTING");


