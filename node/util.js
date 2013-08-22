 
//log(tag,a,b,c...) logs only if tag or "all" is among activetags
var activeTags = ["web"];//"s3","session","error","twitter"];

exports.log = function (tag) {
    if ((activeTags.indexOf("all")>=0) || (activeTags.indexOf(tag)>=0)) {
      var aa = [];
      var ln = arguments.length;
      for (var i=1;i<ln;i++) {
        aa.push(arguments[i]);
      }
      console.log(tag,aa.join(", "));
   }
  }

var fs = require('fs');

var cwd = process.cwd();
exports.docroot = cwd.substr(cwd,cwd.length-4)+"www/";

exports.isDev = cwd.indexOf('jungledev')>0;
exports.log("util","docroot",exports.docroot);

exports.log("util","ISDEV",exports.isDev);
