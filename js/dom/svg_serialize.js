// Copyright 2019 Chris Goad
// License: MIT

vars.svgIncludeIds = true;

// svg serialization:for writing out the svg dom as a string, so that it can be shown independent of PrototypeJungle
/* Example use:
  dom.svgMain.svgString(200,10);
*/

const compressNumber = function (s) {
  let numc,trailingComma;
  if (s[s.length-1] ===',') {
    numc = s.substring(0,s.length-1);
    trailingComma = ',';
  } else {
    numc = s;
    trailingComma = '';
  }
  if (isNaN(Number(numc))) {
    return numc+trailingComma;
  }
  let m = numc.match(/(\-*)(\d*)(\.*)(\d*)(e*)(.*)/);
  let mn = m[1];
  let intp =  m[2];
  let decp = m[3];
  let decimals = m[4];
  let ep = m[5];
  let exp = m[6];
  let rs = mn + intp + decp + decimals.substring(0,5) + ep + exp+trailingComma;
  return rs;
}


const compressNumbers = function (str) {
  let sp = str.split(' ');
  let mp = sp.map(compressNumber);
  return mp.join(' ');
}
  
  

const toPointsString = function (pnts) {
  let rs = "";
  let numd = 4;
  let first = true;
  pnts.forEach(function (p) {
    if (!first) {
      rs += " ";
    }
    first = false;
    rs += core.nDigits(p.x,numd)+","+core.nDigits(p.y,numd);
  });
  return rs;
}
  // for the outermost g, a transform is sent in
svg.tag.g.__svgStringR = function (dst,itr) {
  let tr;
  if (this.__hidden()) {
    return;
  }
  if (itr) {
    dst[0] += '<g id="outerG" '+itr+'>\n';
  } else {
    let ids = vars.svgIncludeIds?'id="'+core.stringPathOf(this,core.root,'_')+'" ':'';
    tr = this.transform;
    if (tr) {
      dst[0] +="<g "+ids+tr.svgString()+">\n";
    } else {
      dst[0] += "<g "+ids+">\n";
    }
  }
  this.__iterDomTree(function (ch) {
    if (core.ArrayNode.isPrototypeOf(ch) || SvgElement.isPrototypeOf(ch)) {
      ch.__svgStringR(dst);
    }
  });
  dst[0] += "\n</g>\n";
}
  
  
  
core.ArrayNode.__svgStringR = svg.tag.g.__svgStringR;

svg.tag.g.svgString = function () {
  let dst = [""];
  this.__svgStringR(dst);
  return dst[0];
}
  
 
const genFitfun = function (bnds) {
  let rs = "function fit() {\n";
  rs += ' var ff = 0.9;\n';
  rs += '  var wd = '+bnds.extent.x+';\n';
  rs += '  var ht = '+bnds.extent.y+';\n';
  rs += '  var xtr = '+bnds.corner.x+'-(0.5*wd*(1-ff));\n';
  rs += '  var ytr = '+bnds.corner.y+'-(0.5*ht*(1-ff));\n';
  rs += '  var wnwd = window.innerWidth;\n';
  rs += '  var wnht = window.innerHeight*(0.90);\n';
  rs += '  var swd = wnwd/wd;\n';
  rs += '  var sht = wnht/ht;\n';
  rs += '  var s = Math.min(swd,sht)*ff;\n';
  rs += '  var og = document.getElementById("outerG");\n';
  rs += '  og.setAttribute("transform","translate("+(-xtr*s)+" "+(-ytr*s)+") scale("+s+")");\n';
  rs += '}\n'
  return rs;
}
  
const genHtmlPreamble = function () {
  let rs = "<!DOCTYPE html>\n";
  rs += '<html>\n<body style="overflow:hidden">\n<script>\n';
  rs += '</script>\n';
  return rs;
}


 // write out a complete svg file for this root
SvgRoot.svgString = function (viewWd,padding,aspectRatio) {
  let ar;
  let cn = this.contents;
  cn.__removeIfHidden(); 
  let bnds = cn.bounds();
  let ex = bnds.extent;
  if (aspectRatio) {
    ar = aspectRatio;
  } else if (ex.y === 0) {
    ar = 10;
  } else {
    ar = Math.min(10,ex.x/ex.y);
  }
  vars.svgAspectRatio = ar;
  let viewHt = viewWd / ar;
  vars.svgAspectRatio = ar;
  let color = core.root.backgroundColor;
  let destrect = Rectangle.mk(Point.mk(padding,padding/ar),Point.mk(viewWd-2*padding,viewHt-2*padding/ar));
  let tr = 'transform = "'+bnds.transformTo(destrect).toSvg()+'"';
  let rs = '<svg id="svg" baseProfile="full" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" ';
  if (color) {
    rs += 'style = "background:'+color+'" ';
  }
  rs += 'viewBox="0 0 '+ viewWd + ' ' + viewHt + '">\n';
  let dst = [rs];
  this.contents.__svgStringR(dst,tr);
  dst += '</svg>';
  let cdst = compressNumbers(dst); 
  return cdst;
}
 
 export {compressNumber,compressNumbers};
