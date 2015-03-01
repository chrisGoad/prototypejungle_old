(function (pj) {
  var pt = pj.pt;

// This is one of the code files assembled into pjom.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract


// <Section> log ====================================================


pt.activeConsoleTags = ['error'];//,'drag','util','tree'];

pt.addConsoleTag = function (tag) {
  pt.addToArrayIfAbsent(pt.activeConsoleTags,tag);
}

pt.removeConsoleTag = function (tag) {
  pt.removeFromArray(pt.activeConsoleTags,tag);
}


pt.argsToString= function (a) {
  pt.error('NOPE');
  return;
  // only used for slog1; this check is a minor optimization
  if (typeof(console) === 'undefined') return '';
  var aa = [];
  var ln = a.length;
  for (var i=0;i<ln;i++) {
    aa.push(a[i]);
  }
  return aa.join(', ');
}

  

pt.log = function (tag) {
  if (typeof(console) === 'undefined') return;
  if ((pt.activeConsoleTags.indexOf('all')>=0) || (pt.activeConsoleTags.indexOf(tag) >= 0)) { 
    // transform arguments list into array
    var aa = [].slice.call(arguments);
    console.log(tag,aa.join(', '));
  }
};


pt.startTime = Date.now()/1000;
// time log, no tag


pt.resetClock = function () {
  pt.startTime = Date.now()/1000;
}

pt.elapsedTime = function () {
  var now = Date.now()/1000;
  var elapsed = now-pt.startTime;
  return  Math.round(elapsed * 1000)/1000;
}

pt.tlog = function () {
  if (typeof(console) === 'undefined') return;
  var elapsed = pt.elapsedTime();
  // turn arguments into array
  var aa = [].slice.call(arguments);
  var rs = 'At '+elapsed+': '+aa.join(', ');
  console.log(rs);
  return;
}




//end extract

})(prototypeJungle);


