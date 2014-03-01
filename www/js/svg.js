(function (__pj__) {
  var om = __pj__.om;
  var geom  = __pj__.geom;
  var dom = __pj__.dom;
  var svg =  __pj__.set("svg",__pj__.om.DNode.mk());
  __pj__.draw = svg; // synonym
  svg.__external__ = 1;

  svg.surroundersEnabled = 1;
  
  svg.mkWithStyle = function (pr,style) {
    var rs = Object.create(pr);
    if (style) {
      rs.set("style",dom.Style.mk(style));
    } else {
      rs.set("style",dom.Style.mk());
    }
    return rs;
  }
  
  
  
  svg.mkWithVis = function (pr) {
    var rs = Object.create(pr);
    rs.visibility = "inherit";
    return rs;
  }
  
  svg.__external__ = 1;
  svg.NS = "http://www.w3.org/2000/svg";
  
  // a Root is separate svg element. At the moment only one is in use: svg.main
  svg.set("Root",om.DNode.mk()).namedType();
  svg.Root.mk = function (wd,ht) {
    var rs = Object.create(svg.Root);
    rs.width = wd?wd:200;
    rs.height = ht?ht:200;
    rs.fitFactor = 0.98;
    return rs;
  }
  
  
  
  svg.Root.resize = function (wd,ht) {
    var cel = this.__element__;
    if (cel) {
      cel.setAttribute("width",wd)
      cel.setAttribute("height",ht);
    }
    this.width = wd;
    this.height = ht;
  }
  
 
  svg.set("shape",om.DNode.mk()).namedType();
  svg.shape.mk = function () {return Object.create(svg.shape)};
  
  svg.shape.visible = function () {
    var v = this.visibility;
    return (v===undefined) || (v==="visible")||(v==="inherit");
  }
  
  svg.shape.removeElement = function (bringToFront) {
    var el = this.__element__;
    if (!el) return;
    var pr = this.__parent__;
    var pel = pr.__element__;
    if (!pel) return;
    pel.removeChild(el);
    if (bringToFront) {
      svg.frontShape = this;
      this["pointer-events"] = "none";
      pel.appendChild(el);
    }
    delete this.element;
  }
  
  om.LNode.removeElement = svg.shape.removeElement;
  
  svg.shape.bringToFront = function () {
    this.removeElement(1);
  }
  
  svg.shape.hide = function () {
    this.visibility = "hidden";
    return this;
    this.hidden = 1;
    this.style.display = "none";
    return this;
  }
  
  svg.shape.show = function () {
    this.visibility = "inherit";
    return this;
    this.hidden = 0;
    this.style.display = "block";
    return this;
  }
  
  svg.refresh = function () {
    var st = Date.now();
    om.root.draw();
    var tm = Date.now() - st;
    console.log("Draw time",tm);
  }
  svg.updateVisibility = function (hs,sh) {
    om.error("obsolete");
    alert("updateVisibility obsolete");
    var h = parseInt(hs);
    sh.visibility = h?"hidden":"inherit";
    svg.refresh();
  }
  

  svg.commonAttributes = {"visibility":"S","pointer-events":"S","stroke":"S",fill:"S","stroke-width":"N","text-anchor":"S"};
  
  svg.set("g",svg.shape.mk()).namedType();
  svg.g.mk = function () {
    return svg.mkWithVis(svg.g);
  }
  
  om.mkRoot = svg.g.mk;
  
  svg.g.set("attributes",om.LNode.mk());// no attributes, but might have style
  
  
  svg.set("line",svg.shape.mk()).namedType();
  svg.line.set("attributes",om.lift({x1:"N",y1:"N",x2:"N",y2:"N"}));

  
  svg.set("rect",svg.shape.mk()).namedType();
  svg.rect.set("attributes",om.lift({x:"N",y:"N",width:"N",height:"S"}));

  svg.rect.mk = function (x,y,width,height,st) {
    var rs = svg.mkWithVis(svg.rect);
    if (x === undefined) {
      return rs;
    }
    rs.x = x;
    rs.y = y;
    rs.width = width;
    rs.height = height;
    return rs;
  }
  

  svg.rect.toRectangle = function () {
    var crn = geom.Point.mk(this.x,this.y);
    var xt = geom.Point.mk(this.width,this.height);
    var rs = geom.Rectangle.mk(crn,xt);
    return rs;
  }
  
  geom.Rectangle.toRect = function () {
    var rs = svg.rect.mk();
    var crn = this.corner;
    var xt = this.extent;
    rs.x = crn.x;
    rs.y = crn.y;
    rs.width = xt.x;
    rs.height = xt.y;
  }
  
  
  svg.shape.getBBox = function () {
    var el = this.__element__;
    if (el) {
      return el.getBBox();
    }
  }
  
  svg.shape.bounds = function () {
    var el = this.__element__;
    if (el) {
      var bb = el.getBBox();
      console.log("BBox",bb);
      var rs = svg.rect.toRectangle.call(bb);
      var gc = this.toGlobalCoords(rs.corner,om.root);
      var sc = this.scalingDownHere(om.root,1);// 1 = notTop
      var grs = geom.Rectangle.mk(gc,rs.extent.times(sc));
      console.log("scaling ",sc);
      return grs;
    }
  }
  
  
  svg.set("circle",svg.shape.mk()).namedType();
  svg.circle.set("attributes",om.lift({r:"N",cx:"N",cy:"S"}));
 
  svg.circle.contains = function (p) {
    var r = this.radius;
    var lp = this.toLocalCoords(p);
    debugger;
  }
  
  svg.set("text",svg.shape.mk()).namedType();
  svg.text.set({"font-family":"Arial","font-size":"10",fill:"black"});
  svg.text.mk = function () {return svg.mkWithVis(svg.text);}
  svg.text.set("attributes",om.lift({x:"N",y:"N","font-family":"S","font-size":"N"}));
  svg.text.update = function () {
    var d = this.data;
    var tp = typeof(d);
    if (tp === "number") {
      this.setText(d+"");
    } else if (tp === "string") {
      this.setText(d);
    }
  }
  
  svg.elementPath = function (el) {
    var rs = [];
    var cel = el;
    while (cel.tagName !== "svg") {
      rs.push(cel.id);
      cel = cel.parentElement;
    }
    rs.pop(); // don't need that last step
    rs.reverse();
    return rs;
  }
  
  
  om.selectCallbacks = [];

  // what to do when an element is selected by clicking on it in graphics or tree
  om.DNode.select = function (src,dontDraw) { // src = "svg" or "tree"
    if (src === "svgg") {
      om.unselect();
    }
    om.selectedNodePath =this.pathOf(__pj__);
    // this selectedNode is only for debugging
    om.selectedNode = this;
    this.__selected__ = 1;
    var thisHere = this;
    this.setSurrounders();// highlight
    if (src === "svg") {
      om.selectCallbacks.forEach(function (c) {
        c(thisHere);
      });
      return;

      // this will need modification when there is more than one canvas

      svg.refresh();
      var thisHere = this;
      draw.selectCallbacks.forEach(function (c) {
        c(thisHere);
      });
    } else if (om.inspectMode) {
        return;
        draw.mainCanvas.surrounders = (this===om.root)?undefined:this.computeSurrounders(5000);
      svg.refresh();
    }


  }

  svg.surrounderP = svg.shape.mk('<rect fill="rgba(0,0,0,0.4)"  x="0" y="0" width="100" height="10"/>');
  svg.surrounderP = svg.shape.mk('<rect stroke="black" fill="green"  x="0" y="0" width="100" height="10"/>');

  
  svg.surrounderP["pointer-events"] = "none";
   
  svg.Root.addSurrounders = function () {
    if (!svg.surroundersEnabled) {
      return;
    }
    var cn = this.contents;
    if (cn.surrounders) {
      return cn.surrounders;
    }
    var surs = svg.g.mk();//om.LNode.mk();
    for (var i=0;i<4;i++) {
      var rct = svg.surrounderP.instantiate();
      //var rct = svg.rect.mk(0,0,10,10,{fill:"rgba(0,0,0,0.4)"});
      //rct["pointer-events"] = "none";
      var nm = "s"+i;
      surs.set(nm,rct);
      //surs.push(rct);
    }
    surs.visibility="hidden";
    cn.set("surrounders",surs);
    return surs;
  }
 
  svg.eventToNode = function (e) {
      var trg = e.target;
      var pth = svg.elementPath(trg);
      //om.selectedNodePath = pth;
      return om.root.evalPath(pth);
  }
  // this is the nearest ancestor of the hovered object which has a forHover method
  
  svg.hoverAncester = undefined;
  // the node currently hovered over
  
  svg.hoverNode = undefined;
  
  
  om.DNode.isSelectable = function () {
    return !this.__notSelectable__;
  }
  
  om.LNode.isSelectable = function () {
    return false;
  }
  
  om.nodeMethod("selectableAncestor",function () {
    var cv = this;
    while (true) {
      if (!cv.__notSelectable__) return cv;
      if (cv === om.root) return cv;
      cv = cv.__parent__;
     
    }
  });
  
  om.nodeMethod("clickableAncestor",function () {
    return this.ancestorWithProperty("clickFunction");
  });
  
  svg.Root.init = function (container) {
    var cel = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    cel.setAttribute("width",this.width)
    cel.setAttribute("height",this.height);
    cel.setAttribute("version","1.1");
    if (svg.style) {
       cel.style.border = svg.style.border;
    }
    this.container = container;
    container.appendChild(cel);
    this.__element__ =  cel;
    thisHere=this;
    
    
    
    cel.addEventListener("mousedown",function (e) {
      // for bubbles, the front shape is the bubble over which the user is now hovering. When there is a click, this is the target
      if (svg.frontShape) {
        var clka = svg.frontShape.clickableAncestor();
        if (clka) {
          clka.clickFunction();
        }
        return;
      }
      var trg = e.target;
      var id = trg.id;
      var px = e.offsetX;
      var py = e.offsetY;
      thisHere.refPoint = geom.Point.mk(px,py);
      console.log("mousedown ",id);
      var pth = svg.elementPath(trg);

      console.log("SELECTED ",pth.join("."));
      if (pth.length===0) {
        if (om.inspectMode) {
          thisHere.refTranslation = thisHere.contents.getTranslation().copy();
        /*
        var rc = thisHere.relCanvas(e);
        om.log("untagged","relCanvas",rc.x,rc.y);
        thisHere.refPoint = rc;
        var trns = thisHere.transform();
        if (trns) {
          var tr = trns.translation;
          thisHere.refTranslation = geom.Point.mk(tr.x,tr.y);
        }
        om.log("untagged",rc.x,rc.y);
        */
        }
        return;
      }
      var iselnd = om.root.evalPath(pth);
      if (om.inspectMode) {
        var selnd = om.root.evalPath(pth).selectableAncestor();
        selnd.select("svg");
        var dra = selnd.ancestorWithProperty("draggable");
        if (dra) {
          console.log('dragging ',dra.__name__);
          thisHere.dragee = dra;
          thisHere.refPos = dra.toGlobalCoords();
        } else {
          delete thisHere.dragee;
          delete thisHere.refPos;
        }
      } else {
        debugger;
        var clka = iselnd.clickableAncestor();
        if (clka) {
          clka.clickFunction();
        }
      }
    });
    
    
  geom.degreesToRadians =  function (n) { return Math.PI * (n/180);}
  
  geom.radiansToDegrees =  function (n) { return 180 * (n/Math.PI);}

    cel.addEventListener("mousemove",function (e) {
      var ps = geom.Point.mk(e.offsetX,e.offsetY);
      // for bubbles, the front shape is expanded, and covers other shapes. We want to be able to select things beneath it
      if (thisHere.refTranslation) { //panning
        var px = e.offsetX;
        var py = e.offsetY;
        var cp = geom.Point.mk(px,py);
        var pdelta = cp.difference(thisHere.refPoint);
        var tr = thisHere.contents.getTranslation();
        var s = thisHere.contents.transform.scale;
        tr.x = thisHere.refTranslation.x + pdelta.x;// / s;
        tr.y = thisHere.refTranslation.y + pdelta.y;//
        console.log("drag","doPan",pdelta.x,pdelta.y,s,tr.x,tr.y);
        svg.refresh();
        return;
      }
      if (svg.frontShape) {
        var xf = svg.main.contents.get("transform");
        var p = xf.applyInverse(ps);
        var inf = svg.frontShape.contains(p);
      } else {
        inf = false;
      }
      var refPoint = thisHere.refPoint;
      if (!thisHere.refPos && !om.inspectMode) {// no hovering in inspect mode
        var nd = svg.eventToNode(e);
        if ((nd === undefined) || (nd === svg.hoverNode)) {
          return;
        }
        console.log("Hovering over ",nd.__name__);
        if ((nd === om.root) && inf) return;
        svg.hoverNode = nd;
        var hva = nd.ancestorWithProperty("forHover");
      
        if (hva === svg.hoverAncestor) {
          return;
        }
        if (svg.hoverAncestor) {
          svg.hoverAncestor.forUnhover();
          if (svg.frontShape === svg.hoverAncestor) {
            svg.frontShape["pointer-events"] = "visible";
          }
        }
    
        console.log("Hovering ancestor ",hva?hva.__name__:"none");
        svg.hoverAncestor = hva;
        
        if (hva) {
          hva.forHover();
        }
        return;
      }
      var px = e.offsetX;
      var py = e.offsetY;
      var mvp = geom.Point.mk(px,py);
      if (refPoint) {
        var delta = mvp.difference(refPoint);
        console.log("mouse move ",id,delta.x,delta.y);
      }
          
      var dr = thisHere.dragee;
      if (dr) {
        var trg = e.target;
        var id = trg.id;
         var rfp = thisHere.refPos;
        var npos = rfp.plus(delta);
        console.log("drag",dr.__name__,"delta",delta.x,delta.y,"npos",npos.x,npos.y);
        //var tr = dr.getTranslation();
        //console.log(" before drag",tr.x,tr.y);
        dr.moveto(npos);
        //console.log(" after drag",tr.x,tr.y);

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
  
  svg.init = function (container,wd,ht) {
    if (svg.main) return;
    svg.main = svg.Root.mk(wd,ht);
    svg.main.init(container);
  }
  
  
  svg.Root.setContents = function (cn) {
    if (this.contents === cn) {
      return;
    }
    var rte = this.__element__;
    var fc = rte.firstChild;
    if (fc) {
      rte.removeChild(fc);
    }
    this.contents = cn;
    var xf = cn.transform;
    if (!xf) {
      cn.set("transform",geom.Transform.mk());
    }
    //this.addSurrounders();
    
  }
    
  om.DNode.isShape = function () {
    return svg.shape.isPrototypeOf(this);
  }
  
  om.LNode.isShape = function () {
    return true; 
  }
  svg.shape.setText = function (itxt)  {
    var txt = String(itxt);
    this.text = txt;
    var el = this.get("__element__");
    if (!el) return;
    var fc = el.firstChild;
    if (fc && (fc.nodeType === 3)) {
      fc.textContent = txt;
    } else { // needs to be added
      var tn = document.createTextNode(txt);
      el.appendChild(tn);
    }
  }
  // attributes as they appear in the DOM are also recorded in the transient (non DNode), __domAttributes__
  // this is a little Reactish
  svg.shape.setAttributes = function (tag) {
    //om.error("old version with prevA")
    var el = this.get("__element__");
    if (!el) return;
    var prevA = this.get("__domAttributes__");
    if (!prevA) {
      prevA = this.__domAttributes__ = {};
    }
    var thisHere = this;
    var nm = this.__name__;
    if (nm !== prevA.__name__) {
      el.setAttribute("id",nm);
      prevA.__name__ = nm;
    }
    var atts = this.attributes;
    if (!atts) return;
    var thisHere = this;
    var op = Object.getOwnPropertyNames(atts);
    var setatt = function (att) {
      if (om.internal(att)||(att==="__setIndex__")) return;
      var av = thisHere[att];
      if (av !== undefined) {
        var pv = prevA[att];
        if (pv !== av) {
          el.setAttribute(att,av);
          prevA[att] = av;
        }
      }
    }
    // set the attributes for this tag
    op.forEach(setatt);
    var catts = Object.getOwnPropertyNames(svg.commonAttributes);
    // set the common attributes;
    catts.forEach(setatt);
   
    var st = this.style;
    if (st) {
      el.style = st;
      st.iterAtomicNonstdProperties(function (sv,sp) {
        el.style[sp] = sv;
      });
    }
    var xf = this.transform;
    if (xf) {
      var s = xf.toSvg();
      var pxf = prevA.transform;
      if (pxf !== s) {
        el.setAttribute("transform",s);
        prevA.transform = pxf;
      }
    }
    var tc = this.text;
    if (tc  && (tag==="text")) {
      var ptxt = prevA.text;
      if (ptxt !== tc)  {
        this.setText(tc);
        prevA.text = tc;
      }
    }
  }
  
  
  svg.shape.setAttribute = function (att,av) {
    var el = this.get("__element__");
    if (!el) return;
    var prevA = this.get("__domAttributes__");
    if (!prevA) {
      prevA = this.__domAttributes__ = {};
    }
    var pv = prevA[att];
    if (pv !== av) {
      el.setAttribute(att,av);
      prevA[att] = av;
    }
  }
  
  
  svg.shape.setAttributesNV = function (tag) {
    var el = this.get("__element__");
    if (!el) return;
    var thisHere = this;
    var nm = this.__name__;
    el.setAttribute("id",nm);
    var atts = this.attributes;
    if (!atts) return;
    var thisHere = this;
    var op = Object.getOwnPropertyNames(atts);
    var setatt = function (att) {
      if (om.internal(att)||(att==="__setIndex__")) return;
      var av = thisHere[att];
      if (av !== undefined) {
        el.setAttribute(att,av);
      }
    }
    // set the attributes for this tag
    op.forEach(setatt);
    var catts = Object.getOwnPropertyNames(svg.commonAttributes);
    // set the common attributes;
    catts.forEach(setatt);
   
    var st = this.style;
    if (st) {
      el.style = st;
      st.iterAtomicNonstdProperties(function (sv,sp) {
        el.style[sp] = sv;
      });
    }
    var xf = this.transform;
    if (xf) {
      var s = xf.toSvg();
      el.setAttribute("transform",s);
    }
    var tc = this.text;
    if (tc  && (tag==="text")) {
      this.setText(tc);
    }
  }
  
  svg.shape.removeAttribute = function (att) {
    var el = this.__element__;
    if (el) {
      el.removeAttribute(att);
    }
  }
    
   svg.shape.updateSVG =  svg.shape.setAttributes;
    
  // the only attribute that an LNode has is an id
  om.LNode.setAttributes = function () {
    var el = this.get("__element__");
    if (!el) return;
    var nm = this.__name__;
    el.setAttribute("id",nm);
    var vis = this.visibility;
    if (vis) {
      el.setAttribute("visibility",vis);
    }
  };

  svg.shape.svgTag = function () {
    // march two prototypes p0 p1, adjacent elements of the prototype chain, down the chain
    // until p1 === svg.shape
    var p0 = this;
    var p1 = Object.getPrototypeOf(p0);
    while (true) {
      if (p1 === svg.shape) {
        return p0.__name__;
      }
      if (p1 === om.DNode) {
        return undefined;
      }
      p0 = p1;
      p1 = Object.getPrototypeOf(p1);
    }
  }
  // an LNode functions as a <g>
  om.LNode.svgTag = function () {
    return "g";
  }
  
  svg.shape.addToDom = function (itag,iroot) {
    var root = iroot?iroot:svg.main;
    var tag = itag?itag:this.svgTag();
    var cel = this.get("__element__");
    if (cel) return cel;
    var pr = this.__parent__;
    var pel = (this === root.contents)?root.__element__:pr.get("__element__");
    if (!pel) return;
    var cel = document.createElementNS("http://www.w3.org/2000/svg", tag);
    this.__element__ = cel;
    this.setAttributes(tag);
    var zz = pel.appendChild(cel);
    return cel;
  }
  
    
    
  om.LNode.addToDom = svg.shape.addToDom
  svg.drawCount = 0;
  om.nodeMethod("draw",function (iroot) {
    var root = iroot?iroot:svg.main;
    if (!this.isShape()) {
      return;
    }
    var el = this.get("__element__");
    var tg = this.svgTag();
    if (el) {
      this.setAttributes(tg); // update 
    } else {
      this.addToDom(tg,root);
    }
    if (tg === "g") {
      this.iterTreeItems(function (ch) {
        ch.draw();
      },true); // iterate over objects only
    }
  });
        

    
  svg.stringToTransform = function (s) {
      var mt = s.match(/translate\(([^ ]*)( +)([^ ]*)\)/)
      if (mt) {
        return geom.mkTranslation(parseFloat(mt[1]),parseFloat(mt[3]));
      }
    }
  geom.Transform.toSvg = function () {
    var tr = this.translation;
    var sc = this.scale;
    var rs = 'translate('+tr.x+' '+tr.y+')';
    if (sc) {
      rs += 'scale('+sc+')';
    }
    return rs;
  }
  // bounds computations:
  
  
  svg.set("Rgb",om.DNode.mk()).namedType();
  
  svg.shape.setFieldType("fill","svg.Rgb");


  // for highlighting; this sets the suroundes
  
  svg.shape.setSurrounders  = function () {
    if (!svg.surroundersEnabled) {
      return;
    }
    var sz = 5000;
    var surs = om.root.surrounders;
    if (!surs) {
      surs = svg.main.addSurrounders();
    }
    var b = this.bounds();
    var rct = b.expandTo(5,5); // Lines have 0 width in svg's opinion, but we want a surround anyway
    var cr = rct.corner;
    var xt = rct.extent;
    // first top and bottom
    var lx = cr.x - sz;
    var ly = cr.y - sz;
    console.log("surrounders ",lx,ly);
    var efc = 1.05; // add this much space around the thing
    var ext = 5;// absolute 
    var efcm = efc - 1;
    var st = {fill:"rgba(0,0,0,0.4)"};
   
    surs.s0.set({x:lx,y:ly,width:sz*2,height:sz-ext});// above
    surs.s1.set({x:lx,y:cr.y+xt.y + ext,width:sz*2,height:sz}); //below    
    surs.s2.set({x:lx,y:cr.y-ext,width:sz-ext,height:xt.y+2*ext});//to left
    surs.s3.set({x:cr.x+xt.x + ext,y:cr.y-ext,width:sz,height:xt.y + 2*ext});// to right
    surs.visibility = "inherit";
    surs.draw();
  }
  
  om.DNode.shapeTreeIterate = function (fn) {
    this.iterTreeItems(function (v) {
      if (v.isShape()) {
        fn(v);
      }
    },true);
  }
  
  
  om.LNode.shapeTreeIterate = function (fn) {
    this.forEach(function (v) {
      if (v && (typeof v === "object") && v.isShape()) {
        fn(v);
      }
    });
  }
  
  om.DNode.transformToSvg = function () {
    var xf = this.transform;
    var el = this.__element__;
    if (el && xf) {
      var svgXf = xf.toSvg();
      el.setAttribute("transform",svgXf);
    }
  }
      
   
  
    // returns the transform that will fit bnds into the svg element, with fit factor ff (0.9 means the outer 0.05 will be padding)
   svg.Root.fitBoundsInto = function (bnds) {
    console.log("fitting ",bnds," into ",this.width,this.height," factor ",this.fitFactor);
     var dst = geom.Point.mk(this.width,this.height).toRectangle().scaleCentered(this.fitFactor);
     var rs = bnds.transformTo(dst);
     return rs;
    
   }
  
  svg.Root.fitContentsTransform = function () {
    var cn = this.contents;
    var bnds = cn.bounds();
    // don't take the shape's own transform into account; that is what we are trying to compute!
    if (!bnds) return;
    return this.fitBoundsInto(bnds);
  }
 
    
    
  svg.Root.fitContents = function () {
    var cxf = this.contents.transform;
    if (cxf) {
      this.contents.removeAttribute("transform");
    }
    if (!cxf) {
      cxf = this.contents.transform = geom.Transform.mk();
    }
    var xf = this.fitContentsTransform();
    this.contents.set("transform",xf);
  }
  
  
  // The xdom element means "externalDom; a "regular" page dom element that appears over the svg viewport.
  // It comes with a regular svg rect to delimit it's area.
  //Of course, it behaves differently from other shapes; cannot be scaled or rotated
  // and held in the canvas.domElements LNode
  // fields: omElement /is a dom.OmElement(ement, and __dom__ is the for-real DOM
  // rename to DomShape?
  svg.set("Xdom",svg.rect.mk()).namedType();

 
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
    rs.setProperties(o,['x','y','width','height']);
    
    rs.fill = "rgba(100,0,0,0.2)";
    rs.fill = "white";
    return rs;
  }

  
    
 svg.Xdom.hideDom = function () { //called to reflect hides further up the ancestry chain.
    if (this.get("_domHidden__")) {
      return;
    }
    var ome = this.omElement;
    // supervent normal channels; we don't want to actually change the hidden status of the OmElement or Element
    if (ome) {
      ome.hide();
    }
    this.__domHidden__ = 1;
  }
  
  
  svg.Xdom.showDom = function () { //called to reflect hides further up the ancestry chain.
    if (this.get("_domHidden__")===0) {
      return;
    }
    var ome = this.omElement;
    // supervent normal channels; we don't want to actually change the hidden status of the OmElement or Element
    if (ome) {
      ome.show();
    }
    this.__domHidden__ = 0;
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
  svg.Xdom.draw = function () {
    // an html element might have a target width in local coords
    var xf = om.root.transform;
    if (xf) {
      console.log("xf ",xf.translation.x,xf.translation.y,xf.scale);
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
    var pos = this.toGlobalCoords(geom.Point.mk(0,0),om.root);
    var scwd = 0;
    var scd = this.scalingDownHere();
    if (this.width) {
      var scwd = this.width*scd;
    }
    
    var xf = svg.main.contents.get("transform");
    if (xf) {
      var p = pos.applyTransform(xf);
    } else {
      p = pos;
    }
    var ht = ome.height();
    var st = {"pointer-events":"none",position:"absolute",left:(offx + p.x)+"px",top:(offy+p.y)+"px"};
    if (scwd) {
      st.width = scwd;
      console.log('scwd',scwd);
    }
    ome.css(st);
    var ht = ome.height();
    var  awd = ome.width();
    om.DNode.draw.call(this);// draw the rectangle
  }
  
  
  
  svg.Root.setZoom = function (trns,ns) {
    var cntr = geom.Point.mk(this.width/2,this.height/2);// center of the screen
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
    console.log("start zoom");
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
    console.log("stop zoom");
    nowZooming = 0;
  }
 
  svg.stdColors = ["rgb(244,105,33)","rgb(99,203,154)","rgb(207,121,0)","rgb(209,224,58)","rgb(191,112,227)","rgb(216,40,165)",
                     "rgb(109,244,128)","rgb(77,134,9)","rgb(1,219,43)","rgb(182,52,141)","rgb(48,202,20)","rgb(191,236,152)",
                     "rgb(112,186,127)","rgb(45,157,87)","rgb(80,205,24)","rgb(250,172,121)","rgb(200,109,204)","rgb(125,10,91)",
                     "rgb(8,188,123)","rgb(82,108,214)"];
  svg.stdColor = function (n) {
    if (n < svg.stdColors.length) {
      return svg.stdColors[n];
    } else {
      return svg.randomRgb();
    }
  }
  
  // overwritten in inspect
  svg.refreshAll = function (){ // svg and trees
    svg.refresh();//  get all the latest into svg
    svg.main.fitContents();
    svg.refresh();
  }
  
  

  svg.initDiv = function (dv) {
    var jdv = $(dv);
    var wd = jdv.width();
    var ht = jdv.height();
    var dom = pj.dom;
    var svgDiv =  dom.El('<div style="postion:absolute;background-color:white;border:solid thin black;display:inline-block"/>');;
    svgDiv.install(dv);
    svg.init(svgDiv.__element__[0],wd,ht);
  }
  
  
  svg.removeElements = function (x) {
    x.iterTreeItems(function (nd) {
        svg.removeElements(nd);
    },true);  
    if (x.isShape()) {
      console.log("removing ",this.__name__);
      x.removeElement();
    }
  }
  
  om.removeCallbacks.push(svg.removeElements);
  
    
})(prototypeJungle);
