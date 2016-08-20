
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
  console.log('Transfering ',path);
  var cn = ""+fs.readFileSync('protochart/www/'+path);
  fs.writeFileSync('../protochart/www/'+path,cn);
}

var transferFiles = function(paths) {
  paths.forEach(transferFile);
}


var transferFromPJ = function (path) {
  console.log('Transfering from PJ ',path);
  var cn = ""+fs.readFileSync('www/'+path);
  fs.writeFileSync('../protochart/www/'+path,cn);
}

var transferFilesFromPJ = function(paths) {
  paths.forEach(transferFromPJ);
}

transferFiles(['edit.html','spectrum.css','indexd.html','style.css','repo1/chart/bar1.js',
               'sign_in.html',
               'chooser.html',
               'images/logo.svg',
               'repo1/chart/bar1.js',
               'repo1/chart/component/axis1.js',
               'repo1/chart/component/labels1.js',
    
               'repo1/chart/core/bar1.js',
               'repo1/startchart/bar.js',
               'repo1/startchart/column.js',
               'repo1/lib/color_utils.js',
               'repo1/lib/axis_utils.js',
               'repo1/shape/rectangle1.js',
              ]);
transferFilesFromPJ([
               'js/pjdata-0.9.3.js',
               'js/pjui-0.9.3.js',
               'js/editor-0.9.3.js',
               'js/chooser-0.9.3.js',
               'js/color_picker.js'
               
               ]);
//fs.writeFileSync('../protochart/test.js',"TESTING");


