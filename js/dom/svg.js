   
  (function (pj) {
  var geom  = pj.geom;
  var dom = pj.dom;
  var svg = pj.svg;
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract
 
svg.surroundersEnabled = true;

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
  
svg.__external = true;
svg.NS = "http://www.w3.org/2000/svg";

// a Root is separate svg element. At the moment only one is in use: svg.main
svg.set("Root",Object.create(dom.Element)).__namedType();

  
svg.Root.mk = function (container) {
  var rs = Object.create(svg.Root);
  var cel,wd,ht;
  rs.fitFactor = 0.8; // a default;
  cel = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
  cel.setAttribute("version","1.1");
  cel.style['background'] = 'white';
  cel.addEventListener("dragstart",function (event) {
    event.preventDefault();
  });
  rs.__element = cel;
  rs.__aPoint = cel.createSVGPoint();
  if (container) {
    rs.__container = container;
    container.appendChild(cel);
    wd = container.offsetWidth-2;// -2 motivated by jsfiddle (ow boundary of containing div not visible)
    ht = container.offsetHeight-2; 
    cel.setAttribute('height',ht);
    cel.setAttribute('width',wd);
  }
  return rs;
}

svg.Root.cursorPoint = function (evt){
  var pj = this.__aPoint;
  var rs;
  pj.x = evt.clientX;
  pj.y = evt.clientY;
  rs = pj.matrixTransform(this.__element.getScreenCTM().inverse());
  return geom.Point.mk(rs.x,rs.y);
}

  
  
  
svg.wrapAsRoot = function (node) {
  var rs = Object.create(svg.Root);
  var cel;
  rs.contents = node;
  cel = node.__element;
  if (cel) {
    cel.addEventListener("dragstart",function (event) {
      event.preventDefault();
    });
    rs.__element = cel;
  }
  return rs;
}
  
svg.setMain = function (node) {
  svg.main = svg.wrapAsRoot(node);
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
}
 
svg.set("Element",Object.create(dom.Element)).__namedType();
svg.Element.mk = function () {return Object.create(svg.Element)};


svg.Element.svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}



svg.Element.addChildren = function (ch) {
  var thisHere = this;
  ch.forEach(function (c) {
    thisHere.push(c);
  });
  return this;
}
  
/* outerHTML is not defined in IE edge or safari 
 * From http://www.yghboss.com/outerhtml-of-an-svg-element/
 * with jquery: $('<div>').append($(svgElement).clone()).html(); */

svg.Element.__outerHTML = function() {
  var el = this.__element;
  var oh,node,temp;
  if (!el) {
    return undefined;
  }
  oh = el.outerHTML;
  if (oh) {
    return oh;
  }
  temp = document.createElement('div');
  node = el.cloneNode(true);
  temp.appendChild(node);
  return temp.innerHTML;
}

svg.Element.__visible = function () {
  var v = this.visibility;
  return (v===undefined) || (v==="visible")||(v==="inherit");
}
  
  
  // if bringToFront is true, then the element should be not removed, but just moved out as the last child of its parent
  // overrides dom.Element.remove
svg.Element.__bringToFront = function () {
  var el = this.__element;
  var pel;
  if (el) {
    pel = el.parentNode;
    pel.removeChild(el);
    //svg.frontShape = this;
    pel.appendChild(el);
  }
}
 
svg.Element.__hidden = function () {
  return this.visibility === "hidden";
}

pj.Array.__hidden = svg.Element.__hidden;

svg.Element.__hide = function () {
  this.visibility = "hidden";
  if (this.__element) {
    this.__draw();
  }
  return this;
}

svg.Element.__show = function () {
  this.visibility = "inherit";
 // if (this.__element) {
    this.__draw();
 // }
  return this;
}

svg.Element.__unhide = function () {
  this.visibility = "inherit";
  return this;
}

svg.Root.draw = function () {  
  var st = Date.now();
  var cn = this.contents;
  var tm;
  if (cn  && cn.__addToDom) cn.__addToDom(this.__element);
  tm = Date.now() - st;
  pj.log("svg","Draw time",tm);
}

svg.draw= function () {
  if (svg.main) svg.main.draw();
}

svg.Root.width = function () {
  var rs;
  var element = this.__element;
  if (element) {
    //rs = element.offsetWidth;
    debugger;
    rs = element.clientWidth;
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
    //rs = element.offsetHeight;
    rs = element.clientHeight;
    if (rs === undefined) {
      return parseFloat(element.attributes.height.nodeValue);
    }
    return rs;
  }
}


svg.commonAttributes = {"visibility":"S","pointer-events":"S","clip-path":"S","stroke":"S",fill:"S","stroke-opacity":"N","fill-opacity":"N",
                        "stroke-width":"N","text-anchor":"S"};

var tag = svg.set("tag",pj.Object.mk());
tag.set("svg",svg.Element.mk()).__namedType();
  tag.svg.set("attributes",pj.lift({width:"N",height:"N",viewBox:"S"})); 

tag.svg.mk = function () {
  return Object.create(tag.svg);
}

tag.set("g",svg.Element.mk()).__namedType();
tag.g.mk = function () {
  return svg.mkWithVis(tag.g);
}

tag.g.set("attributes",pj.Array.mk());// no attributes, but might have style

tag.set("line",svg.Element.mk()).__namedType();
tag.line.set("attributes",pj.lift({x1:"N",y1:"N",x2:"N",y2:"N","stroke-linecap":"S"}));

function primSvgStringR(dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
 }
  
tag.line.svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
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


tag.line.setEnds = function (e1,e2) {
  this.setEnd1(e1);
  this.setEnd2(e2);
}
  
  
tag.set("rect",svg.Element.mk()).__namedType();
tag.rect.set("attributes",pj.lift({x:"N",y:"N",width:"N",height:"N"}));
tag.rect.set('__signature',pj.Signature.mk({width:'N',height:'N',fill:'S',stroke:'S','stroke-width':'N'}));
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
  var crn,xt,rs;
  if (dst) {
    crn = dst.corner;
    xt = dst.extent;
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
  
  
tag.rect.__setExtent = function (extent) {
  this.width = extent.x;
  this.height = extent.y;
  this.x = -0.5 * extent.x;
  this.y = -0.5 * extent.y;
}

tag.rect.__adjustable = true;

tag.rect.setColor = function (color) {
  this.fill = color;
}
geom.Rectangle.toRect = function () {
  var rs = tag.rect.mk();
  rs.__enactBounds(this);
}
  
tag.rect.svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
  
  
geom.Transform.svgString = function (dst) {
  var rs = 'transform="'
  var tr = this.translation;
  var sc;
  if (tr) {
    rs += 'translate('+tr.x+' '+tr.y+')'
  }
  sc = this.scale;
  if (sc && sc!==1) {
    rs += 'scale('+sc+')'
  }
  rs += '"';
  return rs;
}


tag.set("path",svg.Element.mk()).__namedType();
tag.path.set("attributes",pj.lift({d:"S"}));
tag.path.set('__signature',pj.Signature.mk({fill:'S',stroke:'S','stroke-width':'N'}));

tag.path.svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
tag.set("polyline",svg.Element.mk()).__namedType();
tag.polyline.set("attributes",pj.lift({points:"S"}));

tag.polyline.svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
  
  
  
  tag.set("polygon",svg.Element.mk()).__namedType();
  tag.polygon.set("attributes",pj.lift({points:"S"}));

tag.polygon.svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}


tag.set("linearGradient",svg.Element.mk()).__namedType();
tag.linearGradient.set("attributes",pj.lift({x1:'N',x2:'N',y1:'N',y2:'N'}));



tag.set("stop",svg.Element.mk()).__namedType();
tag.stop.set("attributes",pj.lift({offset:'N','stop-color':'S','stop-opacity':'S'}));

  /* For setting the points field of a polyline or polygon from an array of geom.point, and from a mapping on the plane */
  
svg.toSvgPoints = function (points,f) {
  var rs = "";
  var i,p,mp;
  var n = points.length;
  for (var i=0;i<n;i++) {
    p = points[i];
    mp = f?f(p):p;
    rs += mp.x +",";
    rs += mp.y;
    if (i<n-1) {
      rs += ",";
    }
  }
  return rs;
}
  
/* returns bound of this in the coordinates of rt, if rt is supplied; ow in this's own coords */
svg.Element.__bounds = function (rt) {
  var el = this.__element;
  var bb,gc,sc,grs;
  if (el) {
    if (!el.getBBox) {
      pj.log("svg","Missing getBBox method");
      return;
    }
    bb = el.getBBox();
    pj.log("svg","BBOX ",bb);
    var rs = tag.rect.toRectangle.call(bb);
    if (rt) {
      gc = geom.toGlobalCoords(this,rs.corner);
      sc = geom.scalingDownHere(this);// 1 = includeRoot
      pj.log("svg","scaling down here",sc);
      grs = geom.Rectangle.mk(gc,rs.extent.times(sc));
      pj.log("svg","scaling ",sc,'extent',grs.extent.x,grs.extent.y);
      return grs;
    } else {
      return rs;
    }
  }
}
  
svg.visibleChildren = function (node) {
  var allVisible = true,noneVisible = true,
    rs = [];
  pj.forEachTreeProperty(node,function (child) {
    if (svg.Element.isPrototypeOf(child)) {
      if  (child.visibility === "hidden") {
        allVisible = false;
      } else {
        noneVisible = false;
        rs.push(child);
      }
    }
  });
  return noneVisible?rs:(allVisible?"all":rs);
}
   
// only goes one layer deep; used to exclude surrounders from root, currently
svg.boundsOnVisible = function  (node,root) {
  var visChildren = svg.visibleChildren(node);
  var rs;
  if (visChildren === "all") {
    return node.__bounds(root);
  } else {
    if (visChildren.length === 0) {
      return undefined;
    }
    visChildren.forEach(function (child) {
      var bnds = child.__bounds(root);
      if (rs) {
        rs = rs.extendBy(bnds);
      } else {
        rs = bnds;
      }
    });
    return rs;
  }
}
  

  var highlights = [];
  var numHighlightsInUse = 0;
  
var highlightNode = function (node) {
  var bounds,root,ebounds,ln,highlight,extent,corner;
  if (!node.__bounds) {
    return;
  }
  bounds = node.__bounds(svg.main);
  root = svg.main;
  if (root && bounds) {
    ebounds = bounds.expandBy(20,20);
    ln = highlights.length;
    if (numHighlightsInUse === ln) { // allocate another
      highlight = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
      svg.main.contents.__element.appendChild(highlight);
      highlight.setAttribute("fill","rgba(50,100,255,0.4)");
      highlight.setAttribute("stroke","rgba(255,0,0,0.4)");
      highlight.setAttribute("stroke-width","5");
      highlight.style["pointer-events"] = "none";
      highlights.push(highlight);
    } else {
      highlight = highlights[numHighlightsInUse++];
    }
    highlight.style.display = "block";
    var extent = ebounds.extent;
    var corner = ebounds.corner;
    highlight.setAttribute("width",extent.x)
    highlight.setAttribute("height",extent.y);
    highlight.setAttribute("x",corner.x);
    highlight.setAttribute("y",corner.y);
  }
}
  
  
svg.highlightNodes = function (nodes) {
  nodes.forEach(highlightNode);
}

svg.unhighlight = function () {
  highlights.forEach(function (highlight) {
    highlight.style.display = "none";
  });
  numHighlightsInUse = 0;
}
  

svg.Element.__getBBox = function () {
  var el = this.__element;
  if (el) {
    return el.getBBox();
  }
}

svg.Element.__getCTM = function () {
  var el = this.__element;
  if (el) {
    return el.getCTM();
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


tag.set("circle",svg.Element.mk()).__namedType();
tag.circle.set("attributes",pj.lift({r:"N",cx:"N",cy:"S"}));

tag.circle.setColor = function (color) {
  this.fill = color;
}
tag.circle.__getExtent = function () {
  var diam = 2 * this.r;
  return geom.Point.mk(diam,diam);
}
tag.circle.__setExtent = function (extent) {
  var r = 0.5 * Math.min(extent.x,extent.y)
  this.r = r; 
}

tag.circle.__adjustable = true;

tag.circle.svgStringR = primSvgStringR;
tag.set("text",svg.Element.mk()).__namedType();
tag.text.set({"font-family":"Arial","font-size":"10",fill:"black"});
tag.text.mk = function (txt) {
  var rs = svg.mkWithVis(tag.text);
  if (txt!==undefined) {
    rs.setText(txt);
  }
  return rs;
}
tag.text.set("attributes",pj.lift({x:"N",y:"N","font-style":"S","font-weight":"S","font-family":"S","font-size":"N"}));
tag.text.update = function () {
  var d = this.data;
  var tp = typeof(d);
  if (tp === "number") {
    this.setText(d+"");
  } else if (tp === "string") {
    this.setText(d);
  }
}

  tag.set("tspan",svg.Element.mk()).__namedType();
  tag.tspan.mk = function () {return Object.create(tag.tspan)};
  tag.tspan.set("attributes",pj.lift({x:"N",y:"N",dx:"N",dy:"N","font-family":"S","font-size":"N"}));

  
tag.text.svgStringR = function (dst) {
  var el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
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

  
pj.Object.__isShape = function () {
  return svg.Element.isPrototypeOf(this);
}

pj.Array.__isShape = function () {
  return true; 
}
svg.tag.text.setText = function (itxt)  {
  var txt = String(itxt);
  this.text = txt;
  this.updateSvgText();
  return;
} 
  
   
svg.tag.text.center = function () {
  var size = this['font-size']; 
  this.y = size/3;  
  return;
}

svg.tag.text.__setExtent = function (extent) {
  var iht = Math.trunc(extent.y);
  this["font-size"] = iht;
  this.y = iht/3
}
  
  svg.tag.text.updateSvgText  = function ()  {
   var el = this.__get("__element");
   var fc,txt,tn;
   if (!el) return;
   fc = el.firstChild;
   txt = this.text;
   if (fc && (fc.nodeType === 3)) {
     fc.textContent = txt;
   } else { // needs to be added
     tn = document.createTextNode(txt);
     el.appendChild(tn);
   }
 }
  
tag.set("clipPath",svg.Element.mk()).__namedType(); //tags are lower case
tag.set("defs",svg.Element.mk()).__namedType();

  
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
    debugger;
    pj.error('In transform','aritmetic');
  }
  var rs = 'translate('+tr.x+' '+tr.y+')';
  if (sc) {
    rs += 'scale('+sc+')';
  }
  return rs;
}
  // bounds computations:
  
  
 
  
svg.set("Rgb",pj.Object.mk()).__namedType();




pj.Object.__transformToSvg = function () {
  var xf = this.transform;
  var el = this.__element;
  var svgXf;
  if (el && xf) {
    svgXf = xf.toSvg();
    el.setAttribute("transform",svgXf);
  }
}
      
   
  
  // returns the transform that will fit bnds into the svg element, with fit factor ff (0.9 means the outer 0.05 will be padding)
 svg.Root.fitBoundsInto = function (bnds,fitFactor) {
  var ff = fitFactor?fitFactor:this.fitFactor;
  var wd = this.__container.offsetWidth;
  var ht = this.__container.offsetHeight;
   var dst = geom.Point.mk(wd,ht).toRectangle().scaleCentered(ff);
   var rs = bnds.transformTo(dst);
   pj.log("svg","fitting ",bnds," into ",wd,ht," factor ",ff);
   return rs;
  
 }
  
svg.Root.fitContentsTransform = function (fitFactor) {
  var cn = this.contents;
  var bnds;
  if (!cn) return undefined;
  if (!cn.__bounds) return undefined;
  bnds = cn.__bounds();
  // don't take the Element's own transform into account; that is what we are trying to compute!
  if (!bnds) return;
  return this.fitBoundsInto(bnds,fitFactor);
}
 
 
  
svg.Root.fitContents = function (fitFactor,dontDraw) {
  debugger;
  var cn = this.contents;
  var sr = cn.surrounders;
  var ff,fitAdjust,cxf,xf;
  if (sr) {
    sr.remove();
  }
  if (!dontDraw) {
    cn.__draw();
  }
  ff = fitFactor?fitFactor:this.contents.fitFactor;
  if (!ff) {
    ff = this.fitFactor;
  }
  fitAdjust = this.contents.fitAdjust;
  cxf = cn.transform;
  if (cxf) {
    cn.__removeAttribute("transform");
  }
  var xf = this.fitContentsTransform(ff);
  if (fitAdjust) {
    xf.set("translation",xf.translation.plus(fitAdjust));
  }
  cn.set("transform",xf);
  if (sr && pj.selectedNode) {
    pj.selectedNode.__setSurrounders();
  }
  cn.__draw();
}
 
   
svg.Root.fitBounds = function (fitFactor,bounds) {
  var cn = this.contents;
  var xf = this.fitBoundsInto(bounds,fitFactor);
  //return xf;
  var cxf = cn.transform;
  if (cxf) {
    cn.__removeAttribute("transform");
  }
  this.contents.set("transform",xf);
  this.draw();
}

  
svg.drawAll = function (){ // svg and trees
  svg.draw();//  __get all the latest into svg
  svg.main.fitContents();
  svg.draw();
}
  
pj.Array.__svgClear = function () { 
  var el = this.__element;
  if (el) {
    this.forEach(function (x) {
      if (typeof x === 'object') {
        x.remove();
      }
    });
  }
  this.length = 0;
}


pj.Object.__svgClear = function () {
  var el = this.__element;
  var thisHere = this;
  if (el) {
    this.__iterDomTree(function (x,nm) {
      x.remove();
    });
  }
}

svg.Element.mk = function (s) {
  var hasVis = false;
  var rs,ops,pv;
  if (s) {
    rs = dom.parseWithDOM(s,true);
    // introduce computed __values
    ops = Object.getOwnPropertyNames(rs);
    ops.forEach(function (p) {
      if (p === "visibility") {
        hasVis = true;
      }
      pv = rs[p];
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
  
svg.Root.eventToNode = function (e) {
  return e.target.__prototypeJungleElement;
}


svg.Root.addBackground = function () {
   var cl = this.contents?this.contents.backgroundColor:"white";
   var el =  this.__element;
   if (el) {
     el.style["background-color"] = cl;
   }
}
  
svg.__rootElement = function (nd) {
  var cv =nd;
  var pr;
  while (true) {
    pr = cv.__get('__parent');
    if (!(pj.svg.Element.isPrototypeOf(pr)||pj.Array.isPrototypeOf(pr))) return cv;
    cv = pr;
  }
}



svg.Root.updateAndDraw = function (doFit,iitm) {
  var itm = itm?itm:this.contents;
  if (itm.update) {
    itm.update();
  } else {
    pj.updateParts(itm);
  }
  if (itm.__draw) {
    itm.__draw();
    this.addBackground(); 

    if (doFit) this.fitContents();
  }
}
    
 
svg.stdColors = ["rgb(100,100,200)","rgb(100,200,100)","red","yellow","red","rgb(244,105,33)","rgb(99,203,154)","rgb(207,121,0)","rgb(209,224,58)","rgb(51, 97, 204)","rgb(216,40,165)",
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
  
  // fills in an  array mapping categories to colors with default values
svg.stdColorsForCategories = function (colors,categories) {
  var cnt = 0;
  var ln = svg.stdColors.length;
  categories.forEach(function (category) {
    if (!colors[category]) {
      colors[category] = svg.stdColors[cnt%ln];
    }
    cnt++;
  });
}
  
  // move to a given location in nd's own coordinates
    // supports multiple input formats eg x = Point or array


svg.Element.__moveto = function (ix,iy) {
  var x,y,xf;
  if (typeof iy=="number") {
    x = ix;
    y = iy;
  } else {
    x = ix.x;
    y = ix.y;
  }
  xf = this.transform;
  if (xf) {
    xf.translation.setXY(x,y);
    
  }  else {
    xf = geom.mkTranslation(x,y);
    this.set("transform",xf);
  }
  this.__transformToSvg(); 
}
  

svg.Element.__setX = function (x) {
  var xf = this.transform;
  var tr;
  if (xf) {
    tr = xf.translation;
    tr.x = x;
    return;
  }
  xf = geom.mkTranslation(x,0);
  this.set("transform",xf);
}

svg.Element.__setY = function (y) {
  var xf = this.transform;
  var tr;
  if (xf) {
    tr = xf.translation;
    tr.y = y;
    return;
  }
  xf = geom.mkTranslation(0,y);
  this.set("transform",xf);
}


  
svg.Element.__setScale = function (s) {
  var xf = this.transform;
  if (xf) {
    xf.scale = s;
    return;
  }
  xf = geom.mkScaling(s);
  this.set("transform",xf);
}

//pj.defineSpread(svg.tag.g.mk); 

svg.svgAncestor = function (node) {
  var current = node;
  while (true) {
    if (svg.tag.svg.isPrototypeOf(current)) {
      return current;
    } else {
      if (current.__container) {
        return svg.main;
      }
      current = current.__parent;
      if (!current) {
        return undefined;
      }
    }
  }
}

tag.text.__getExtent = function () {
  var bb = this.__getBBox();
  return geom.Point.mk(bb.width,bb.height);
}

tag.text.__holdsExtent = function () {
  return this.hasOwnProperty('font-size');
}



tag.text.__scalable = true;
tag.text.__adjustable = true;

svg.Element.__getExtent = function () {
  return pj.geom.Point.mk(this.width,this.height);
}


svg.Element.__setExtent = function (extent) {
  this.width = extent.x;
  this.height = extent.y;
}

svg.Element.__removeIfHidden = function () {
  if (this.__hidden()) {
    this.remove();
  } else {
    this.__iterDomTree(function (ch) {
        ch.__removeIfHidden();
      },true); 
  }
}


svg.Element.__getTranslation = function () {
  var xf = this.transform;
  if (xf) {
    return xf.translation;
  }
  return geom.Point.mk(0,0);
}
  
  
  
svg.Element.__getScale = function () {
  var xf = this.transform;
  if (xf) {
    return xf.scale;
  }
  return 1;
}

pj.Array.__removeIfHidden = svg.Element.__removeIfHidden;


pj.newItem = function () {
  return tag.g.mk();
  return svg.Element.mk('<g/>');
}

// color utilities

svg.colorTable = {blue:'#0000FF',
                  red:'#FF0000',
                  green:'#00FF00'};
                  
svg.parseColor  =  function (color) {
  if (color[0] === '#') {
    return {r:parseInt(color.substr(1,2),16),
            g:parseInt(color.substr(3,2),16),
            b:parseInt(color.substr(5,2),16)};
  }
  var m = color.match(/^rgb\(\ *(\d*)\ *\,\ *(\d*)\ *\,\ *(\d*)\ *\)$/);
  if (m) {
    return {r:Number(m[1]),g:Number(m[2]),b:Number(m[3])}
  } else {
    var lkup = svg.colorTable[color];
    if (lkup) {
      return svg.parseColor(lkup);
    } else {
      return null;
    }
  }
}


//end extract
})(prototypeJungle);
