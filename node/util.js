
var fs = require('fs');

var cwd = process.cwd();
exports.docroot = cwd.substr(cwd,cwd.length-4)+"www/";

exports.isDev = cwd.indexOf('jungledev')>0;

exports.activeTags = ["s3","web","error"];//["postData","user","session"];//"headers","s3","session","error","twitter"];

exports.activateTagForDev = function (tag) {
  if (exports.isDev) {
    exports.activeTags.push(tag);
  }
}


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
  
exports.log("util","docroot",exports.docroot);

exports.log("util","ISDEV",exports.isDev);


 exports.checkName = function (s) {
    if (typeof s !== 'string') {
      return false;
    }
    if (s==='checkNameCheck') {
      return false;
    }
    if (s==='') return false;
    return !!s.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
  }
  

exports.afterChar = function (s,c) {
  var idx = s.indexOf(c);
  if (idx < 0) return "";
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
  return es === p;
}

exports.hasExtension = function (s,extensions) {
  if (!extensions) {
    return false;
  }
  if (typeof extensions === "string") {
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

// fn should take as inputs dt , and a function which should call its callback   with an error if there is one
  exports.asyncFor = function (fn,data,cb,tolerateErrors) {
    //console.log("AFOR ",fn,data);
    var ln = data.length;
    function asyncFor1(n) {
      debugger;
      if (n===ln) {
        if (cb) {
          cb(undefined,data);
        }
        return;
      }
      var dt = data[n];
      fn.call(null,dt,function (e) {
        //console.log("AFOR1 ",dt);
        if (e) {
          console.log("ERROR",e);
          if (tolerateErrors) {
            asyncFor1(n+1);
          } else if (cb) {
            cb(e);
          }
        } else {
          asyncFor1(n+1);
        }
      });
    }
    asyncFor1(0);
  }
  
  
  // each cmd is a pair [fn,args]
  
  exports.asyncBlock = function (cmds,cb,tolerateErrors) {
    //console.log("AFOR ",fn,data);
    var ln = cmds.length;
    function asyncBlock1(n) {
      debugger;
      if (n===ln) {
        if (cb) {
          cb(undefined);
        }
        return;
      }
      var cmd = cmds[n];
      var fn = cmd[0];
      var dt = cmd[1];
      fn.call(null,dt,function (e) {
        //console.log("AFOR1 ",dt);
        if (e) {
          console.log("ERROR",e);
          if (tolerateErrors) {
            asyncBlock1(n+1);
          } else if (cb) {
            cb(e);
          }
        } else {
          asyncBlock1(n+1);
        }
      });
    }
    asyncBlock1(0);
  }
      
