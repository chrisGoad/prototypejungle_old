
var __pj__;  // the only top level global

(function () {


  var DNode = {};
  __pj__ = Object.create(DNode);
  
  var om = Object.create(DNode);
  __pj__.om = om;
  om.__parent__ = __pj__;
  om.__name__ = "om";
  om.DNode = DNode;
  // do the work of installType by hand for this first type
  DNode.__parent__ = om;
  DNode.__name__ = "DNode";
  
  om.pw = "vMfm7i1r";

  om.activeConsoleTags = [];
  

  om.argsToString= function (a) {
    // only used for slog1; this check is a minor optimization
    if (typeof(console) == "undefined") return "";
    var aa = [];
    var ln = a.length;
    for (var i=0;i<ln;i++) {
      aa.push(a[i]);
    }
    return aa.join(", ");
  }
  
    
    
  om.slog1 = function (s) {
   if (typeof(console) == "undefined") return;
    console.log("SLOG1",s);
  }
  // simple log, no tag
  
  om.slog = function () {
    var s = om.argsToString(arguments);
    om.slog1(s);
  }
  
  
  om.startTime = Date.now()/1000;
  // time log, no tag
  
  
  om.resetClock = function () {
    om.startTime = Date.now()/1000;
  }
  
  om.elapsedTime = function () {
    var nw = Date.now()/1000;
    var et = nw-om.startTime;
    return  Math.round(et * 1000)/1000;

  }
  
  om.tlog = function () {
    //if (arguments.length == 1) alert(1);
    if (typeof(console) == "undefined") return;
  // for ie 8
   var aa = [];
   var nw = Date.now()/1000;
   var et = nw-om.startTime;
   var ln = arguments.length;
   for (var i=0;i<ln;i++) {
     aa.push(arguments[i]);
   }
   et = Math.round(et * 1000)/1000;
   var rs = "AT "+et+": "+aa.join(", ");
   console.log(rs);
  return;
  }
  
  
  
  
  
  om.log = function (tag) {
    if (typeof(console) == "undefined") return;
    if (($.inArray("all",om.activeConsoleTags)>=0) || ($.inArray(tag,om.activeConsoleTags) >= 0)) {
     if (typeof window == "undefined") {
       system.stdout(tag + JSON.stringify(arguments));
    } else {
      // for ie 8
      var aa = [];
      var ln = arguments.length;
      for (var i=0;i<ln;i++) {
        aa.push(arguments[i]);
      }
      console.log(tag,aa.join(", "));
    }
   }
  };
  
  
  om.error = function (a,b) {
    console.log("Error "+a,b);
    foob();
  };
  
  om.ajaxPost = function (url,data,callback) {
   if (typeof data == "string") {
    dataj = data;
   } else {
    var dataj = JSON.stringify(data);
   }
   var ecallback = function (rs,textStatus,v) {
      alert("ERROR IN POST "+textStatus);
    }
   $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:callback,error:ecallback});
  }
  
  
  om.ajaxGet = function (url,callback,ecallback) {
   var opts = {url:url,cache:false,contentType:"application/json",type:"GET",dataType:"json", // cache was false
         success:callback};
    if (ecallback) {
      opts.error = ecallback;
    }
    opts.error = function (rs,textStatus) {
      alert("ERROR IN get "+textStatus);
    }
    $.ajax(opts);
  }


  om.runCallbacks = function (cbs) {
    if (cbs == undefined) return;
    var a = arguments;
    var ca = [];
    var ln = a.length;
    for (i=1;i<ln;i++) {
      ca.push(a[i]);
    }
    om.arrayForEach(cbs,function (cb) {
      cb.apply(undefined,ca);
    })
  }
  
  
  
  
          
  om.pathLast =  function (s) {
    var lsl = s.lastIndexOf("/");
    return s.substr(lsl+1);
  }
  
  
  om.toInt = function (s) {
    var ts = $.trim(s);
    var rs = parseInt(ts);
    var ck = ""+rs;
    if (ck == ts) {
      return rs;
    } else {
      return undefined;
    }
    
  }

  
  om.removeFromArray= function (a,el) {
    var rs = [];
    a.forEach(function (e) {
      if (e!=el) {
        rs.push(e);
      }
    });
    return rs;
  }

  
   om.getScript  = function (url,cb) {
    console.log("About to load ",url);
    $.ajax({
              crossDomain: true,
              dataType: "script",
              url: url,
              success: function(){
                console.log("loaded ",url);
                if (cb) cb();              
              }
          });
   }
   
  // n is the index of the next script to fetch
  om.getScripts = function (scripts,cb,n) {
    if (1) { // disabled for now
      cb();
      return;
    }
    var ln = scripts.length;
    if (n == ln) {
      cb();
      return;
    }
    if (typeof n == "number") {
      var i = n;
    } else {
      var i = 0;
    }
    om.getScript(scripts[i],function () {om.getScripts(scripts,cb,i+1)});
  }
  
  //  swiped from http://paulgueller.com/2011/04/26/parse-the-querystring-with-jquery/
   om.parseQuerystring = function(){
      var nvpair = {};
      var qs = window.location.search.replace('?', '');
      var pairs = qs.split('&');
      $.each(pairs, function(i, v){
        var pair = v.split('=');
        if (pair.length>1) {
          nvpair[pair[0]] = pair[1];
        }
      });
      return nvpair;
    }

})();