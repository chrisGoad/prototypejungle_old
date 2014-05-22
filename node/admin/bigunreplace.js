
var fs = require('fs');
var a0 = process.argv[2];
var a1 = process.argv[3];
/*

cd /mnt/ebs0/prototypejungledev/node;node admin/bigunreplace.js  
*/

  var replaceCount = 0;
  var replaceCandidates = 0;
  
function wreplace(s,target,rep) {
  
  var tln = target.length;
  function findInstances() {
    var rs = [];
    var f = 0;
    while (1) {
      var p = s.indexOf(target,f);
      if (p>=0) {
        rs.push(p);
        f = p+1;
      } else {
        return rs;
      }
    }
  }

  function isLetter(a) {
    return !!a.match(/\w/);
  }
  function isWord(p) {
    debugger;
    var pv = s[p-1];
    var nv = s[p+tln];
    return !(isLetter(pv) || isLetter(nv));
  }

  function replaceInstances(){
    var rs = "";
    var cp = 0;
    var ins = findInstances();
    var cnt = 0;
    replaceCandidates = ins.length;
   // console.log(ins.length,"replacement candidates");
    ins.forEach(function (n) {
      if (isWord(n)) {
        rs += s.substring(cp,n);
        rs += rep;
        cp = n+tln
        cnt++;
      }
    });
    //console.log(cnt,"replacements");
    replaceCount = cnt;
    rs += s.substring(cp,s.length);
    return rs;
  }
//var ii = findInstances(s,"abc");
//return isWord(ii[0]);
  return replaceInstances();

}

var dir = "/mnt/ebs0/prototypejungledev/www/js/"

function fileReplace(fl,target) {
  replaceCount = 0;
 var fpth = dir + fl + ".js";
  //console.log("replace start for ",target," in ",fpth);
  var vl = ""+fs.readFileSync(fpth);
  var rvl = wreplace(vl,"_"+target,target);
  //dpth = dir + a0+"_rr"+".js";
  if (replaceCount>0) {
    console.log("replace done for ",target," in ",fl," candidates "+replaceCandidates+" replaces: ",replaceCount+"\n\n");
    fs.writeFileSync(fpth,rvl);

  }
}


sfiles = ["pj","util1","util2","page","om1N","om2N","instantiateN",
                    "externalizeN","geom","dom1","svgN","jxon2","dom2N","bubbles",
                    "data","marks","initsvgN","tree1NN","tree2NN","lightboxN","inspect1N","inspect2N","error",'view',
                    "codemode","page","error","login","standalone_page","chooser2N"]




function filesReplace(target) {
  sfiles.forEach(function (fl) {fileReplace(fl,target);});
}

//filesReplace(a0);
//console.log(rvl);

/*
 var oo = pj.om.DNode;
 var aa = Object.getOwnPropertyNames(oo);
 var bb = [];
 aa.forEach(function (a) {
   if (a[0]!=="_") bb.push(a);
   });
  */

var reps = ["mfreeze", "tHide", "setf"]

var reps = ["seth", "setN", "setIfMissing",  "xferLifted", "iterItems", "properties", "iterTreeItems", "iterDomTree", "iterInheritedItems",
            "iterInheritedTreeItems", "iterAtomicNonstdProperties", "iterValues", "setProps", "keys", "pathOf", "topAncestorName", "pathAsString", "remove", "values",
            "pathSetValue", "nonAtomicTreeProperty", "treeOfSelections", "transferToOverride", "stickySet", "setIfNumeric", "removeComputed", "xferProperty", "setProperties",
            "setPropertiesN", "stripOm", "namedType", "protoPath", "lastProtoInTree", "protoName", "setPropForAncestors", "treeInheritsPropertyFrom", "treeInheritsSomePropertyFrom",
            "setNote", "setTransient", "setFieldType", "setFieldStatus", "setvis", "setRequiresUpdate", "requiresUpdate", "Iwatch", "setInputF", "setOutputF", "isMfrozen",
            "isThidden", "reportChange", "setListener", "onChange", "setIfExternal", "lnodeIndex", "nthAncestor", "treeSize", "instantiate", "mbindd", "isProtoChild", "setPoint",
            "moveto", "toGlobalCoords", "scalingDownHere", "toLocalCoords", "translate", "translateX", "translateY", "setScale", "rotate", "svgTag", "isDomEL", "removeDom",
            "select", "isSelectable", "selectableAncestor", "isShape", "transformToSvg", "svgClear", "resetComputedNode", "resetComputedLNode", "resetComputedDNode",
            "stashData1", "stashData", "restoreData1", "restoreData", "isetData", "setInsideData", "marksAncestor", "mkWidgetLine", "widgetLineOf", "showInTreeP",
            "mkPrimWidgetLine","hide","show"]

var reps = ["instantiate"];
reps.forEach(function (r) {
  console.log("\n\n\n==========================");
  filesReplace(r);
});
