
// this contains the minimum needed to support standalone pages (eg, the docs, home page(

(function (pj) {
  var om = pj.om;

// This is one of the code files assembled into pjtopbar.js. "start extract" and "end extract" indicate the part used in the assembly

//start extract


om.DNode.mk = function () {
  return Object.create(om.DNode);
}

om.DNode.set = function (nm,vl) {
  this[nm]=vl;
  if (vl && (typeof vl === "object")) {
    vl.__name = nm;
    vl.__parent = this;
  }
  return vl;
}
/*
om.activeConsoleTags = ["error"]; // ammended up in constants, usually 

om.addTagIfDev = function (tg) {
  if (ui.isDev) {
    om.activeConsoleTags.push(tg);
  }
}

om.removeConsoleTag = function (tg) {
  var a = om.activeConsoleTags;
  var i = array.indexOf(tg);
  if(i != -1) {
    a.splice(i, 1);
  }
  //om.removeFromArray(om.activeConsoleTags,tg);
}


om.argsToString= function (a) {
  // only used for slog1; this check is a minor optimization
  if (typeof(console) === "undefined") return "";
  var aa = [].slice.call(a);
  return aa.join(", ");
}

  

om.log = function (tag) {
  if (typeof(console) === "undefined") return;
  if ((om.activeConsoleTags.indexOf("all")>=0) || (om.activeConsoleTags.indexOf(tag) >= 0)) {
   if (typeof window === "undefined") {
     system.stdout(tag + JSON.stringify(arguments));
  } else {
    var aa = [].slice.call(arguments);
    console.log(tag,aa.join(", "));
  }
 }
};


om.browser = function () {
  var userAgent = window.navigator.userAgent,
    m = userAgent.match(/Chrome\/(\d*)/),
    browser,version;
  if (m) {
    browser = 'Chrome';
  } else {
    m = userAgent.match(/Firefox\/(\d*)/);
    if (m) {
      browser = 'Firefox';
    } else {
      m = userAgent.match(/MSIE (\d*)/);
      if (m) {
        browser = 'IE';
      } else {
        m = userAgent.match(/rv\:(\d*)/);
        if (m) {
          browser = 'IE';
        }
      }
    }
  }
  if (m) {
    version = parseInt(m[1]);
    return {browser:browser,version:version}
  }
}

om.supportedBrowser = function () {
  return 0;
  var browserVersion = om.browser();
  if (!browserVersion) {
    return 0;;
  }
  if ((browserVersion.browser === 'IE') && (browserVersion.version < 9)) {
    return 0;
  }
  return 1;
}
  */

om.beforeChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
  return s.substr(0,idx);
}
  
om.afterChar = function (s,c,strict) {
  var idx = s.indexOf(c);
  if (idx < 0) return strict?undefined:s;
  return s.substr(idx+1);
}
  
// only strings that pass this test may  be used as names of nodes
om.checkName = function (s) {
  if (s === undefined) {
    debugger;
  }
  if (s==='') return false;
  if (s==='$') return true;
  if (typeof s==="number") {
    return s%1 === 0;
  }
  return !!s.match(/^(?:|_|[a-z]|[A-Z])(?:\w|-)*$/)
}

//end extract


})(prototypeJungle);