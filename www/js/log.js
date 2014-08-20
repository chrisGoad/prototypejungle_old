NOT IN USE 
(function (pj) {
  var om = pj.om;

// This is one of the code files assembled into pjcs.js. "start extract" and "end extract" indicate the part used in the assembly

//start extract

// <Section> Logging  ==============================
om.activeConsoleTags = (om.isDev)?["error","updateError","installError"]:["error"];//,"drag","util","tree"];

om.addTagIfDev = function (tg) {
  if (om.isDev) {
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
  var aa = [];
  var ln = a.length;
  for (var i=0;i<ln;i++) {
    aa.push(a[i]);
  }
  return aa.join(", ");
}

  

om.log = function (tag) {
  if (typeof(console) === "undefined") return;
  if ((om.activeConsoleTags.indexOf("all")>=0) || (om.activeConsoleTags.indexOf(tag) >= 0)) {
   if (typeof window === "undefined") {
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
    if (typeof(console) === "undefined") return;
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


/*
om.error = function () {
  var aa = [];
  var ln = arguments.length;
  for (var i=0;i<ln;i++) {
    aa.push(arguments[i]);
  }
  if (om.debugMode) {
    debugger;
  }
  console.log('Error',aa.join(", "));
  throw "error"
};
*/

//end extract
})(prototypeJungle);


