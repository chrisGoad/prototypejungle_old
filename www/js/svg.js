(function (__pj__) {
  var om = __pj__.om;
  var geom  = __pj__.geom;
  var dom = __pj__.dom;
  var svg =  __pj__.set("svg",__pj__.om.DNode.mk());
  svg.__externalReferences__ = [];

  //var dom = __pj__.set("dom",om.DNode.mk());// added for prototypeJungle; this is where symbols are added, rather than at the global level
  svg.surroundersEnabled = 0;
  
  svg.mkWithStyle = function (pr,style) {
    var rs = Object.create(pr);
    if (style) {
      rs.set("style",dom.Style.mk(style));
    } else {
      rs.set("style",dom.Style.mk());
    }
    return rs;
  }
  
  svg.__externalReferences__ = [];
  svg.NS = "http://www.w3.org/2000/svg";
  
  // a Root is separate svg element. At the moment only one is in use: svg.main
  svg.set("Root",om.DNode.mk()).namedType();
  svg.Root.mk = function (wd,ht) {
    var rs = Object.create(svg.Root);
    rs.width = wd?wd:200;
    rs.height = ht?ht:200;
    rs.fitFactor = 0.9;
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
  
  //svg.main.width = 200;
 // svg.main.height = 200;
  

  svg.set("shape",om.DNode.mk()).namedType();
  svg.shape.mk = function () {return Object.create(svg.shape)};
  
  svg.shape.visible = function () {return (!this.style || (this.style.display !== "none"));}
  
  svg.shape.remove = function (bringToFront) {
    var el = this.__element__;
    if (!el) return;
    var pr = this.__parent__;
    var pel = pr.__element__;
    pel.removeChild(el);
    if (bringToFront) {
      pel.appendChild(el);
    }
  }
  
  svg.shape.bringToFront = function () {
    this.remove(1);
  }
  
  svg.shape.hide = function () {
    this.style.display = "none";
    return this;
  }
  
  svg.shape.show = function () {
    this.style.display = "block";
    return this;
  }
  
  //svg.main = svg.Root.mk();

  svg.commonAttributes = {"pointer-events":"S","stroke":"S",fill:"S","stroke-width":"N","text-anchor":"S"};
  
  svg.set("g",svg.shape.mk()).namedType();
  svg.g.mk = function () {
    return svg.mkWithStyle(svg.g);
  }
  
  svg.g.set("attributes",om.LNode.mk());// no attributes, but might have style
  
  
  svg.set("line",svg.shape.mk()).namedType();
  //svg.rect.set("attributes",om.LNode.mk(["x","y","width","height"]));
  svg.line.set("attributes",om.lift({x1:"N",y1:"N",x2:"N",y2:"N"}));

  
  svg.set("rect",svg.shape.mk()).namedType();
  //svg.rect.set("attributes",om.LNode.mk(["x","y","width","height"]));
  svg.rect.set("attributes",om.lift({x:"N",y:"N",width:"N",height:"S"}));

  svg.rect.mk = function (x,y,width,height,st) {
    var rs = svg.mkWithStyle(svg.rect);
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
      var rs = svg.rect.toRectangle.call(bb);
      return rs;
    }
  }
  
  
 /*   
  svg.rect.bounds = function () {
    return this.toRectangle();
  }
  */
  
  
  svg.set("circle",svg.shape.mk()).namedType();
  //svg.circle.set("attributes",om.LNode.mk(["r","cx","cy"]));
  svg.circle.set("attributes",om.lift({r:"N",cx:"N",cy:"S"}));
  /*
  svg.circle.bounds = function () {
    var r = this.r;
    var cx = this.cx;
    var cy = this.cy;
    var lx = this.cx-r;
    var ly = this.cy-r;
    var crn = geom.Point.mk(lx,ly);
    var xt = geom.Point.mk(2*r,2*r);
    return geom.Rectangle.mk(crn,xt);
  }
  */
  
  svg.set("text",svg.shape.mk()).namedType();
  svg.text.mk = function () {return svg.mkWithStyle(svg.text);}
  svg.text.set("attributes",om.lift({x:"N",y:"N","font-family":"S","font-size":"N"}));
  
  //svg.text.bounds = svg.shape.boundsF;
  
  svg.elementPath = function (el) {
    var rs = [];
    var cel = el;
    while (cel.tagName !== "svg") {
      rs.push(cel.id);
      cel = cel.parentElement;
    }
    rs.pop(); // don't need that last step
    return rs.reverse();
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
    //if (!this.selectable) {
      //this.deepSetProp("__selectedPart__",1);
    //  this.setPropForAncestors("__descendantSelected__",1,om.root);
    //} else {
    var thisHere = this;
    this.setSurrounders();// highlight
    if (src === "svg") {
      om.selectCallbacks.forEach(function (c) {
        c(thisHere);
      });
      return;

      // this will need modification when there is more than one canvas

      draw.refresh();
      var thisHere = this;
      draw.selectCallbacks.forEach(function (c) {
        c(thisHere);
      });
    } else if (om.inspectMode) {
        return;
        draw.mainCanvas.surrounders = (this===om.root)?undefined:this.computeSurrounders(5000);
      draw.refresh();
    }


  }
  
  svg.surrounderP = svg.rect.mk(0,0,10,10,{fill:"rgba(0,0,0,0.4)"});
   svg.surrounderP["pointer-events"] = "none";
   
  svg.Root.addSurrounders = function () {
    if (!svg.surroundersEnabled) {
      return;
    }
    var cn = this.contents;
    if (cn.surrounders) {
      return;
    }
    var surs = om.LNode.mk();
    for (var i=0;i<4;i++) {
      var rct = svg.surrounderP.instantiate();
      //var rct = svg.rect.mk(0,0,10,10,{fill:"rgba(0,0,0,0.4)"});
      //rct["pointer-events"] = "none";
      surs.push(rct);
    }
    cn.set("surrounders",surs);
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
  
  svg.Root.init = function (container) {
    var cel = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    cel.setAttribute("width",this.width)
    cel.setAttribute("height",this.height);
   // cel.setAttribute("viewPort",o.viewPort);
    cel.setAttribute("version","1.1");
    if (svg.style) {
       cel.style.border = svg.style.border;
    }
    this.container = container;
    container.appendChild(cel);
    this.__element__ =  cel;
    thisHere=this;
    //svg.addSurrounders();
    cel.addEventListener("mousedown",function (e) {
      var trg = e.target;
      var id = trg.id;
      var px = e.offsetX;
      var py = e.offsetY;
      thisHere.refPoint = geom.Point.mk(px,py);
      console.log("mousedown ",id);
      var pth = svg.elementPath(trg);
      //om.selectedNodePath = pth;
      var selnd = om.root.evalPath(pth);
      selnd.select("svg");
      var dra = selnd.ancestorWithProperty("draggable");
      if (dra) {
        thisHere.dragee = dra;
        thisHere.refPos = dra.toGlobalCoords();
      } else {
        delete thisHere.dragee;
        delete thisHere.refPos;
      }
      console.log("with path",pth);
    });
    
    cel.addEventListener("mousemove",function (e) {
      var refPoint = thisHere.refPoint;
      if (!thisHere.refPos) {
        var nd = svg.eventToNode(e);
        if (nd === svg.hoverNode) {
          return;
        }
        console.log("Hovering over ",nd.__name__);
        svg.hoverNode = nd;
        var hva = nd.ancestorWithProperty("forHover");
        
        if (hva === svg.hoverAncestor) {
          return;
        }
        if (svg.hoverAncestor) {
          svg.hoverAncestor.forUnhover();
        }
        console.log("Hovering ancestor ",hva?hva.__name__:"none");
        svg.hoverAncestor = hva;
       if (hva) hva.forHover();

        return;
      }
      
      var dr = thisHere.dragee;
      var trg = e.target;
      var id = trg.id;
      var px = e.offsetX;
      var py = e.offsetY;
      var mvp = geom.Point.mk(px,py);
      var delta = mvp.difference(refPoint);
      console.log("mouse move ",id,delta.x,delta.y);
      var rfp = thisHere.refPos;
      var npos = rfp.plus(delta);
      console.log("drag",dr.__name__,"delta",delta.x,delta.y,"npos",npos.x,npos.y);
      dr.moveto(npos);
     
    });
    cel.addEventListener("mouseup",function (e) {
      delete thisHere.refPoint;
      delete thisHere.refPos;
      delete thisHere.dragee;
    });
   
  }
  
  svg.init = function (container,wd,ht) {
    if (svg.main) return;
    svg.main = svg.Root.mk(wd,ht);
    svg.main.init(container);
  }
  
  
  svg.Root.setContents = function (cn) {
    var rte = this.__element__;
    var fc = rte.firstChild;
    if (fc) {
      rte.removeChild(fc);
    }
    this.contents = cn;
    this.addSurrounders();
    
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
  svg.shape.setAttributes = function (tag) {
    var el = this.get("__element__");
    if (!el) return;
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
      /*
      var fc = el.firstChild;
      if (fc && (fc.nodeType === 3)) {
        fc.textContent = tc;
      } else { // needs to be added
        var tn = document.createTextNode(tc);
        el.appendChild(tn);
      }
      */
   
    }
  }
   svg.shape.updateSVG =  svg.shape.setAttributes;
    
  // the only attribute that an LNode has is an id
  om.LNode.setAttributes = function () {
    var el = this.get("__element__");
    if (!el) return;
    var nm = this.__name__;
    el.setAttribute("id",nm);
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
/*
    if (this.text) {
      var tn = document.createTextNode(this.text);
      cel.appendChild(tn);
    }
    */
    var zz = pel.appendChild(cel);

    return cel;
  }
  
    
    
  om.LNode.addToDom = svg.shape.addToDom
  
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
    var sz = 500;
    var surs = om.root.surrounders;
    
   // var rct = this.computeBounds();
    var rct = this.bounds();
    var cr = rct.corner;
    var xt = rct.extent;
    // first top and bottom
    var lx = cr.x - sz;
    var ly = cr.y - sz;
    console.log("surrounders ",lx,ly);
    var efc = 1.05; // add this much space around the thing
    var efcm = efc - 1;
    var st = {fill:"rgba(0,0,0,0.4)"};
    surs[0].set({x:lx,y:ly,width:sz*2,height:sz-(xt.y *efcm)});// above
    surs[1].set({x:lx,y:cr.y+xt.y*efc,width:sz*2,height:sz}); //below
    //var r2= geom.Rectangle.mk({corner:[lx,cr.y-xt.y*efcm],extent:[sz-xt.x*efcm,xt.y*(1 + 2*efcm)],style:st});
    
    surs[2].set({x:lx,y:cr.y-xt.y*efcm,width:sz-xt.x*efcm,height:xt.y*(1 + 2*efcm)});//to left
    surs[3].set({x:cr.x+xt.x*efc,y:cr.y-xt.y*efcm,width:sz,height:xt.y*(1 + 2*efcm)});
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
    console.log("AAAA");
    var xf = this.transform;
    var el = this.__element__;
    if (el && xf) {
      var svgXf = xf.toSvg();
      console.log("SVGT",svgXf);
      el.setAttribute("transform",svgXf);
    }
  }
      
   
  
    // returns the transform that will fit bnds into the svg element, with fit factor ff (0.9 means the outer 0.05 will be padding)
   svg.Root.fitBoundsInto = function (bnds) {
     var dst = geom.Point.mk(this.width,this.height).toRectangle().scaleCentered(this.fitFactor);
     var rs = bnds.transformTo(dst);
     return rs;
    
   }
  
  svg.Root.fitContentsTransform = function () {
    var cn = this.contents;
    var bnds = cn.bounds();
    //var bnds = cn.deepBounds(true); // don't take the shape's own transform into account; that is what we are trying to compute!
    if (!bnds) return;
    return this.fitBoundsInto(bnds);
  }
 
    
    
  svg.Root.fitContents = function () {
    var cxf = this.contents.transform;
    if (!cxf) {
      cxf = this.contents.transform = geom.Transform.mk();
    }
    var csc = cxf.scale;
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
    // a default to be overridden, of course
    // the selection rectangle
   // rs.set("selectRect",svg.shape.mk('<rect x="0" y="0" width="20"  height="30",fill:"rgba(0,0,0,0.2)"/>'));
   //        //{corner:[0,0],extent:[20,30],style:{fillStyle:"transparent"}}));
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
  
    //var dm = ome.__dom__;
   // var dm = this.get("__dom__");
    var thisHere = this;
    var clickInstalled = false;
    // be sure the __dom__ matches the element's  dom; ow there is a new element
    /*if (dm && this.element) {
      if (this.element.__dom__ !== dm) {
        dm = undefined;
      }
    }*/
    //ome.click = function (e) {e.preventDefault();console.log("CLICK ",e);}
    //ome.mousemove = function (e) {e.preventDefault();console.log("mousemove",e);}
    //ome.install(canvas.htmlDiv.__element__);
    ome.install($(svg.main.container));
//if (this.lastHtml !== this.html) {
    //  this.setHtml(this.html);
   // }
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
     // var st = {left:(offx + p.x)+"px",top:(offy+p.y-ht)+"px"};
    var st = {"pointer-events":"none",position:"absolute",left:(offx + p.x)+"px",top:(offy+p.y)+"px"};
    if (scwd) {
      st.width = scwd;
      console.log('scwd',scwd);
    }
    ome.css(st);
    var ht = ome.height();
    var  awd = ome.width();
    //console.log("awd",awd,"width",scwd,"Height",ht);
    //this.x = awd/scd;
    //this.y = ht/scd;
    om.DNode.draw.call(this);// draw the rectangle
    
    //this.selectRect.draw(canvas);
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
    om.root.draw();

   // whenStateChanges();
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
        
    
})(prototypeJungle);
