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
  

exports.afterChar = function (s,c) {
  var idx = s.indexOf(c);
  if (idx < 0) return s;
  return s.substr(idx+1);
}


exports.beforeChar = function (s,c) {
  var idx = s.indexOf(c);
  if (idx < 0) return s;
  return s.substr(0,idx);
}
    
exports.endsIn = function (s,p) {
  var ln = s.length;
  var pln = p.length;
  if (pln > ln) return false;
  var es = s.substr(ln-pln);
  return es == p;
}

exports.hasExtension = function (s,extensions) {
  if (!extensions) {
    return false;
  }
  if (typeof extensions == "string") {
    return exports.endsIn(s,extensions);
  } else {
    var ln = extensions.length;
    for (var i=0;i<ln;i++) {
      if (exports.endsIn(s,extensions[i])) {
        return true;
      }
    }
    return false;
  }
}
