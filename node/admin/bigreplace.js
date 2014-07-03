/*

cd /mnt/ebs0/prototypejungledev/node;node admin/bigreplace.js  
*/
var fs = require('fs');
var a0 = process.argv[2];
var a1 = process.argv[3];


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

function fileReplace(fl,itarget) {
  if (typeof itarget==="string") {
    var target = itarget;
    var replacement = "_"+target;
  } else {
    target = itarget[0];
    replacement = itarget[1];
  }
  replaceCount = 0;
 var fpth = dir + fl + ".js";
  //console.log("replace start for ",target," in ",fpth);
  var vl = ""+fs.readFileSync(fpth);
  var rvl = wreplace(vl,target,replacement);
  //dpth = dir + a0+"_rr"+".js";
  if (replaceCount>0) {
    console.log("replace done for ",target," in ",fl," candidates "+replaceCandidates+" replaces: ",replaceCount+"\n\n");
    fs.writeFileSync(fpth,rvl);

  }
}


sfiles = ["pj","util1","util2","pageN","om1","om2","instantiate",
                    "externalize","geom","dom1","svg","jxon","dom2","bubbles",
                    "data","marks","initsvg","tree1","tree2","lightbox","inspect1","inspect2","error",'view',
                    "codemode","error","login","standalone_page","chooser"]




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
   if ((a[0]==="_")&&(a[1]!=="_")) bb.push(a);
   });
  */
var reps = ["mfreeze", "tHide", "setf"]

var ireps = ["seth", "setN", "setIfMissing",  "xferLifted", "iterItems", "properties", "iterTreeItems", "iterDomTree", "iterInheritedItems",
            "iterInheritedTreeItems", "iterAtomicNonstdProperties", "iterValues", "setProps", "keys", "pathOf", "topAncestorName", "pathAsString",  "values",
            "pathSetValue", "nonAtomicTreeProperty", "treeOfSelections", "transferToOverride", "stickySet", "setIfNumeric", "removeComputed", "xferProperty", "setProperties",
            "setPropertiesN", "stripOm", "namedType", "protoPath", "lastProtoInTree", "protoName", "setPropForAncestors", "treeInheritsPropertyFrom", "treeInheritsSomePropertyFrom",
            "setTransient", "setFieldType", "setFieldStatus", "setvis", "setRequiresUpdate", "requiresUpdate",  "setInputF", "setOutputF", "isMfrozen",
            "isThidden", "reportChange", "setListener", "onChange", "setIfExternal", "lnodeIndex", "nthAncestor", "treeSize", "mbindd", "isProtoChild", "setPoint",
            "moveto", "toGlobalCoords", "scalingDownHere", "toLocalCoords", "translate", "translateX", "translateY", "setScale", "rotate", "svgTag", "isDomEL", "removeDom",
            "select", "isSelectable", "selectableAncestor", "isShape", "transformToSvg", "svgClear", "resetComputedNode", "resetComputedLNode", "resetComputedDNode",
            "stashData1", "stashData", "restoreData1", "restoreData", "isetData", "setInsideData", "marksAncestor", "mkWidgetLine", "widgetLineOf", "showInTreeP",
            "mkPrimWidgetLine","fieldIsFrozen"]

//var reps = ["show"];
//var reps = [["__name__","_name"],["__parent__","_parent"]];



function toOneUnderbar(s) {
  //var ln = s.length;
  //return s.substring(1,ln-2);
  return "_"+s;
}

function fromOneUnderbar(s) {
  return s.substring(1);
}

function mkReps(ubs) {
  reps = [];
  ubs.forEach(function (nm) {
    reps.push(["_"+nm,"_pj_"+nm]);
  });
}


function mkReps(ubs) {
  reps = [];
  ubs.forEach(function (nm) {
    //reps.push(["_"+nm,"_pj_"+nm]);
    //reps.push(["_"+nm,"_"+nm+"_j"]);
    //reps.push(["_pj_"+nm,"__"+nm]);
        reps.push([nm,"_"+nm]);

  });
}
/*
 
 
 
 var ireps = ["__prim__","__ref__","__container__","__selectedLine__","__props__","__prototype__",
             "__typePrototype__","__external__","__protoChild__","__externalReferences__","__element__","__outsideData__",
             "__transform__","__transform1d__","__currentXdata__","__overrides__","__beenModified__","__components__",
             "__setCount__","__setIndex__","__wraps__","__domAttributes__","__reference__","__chain__",
             "__prototypev__","__collected__","__v__","__function__","__variantOf__","__saveCount__","__objectsModified__",
             "__coreModule__","__bounds__","__source__","__installFailure__","__about__","__inCopyTree__","__copy__",
             "__headOfChain__","__inCopyTree__","__default__","__doNotBind__","__computed__","__mfrozen__","__tHidden__",
             "__hitColor__","__protoLine__","__selected__","__descendantSelected__","__doNotUpdate__","__isType__",
             "__fieldType__","__visible__","__status__","__requiresUpdate__","__listeners__","__notSelectable__","__domHidden__",
             "__topNote__","__treeTop__","__leaf__","__prim__","__record__","__fieldStatus__","__autonamed__","__origin__",
             "__objectsModified__","__current__","__saveCountForNote__","__outsideData__","__note__","__range__","__reExpanding__"];

*/

 ireps = ireps.concat(["prim","ref","container","selectedLine","props","prototype",
             "typePrototype","external","protoChild","externalReferences","element","outsideData",
             "transform","transform1d","currentXdata","overrides","beenModified","components",
             "setCount","setIndex","wraps","domAttributes","reference","chain",
             "prototypev","collected","v","function","variantOf","saveCount","objectsModified",
             "coreModule","bounds","source","installFailure","about","inCopyTree","copy",
             "headOfChain","inCopyTree","default","doNotBind","computed","mfrozen","tHidden",
             "hitColor","protoLine","selected","descendantSelected","doNotUpdate","isType",
             "fieldType","visible","status","requiresUpdate","listeners","notSelectable","domHidden",
             "topNote","treeTop","leaf","prim","record","fieldStatus","autonamed","origin",
             "objectsModified","current","saveCountForNote","outsideData","note","range","reExpanding"]);

var ireps = [                  
"_parent", "_name", "_booleanField", "_mfreeze", "_freezeField", "_freezeFields", "_freezeAllFields", "_freezeAllFieldsR", "_tHide", "_setf", "_drop",
"_evalPath", "_findPropertyOnInheritanceChain", "_coreProperty", "_inheritedTreeProperty", "_children", "_getMethod", "_installTreeOfSelections",
"_findInOverride", "_fromNode", "_checkTree", "_checkAncestry1", "_installType", "_findInheritors", "_get", "_hasTreeProto", "_deepApplyFun",
"_applyFunToAncestors", "_deepApplyMeth", "_deepSetProp", "_deepDeleteProps", "_deepDeleteProp", "_findWhichSubtree", "_ancestorWithProperty",
"_funstring1", "_funstring", "_findOwner", "_inheritsPropertyFrom", "_inheritsSomePropertyFrom", "_createChild", "_applyInputF", "_getOutputF",
"_getBeforeDNode", "_applyOutputF", "_isComputed", "_fieldIsThidden", "_installOverrides", "_inWs", "_instantiationCount", "_copyNode",
"_externalize", "_cleanupAfterInternalize", "_addTransform", "_getTranslation", "_countShapes", "_countNodes", "_deepBounds", "_computeBounds",
"_displaceBy", "_domTag", "_clickableAncestor", "_draw", "_dataTransform", "_dataTransform1d", "_internalizeData", "_hasNodeChild", "_getTheNote",
"_atFrontier", "_expandToHere", "_atProtoFrontier"];
 /*
 var ireps = [ "remove","computed",
 
    
            "setNote", "Iwatch", "Ifreeze","Ihide",
             "instantiate", 
            "hide","show"]            
  */           
mkReps(ireps);
console.log(reps);


reps.forEach(function (r) {console.log("\n\n\n==========================");filesReplace(r);});

