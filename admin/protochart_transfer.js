
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

var transferFile = function (fromDir,toDir,path) {
  var fromFile = 'protochart/'+fromDir+path;
  var toFile = '../protochart/'+toDir+path;
  console.log('Transfering ',path,'from',fromFile,'to',toFile);
  var cn = ""+fs.readFileSync(fromFile);
  fs.writeFileSync(toFile,cn);
}

var transferFiles = function(fromDir,toDir,paths) {
  paths.forEach(function(path) {transferFile(fromDir,toDir,path)});
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
transferFiles('www/','www/',['edit.html','spectrum.css','style.css','repo1/chart/bar1.js',
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
transferFiles('wwwsrc/','www/',[
               'indexd.html',
               'sign_in.html'
              ]);
/*transferFilesFromPJ([
               'js/pjdata-0.9.3.js',
               'js/pjui-0.9.3.js',
               'js/editor-0.9.3.js',
               'js/chooser-0.9.3.js',
               'js/color_picker.js'
               
               ]);
               */
//fs.writeFileSync('../protochart/test.js',"TESTING");


