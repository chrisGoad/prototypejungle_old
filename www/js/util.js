
(function (__pj__) {
  var om = __pj__.om;
  var page = __pj__.page;
  var LNode = []; // list node, with children named by sequential integers starting with 0
  var DNode = om.DNode;
  om.LNode = LNode;
  om.isDev = location.href.indexOf(':8000')>0;
  om.testMinify = 0;
  
  om.useMinified = om.testMinify || !om.isDev;


  om.mapUrlToDev= function (u) {
    if (om.isDev && (u.indexOf('http://prototypejungle.org/')==0)) {
      return 'http://prototypejungle.org:8000'+u.substr(26);
    } else {
      return u;
    }
  }
  // do the work normally performed by "set"  by hand for these initial objects
  om.__parent__ = __pj__;
  om.__name__ = "om";
  DNode.__parent__ = om;
  DNode.__name__ = "DNode";
  LNode.__parent__ = om;
  LNode.__name__ = "LNode";
  page.__parent__ = __pj__;
  page.__name__ = "page";
  
  om.activeConsoleTags = ["error","tree"];//,"drag","util","tree"];
  
  
  om.itemHost = "http://s3.prototypejungle.org";

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
      var aa = [];
      var ln = arguments.length;
      for (var i=0;i<ln;i++) {
        aa.push(arguments[i]);
      }
      console.log(tag,aa.join(", "));
    }
   }
  };
  
  
  om.error = function () {
    var aa = [];
    var ln = arguments.length;
    for (var i=0;i<ln;i++) {
      aa.push(arguments[i]);
    }
    console.log(aa.join(", "));
    throw "error"
  };
  
  
  om.ajaxPost = function (url,data,callback,ecallback) {
    if (typeof data == "string") {
      dataj = data;
    } else {
      var sid = om.storage.sessionId;
      if (sid) {
        data.sessionId = sid;
        data.userName = om.storage.userName;
      }
      var dataj = JSON.stringify(data);
    }
    if (!ecallback) {
      ecallback = function (rs,textStatus,v) {
        alert("ERROR (INTERNAL) IN POST "+textStatus);
      }
   }
   $.ajax({url:url,data:dataj,cache:false,contentType:"application/json",type:"POST",dataType:"json",
         success:callback,error:ecallback});
  }
  
  
  om.ajaxGet = function (url,callback,ecallback,dtype) {
   if (!dtype) {
     ctype = "application/json";
     dtype = "json";
   } else {
     ctype = "text/plain";
   }
   var opts = {url:url,cache:false,contentType:ctype,type:"GET",dataType:dtype, // cache was false
         success:callback};
    if (ecallback) {
      opts.error = ecallback;
    }
    opts.error = function (rs,textStatus) {
      alert("ERROR (INTERNAL) IN get "+textStatus);
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
  
  
  om.toInt = function (s) {
    var rs = parseFloat(s);
    return ((rs%1) == 0)?rs:undefined;
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
    om.log("util","About to load ",url);
    $.ajax({
              crossDomain: true,
              dataType: "script",
              url: url,
              success: function(){
                om.log("util","loaded ",url);
                if (cb) cb();              
              }
          });
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
    
  // n = max after decimal place
  om.nDigits = function (n,d) {
    if (typeof n !="number") return n;
    var ns = String(n);
    var dp = ns.indexOf(".");
    if (dp < 0) return ns;
    var ln = ns.length;
    if ((ln - dp -1)<=d) return ns;
    var bd = ns.substring(0,dp);
    var ad = ns.substring(dp+1,dp+d+1)
    return bd + "." + ad;
  }
  
  // from http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/#more-2838

  om.toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  }
  
  om.mkLink = function(url) {
    return '<a href="'+url+'">'+url+'</a>';
  }
  
  om.mkCapLink = function (caption,url) {
    return "<div class='linkLine'><div class='caption'>"+caption+"</div>"+om.mkLink(url)+'</div>';
  }
  
  om.mkEmbed = function (url) {
    return '&lt;iframe width="500" height="500" src="'+url+'"&gt;\n '
  }
  
  om.mkLinks = function (paths,kind) {
    var repo = paths.repo;
    var prf = om.itemHost;
    var frepo = om.itemHost + repo;
   // var cdlink = frepo + paths.code;
  //  var itmlink = frepo + paths.data;
     var url = paths.url;
    var cdlink = url+"/code.js";
    var itmlink = url+"/data.js";
    var host = location.host;
    var inslink = "http://"+host+"/inspect?item="+url;
    var viewlink = url+"/view"; //"http://"+host+"/view?item="+fnm;
    var rs = "<div class='links'>";
    rs += om.mkCapLink('To inspect the item you just '+kind+':',inslink);
    rs += om.mkCapLink('To view the item you just '+kind+' (Developers: use this in code depdendencies too):',viewlink);
    rs += "<div class='embed'>";
    rs += '<p>To embed the item you just '+kind+':</p>';
    rs += om.mkEmbed(url);  
     rs += '<p>(adjust width and height to taste)</p>';
    rs += "</div>";
     rs += om.mkCapLink('The JSON that describes the structure of this item:',itmlink);
    rs += om.mkCapLink('The JavaScript functions associated with this item:',cdlink);
    return rs;
  }
  
  
  om.check = function (v,msg,ckf) {
    var rs = ckf(v);
    if (rs === undefined) {
      return {error:1,message:"<center><span class='errorTitle'>Error</span>: "+msg+"</center>"};
    } else {
      return rs;
    }
  }
  
  om.checkNumber = function (v) {
    return om.check(v,"expected number.",
      function (x) {if (isNaN(x)) return undefined;return parseFloat(v)});
  }
  
  
  om.checkInteger = function (v) {
    return om.check(v,"expected integer.",
      function (x) {
        if (isNaN(x)) return undefined;
        var rs =parseFloat(v);
        if (rs%1 == 0) return rs;
        return undefined;
      });
  }
  
  
  om.checkPositiveInteger = function (v) {
    return om.check(v,"expected positive integer.",
      function (x) {
        if (isNaN(x)) return undefined;
        var rs =parseFloat(v);
        if ((rs>0) && (rs%1 == 0)) return rs;
        return undefined;
      });
  }
  
  
  
   om.checkPositiveNumber = function (v) {
    return om.check(v,"expected positive number.",
      function (x) {
        if (isNaN(x)) return undefined;
        var rs =parseFloat(v);
        if (rs>0) return rs;
        return undefined;
      });
  }
  
  om.checkNonNegative = function (v) {
    return om.check(v,"expected non-negative number.",
      function (x) {
        if (isNaN(x)) return undefined;
        var rs =parseFloat(v);
        if (rs>=0) return rs;
        return undefined;
      });
  }
  
  om.checkBoolean = function (v) {
    return om.check(v,"No failure possible",
      function (x) {
        if (x == 'false'){
          var rs = 0;
        } else {
          rs = x?1:0;
        }
        return rs;
      });
  }
  
  om.toBooleanOut = function (x) {
    return x?'true':'false';
  }
  
  
  om.DNode.booleanField = function (k) {
    
    this.setInputF(k,om,"checkBoolean");
    this.setOutputF(k,om,"toBooleanOut");

  }
  // from https://github.com/janl/mustache.js/blob/master/mustache.js#L49
  
  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  om.escapeHtml = function(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }
  
  
  om.afterChar = function (s,c) {
    var idx = s.indexOf(c);
    if (idx < 0) return s;
    return s.substr(idx+1);
  }
  
  
  om.beforeChar = function (s,c) {
    var idx = s.indexOf(c);
    if (idx < 0) return s;
    return s.substr(0,idx);
  }
  
  om.endsIn = function (s,p) {
    var ln = s.length;
    var pln = p.length;
    if (pln > ln) return false;
    var es = s.substr(ln-pln);
    return es == p;
  }
  
  om.beginsWith = function (s,p) {
    var ln = s.length;
    var pln = p.length;
    if (pln > ln) return false;
    var es = s.substr(0,pln);
    return es == p;
  }
  
  
  om.stripInitialSlash = function (s) {
    if (s=="") return s;
    if (s[0]=="/") return s.substr(1);
    return s;
  }
  
  om.pathLast =  function (s) {
    if (typeof s == "string") {
      var lsl = s.lastIndexOf("/");
      return s.substr(lsl+1);
    } else  {
      return s[s.length-1];
    }
  }
       
  om.pathExceptLast =  function (s) {
    if (typeof s == "string") {
      var lsl = s.lastIndexOf("/");
      return s.substr(0,lsl+1);
    } else  {
      var cs = s.concat();
      cs.pop();
      return cs;
    }
  }
  
  
  om.pathFirst =  function (s) {
    if (typeof s == "string") {
      var sl = s.indexOf("/");
      if (sl < 0) return s;
      if (sl == 0) {
        var nsl = s.indexOf("/",1);
        if (nsl<0) return s.substr(1);
        return s.substring(1,nsl);
      }
      return s.substring(0,sl);
    } else  {
      return s[1];
    }
  }
       
  om.pathExceptFirst =  function (s) {
    if (typeof s == "string") {
      var sl = s.indexOf("/");
      if (sl<0) return "";
      if (sl == 0) {
        var nsl = s.indexOf("/",1);
        if (nsl<0) return ""
        return s.substr(nsl+1);

      }
      return s.substr(sl+1);
    } else  {
      var cs = s.concat();
      cs.shift();
      return cs;
    }
  }
  
  om.stripDomainFromUrl = function (url) {
    var r = /^http\:\/\/[^\/]*\/(.*)$/
    var m = url.match(r);
    if (m) {
      return m[1];
    }
  }
  
  om.mainName = function(nm) {
    var bf = om.beforeChar(nm,"_");
    var af = om.afterChar(nm,"_");
    if (bf == "persona") {
      return om.beforeChar(af,"@");
    } else {
      return af;
    }
  }
  // only strings that pass this test may  be used as names of nodes
  om.checkName = function (s,allowJpg) {
    if (s=='') return false;
    if (allowJpg) {
      var sp = s.split('.');
      if (sp.length == 2) {
        if (checkName(sp[0]) && sp[1] == '.jpg'){
          return true;
        } else {
          return false;
        }
      }
    }
    return !!s.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
  }
  
  
  om.checkPath = function (s,allowJpg) {
    var sp = s.split("/");
    var ln = sp.length;
    if (ln==0) return false;
    for (var i=0;i<ln;i++) {
      var e = sp[i];
      if (((i>0) || (e != "")) // "" is allowed as the first element here, corresponding to a path starting with "/"
        &&  !om.checkName(sp[i],allowJpg && i==ln-1)) {
        return false;
      }
    }
    return true;
  }
  
  // respond to an "enter" event for a jquery element
  om.setOnEnter = function(jel,fn) {
    jel.keyup(function (e) {
      if (e.keyCode == 13) {
         fn(e);
      }
    });
  }
  
  om.disableBackspace = function () {
    //from http://stackoverflow.com/questions/1495219/how-can-i-prevent-the-backspace-key-from-navigating-back
    var rx = /INPUT|SELECT|TEXTAREA/i;
    $(document).bind("keydown keypress", function(e){
      if( e.which == 8 ){ // 8 == backspace
        if(!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly ){
          e.preventDefault();
        }
      }
    });
  }
  
  
  
om.clearStorageOnLogout = function () {
   om.storage.removeItem('sessionId');
   om.storage.removeItem('userName');
   om.storage.removeItem('handle');
   om.storage.removeItem("signingInWithTwitter");
   om.storage.removeItem("twitterToken");
   om.storage.removeItem("lastPrefix");
   om.storage.removeItem("lastBuildUrl");
   om.storage.removeItem("email");
   om.storage.removeItem("lastFolder");
}


om.checkSession = function (cb) {
  if (om.storage.sessionId) {
    om.ajaxPost('/api/checkSession',{},function (rs) {
      om.log("util","checked session; result:",JSON.stringify(rs));
      if (rs.status == "fail") {
        om.clearStorageOnLogout();
      }
      cb(rs);
    });
  } else {
    cb({status:"fail",msg:"noSession"});
  }
}

// for determining if we are on a dev page or not
om.whichPage =    function (iurl) {
  if (iurl) {
    var url = iurl;
  } else {
    url = location.href;
  }
  var r = /http\:\/\/([^\/]*)\/([^\/\?]*)(.*)$/
  var m = url.match(r);
  if (m) return m[2];
}


})(__pj__);