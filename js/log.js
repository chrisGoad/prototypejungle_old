
pj.activeConsoleTags = ['error'];//,'drag','util','tree'];

pj.addConsoleTag = function (tag) {
  pj.addToArrayIfAbsent(pj.activeConsoleTags,tag);
}

pj.removeConsoleTag = function (tag) {
  pj.removeFromArray(pj.activeConsoleTags,tag);
}
  

pj.log = function (tag) {
  if (typeof(console) === 'undefined') return;
  if ((pj.activeConsoleTags.indexOf('all')>=0) || (pj.activeConsoleTags.indexOf(tag) >= 0)) { 
    // transform arguments list into array
    var aa = [].slice.call(arguments);
    console.log(tag,aa.join(', '));
  }
};


pj.startTime = Date.now()/1000;
// time log, no tag


pj.resetClock = function () {
  pj.startTime = Date.now()/1000;
}

pj.elapsedTime = function () {
  var now = Date.now()/1000;
  var elapsed = now-pj.startTime;
  return  Math.round(elapsed * 1000)/1000;
}

pj.tlogActive = false;
pj.tlog = function () {
  var elapsed,aa,rs;
  if (!pj.tlogActive) {
    return;
  }
  if (typeof(console) === 'undefined') return;
  elapsed = pj.elapsedTime();
  // turn arguments into array
  aa = [].slice.call(arguments);
  rs = 'At '+elapsed+': '+aa.join(', ');
  console.log(rs);
  return;
}

})();


