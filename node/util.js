exports.activeTags = ["web"];//["postData","user","session"];//"headers","s3","session","error","twitter"];


function dateString(d) {
  return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
}

exports.log = function (tag) {
    var atags = exports.activeTags;
    var d = new Date();
    var ds = dateString(d);
    if ((atags.indexOf("all")>=0) || (atags.indexOf(tag)>=0)) {
      var aa = [];
      var ln = arguments.length;
      for (var i=1;i<ln;i++) {
        aa.push(arguments[i]);
      }
      console.log(ds+" "+tag,aa.join(", "));
   }
  }

var fs = require('fs');

var cwd = process.cwd();
exports.docroot = cwd.substr(cwd,cwd.length-4)+"www/";

exports.isDev = cwd.indexOf('jungledev')>0;
exports.log("util","docroot",exports.docroot);

exports.log("util","ISDEV",exports.isDev);


 exports.checkName = function (s) {
    if (typeof s != 'string') {
      return false;
    }
    if (s=='checkNameCheck') {
      return false;
    }
    if (s=='') return false;
    return !!s.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
  }