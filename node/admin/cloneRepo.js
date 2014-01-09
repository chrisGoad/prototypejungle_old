
/*
Utility for copying trees in at s3



cd /mnt/ebs0/prototypejungledev/node;node admin/cloneRepo.js

*/
var src = "sys/repo0"
var dst = "canvasBackup/repo0"

var s3 = require('../s3.js');
var util = require('../util.js');
util.activeTags = ["s3"];
//s3.list([src],null,['.js'],function (e,keys) {
  //console.log(keys);
  s3.copyTree(src,dst,function (e,d) {
    console.log("DONE",e,d);
  },true);//true tolerate errors
//});

/*
var s3 = require('../s3');
var iFiles = ['code.js','data.js','kind codebuilt','kind variant','source.js','view'];
function addItemFiles (rs,key) {
  iFiles.forEach(function (fl) {
    rs.push(key+"/"+fl);
  });
}
var cc = "sys/repo0/chart/component/";
var keys = ["sys/repo0/examples/TwoRectangles","sys/repo0/chart/Bubble1",
            cc+'Caption1',cc+'Bubble',cc+'Legend'];
keys  = [cc+"Axis",cc+"TextBox"];


function allItemFiles(keys) {
  var rs = [];
  keys.forEach(function (k) {addItemFiles(rs,k);});
  return rs;
}
var allKeys = allItemFiles(keys);
var dd = "sys/repo0/data/";

allKeys.push(dd+"noaa_weather_events.html",dd+"noaa_weather_events.json");
console.log(allKeys);
function theJob() {
  util.asyncFor(function (k,cb) {
      //console.log("inner ",k);
      s3.copyToNewBucket(k,function (e,d) {
        //console.log(e);
        cb(e);
      });
      
    },allKeys,function (){console.log("ALL DONE");},true);
}
theJob();
*/
