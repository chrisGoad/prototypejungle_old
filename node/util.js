
var fs = require('fs');
var cwd = process.cwd();
exports.docroot = cwd.substr(cwd,cwd.length-4)+"www/";

exports.isDev = cwd.indexOf('jungledev')>0;

exports.homePage = "/index.html"; // change to "" on release

exports.activeTags = ["error"];//["web","error"];//["postData","user","session"];//"headers","s3","session","error","twitter"];


exports.seconds = function () {
    return Math.floor(new Date().getTime()/1000);
  }

exports.activateTagForDev = function (tag) {
  if (exports.isDev) {
    if (exports.activeTags.indexOf(tag)<0) exports.activeTags.push(tag);
  }
}


exports.activateTag = function (tag) {
  exports.activeTags.push(tag);
  exports.activateTagForDev(tag);
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
  

exports.afterChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
  return s.substr(idx+1);
}


exports.afterLastChar = function (s,c,strict) {
    var idx = s.lastIndexOf(c);
    if (idx < 0) return strict?undefined:s;
    return s.substr(idx+1);
  }

exports.beforeChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
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
    var ln = data.length;
    function asyncFor1(n) {
      if (n===ln) {
        if (cb) {
          cb(undefined,data);
        }
        return;
      }
      var dt = data[n];
      fn.call(null,dt,function (e) {
        if (e) {
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
    var ln = cmds.length;
    function asyncBlock1(n) {
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
        if (e) {
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
  // takes a path like sys/repo0/whatever or /sys/repo0/whatever and returns sys/repo 
  exports.repoFromPath = function (path) {
    var sts = path[0]==='/';
    var sp = path.split("/");
    return sts?sp[1]+"/"+sp[2]:sp[0]+"/"+sp[1];
  }
  
  
  exports.handleFromPath = function (path) {
    var sts = path[0]==='/';
    if (sts) {
      var sidx = path.indexOf("/",1);
      return path.substring(1,sidx);
    } else {
      var sidx = path.indexOf("/");
      return path.substring(0,sidx);
    }
  }
  
  
  
  exports.stripInitialSlash = function (s) {
    if (s==="") return s;
    if (s[0]==="/") return s.substr(1);
    return s;
  }
