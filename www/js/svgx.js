
(function (pj) {
  var om = pj.om;
  var ui = pj.ui;
  var geom  = pj.geom;
  var svg = pj.svg;// for highlighting; this sets the suroundes
  var html = pj.html;

  
  svg.Element.setSurrounders  = function () {
    if (!svg.surroundersEnabled) {
      return;
    }
    var sz = 5000;
    var surs = ui.root.surrounders;
    if (!surs) {
      surs = svg.main.addSurrounders();
    }
    var b = this.bounds(svg.main.contents);
    if (!b) {
      surs.hide();
      surs.refresh();
      return;
    }
    surs.show();
    var rct = b.expandTo(5,5); // Lines have 0 width in svg's opinion, but we want a surround anyway
    var cr = rct.corner;
    var xt = rct.extent;
    // first top and bottom
    var lx = cr.x - sz;
    var ly = cr.y - sz;
    om.log("svg","surrounders ",lx,ly);
    var efc = 1.05; // add this much space around the thing
    var ext = 5;// absolute 
    var efcm = efc - 1;
    var st = {fill:"rgba(0,0,0,0.4)"};
    surs.s0.set({x:lx,y:ly,width:sz*2,height:sz-ext});// above
    surs.s1.set({x:lx,y:cr.y+xt.y + ext,width:sz*2,height:sz}); //below    
    surs.s2.set({x:lx,y:cr.y-ext,width:sz-ext,height:xt.y+2*ext});//to left
    surs.s3.set({x:cr.x+xt.x + ext,y:cr.y-ext,width:sz,height:xt.y + 2*ext});// to right
    surs.visibility = "inherit";
    surs.refresh();
  }
  
  svg.refresh = function () {
    if (svg.main) svg.main.refresh();
  }
  
  // The xdom element means "externalDom; a "regular" page dom element that appears over the svg viewport.
  // It comes with a regular svg rect to delimit it's area.
  //Of course, it behaves differently from other shapes; cannot be scaled or rotated
  // and held in the canvas.domElements LNode
  // fields: omElement /is a dom.OmElement(ement, and __dom__ is the for-real DOM
  // rename to DomShape?
 /*
  * svg.set("Xdom",svg.tag.rect.mk()).namedType();

 
  svg.Xdom.mk = function (o) {
    var rs = svg.Xdom.instantiate();
    var html = o.html;
    if (html) {
      var ome = dom.OmElement.mk(html);
      rs.set("omElement",ome);
    }
    rs.x = 0;
    rs.y = 0;
    rs.width = 100;
    rs.height = 100;
    rs.__setProperties(o,['x','y','width','height']);
    
    rs.fill = "rgba(100,0,0,0.2)";
    rs.fill = "white";
    return rs;
  }

  
    
 svg.Xdom.hideDom = function () { //called to reflect hides further up the ancestry chain.
    if (this.__get("_domHidden__")) {
      return;
    }
    var ome = this.omElement;
    // supervent normal channels; we don't want to actually change the hidden status of the OmElement or Element
    if (ome) {
      ome.hide();
    }
    this.__domHidden = 1;
  }
  
  
  svg.Xdom.showDom = function () { //called to reflect hides further up the ancestry chain.
    if (this.__get("__domHidden")===0) {
      return;
    }
    var ome = this.omElement;
    // supervent normal channels; we don't want to actually change the hidden status of the OmElement or Element
    if (ome) {
      ome.show();
    }
    this.__domHidden = 0;
  }
  
  svg.Xdom.setHtml = function (ht) {
    //this.lastHtml = this.html;
    //this.html = ht;
    var ome = this.omElement;
    if (!ome) {
      var ome = dom.OmElement.mk(ht);
      rs.set("omElement",ome);
    } else {
      ome.setHtml(ht);
    }
  }
  // clear out the dom so it gets rebuilt
  // html's can only live on one canvas at the moment
  svg.Xdom.refresh = function () {
    // an html element might have a target width in local coords
    var xf = ui.root.transform;
    if (xf) {
      om.log("svg","xf ",xf.translation.x,xf.translation.y,xf.scale);
    }
    var offset=this.offset;
    var offx = offset?(offset.x?offset.x:0):0;
    var offy = offset?(offset.y?offset.y:0):0;
    var ome = this.omElement;
    if (!ome) return 
    var thisHere = this;
    var clickInstalled = false;
    // be sure the __dom__ matches the element's  dom; ow there is a new element
    ome.install($(svg.main.container));
    var pos = this.__toGlobalCoords(geom.Point.mk(0,0),ui.root);
    var scwd = 0;
    var scd = this.__scalingDownHere();
    if (this.width) {
      var scwd = this.width*scd;
    }
    
    var xf = svg.main.contents.__get("transform");
    if (xf) {
      var p = pos.applyTransform(xf);
    } else {
      p = pos;
    }
    var ht = ome.height();
    var st = {"pointer-events":"none",position:"absolute",left:(offx + p.x)+"px",top:(offy+p.y)+"px"};
    if (scwd) {
      st.width = scwd;
      om.log("svg",'scwd',scwd);
    }
    ome.css(st);
    var ht = ome.height();
    var  awd = ome.width();
    om.DNode.refresh.call(this);// draw the rectangle
  }
  
  */
  
  svg.Root.setZoom = function (trns,ns) {
    var cntr = geom.Point.mk(this.width()/2,this.height()/2);// center of the screen
    var ocntr = trns.applyInverse(cntr);
    trns.scale = ns;
    var ntx = cntr.x - (ocntr.x) * ns;
    var nty = cntr.y - (ocntr.y) * ns;
    var tr = trns.translation;
    tr.x = ntx;
    tr.y = nty;
  }
  
  
  // zooming is only for the main canvas, at least for now
  function zoomStep(factor) {
    var trns = svg.main.contents.transform;
    if (!trns) return;
    var s = trns.scale;
    om.log("svg","zoom scaling",s);
    svg.main.setZoom(trns,s*factor);
    svg.refresh();
  }
  
  var nowZooming = false;
  var zoomFactor = 1.1;
  var zoomInterval = 150;
  function zoomer() {
    if (nowZooming) {
      zoomStep(cZoomFactor);
      setTimeout(zoomer,zoomInterval);
    }
  }
  
  
  svg.startZooming = function () {
    om.log("svg","start zoom");
    cZoomFactor = zoomFactor;
    if (!nowZooming) {
      nowZooming = 1;
      zoomer();
    }
  }
  
  svg.startUnZooming = function () {
    cZoomFactor = 1/zoomFactor;
    if (!nowZooming) {
      nowZooming = 1;
      zoomer();
    }
  }
  
  svg.stopZooming = function() {
    om.log("svg","stop zoom");
    nowZooming = 0;
  }
 
  

  svg.initDiv = function (dv) {
    var jdv = $(dv);
    var wd = jdv.width();
    var ht = jdv.height();
    var dom = pj.dom;
    var svgDiv =  dom.El('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>');;
    svgDiv.install(dv);
    svg.init(svgDiv.__element[0],wd,ht);
  }
  
  
  
  
  svg.Element.checkNode = function () {
    var el = this.__element;
    if (el) {
      var pth = this.__pathAsString();

      var pr = this.__parent;
      var pel = pr.__element;
      var cpel = el.parentElement;
      if (cpel !== pel) {
        om.log("svg","Bad node check for ",pth,pel,cpel);
      }
    } 
  }
  
  om.LNode.checkNode = svg.Element.checkNode;
  
  svg.Element.checkSvgTree = function () {
    this.checkNode();
    this.__iterTreeItems(function (nd) {
      if (nd.checkSvgTree) nd.checkSvgTree();
    },1);
  }
  
  om.LNode.checkSvgTree = svg.Element.checkSvgTree;
  
  svg.checkMain = function () {
    svg.main.contents.checkSvgTree();
  }
  
  

  svg.surrounderP = svg.Element.mk('<rect fill="rgba(0,0,0,0.4)"  x="0" y="0" width="100" height="10"/>');
  svg.surrounderP["pointer-events"] = "none";
  
  
  // svg serialization: the following group of function is for writing out the svg dom as a string, so that it can be shown independent of prototypejungle
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
        console.log("string",ch.__name);
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
    //rs += "debugger;\n";
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
    rs += svg.genFitfun(bnds);
    rs += 'document._addEventListener("DOMContentLoaded",fit);\n';
    rs += 'window.onresize=fit;\n';
    rs += '</script>\n';
    return rs;
  }
 // write out a complete svg file for this root
  svg.Root.svgString = function () {
    var cn = this.contents;
    var bnds = cn.bounds();
    var rs = '<script>\n';
    rs  = svg.genHtmlPreamble(bnds);
    var wd = bnds.extent.x;
    var ht = bnds.extent.y;
    var ytr = -bnds.corner.y;
    var xtr = -bnds.corner.x;
    var tr = 'transform="translate('+xtr+' '+ytr+')"';
    rs+='<svg id="svg" baseProfile="full" width="100%" height="90%" xmlns:svg="http://www.w3.org/2000/svg">\n';
    var dst = [rs];
    this.contents.svgStringR(dst,tr);
    dst += '</svg>\n</body>\n</html>\n';
    return dst;
  }
 
 //======= end serialize svg
 
 // for selection in the inspector
 
 
 
  om.selectCallbacks = [];

  // what to do when an element is selected by clicking on it in graphics or tree
  om.DNode.__select = function (src,dontDraw) { // src = "svg" or "tree"
    //if (src === "svg") {
   //   om.unselect();
    //}
    om.selectedNodePath =this.__pathOf(pj);
    // this selectedNode is only for debugging
    om.selectedNode = this;
    this.__selected = 1;
    var thisHere = this;
    this.setSurrounders();// highlight
    if (src === "svg") {
      om.selectCallbacks.forEach(function (c) {
        c(thisHere);
      });
      return;

      // this will need modification when there is more than one canvas
/*
      svg.refresh();
      var thisHere = this;
      svg.selectCallbacks.forEach(function (c) {
        c(thisHere);
      });*/
    } else if (om.inspectMode) {
        return;
        __draw.mainCanvas.surrounders = (this===ui.root)?undefined:this.computeSurrounders(5000);
      svg.refresh();
    }


  }

  
  
  svg.Root.addSurrounders = function () {
    if (!svg.surroundersEnabled) {
      return;
    }
    var cn = this.contents;
    if (cn.surrounders) {
      return cn.surrounders;
    }
    var surs = svg.tag.g.mk();//om.LNode.mk();
    for (var i=0;i<4;i++) {
      var rct = svg.surrounderP.instantiate();
      var nm = "s"+i;
      surs.set(nm,rct);
    }
    surs.visibility="visible";
    cn.set("surrounders",surs);
    return surs;
  }
 
  
 // this is the nearest ancestor of the hovered object which has a forHover method
  
  svg.hoverAncester = undefined;
  // the node currently hovered over
  
  svg.hoverNode = undefined;
  
  
  om.DNode.__isSelectable = function () {
    return !this.__notSelectable;
  }
  
  om.LNode.__isSelectable = function () {
    return false;
  }
  
  om.nodeMethod("__selectableAncestor",function () {
    var cv = this;
    while (true) {
      if (!cv.__notSelectable) return cv;
      if (cv === ui.root) return cv;
      cv = cv.__parent;
     
    }
  });
  
  om.nodeMethod("__clickableAncestor",function () {
    return this.__ancestorWithProperty("clickFunction");
  });
  
  
  
  svg.Root.activateInspectorListeners = function (container) {
    //var cel = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    //cel.setAttribute("width",this.width)
   // cel.setAttribute("height",this.height);
   // cel.setAttribute("version","1.1");
    //if (svg.style) {
    //   cel.style.border = svg.style.border;
    //}
    //this.container = container;
    //container.appendChild(cel);
    //this.__element =  cel;
   // var thisHere = this;
    // a rectangle for checking what's under a hovered object
    
      var cel = this.__element;
      var thisHere = this;
    
    cel.addEventListener("mousedown",function (e) {
      // for bubbles, the front Element is the bubble over which the user is now hovering. When there is a click, this is the target
      if (svg.frontShape) {
        var clka = svg.frontShape.__clickableAncestor();
        if (clka) {
          clka.clickFunction();
        }
        return;
      }
      var trg = e.target;
      var id = trg.id;
      var px = e.offsetX===undefined?e.layerX:e.offsetX;
      var py = e.offsetY===undefined?e.layerY:e.offsetY;
      thisHere.refPoint = geom.Point.mk(px,py); // refpoint is in svg coords (ie before the viewing transformation)
      var iselnd = trg.__prototypeJungleElement;
      om.log("svg","mousedown ",id);
      //var pth = svg.elementPath(trg);

      //om.log("svg","SELECTED ",pth.join("."));
      if (!iselnd) {
        if (om.inspectMode) {
          thisHere.refTranslation = thisHere.contents.__getTranslation().copy();
        }
        return;
      }
      //var iselnd = om.evalPath(ui.root,pth);
      if (1 || om.inspectMode) {
        //var selnd = iselnd.__selectableAncestor();
        iselnd.__select("svg");
        var dra = om.ancestorWithProperty(iselnd,"draggable");
        if (dra) {
          om.log("svg",'dragging ',dra.__name);
          thisHere.dragee = dra;
          thisHere.refPos = geom.toGlobalCoords(dra);
        } else {
          delete thisHere.dragee;
          delete thisHere.refPos;
        }
      } else {
        var clka = iselnd.__clickableAncestor();
        if (clka) {
          clka.clickFunction();
        }
      }
    });
    
    
      
    cel.addEventListener("mousemove",function (e) {
      var px = e.offsetX===undefined?e.layerX:e.offsetX;
      var py = e.offsetY===undefined?e.layerY:e.offsetY;
      var ps = geom.Point.mk(px,py);
      // for bubbles, the front Element is expanded, and covers other shapes. We want to be able to __select things beneath it
      if (thisHere.refTranslation) { //panning
        var cp = geom.Point.mk(px,py);
        var pdelta = cp.difference(thisHere.refPoint);
        var tr = thisHere.contents.__getTranslation();
        var s = thisHere.contents.transform.scale;
        tr.x = thisHere.refTranslation.x + pdelta.x;// / s;
        tr.y = thisHere.refTranslation.y + pdelta.y;//
        om.log("svg","drag","doPan",pdelta.x,pdelta.y,s,tr.x,tr.y);
        svg.main.refresh();
        return;
      }
      var newHover = undefined;
      var newHoverAncestor = undefined;
      var refPoint = thisHere.refPoint;
      if (!thisHere.refPos && !om.inspectMode) {// no hovering in inspect mode
        if (!newHover) {
          var nd =svg.eventToNode(e);
          if ((nd === undefined) || (nd === svg.hoverNode)) {
            return;
          }
          newHover = nd;
          om.log("svg","Hovering over ",nd.__name);
          if (nd === ui.root) return;
          var newHoverAncestor = nd.__ancestorWithProperty("forHover");
          if (newHoverAncestor === svg.hoverAncestor) {
            return;
          }
        }
        if (svg.hoverAncestor) {
          svg.hoverAncestor.forUnhover();
          if (svg.frontShape === svg.hoverAncestor) {
            svg.frontShape["pointer-events"] = "visible";
            svg.frontShape = undefined;
          }
        }
    
        om.log("svg","Hovering ancestor ",newHoverAncestor?newHoverAncestor.__name:"none");
        svg.hoverAncestor = newHoverAncestor;
        
        if (newHoverAncestor) {
          newHoverAncestor.forHover();
        }
        return;
      }
      var mvp = geom.Point.mk(px,py);
      if (refPoint) {
        var delta = mvp.difference(refPoint);
        om.log("svg","mouse move ",id,delta.x,delta.y);
      }
          
      var dr = thisHere.dragee;
      if (dr) {
        debugger;
        var trg = e.target;
        var id = trg.id;
         var rfp = thisHere.refPos;
        //var tr = thisHere.contents.__getTranslation();
        var s = thisHere.contents.transform.scale;
     
        var npos = rfp.plus(delta.times(1/s));
        om.log("svg","drag",dr.__name,"delta",delta.x,delta.y,"npos",npos.x,npos.y);
        geom.movetoInGlobalCoords(dr,npos);
        dr.setSurrounders();// highlight
        var drm = dr.onDrag;
        if (drm) {
          dr.onDrag(delta);
        }
      }
    });
    cel.addEventListener("mouseup",function (e) {
      delete thisHere.refPoint;
      delete thisHere.refPos;
      delete thisHere.dragee;
      delete thisHere.refTranslation;
    });
   
  }
   
   
  svg.Root.setContents = function (cn) {
    om.error("OBSOLETE");
    if (this.contents === cn) {
      return;
    }
    //var rte = this.__element;
    //while (rte.firstChild) {
    //  rte.removeChild(rte.firstChild);
    //}
   // this.set("contents",cn);
    this.contents = cn;
    var xf = cn.transform;
    if (!xf) {
      cn.set("transform",geom.Transform.mk());
    }
    var ff = cn.fitFactor;
    if (ff) {
      this.fitFactor = ff;
    }
  }
  
   
  // when inspecting dom, the canvas is a div, not really a canvas
  svg.Root.addButtons = function (navTo) {
    var plusbut,minusbut,navbut;
    var div = this.__container;
    this.plusbut = plusbut = html.Element.mk('<div class="button" style="position:absolute;top:0px">+</div>');
    this.minusbut = minusbut = html.Element.mk('<div class="button" style="position:absolute;top:0px">&#8722;</div>');
    this.navbut = navbut = html.Element.mk('<div class="button" style="position:absolute;top:0px">'+navTo+'</div>');
    plusbut.__addToDom(div);
    minusbut.__addToDom(div);
    navbut.__addToDom(div);
    this.initButtons();
  }

  svg.Root.positionButtons = function (wd) {
    this.plusbut.$css({"left":(wd - 50)+"px"});
    this.minusbut.$css({"left":(wd - 30)+"px"});
    this.navbut.$css({"left":"0px"});
  }
  
  svg.Root.initButtons = function () {
    this.plusbut.addEventListener("mousedown",svg.startZooming);
    this.plusbut.addEventListener("mouseup",svg.stopZooming);
    this.plusbut.addEventListener("mouseleave",svg.stopZooming);
    this.minusbut.addEventListener("mousedown",svg.startUnZooming);
    this.minusbut.addEventListener("mouseup",svg.stopZooming);
    this.minusbut.addEventListener("mouseleave",svg.stopZooming);
  }
  
    
    
    
  /*
  om.DNode.__resetComputedNode = function (prp,forLNode) {
    var cv = this[prp];
    if (cv) {
      cv.__svgClear();
    } else {
      cv = om.declareComputed(this.set(prp,forLNode?om.LNode.mk():svg.tag.g.mk()));
    }
    return cv;
  }
  */
  /*
  om.resetComputedLNode = function (nd,prp) {
    return nd.__resetComputedNode(prp,1);
  }
  
  om.resetComputedDNode = function (nd,prp) {
    return nd.__resetComputedNode(prp);
  }
  
  */  
})(prototypeJungle);

  