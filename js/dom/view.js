
// This is one of the code files assembled into pjdom.js. 


pj.viewItem = function (item,inDiv,cb) {
  var viewIt = function () {
    var root = pj.svg.Root.mk(document.getElementById(inDiv));
    root.set("contents", item);
    pj.updateParts(root);
    root.fitContents();
    if (cb) {
      cb();
    }
  }
  if (document.readyState == "complete" || document.readyState == "loaded"  || document.readyState == "interactive") {
     viewIt();
  } else {
    document.addEventListener('DOMContentLoaded',viewIt);
  }
}
 


})(prototypeJungle);

