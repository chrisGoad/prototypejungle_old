/*
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js pjcs 0.9.0
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js pjdom 0.9.0

The major parts of the system are assembled into the single files: pjcs, pjdom, pjdat, and pjui
*/
var util = require('../util.js');

var fs = require('fs');
var s3 = require('../s3');
s3.useNewBucket();

var which = process.argv[2];// which = pjcs pjdom pjdat
var version =  process.argv[3];

var dev = 1;
function fullName(f) {
  return "/mnt/ebs0/prototypejungle"+(dev?"dev":"")+"/www/js/"+f+".js";
}
function extract(fl) {
  var fln = fullName(fl);
  var cn = ""+fs.readFileSync(fln)
  var sex = cn.indexOf("\n//start extract")+ ("//start extract".length + 2);
  var eex = cn.indexOf("\n//end extract")-1;
 console.log(fl,"sex=",sex,"eex = ",eex);
   var ex = cn.substring(sex,eex);
 // console.log(ex);
   return ex;
}

function mextract(fls) {
  var rs = "";
  fls.forEach(function (fl) {
    rs += extract(fl);
  });
  return rs;
}

<script src="/js/geomN.js"></script>
<script src="/js/dom1N2.js"></script>
<script src="/js/jxonN.js"></script>
<script src="/js/svgN.js"></script>
<script src="/js/dataN2.js"></script>
<script src="/js/marksN.js"></script>
<script src="/js/html.js"></script>


if (which === "pjcs") {
  var fls = ["pj","om","event","exception","update","instantiate","externalize","internalize","installN2","log"];
  var rs =
  '\nwindow.prototypeJungle =  (function () {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})();\n"

} else if (which === "pjdom") {
  var fls = ["geomN","dom1N2","jxonN","svgN","html","dataN2","marksN"];
  
var rs = "(function (pj) {\n\ndebugger;var om=pj.om;"+mextract(fls) + "\n})(prototypeJungle);\n"

}


s3.maxAge = 0;
var path = "js/"+which+"-"+version+".js";
console.log("Saving to ",path);
var cb = function () {
  console.log("S3 Save  DONE");
}

s3.save(path,rs,"application/javascript","utf8",cb,true);
  
  
