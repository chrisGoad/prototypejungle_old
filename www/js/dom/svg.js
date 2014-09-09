   
  (function (pj) {
  var om = pj.om;
  var geom  = pj.geom;
  var dom = pj.dom;
  var svg = pj.svg;
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract
  //var svg =  pj.set("svg",pj.om.DNode.mk());
  //pj.__draw = svg; // synonym
  //svg.__external = 1;

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
  
  svg.__external = 1;
  svg.NS = "http://www.w3.org/2000/svg";
  
  // a Root is separate svg element. At the moment only one is in use: svg.main
  svg.set("Root",Object.create(dom.Element)).namedType();
 /*
  * svg.Root.mk = function (wd,ht) {
    var rs = Object.create(svg.Root);
    rs.width = wd?wd:200;
    rs.height = ht?ht:200;
    rs.fitFactor = 0.98;
    return rs;
  }
  */
  svg.Root.mk = function (container) {
    var rs = Object.create(svg.Root);
    rs.fitFactor = 0.8; // a default;
    var cel = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    cel.setAttribute("version","1.1");
    rs.__container = container;
    rs.__element = cel;
    container.appendChild(cel);
    var wd = container.offsetWidth;
    var ht = container.offsetHeight;
    cel.setAttribute('height',ht);
    cel.setAttribute('width',wd);
    return rs;
  }
  
    
  
  svg.Root.resize = function (wd,ht) {
    var cel = this.__element;
    if (cel) {
      cel.setAttribute("width",wd)
      cel.setAttribute("height",ht);
    }
    if (this.backgroundRect) {
      this.addBackground();
    }

    //this.width = wd;
    //this.height = ht;
  }
 
  //svg.set("Element",om.DNode.mk()).namedType();
  svg.set("Element",Object.create(dom.Element)).namedType();
 svg.Element.mk = function () {return Object.create(svg.Element)};
  
  svg.Element.__visible = function () {
    var v = this.visibility;
    return (v===undefined) || (v==="visible")||(v==="inherit");
  }
  
  
  // if bringToFront is true, then the element should be not removed, but just moved out as the last child of its parent
  // overrides dom.Element.remove
  svg.Element.bringToFront = function () {
    var el = this.__element;
    if (el) {
      var pel = el.parentNode;
      pel.removeChild(el);
      svg.frontShape = this;
      pel.appendChild(el);
     // el.style["pointer-events"] = "none";
    }
  }
  /*
    var el = this.__element;
    if (!el) return;
    var pr = this.__parent;
    var pel = pr.__element;
    if (!pel) return;
    if (el.parentNode) {
      pel.removeChild(el);
    }
    if (bringToFront) {
      svg.frontShape = this;
      this["pointer-events"] = "none";
      pel.appendChild(el);
    }
    delete this.element;
  }
  */
  //om.LNode.removeElement = svg.Element.removeElement;
  
  //svg.Element.bringToFront = function () {
  //  this.removeElement(1);
 // }
  
  svg.Element.hide = function () {
    this.visibility = "hidden";
    return this;
  }
  
  svg.Element.show = function () {
    this.visibility = "inherit";
    this.draw();
    return this;
  }
  
  svg.Root.draw = function () {
  //  this.addBackground(); putback
  
    var st = Date.now();
    var cn = this.contents;
    if (cn  && cn.__addToDom) cn.__addToDom(this.__element);
   // om.root.__draw();
    var tm = Date.now() - st;
    om.log("svg","Draw time",tm);
  }
  
  svg.draw= function () {
    if (svg.main) svg.main.draw();
  }
  
  svg.Root.width = function () {
    var rs;
    var element = this.__element;
    if (element) {
      rs = element.offsetWidth;
      if (rs === undefined) {
        return parseFloat(element.attributes.width.nodeValue);
      }
      return rs;
    }
  }
  
  svg.Root.height = function () {
    var rs;
    var element = this.__element;
    if (element) {
      rs = element.offsetHeight;
      if (rs === undefined) {
        return parseFloat(element.attributes.height.nodeValue);
      }
      return rs;
    }
  }
  
  //svg.Element.refresh = dom.Element.__addToDom;
  //om.LNode.refresh = om.LNode.__addToDom;
    
 
  svg.commonAttributes = {"visibility":"S","pointer-events":"S","stroke":"S",fill:"S","stroke-width":"N","text-anchor":"S"};
  var tag = svg.set("tag",om.DNode.mk());
  tag.set("g",svg.Element.mk()).namedType();
  tag.g.mk = function () {
    return svg.mkWithVis(tag.g);
  }
  
  //om.mkRoot = svg.g.mk;
  
  tag.g.set("attributes",om.LNode.mk());// no attributes, but might have style
  
  
  tag.set("line",svg.Element.mk()).namedType();
  tag.line.set("attributes",om.lift({x1:"N",y1:"N",x2:"N",y2:"N"}));

  function primSvgStringR(dst) {
    var el = this.__element;
    if (el) {
      dst[0] += el.outerHTML;
    }
   }
  
  tag.line.svgStringR = function (dst) {
    var el = this.__element;
    if (el) {
      dst[0] += el.outerHTML;
    }
  }
  
  tag.line.end1 = function () {
    return geom.Point.mk(this.x1,this.y1);
  }
  
  tag.line.end2 = function () {
    return geom.Point.mk(this.x2,this.y2);
  }
  
  
  tag.line.setEnd1 = function (p) {
    this.x1 = p.x;
    this.y1 = p.y;
  }
  
  tag.line.setEnd2 = function (p) {
    this.x2 = p.x;
    this.y2 = p.y;
  }
  
  
  tag.set("rect",svg.Element.mk()).namedType();
  tag.rect.set("attributes",om.lift({x:"N",y:"N",width:"N",height:"S"}));

  tag.rect.mk = function (x,y,width,height,st) {
    var rs = svg.mkWithVis(tag.rect);
    if (x === undefined) {
      return rs;
    }
    rs.x = x;
    rs.y = y;
    rs.width = width;
    rs.height = height;
    return rs;
  }
  

  tag.rect.toRectangle = function (dst) {
    if (dst) {
      var crn = dst.corner;
      var xt = dst.extent;
      crn.x = this.x;
      crn.y = this.y;
      xt.x = this.width;
      xt.y = this.height;
      return dst;
    } else {
      crn = geom.Point.mk(this.x,this.y);
      xt = geom.Point.mk(this.width,this.height);
      var rs = geom.Rectangle.mk(crn,xt);
      return rs;
    }
  }
  
  geom.Rectangle.toRect = function () {
    var rs = tag.rect.mk();
    var crn = this.corner;
    var xt = this.extent;
    rs.x = crn.x;
    rs.y = crn.y;
    rs.width = xt.x;
    rs.height = xt.y;
  }
  
  tag.rect.svgStringR = function (dst) {
    var el = this.__element;
    if (el) {
      dst[0] += el.outerHTML;
    }
  }
  
  geom.Transform.svgString = function (dst) {
    var rs = 'transform="'
    var tr = this.translation;
    if (tr) {
      rs += 'translate('+tr.x+' '+tr.y+') '
    }
    var sc = this.scale;
    if (sc && sc!==1) {
      rs += 'scale('+sc+')'
    }
    rs += '"';
    return rs;
  }
  
  
  
  
  tag.set("polyline",svg.Element.mk()).namedType();
  tag.polyline.set("attributes",om.lift({points:"S"}));

  tag.polyline.svgStringR = function (dst) {
    var el = this.__element;
    if (el) {
      dst[0] += el.outerHTML;
    }
  }
  /* returns bound of this in the coordinates of rt, if rt is supplied; ow in this's own coords */
  svg.Element.bounds = function (rt) {
    var el = this.__element;
    if (el) {
      if (!el.getBBox) {
        om.log("svg","Missing getBBox method");
        return;
      }
      var bb = el.getBBox();
      
      var rs = tag.rect.toRectangle.call(bb);
      if (rt) {
        var gc = geom.toGlobalCoords(this,rs.corner);
        var sc = geom.scalingDownHere(this);// 1 = notTop
        var grs = geom.Rectangle.mk(gc,rs.extent.times(sc));
        om.log("svg","scaling ",sc);
        return grs;
      } else {
        return rs;
      }
    }
  }

  
  svg.Element.getBBox = function () {
    var el = this.__element;
    if (el) {
      return el.getBBox();
    }
  }
  
  svg.Element.__getHeight = function () {
    var el = this.__element;
    if (el) {
      return el.getBBox().height;
    } else {
      return 0;
    }
  }

  
  tag.set("circle",svg.Element.mk()).namedType();
  tag.circle.set("attributes",om.lift({r:"N",cx:"N",cy:"S"}));
 
  tag.circle.svgStringR = primSvgStringR;
  tag.set("text",svg.Element.mk()).namedType();
  tag.text.set({"font-family":"Arial","font-size":"10",fill:"black"});
  tag.text.mk = function (txt) {
    var rs = svg.mkWithVis(tag.text);
    if (txt!==undefined) {
      rs.setText(txt);
    }
    return rs;
  }
  tag.text.set("attributes",om.lift({x:"N",y:"N","font-family":"S","font-size":"N"}));
  tag.text.update = function () {
    alert('Text UPDATE');
    var d = this.data;
    var tp = typeof(d);
    if (tp === "number") {
      this.setText(d+"");
    } else if (tp === "string") {
      this.setText(d);
    }
  }
  
  tag.set("tspan",svg.Element.mk()).namedType();
  tag.tspan.mk = function () {return Object.create(tag.tspan)};
  tag.tspan.set("attributes",om.lift({x:"N",y:"N",dx:"N",dy:"N","font-family":"S","font-size":"N"}));

  
  tag.text.svgStringR = function (dst) {
    var el = this.__element;
    if (el) {
      dst[0] += el.outerHTML;
    }
  }
  svg.elementPath = function (el) {
    var rs = [];
    var cel = el;
    while (cel.tagName !== "svg") {
      rs.push(cel.id);
      //cel = cel.parentElement;
      cel = cel.parentNode;
    }
    rs.pop(); // don't need that last step
    rs.reverse();
    return rs;
  }
  
  
    
  geom.degreesToRadians =  function (n) { return Math.PI * (n/180);}
  
  geom.radiansToDegrees =  function (n) { return 180 * (n/Math.PI);}

  
  /* extracts the DOM element from a jQuery element, unless e is already a DOM element
  
  svg.fromJQ = function (e) {
    if (e.length === undefined) {
      return e;
    }
    return e[0];
  }
  */
  /*
  svg.init = function (container,wd,ht) {
    debugger;
    if (svg.main) return;
    if ((wd === undefined) && (container.width)) {
      wd = container.offsetWidth;
      ht = container.offsetHeight;
    }
    //var cn = dom.wrap(undefined,"div");
    var cn = container;
    svg.main = svg.Root.mk(wd,ht);
    svg.main.init(cn);
    return svg.main;
  }
  */
  
  om.DNode.__isShape = function () {
    return svg.Element.isPrototypeOf(this);
  }
  
  om.LNode.__isShape = function () {
    return true; 
  }
  svg.tag.text.setText = function (itxt)  {
    var txt = String(itxt);
    this.text = txt;
    this.updateSvgText();
    return;
    var el = this.__get("__element");
    if (!el) return;
    var fc = el.firstChild;
    if (fc && (fc.nodeType === 3)) {
      fc.textContent = txt;
    } else { // needs to be added
      var tn = document.createTextNode(txt);
      el.appendChild(tn);
    }
  }
  
   svg.tag.text.updateSvgText  = function ()  {
    //if (doAssign) this.text = txt;
    var el = this.__get("__element");
    if (!el) return;
    var fc = el.firstChild;
    var txt = this.text;
    if (fc && (fc.nodeType === 3)) {
      fc.textContent = txt;
    } else { // needs to be added
      var tn = document.createTextNode(txt);
      el.appendChild(tn);
    }
  }
  // attributes as they appear in the DOM are also recorded in the transient (non DNode), __domAttributes
  // this is a little Reactish
  /*
   svg.Element.setAttributes = function (tag) {
    var el = this.__get("__element");
    if (!el) return;
    var prevA = this.__get("__domAttributes");
    if (!prevA) {
      prevA = this.__domAttributes = {};
    }
    var thisHere = this;
    var nm = this.__name;
    if (nm !== prevA.__name) {
      el.setAttribute("id",nm);
      prevA.__name = nm;
    }
    var atts = this.attributes;
    if (!atts) return;
    var thisHere = this;
    var op = Object.getOwnPropertyNames(atts);
    var setatt = function (att) {
      if (om.internal(att)||(att==="__setIndex")) return;
      var av = thisHere[att];
      if (av !== undefined) {
        var pv = prevA[att];
        if (pv !== av) {
          if ((typeof av === "number")&&(isNaN(av))) {
            debugger;
          }
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
      st.__iterAtomicNonstdProperties(function (sv,sp) {
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
  
  
  svg.Element.setAttribute = function (att,av) {
    this[att] = av;
    var el = this.__get("__element");
    if (!el) return;
    var prevA = this.__get("__domAttributes");
    if (!prevA) {
      prevA = this.__domAttributes = {};
    }
    var pv = prevA[att];
    if (pv !== av) {
      el.setAttribute(att,av);
      prevA[att] = av;
    }
  }
  */
  
  
 
  /*
  svg.Element.removeAttribute = function (att) {
    var el = this.__element;
    if (el) {
      el.removeAttribute(att);
    }
  }
  */
    
    
  // the only attribute that an LNode has is an id
 /* om.LNode.setAttributes = function () {
    var el = this.__get("__element");
    if (!el) return;
    var nm = this.__name;
    el.setAttribute("id",nm);
    var vis = this.visibility;
    if (vis) {
      el.setAttribute("visibility",vis);
    }
  };
  
  */

/*
  svg.Element.__svgTag = function () {
    // march two prototypes p0 p1, adjacent elements of the prototype chain, down the chain
    // until p1 === svg.Element
    var p0 = this;
    var p1 = Object.getPrototypeOf(p0);
    while (true) {
      if (p1 === svg.Element) {
        return p0.__name;
      }
      if (p1 === om.DNode) {
        return undefined;
      }
      p0 = p1;
      p1 = Object.getPrototypeOf(p1);
    }
  }
  // an LNode functions as a <g>
  om.LNode.__svgTag = function () {
    return "g";
  }
  */
  /*
  svg.Element.__addToDom = function (itag,iroot) {
    var root = iroot?iroot:svg.main;
    var tag = itag?itag:this.__svgTag();
    var cel = this.__get("__element");
    if (cel) return cel;
    if (this.visibility === "hidden") return;
    var pr = this.__parent;
    var pel = (this === root.contents)?root.__element:pr.__get("__element");
    if (!pel) return;
    var cel = document.createElementNS("http://www.w3.org/2000/svg", tag);
    this.__element = cel;
    this.setAttributes(tag);
    var zz = pel.appendChild(cel);
    return cel;
  }
 
    
  om.LNode.__addToDom = svg.Element.__addToDom
   */
  /*
  svg.drawCount = 0;
  // this is almost like the method used for the DOM (other than svg):__addToDom
  om.nodeMethod("__draw",function (iroot) {
    var root = iroot?iroot:svg.main;
    var rootEl = root.__element;
    if (!this.__isShape()) {
      return;
    }
    var el = this.__get("__element");
    var tg = this.__svgTag();
    if (el) {
      this.setAttributes(tg,1); // update 
    } else {
      this.addToDom1(tg,rootEl,1);// 1 means "forSvg"
    }
    if (tg === "g") {
      this.__iterDomTree(function (ch) {
        ch.__draw();
      },true); // iterate over objects only
    }
  });
        

  */
  svg.stringToTransform = function (s) {
      var mt = s.match(/translate\(([^ ]*)( +)([^ ]*)\)/)
      if (mt) {
        return geom.mkTranslation(parseFloat(mt[1]),parseFloat(mt[3]));
      }
    }
    
  geom.Transform.toSvg = function () {
    var tr = this.translation;
    var sc = this.scale;
    var x = tr.x;
    var y = tr.y;
    if (isNaN(x)||isNaN(y)||isNaN(sc)) {
      om.error('In transform','aritmetic');
    }
    var rs = 'translate('+tr.x+' '+tr.y+')';
    if (sc) {
      rs += 'scale('+sc+')';
    }
    return rs;
  }
  // bounds computations:
  
  
 
  
  svg.set("Rgb",om.DNode.mk()).namedType();
  
  
  
  
  om.DNode.__transformToSvg = function () {
    var xf = this.transform;
    var el = this.__element;
    if (el && xf) {
      var svgXf = xf.toSvg();
      el.setAttribute("transform",svgXf);
    }
  }
      
   
  
    // returns the transform that will fit bnds into the svg element, with fit factor ff (0.9 means the outer 0.05 will be padding)
   svg.Root.fitBoundsInto = function (bnds,fitFactor) {
    var ff = fitFactor?fitFactor:this.fitFactor;
    var wd = this.__container.offsetWidth;
    var ht = this.__container.offsetHeight;
    om.log("svg","fitting ",bnds," into ",wd,ht," factor ",ff);
     var dst = geom.Point.mk(wd,ht).toRectangle().scaleCentered(ff);
     var rs = bnds.transformTo(dst);
     return rs;
    
   }
  
  svg.Root.fitContentsTransform = function (fitFactor) {
    var cn = this.contents;
   
    if (!cn) return undefined;
    if (!cn.bounds) return undefined;
    var bnds = cn.bounds();
    // don't take the Element's own transform into account; that is what we are trying to compute!
    if (!bnds) return;
    return this.fitBoundsInto(bnds,fitFactor);
  }
 
    
  svg.Root.fitContents = function (fitFactor,dontDraw) {
    var cn = this.contents;
     var sr = cn.surrounders;
    if (sr) {
      sr.remove();
    }
    if (!dontDraw) {
      cn.draw();
    }
    var ff = fitFactor?fitFactor:this.contents.fitFactor;
    if (!ff) {
      ff = this.fitFactor;
    }
    var fitAdjust = this.contents.fitAdjust;
    var cxf = cn.transform;
    if (cxf) {
      cn.__removeAttribute("transform");
    }
    var xf = this.fitContentsTransform(ff);
    if (fitAdjust) {
      xf.set("translation",xf.translation.plus(fitAdjust));
    }
    cn.set("transform",xf);
    if (sr) {
      om.selectedNode.__setSurrounders();
    //  sr.show();
    }
    svg.adjustXdoms(cn);
  }
  
  
  // overwritten in inspect
  svg.drawAll = function (){ // svg and trees
    svg.draw();//  __get all the latest into svg
    svg.main.fitContents();
    svg.draw();
  }
  
  
  /*
  svg.removeElements = function (x) {
    x.__iterTreeItems(function (nd) {
        svg.removeElements(nd);
    },true);  
    if (x.__isShape()) {
      om.log("svg","removing ",this.__name);
      x.removeElement();
    }
  }
  */
  om.LNode.__svgClear = function () {
    var el = this.__element;
    if (el) {
      this.forEach(function (x) {
        x.remove();
      });
    }
    this.length = 0;
  }
  
  
  om.DNode.__svgClear = function () {
    var el = this.__element;
    var thisHere = this;
    if (el) {
      this.__iterDomTree(function (x,nm) {
        x.remove();
      });
    }
  }

  svg.Element.mk = function (s) {
    var hasVis = 0;
    if (s) {
      var rs = dom.parseWithDOM(s,true);
      // introduce computed __values
      var ops = Object.getOwnPropertyNames(rs);
      ops.forEach(function (p) {
        if (p === "visibility") {
          hasVis = 1;
        }
        var pv = rs[p];
        if (typeof pv==="string") {
          if (pv.indexOf("function ")===0) {
            rs.setcf(p,pv);
          }
        }
      });
    } else {
      rs = Object.create(svg.Element);
    }
    if (!hasVis) rs.visibility = "inherit";
    return rs;
  }
  
  
  /*
  svg.Root.elementToNode = function (el) {
    
    var pth = svg.elementPath(el);
    return om.evalPath(this.contents,pth);
  }
    
  */
  svg.Root.eventToNode = function (e) {
    return e.target.__prototypeJungleElement;
  //  return this.elementToNode(e.target);
  }
  
  
  // adjusts the background if already present
  svg.Root.addBackground = function () {
    var bk = this.backgroundRect;
    var cl = this.contents?this.contents.backgroundColor:undefined;
    cl = cl?cl:"white";
    if (!bk) {
      bk = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
      this.backgroundRect = bk;
      this.__element.appendChild(bk);
    }
    bk.setAttribute("width",this.width())
    bk.setAttribute("height",this.height());
    bk.setAttribute("fill",cl);
  }
  
  svg.__rootElement = function (nd) {
    var cv =nd;
    while (true) {
      var pr = cv.__get("__parent");
      if (!(pj.svg.Element.isPrototypeOf(pr)||om.LNode.isPrototypeOf(pr))) return cv;
      cv = pr;
    }
  }
  
  
  svg.Root.updateAndDraw = function (doFit) {
  var itm = this.contents;
  itm.outerUpdate();

  if (itm.draw) {
    itm.draw();
    this.addBackground(); 

    if (doFit) this.fitContents();
  }
}

  // adds a generator for prototypeJungle events from DOM events to the node.
  
  
  // The xdom element means "externalDom; a "regular" page dom element that appears over the svg viewport.
  // It comes with a regular svg rect to delimit it's area.
  //Of course, it behaves differently from other shapes; cannot be scaled or rotated
  // and held in the svg.Root.domElements LNode
  // fields: omElement /is a dom.OmElement(ement, and __dom__ is the for-real DOM
  // rename to DomShape?
  
  
  
  svg.set("Xdom",svg.tag.g.mk()).namedType();

 
  svg.Xdom.mk = function (html,irct) {
    var rs = svg.Xdom.instantiate();
    if (html) {
      var ome = pj.html.Element.mk(html);
      //ome.style.color = "blue";
      ome.style.position = "absolute";
      rs.set("__domElement",ome);
    }
    if (irct) {
      var rct = irct;
    } else {
      rct = geom.Rectangle.mk([0,0],[100,100]);
    }
    rs.set("area",rct);
    return rs;
  }
  
  svg.Xdom.setHtml = function (html) {
    var ome = this.__domElement;
    ome.text = html;
    var el = ome.__element;
    if (el) {
      el.innerHTML = html;
    }
  }
  svg.Root.addXdom = function (dm) {
    var dome = dm.__domElement;
    var el = dome.__element;
    if (!el) {
       dome.__addToDom(this.__container);
    }
  }
  svg.addXdom = function (dm) {
    svg.main.addXdom(dm);
  }
  
  svg.Xdom.updateArea = function () {
    var a = this.area;
    var c = a.corner;
    var ext = a.extent;
    //var padding = this.padding;
    var pd = 10;
   
    var gul = geom.toGlobalCoords(this,c);//upper left
    var glr = geom.toGlobalCoords(this,c.plus(ext));// lower right
    var rte = svg.__rootElement(this);
    var xf =  rte.__get("transform");
    if (xf) { // finally, apply the view transform
      gul = gul.applyTransform(xf);
      glr = glr.applyTransform(xf);
    }
    var gext = glr.difference(gul);
    var dome = this.__domElement;
    var el = dome.__element;
    
    if (el) {
      var st=el.style;
      var pdr = st["padding-right"];// for some reason padding-right doesn't take in the usual way
      var pdri = pdr?parseInt(pdr):0;
      st.left = gul.x+"px";
      st.top = gul.y+"px";
      st.width = (gext.x-pdri)+"px";
      st.height = gext.y+"px";
    }
  }
  
  /*  xdoms need adjusting after changing the top level transform (as in eg fit contents), because their
   __domElements lie outside of the svg model */
  
  svg.adjustXdoms = function (nd) {
    if (svg.Xdom.isPrototypeOf(nd)) {
      nd.updateArea();
    } else 
      om.forEachTreeProperty(nd,function (v) {
        svg.adjustXdoms(v);
      });
  }


  /*
   var xf = om.root.transform;
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
    var pos = this.__toGlobalCoords(geom.Point.mk(0,0),om.root);
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
    om.DNode.__draw.call(this);// __draw the rectangle
    
*/
  
    
 
  svg.stdColors = ["rgb(244,105,33)","rgb(99,203,154)","rgb(207,121,0)","rgb(209,224,58)","rgb(51, 97, 204)","rgb(216,40,165)",
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
  
  // move to a given location in nd's own coordinates
  
    // supports multiple input formats eg x = Point or array

    // supports multiple input formats eg x = Point or array

  svg.Element.moveto = function (ix,iy) {
    if (typeof iy=="number") {
      var x = ix;
      var y = iy;
    } else {
      x = ix.x;
      y = ix.y;
    }
    var xf = this.transform;
    if (xf) {
      xf.translation.setXY(x,y);
      return;
    }
    var xf = geom.mkTranslation(x,y);
    this.set("transform",xf);
  }
  

  
  svg.Element.setScale = function (s) {
    var xf = this.transform;
    if (xf) {
      xf.scale = s;
      return;
    }
    var xf = geom.mkScaling(s);
    this.set("transform",xf);
  }
  
  
  om.defineMarks(svg.tag.g.mk());

  
//end extract
})(prototypeJungle);
