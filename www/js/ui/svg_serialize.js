
(function (pj) {
  var om = pj.om;
  var ui = pj.ui;
  var geom  = pj.geom;
  var svg = pj.svg;
  var html = pj.html;

  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

// svg serialization:for writing out the svg dom as a string, so that it can be shown independent of prototypejungle

  svg.toPointsString = function (pnts) {
    var rs = "";
    var numd = 4;
    var first = 1;
    pnts.forEach(function (p) {
      if (!first) rs += " ";
      first = 0;
      rs += om.nDigits(p.x,numd)+","+om.nDigits(p.y,numd);
    });
    return rs;
  }
  // for the outermost g, a transform is sent in
  svg.tag.g.svgStringR = function (dst,itr) {
    if (this.hidden()) {
      return;
    }
    if (itr) {
      dst[0] += '<g id="outerG" '+itr+'>\n';
    } else {
      var tr = this.transform;
      if (tr) {
        dst[0] +="<g "+tr.svgString()+">\n";
      } else {
        dst[0] += "<g>\n";
      }
    }
     
    this.__iterDomTree(function (ch) {
      if (om.LNode.isPrototypeOf(ch) || svg.Element.isPrototypeOf(ch)) {
        ch.svgStringR(dst);
      }
    },1);
    dst[0] += "\n</g>\n";
  }
  
  
  
  om.LNode.svgStringR = svg.tag.g.svgStringR;
  
  svg.tag.g.svgString = function () {
    var dst = [""];
    this.svgStringR(dst);
    return dst[0];
  }
  
 
  svg.genFitfun = function (bnds) {
    var rs = "function fit() {\n";
    rs += ' var ff = 0.90;\n';
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
  
  svg.genHtmlPreamble = function (bnds) {
    var rs = "<!DOCTYPE html>\n";
    rs += '<html>\n<body style="overflow:hidden">\n<script>\n';
    //rs += svg.genFitfun(bnds);
    //rs += 'document._addEventListener("DOMContentLoaded",fit);\n';
    //rs += 'window.onresize=fit;\n';
    rs += '</script>\n';
    return rs;
  }
  
 // write out a complete svg file for this root
  svg.Root.svgString = function (viewWd,padding) {
    debugger;
    var ff = 0.8;
    var pd = (1 - ff)/2
    var cn = this.contents;
    cn.__removeIfHidden(); 
    var bnds = cn.bounds();
    var ex = bnds.extent;
    var ar = ex.y/ex.x;
    var viewHt = viewWd * ar;
    var rs = '<script>\n';
    //rs  = svg.genHtmlPreamble(bnds);
    rs = "";
    var destrect = geom.Rectangle.mk(geom.Point.mk(padding,padding),geom.Point.mk(viewWd-2*padding,viewHt-2*padding));
    var tr = 'transform = "'+bnds.transformTo(destrect).toSvg()+'"';
    /*
    var wd = bnds.extent.x;
    var ht = bnds.extent.y;
    var ytr = pd*ht-bnds.corner.y; 
    var xtr = pd*wd-bnds.corner.x;
    var xsc = viewWd/wd; 
    var ysc = viewHt/ht;
    var sc = ff*Math.min(xsc,ysc);*
    var tr = 'transform="translate('+xtr+' '+ytr+') scale('+sc+')"';
    */
    rs += '<svg id="svg" baseProfile="full" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 '+
       viewWd + ' ' + viewHt + '">\n';
    //rs+='<svg id="svg" baseProfile="full" width="100%" height="90%" xmlns:svg="http://www.w3.org/2000/svg">\n';
     //   rs+='<svg id="svg" baseProfile="full" width="100%" height="90%" xmlns:svg="http://www.w3.org/2000/svg">\n';

    var dst = [rs];
    this.contents.svgStringR(dst,tr);
    dst += '</svg>';//\n</body>\n</html>\n';
    return dst;
  }
 
 //======= end serialize svg
 
 
//end extract


})(prototypeJungle);

