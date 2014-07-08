/*
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js pjcs 0.9.0
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js pjdom 0.9.0
cd /mnt/ebs0/prototypejungledev/node;node admin/assemble.js pjui 0.5.0

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




if (which === "pjcs") {
  var fls = ["pj","om","event","exception","update","instantiate","externalize","internalize","install","log"];
  var rs =
  '\nwindow.prototypeJungle =  (function () {\n\"use strict"\n'+mextract(fls) + "\nreturn pj;\n})();\n"

} else if (which === "pjdom") {
  var fls = ["marks","geom","data","dom1","jxon","svg","html","uistub"];
  var rs = '(function (pj) {\n"use strict"\nvar om=pj.om;'+mextract(fls) + '\n})(prototypeJungle);\n'
} else if (which === "pjui") {
  var fls = ["ajax","constants","ui","page","save","svgx","dom2","tree1","tree2","lightbox",
             "inspect1","inspect2"];
  var rs = "(function (pj) {\n\nvar om=pj.om,dat=pj.dat,dom=pj.dom,svg=pj.dom,html=pj.html,ui=pj.ui;\n"+
            '"use strict"\n'+
             mextract(fls) + "\n})(prototypeJungle);\n"
}


s3.maxAge = 0;
var path = "js/"+which+"-"+version+".js";
console.log("Saving to ",path);
var cb = function () {
  console.log("S3 Save  DONE");
}

s3.save(path,rs,"application/javascript","utf8",cb,true);
  
  
console.log("DOONNNEE");