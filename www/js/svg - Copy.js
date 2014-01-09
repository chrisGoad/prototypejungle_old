(function (__pj__) {
  var om = __pj__.om;
  var geom  = __pj__.geom;
  var svg =  __pj__.set("svg",__pj__.om.DNode.mk());
  var dom = __pj__.set("dom",om.DNode.mk());// added for prototypeJungle; this is where symbols are added, rather than at the global level

  
  dom.set("Style",om.DNode.mk()).namedType();

  dom.Style.mk = function (o) { 
    rs = Object.create(dom.Style);
    rs.setProperties(o);
    return rs;   
  }
  
  svg.__externalReferences__ = [];
  
  svg.width = 200;
  svg.height = 200;
  

  svg.set("shape",om.DNode.mk()).namedType();
  svg.shape.mk = function () {return Object.create(svg.shape)};
  
  
  svg.set("g",svg.shape.mk()).namedType();
  svg.g.mk = function () {return Object.create(svg.g);}
  svg.g.set("attributes",om.LNode.mk());// no attributes, but might have style
  
  
  svg.set("rect",svg.shape.mk()).namedType();
  svg.rect.set("attributes",om.LNode.mk(["x","y","width","height"]));
  svg.rect.mk = function (x,y,width,height,st) {
    var rs = Object.create(svg.rect);
    rs.set("style",dom.Style.mk(st));
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
  
  svg.rect.bounds = function () {
    return this.toRectangle();
  }
  
  
  svg.set("circle",svg.shape.mk()).namedType();
  svg.circle.set("attributes",om.LNode.mk(["r","cx","cy"]));
  svg.circle.bounds = function () {
    var r = this.r;
    var cx = this.cx;
    var cy = this.cy;
    var lx = this.cx-r;
    var ly = this.cy-r;
    var crn = geom.Point.mk(lx,ly);
    var xt = geom.Point.mk(crn.x,crn.y);
    return geom.Rectangle.mk(crn,xt);
  }
  
  svg.elementPath = function (el) {
    var rs = [];
    var cel = el;
    while (cel !== om.root.__element__) {
      rs.push(cel.id);
      cel = cel.parentElement;
    }
    return rs.reverse();
  }
  
  
  om.selectCallbacks = [];

  om.DNode.select = function (src,dontDraw) { // src = "svg" or "tree"
    debugger;
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
  
  svg.addSurrounders = function () {
    if (om.root.surrounders) {
      return;
    }
    var surs = om.LNode.mk();
    for (var i=0;i<4;i++) {
      surs.push(svg.rect.mk(0,0,10,10,{fill:"rgba(0,0,0,0.4)"}));
    }
    om.root.set("surrounders",surs);
  }
 
  svg.init = function (container) {
    var cel = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    cel.setAttribute("width",svg.width)
    cel.setAttribute("height",svg.height);
   // cel.setAttribute("viewPort",o.viewPort);
    cel.setAttribute("version","1.1");
    if (svg.style) {
       cel.style.border = svg.style.border;
    }
    container.appendChild(cel);
    svg.rootElement =  cel;
    svg.addSurrounders();
    cel.addEventListener("click",function (e) {
      var trg = e.target;
      var id = trg.id;
      console.log("clicked on ",id);
      var pth = svg.elementPath(trg);
      //om.selectedNodePath = pth;
      var selnd = om.root.evalPath(pth);
      selnd.select("svg");
      console.log("with path",pth);
    });
  }
  
  svg.reset = function () {
    var rte = svg.rootElement;
    var fc = rte.firstChild;
    if (fc) {
      fte.removeChild(fte);
    }
  }
    
  om.DNode.isShape = function () {
    return svg.shape.isPrototypeOf(this);
  }
  
  om.LNode.isShape = function () {
    return true; 
  }
  // attributes as they appear in the DOM are also recorded in the transient (non DNode), __domAttributes__ 
  svg.shape.setAttributes = function () {
    var el = this.__element__;
    if (!el) return;
    var nm = this.__name__;
    el.setAttribute("id",nm);
    var atts = this.attributes;
    if (!atts) return;
    var thisHere = this;
    atts.forEach(function (att) {
      var av = thisHere[att];
      if (av !== undefined) {
        el.setAttribute(att,av);
      }
    });
    var st = this.style;
    if (st) {
      st.iterAtomicNonstdProperties(function (sv,sp) {
        el.style[sp] = sv;
      });
    }
    var xf = this.transform;
    if (xf) {
      debugger;
      var s = xf.toSvg();
      el.setAttribute("transform",s);
    }
  }
  
  om.LNode.setAttributes = function () {};

  
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
  
  svg.shape.addToDom = function (itag) {
    var tag = itag?itag:this.svgTag();
    var cel = this.__element__;
    if (cel) return cel;
    var pr = this.__parent__;
    var pel = (this === om.root)?svg.rootElement:pr.__element__;
    if (!pel) return;
    var cel = document.createElementNS("http://www.w3.org/2000/svg", tag);
    this.__element__ = cel;
    pel.appendChild(cel);
    this.setAttributes();
    return cel;
  }
  
  om.LNode.addToDom = svg.shape.addToDom;
  
  
  om.nodeMethod("draw",function () {
    if (!this.isShape()) {
      return;
    }
    var el = this.__element__;
    var tg = this.svgTag();
    if (el) {
      this.setAttributes(); // update 
    } else {
      this.addToDom(tg);
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
  return 'translate('+tr.x+' '+tr.y+')'
}
// bounds computations:


svg.set("Rgb",om.DNode.mk()).namedType();



  // for highlighting; this sets the suroundes
  
  
  
  svg.shape.setSurrounders  = function () {
    var sz = 20;
    var surs = om.root.surrounders;
    var rct = this.computeBounds();
    var cr = rct.corner;
    var xt = rct.extent;
    // first top and bottom
    var lx = cr.x - sz;
    var ly = cr.y - sz;
    console.log("surrounders ",lx,ly);
    var efc = 1.05; // add this much space around the thing
    var efcm = efc - 1;
    var st = {fill:"rgba(0,0,0,0.4)"};
    surs[0].set({x:lx,y:ly,width:sz*2,height:sz-(xt.y *efcm)});
    surs[1].set({x:lx,y:cr.y+xt.y*efc,width:sz*2,height:sz});
    surs[2].set({x:lx,y:cr.y-xt.y*efcm,width:sz-xt.x*efc,height:xt.y*(1 + 2*efcm)});
    surs[3].set({x:cr.x+xt.x*efc,y:cr.y-xt.y*efcm,width:sz,height:xt.y*(1 + 2*efcm)});
    surs.draw();
  }
  

    
})(prototypeJungle);
