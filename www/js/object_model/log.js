(function (pj) {
  var om = pj.om;

// This is one of the code files assembled into pjom.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract


// <Section> log ====================================================


om.activeConsoleTags = (om.isDev)?['error','updateError','installError']:['error'];//,'drag','util','tree'];
// so that logging can be forced in debug work from this one line.
om.alwaysActiveConsoleTags =['install'];

om.addTagIfDev = function (tag) {
  if (om.isDev) {
    om.activeConsoleTags.push(tag);
  }
}

om.removeConsoleTag = function (tag) {
  var a = om.activeConsoleTags;
  var i = array.indexOf(tag);
  if(i != -1) {
    a.splice(i, 1);
  }
}


om.argsToString= function (a) {
  om.error('NOPE');
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

  

om.log = function (tag) {
  if (typeof(console) === 'undefined') return;
  if ((om.activeConsoleTags.indexOf('all')>=0) || (om.activeConsoleTags.indexOf(tag) >= 0) ||
      (om.alwaysActiveConsoleTags.indexOf(tag) >= 0) ) {
    // transform arguments list into array
    var aa = [].slice.call(arguments);
    console.log(tag,aa.join(', '));
  }
};


om.startTime = Date.now()/1000;
// time log, no tag


om.resetClock = function () {
  om.startTime = Date.now()/1000;
}

om.elapsedTime = function () {
  var now = Date.now()/1000;
  var elapsed = now-om.startTime;
  return  Math.round(elapsed * 1000)/1000;
}

om.tlog = function () {
  if (typeof(console) === 'undefined') return;
  var elapsed = om.elapsedTime();
  // turn arguments into array
  var aa = [].slice.call(arguments);
  var rs = 'At '+elapsed+': '+aa.join(', ');
  console.log(rs);
  return;
}




//end extract

})(prototypeJungle);


