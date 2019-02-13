// Copyright 2019 Chris Goad
// License: MIT

const  svg = codeRoot.set('svg',core.ObjectNode.mk());//just for supporting an old naming scheme svg.Element, as a synonym for dom.SvgElement
const mkWithVis = function (pr) {
  let rs = Object.create(pr);
  rs.visibility = "inherit";
  return rs;
}
  
let svgNamespace = "http://www.w3.org/2000/svg";

// a Root is separate svg element. At the moment only one is in use: svgMain
let SvgRoot = Object.create(Element).__namedType();

  
SvgRoot.mk = function (container) {
  let rs = Object.create(SvgRoot);
  let cel,wd,ht;
  rs.fitFactor = 0.8; // a default;
  cel = document.createElementNS("http://www.w3.org/2000/svg",'svg');
  cel.setAttribute("version","1.1");
  cel.style.background = 'white';
  cel.addEventListener("dragstart",function (event) {
    event.preventDefault();
  });
  rs.__element = cel;
  rs.__aPoint = cel.createSVGPoint();
  if (container) {
    rs.__container = container;
    container.appendChild(cel);
    wd = Math.max(container.offsetWidth-2,1);// -2 motivated by jsfiddle (ow boundary of containing div not visible)
    ht = Math.max(container.offsetHeight-2,1);
    cel.setAttribute('height',ht);
    cel.setAttribute('width',wd);
  }
 // rs.set("transform",vars.defaultTransform);

  return rs;
}

SvgRoot.cursorPoint = function (evt) {
  let core = this.__aPoint;
  let rs;
  core.x = evt.clientX;
  core.y = evt.clientY;
  rs = core.matrixTransform(this.__element.getScreenCTM().inverse());
  return Point.mk(rs.x,rs.y);
}

  
  
  
const wrapAsSvgRoot = function (node) {
  let rs = Object.create(SvgRoot);
  let cel;
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

let svgMain;
const setSvgMain = function (node) {
  svgMain = node;//svg.wrapAsRoot(node);
}

const fullUpdate = () => {
  svgMain.updateAndDraw();
}

SvgRoot.resize = function (wd,ht) {
  let cel = this.__element;
  if (cel) {
    cel.setAttribute("width",wd)
    cel.setAttribute("height",ht);
  }
  if (this.aRect) {
    this.addBackground();
  }
}
 
let SvgElement = Object.create(Element).__namedType();
SvgElement.mk = function () {return Object.create(SvgElement)};

svg.Element = SvgElement;

SvgElement.__svgStringR = function (dst) {
  let el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}

SvgElement.__addChildren = function (ch) {
  let thisHere = this;
  ch.forEach(function (c) {
    thisHere.push(c);
  });
  return this;
}
  
/* outerHTML is not defined in IE edge or safari 
 * From http://www.yghboss.com/outerhtml-of-an-svg-element/
 * with jquery: $('<div>').append($(svgElement).clone()).html(); */

SvgElement.__outerHTML = function() {
  let el = this.__element;
  let oh,node,temp;
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

SvgElement.__visible = function () {
  let v = this.visibility;
  return (v===undefined) || (v==="visible")||(v==="inherit");
}

  
  // if bringToFront is true, then the element should be not removed, but just moved out as the last child of its parent
  // overrides dom.Element.remove
SvgElement.__bringToFront = function () {
  let el = this.__element;
  let pel;
  if (el) {
    pel = el.parentNode;
    pel.removeChild(el);
    //svg.frontShape = this;
    pel.appendChild(el);
  }
}

SvgElement.__children = function () {
  let rs = [];
  core.forEachTreeProperty(this,function (node) {
    if (SvgElement.isPrototypeOf(node)) {
      rs.push(node);
    }
  });
  return rs;
}
// readd all of the children with indices > index
SvgElement.__removeChildrenInFront = function (index) {
  let children = this.__children();
  sortByIndex(children);
  let pel = this.__element;
  let rs = [];
  children.forEach(function (child) {
    if (child.__setIndex > index) {
      let el = child.__element;
      if (el) {
        rs.push(el);
        pel.removeChild(el);
      }
    }
  });
  return rs;
}




// replaces a child while keeping the order of children
SvgElement.__replaceChild = function(child,replacement) {
  let vis = child.__visible();
  let pel = this.__element;
  let idx = child.__setIndex;
  let name = child.__name;
  let removed = this.__removeChildrenInFront(idx);
  if (vis) {
    replacement.unhide();
  }
  this.set(name,replacement);
  replacement.__setIndex = idx;
  removed.forEach(function (el) {
    pel.appendChild(el);
  });
}

SvgElement.__reorderBySetIndex = function() {
  let pel = this.__element;
  let removed = this.__removeChildrenInFront(-1);//removes all children, and returns them in setIndex order
  removed.forEach(function (el) {
    pel.appendChild(el);
  });
}

SvgElement.__hidden = function () {
  return this.visibility === "hidden";
}

SvgElement.hidden = function () {
  return this.visibility === "hidden";
}

core.ArrayNode.__hidden = SvgElement.__hidden;

SvgElement.hide = function () {
  this.visibility = "hidden";
  if (this.__element) {
    this.draw();
  }
  return this;
}

SvgElement.show = function () {
  this.visibility = "inherit";
 // this.__isPrototype = false; //prototypes are never shown
  if (this.__get('__parent')) {
    this.draw();
  }
  return this;
}

SvgElement.unhide = function () {
  this.visibility = "inherit";
  return this;
}

SvgRoot.draw = function () {  
  let st = Date.now();
  let cn = this.contents;
  let tm;
  if (cn  && cn.__addToDom) {
    cn.__addToDom(this.__element);
  }
  tm = Date.now() - st;
  core.log("svg","Draw time",tm);
}

export function svgDraw () {
  if (svgMain) {
    svgMain.draw();
  }
}

SvgRoot.width = function () {
  let rs;
  let element = this.__element;
  if (element) {
    rs = element.clientWidth;
    if (rs === undefined) {
      return parseFloat(element.attributes.width.nodeValue);
    }
    return rs;
  }
}
  
SvgRoot.height = function () {
  let rs;
  let element = this.__element;
  if (element) {
    //rs = element.offsetHeight;
    rs = element.clientHeight;
    if (rs === undefined) {
      return parseFloat(element.attributes.height.nodeValue);
    }
    return rs;
  }
}

      
const svgCommonTransfers = ['visibility','stroke','stroke-opacity','stroke-width','stroke-linecap','fill','fill-opacity'];


let tag = svg.set("tag",core.ObjectNode.mk());
tag.set("svg",SvgElement.mk()).__namedType();

tag.svg.__domTransfers = ['width','height','viewBox'];

tag.svg.mk = function () {
  return Object.create(tag.svg);
}

tag.set("g",SvgElement.mk()).__namedType();

tag.g.__domTransfers =svgCommonTransfers;


tag.g.mk = function () {
  return mkWithVis(tag.g);
}


tag.set("image",SvgElement.mk()).__namedType();

tag.image.__domTransfers = ['width','height','href'];


tag.image.mk = function (width,height,url) {
  let rs = mkWithVis(tag.image);
  rs.href = url;
  rs.width = width;
  rs.height = height;
  rs.aspectRatio = width/height;
  return rs;
}


tag.image.setDomAttributes = function (element) {
  element.setAttribute('x',-0.5*this.width);
  element.setAttribute('y',-0.5*this.height);
};



tag.image.__svgStringR = function (dst) {
  let el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  vars.imageFound = true;
  let irs = this.__outerHTML().replace('href','xlink:href');
  if (el) {
    dst[0] += irs;
  } 
}

tag.set("line",SvgElement.mk()).__namedType();

tag.line.__domTransfers = svgCommonTransfers.concat(['x1','y1','x2','y2']);

const primSvgStringR = function(dst) {
  let el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
 }
  
tag.line.__svgStringR = function (dst) {
  let el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
  
tag.line.end1 = function () {
  return Point.mk(this.x1,this.y1);
}

tag.line.end2 = function () {
  return Point.mk(this.x2,this.y2);
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
  
  
tag.set("rect",SvgElement.mk()).__namedType();
tag.rect.__domTransfers = svgCommonTransfers.concat(['x','y','rx','ry','width','height']);

tag.rect.mk = function (x,y,width,height) {
  let rs = mkWithVis(tag.rect);
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
  let crn,xt;
  if (dst) {
    crn = dst.corner;
    xt = dst.extent;
    crn.x = this.x;
    crn.y = this.y;
    xt.x = this.width;
    xt.y = this.height;
    return dst;
  } else {
    crn = Point.mk(this.x,this.y);
    xt = Point.mk(this.width,this.height);
    return Rectangle.mk(crn,xt);
  }
}
  

//tag.rect.__adjustable = true;

tag.rect.setColor = function (color) {
  this.fill = color;
}
Rectangle.toRect = function () {
  let rs = tag.rect.mk();
  rs.__enactBounds(this);
}
  
tag.rect.__svgStringR = function (dst) {
  let el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
  
  
Transform.svgString = function () {
  let rs = 'transform="'
  let tr = this.translation;
  let sc;
  if (tr) {
    rs += 'translate('+tr.x+' '+tr.y+')'
  }
  sc = this.scale;
  if (typeof sc === 'number') {
    if (sc!==1) {
      rs += 'scale('+sc+')';
    }
  } else if (sc) {
    rs += 'scale('+sc.x+' '+sc.y+')';
  }
  rs += '"';
  return rs;
}


tag.set("path",SvgElement.mk()).__namedType();

tag.path.__domTransfers = svgCommonTransfers.concat(['d']);

tag.path.__svgStringR = function (dst) {
  let el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    let ohtml = this.__outerHTML();
    dst[0] += ohtml;
  }
}
tag.set("polyline",SvgElement.mk()).__namedType();

tag.polyline.__domTransfers =svgCommonTransfers.concat(['points']);

tag.polyline.__svgStringR = function (dst) {
  let el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
  
  
  
  tag.set("polygon",SvgElement.mk()).__namedType();
  
tag.polygon.__domTransfers = svgCommonTransfers.concat(['points']);

tag.polygon.__svgStringR = function (dst) {
  let el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}


tag.set("linearGradient",SvgElement.mk()).__namedType();

tag.linearGradient.__domTransfers = svgCommonTransfers.concat(['x1','y1','x2','y2']);

tag.set("radialGradient",SvgElement.mk()).__namedType();

tag.radialGradient.__domTransfers = svgCommonTransfers;

tag.set("stop",SvgElement.mk()).__namedType();


tag.stop.__domTransfers = svgCommonTransfers.concat(['offset','stop-color','stop-opacity']);

  /* For setting the points field of a polyline or polygon from an array of point, and from a mapping on the plane */
 
const toSvgPoints = function (points,f) {
  let rs = "";
  let p,mp;
  let n = points.length;
  for (let i=0;i<n;i++) {
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

SvgElement.hasHiddenDescendant  = function () {
  return !!core.findDescendant(this,function (node) {
    return node.visibility === 'hidden';
  });
}

SvgElement.boundsWithHidden = function (rt) {
  let el = this.__element;
  if (el) {
    let bb = el.getBBox();
    return tag.rect.toRectangle.call(bb);
  }
}

/* returns bound of this in the coordinates of rt, if rt is supplied; ow in this's own coords */
SvgElement.bounds = function (rt) {
  core.log('bounds','getBounds');
  let el = this.__element;
  let bb,gc,sc,grs;
  let localBnds,overallBnds;
  if (el) {
    let rects = [];
    if (this.visibility === 'hidden') {
      return undefined;
    }
    // for navaho.js the recursion fails for the root - unknown why
    if ((this !== core.root) && this.hasHiddenDescendant()) { // bbox includes hidden parts, but we do not wish to include them, so have to recurse
      core.log('bounds','has hidden descendant');
      let thisHere = this;
      core.forEachTreeProperty(this,function (child) {
        if ((child.__element) && (child.visibility !== 'hidden') && (child.bounds)) {
          let cbnds = child.bounds(thisHere);
          if (cbnds) {
            let ext = cbnds.extent;
            if ((ext.x !==0)||(ext.y !==0)) {
              rects.push(cbnds);
            }
          }
        } else {
          return undefined;
        }
      });
      if (rects.length === 0) {
        return undefined;
      } else if (rects.length === 1) {
        localBnds = rects[0];
      } else {
        localBnds = geom.boundsForRectangles(rects);
      }      
    } else {
      if (!el.getBBox) {
        core.log("svg","Missing getBBox method");
        return;
      }
      bb = el.getBBox();
      core.log("svg","BBOX ",bb);
      localBnds  = tag.rect.toRectangle.call(bb);
      
    }
    if (rt) {
      gc = this.toAncestorCoords(localBnds.corner,rt);
      sc = this.scalingRelAncestor(rt);
      core.log("svg","scaling down here",sc);
      grs = Rectangle.mk(gc,localBnds.extent.times(sc));
      core.log("svg","scaling ",sc,'extent',grs.extent.x,grs.extent.y);
      return grs;
    } else {
      return localBnds;
    }
  }
}

const centerOnOrigin = function (iitem) {
  let item = iitem?iitem:core.root;
  let bnds = item.bounds();
  let mcenter = bnds.center().minus();
  core.forEachTreeProperty(item,function (child) {
    if (SvgElement.isPrototypeOf(child)) {
      let tr = child.getTranslation();
      let newPos = tr.plus(mcenter);
      child.moveto(newPos);
    }
  });
  let xt=bnds.extent;
  item.width = xt.x;
  item.height = xt.y;
  
  
}
    

  
// mostly used for debugging
const showRectangle = function (bnds) {
  let ext = bnds.extent;
  let crn = bnds.corner;
  let nm =   core.autoname(core.root,'rectangle');
  core.root.set(nm,SvgElement.mk(
   '<rect x="'+crn.x+'" y="'+crn.y+'" width="'+ext.x+'" height="'+ext.y+
   '" stroke="red" stroke-width="2" fill="transparent"/>'));
}

const visibleSvgChildren = function (node) {
  let allVisible = true;
  let noneVisible = true;
  let rs = [];
  core.forEachTreeProperty(node,function (child) {
    if (SvgElement.isPrototypeOf(child)) {
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
const boundsOnVisible = function  (node,root) {
  let visChildren = visibleSvgChildren(node);
  let rs;
  if (visChildren === "all") {
    return node.bounds(root);
  } else {
    if (visChildren.length === 0) {
      return undefined;
    }
    visChildren.forEach(function (child) {
      let bnds = child.bounds(root);
      if (rs) {
        rs = rs.extendBy(bnds);
      } else {
        rs = bnds;
      }
    });
    return rs;
  }
}
  

  let highlights = [];
  let highlightedNodes = []
  //let numHighlightsInUse = 0;
let stdHighlightFill = "rgba(0,0,255,0.4)";

const allocateHighlights = function (n) {
  let ln = highlights.length;
  for (let i=ln;i<n;i++) {
    let highlight = document.createElementNS("http://www.w3.org/2000/svg",'rect');
    svgMain.contents.__element.appendChild(highlight);
    highlight.setAttribute("fill",stdHighlightFill);
    highlight.setAttribute("stroke","rgba(255,0,0,0.4)");
    highlight.setAttribute("stroke-width","5");
    highlight.style["pointer-events"] = "none";
    highlights.push(highlight);
  }
}

const highlightNode = function (node,highlight) {
  let bounds,root,ebounds;
  if (!node.bounds) {
    return;
  }
  bounds = node.bounds(core.root);//svgMain);
  if (bounds) {
    ebounds = bounds.expandBy(20,20);
    highlight.style.display = "block";
    let extent,corner;
    ({extent,corner} = ebounds);
    highlight.setAttribute("width",extent.x)
    highlight.setAttribute("height",extent.y);
    highlight.setAttribute("x",corner.x);
    highlight.setAttribute("y",corner.y);
    node.__highlight = highlight;
    highlightedNodes.push(node);
  }
}

const changeHighlightColor = function (highlight,color) {
  highlight.setAttribute("fill",color);
}
let extraNodeHighlighted;
// needed for addToCohort
const highlightExtraNode = function (node) {
  let ln = highlightedNodes.length;
  let ui = core.ui;
  if (extraNodeHighlighted) {
    if (extraNodeHighlighted === node) {
      return;
    } else if (node) { // replace the node begin highlighted
      highlightedNodes.pop();
      highlightNode(node,highlights[ln-1]);
      extraNodeHighlighted = node;
    } else {
      highlights[ln-1].style.display = "none";
      highlightedNodes.pop();
      extraNodeHighlighted = undefined;
    }
  } else if (node) { // add a node to highlight
    allocateHighlights(ln+1);
    highlightNode(node,highlights[ln]);
    extraNodeHighlighted = node;
  }
} 
  
const highlightNodes = function (inodes) {
  highlightExtraNode(undefined);
  let nodes = inodes.filter(function (node) {return node.__hidden && !node.__hidden()});
  highlightedNodes.length = 0;
  let ln = nodes.length;
  allocateHighlights(ln);
  for (let i=0;i<ln;i++) {
    highlightNode(nodes[i],highlights[i]);
  }
}



const unhighlight = function () {
  highlights.forEach(function (highlight) {
    highlight.style.display = "none";
    highlight.setAttribute("fill",stdHighlightFill);

  });
  highlightedNodes.forEach(function (node) {
    node.__highlight = undefined;
  });
}
  

SvgElement.getBBox = function () {
  core.log('bounds','getBBox');
  let el = this.__element;
  if (el) {
    return el.getBBox();
  }
}

SvgElement.__getCTM = function () {
  let el = this.__element;
  if (el) {
    return el.getCTM();
  }
}
SvgElement.__getHeight = function () {
  let el = this.__element;
  if (el) {
    return el.getBBox().height;
  } else {
    return 0;
  }
}


tag.set("circle",SvgElement.mk()).__namedType();
tag.circle.__domTransfers = svgCommonTransfers.concat(['cx','cy','r']);

//tag.circle.set("attributes",core.lift({r:"N",cx:"N",cy:"S"}));

tag.circle.setColor = function (color) {
  this.fill = color;
}
tag.circle.__getExtent = function () {
  let diam = 2 * this.r;
  return Point.mk(diam,diam);
}


//tag.circle.__adjustable = true;

tag.circle.__svgStringR = primSvgStringR;

tag.set("text",SvgElement.mk()).__namedType();
tag.text.set({"font-family":"Arial","font-size":"10",fill:"black","stroke-width":0.5});
tag.text.mk = function (txt) {
  let rs = mkWithVis(tag.text);
  if (txt!==undefined) {
    rs.setText(txt);
  }
  return rs;
}

tag.text.__domTransfers =  svgCommonTransfers.concat(['x','y','stroke-width','font-style','font-weight','font-family','font-size','text-anchor']);

tag.text.update = function () {
  let d = this.__data;
  let tp = typeof d;
  if (tp === "number") {
    this.setText(String(d));
  } else if (tp === "string") {
    this.setText(d);
  }
}

tag.set("tspan",SvgElement.mk()).__namedType();
tag.tspan.mk = function () {return Object.create(tag.tspan)};

tag.tspan.__domTransfers  = svgCommonTransfers.concat(['x','y','dx','dy','font-family','font-size']);
  
tag.text.__svgStringR = function (dst) {
  let el;
  if (this.__hidden()) {
    return;
  }
  el = this.__element;
  if (el) {
    dst[0] += this.__outerHTML();
  }
}
const SvgElementPath = function (el) {
  let rs = [];
  let cel = el;
  while (cel.tagName !== "svg") {
    rs.push(cel.id);
    cel = cel.parentNode;
  }
  rs.pop(); // don't need that last step
  rs.reverse();
  return rs;
}
  
core.ObjectNode.__isShape = function () {
  return SvgElement.isPrototypeOf(this);
}

core.ArrayNode.__isShape = function () {
  return true; 
}

tag.text.setText = function (itxt)  {
  let txt = String(itxt);
  this.text = txt;
   if (itxt === '\n') {
    return;
  }
  this.updateSvgText();
} 
  
   
tag.text.center = function () {
  let size = this['font-size']; 
  this.y = size/3;  
}

  
  tag.text.updateSvgText  = function ()  {
   let el = this.__get("__element");
   let fc,txt,tn;
   if (!el) {
    return;
   }
   fc = el.firstChild;
   txt = this.text;
   //txt = 'ab \u0398';
   if (txt === '\n') {
     return;
   }
   if (fc && (fc.nodeType === 3)) {
     fc.textContent = txt;
   } else { // needs to be added
     tn = document.createTextNode(txt);
     el.appendChild(tn);
   }
 }
  
tag.set("clipPath",SvgElement.mk()).__namedType(); //tags are lower case
tag.set("defs",SvgElement.mk()).__namedType();


tag.defs.__domTransfers = ['gradient'];
  
const stringToSvgTransform = function (s) {
    let mt = s.match(/translate\(([^ ]*)( +)([^ ]*)\)/)
    if (mt) {
      return geom.mkTranslation(parseFloat(mt[1]),parseFloat(mt[3]));
    }
  }
    
Transform.toSvg = function () {
  let tr = this.translation;
  let sc = this.scale;
  let rt = this.rotation;
  let {x,y} = tr;
  if (isNaN(x)||isNaN(y)||isNaN(sc)) {
    core.error('svg','NaN in transform');
  }
  let rs = 'translate('+tr.x+' '+tr.y+')';
  if (sc) {
    rs += 'scale('+sc+')';
  }
  if (rt) {
    rs += 'rotate('+rt+')';
  }
  return rs;
}
  // bounds computations:
  
  
 
  
svg.set("Rgb",core.ObjectNode.mk()).__namedType();

SvgElement.realizeTransform  = function () {
  let xf = this.transform;
  let el = this.__element;
  let svgXf;
  if (el && xf) {
    svgXf = xf.toSvg();
    el.setAttribute("transform",svgXf);
  }
}
      
   
 
  // returns the transform that will fit bnds into the svg element, with fit factor ff (0.9 means the outer 0.05 will be padding)
 SvgRoot.fitBoundsInto = function (bnds,fitFactor) {
  let ff = fitFactor?fitFactor:this.fitFactor;
  let wd = this.__container.offsetWidth;
  let ht = this.__container.offsetHeight;
   let dst = Point.mk(wd,ht).toRectangle().scaleCentered(ff);
   let rs = bnds.transformTo(dst);
   core.log("svg","fitting ",bnds," into ",wd,ht," factor ",ff);
   return rs;
 }
 
 SvgRoot.boundsFitIntoPanel  = function (fitFactor) {
  let cn = this.contents;
  let bnds = cn.bounds();
  let cxf = cn.transform;
  let tbnds = bnds.applyTransform(cxf);
  let ff = fitFactor?fitFactor:this.fitFactor;
  let wd = this.__container.offsetWidth;
  let ht = this.__container.offsetHeight;
  let dst = Point.mk(wd,ht).toRectangle().scaleCentered(ff);
  return dst.containsRectangle(tbnds);
 }
 

svg.stdExtent = Point.mk(400,300);
svg.fitStdExtent = true; 
SvgRoot.fitContentsTransform = function (fitFactor) {
  let cn = this.contents;
  let bnds;
  if (!cn) {
    return undefined;
  }
  if (!cn.bounds) {
    return undefined;
  }
  bnds = cn.bounds();
  // don't take the Element's own transform into account; that is what we are trying to compute!
  if (!bnds) {
    return;
  }
  let zeroBnds = (bnds.extent.x === 0) && (bnds.extent.y === 0);
  ///let expanded = svg.fitStdExtent?bnds.expandTo(svg.stdExtent.x,svg.stdExtent.y):bnds;
  let expanded = zeroBnds?bnds.expandTo(svg.stdExtent.x,svg.stdExtent.y):bnds;
  return this.fitBoundsInto(expanded,fitFactor);
}
 
SvgRoot.fitItem = function (item,fitFactor) {
  let bnds = item.bounds();
  let xf = this.fitBoundsInto(bnds,fitFactor);
  let cn = this.contents;
  cn.set("transform",xf);
  cn.draw();

}
SvgRoot.fitContents = function (fitFactor,dontDraw,onlyIfNeeded) {
  let cn = this.contents;
  let ff,fitAdjust,cxf,xf;
  if (!dontDraw) {
    cn.draw();
  }
  ff = fitFactor?fitFactor:this.fitFactor;
  if (!ff) {
    ff = this.fitFactor;
  }
  fitAdjust = this.contents.fitAdjust;
  if (onlyIfNeeded) {
    if (this.boundsFitIntoPanel(ff)) {
      return;
    }
  }
  let newXf = this.fitContentsTransform(ff);
  if (!newXf) {
    newXf = vars.defaultTransform;
  }
  cxf = cn.transform;
  if (cxf) {
    cn.__removeAttribute("transform");
  }
  if (fitAdjust) {
    xf.set("translation",newXf.translation.plus(fitAdjust));
  }
  cn.set("transform",newXf);
  cn.draw();
}

SvgRoot.fitContentsIfNeeded = function(fitFactor,dontDraw) {
  let ff = fitFactor?fitFactor:0.8;
  this.fitContents(ff,dontDraw,true);
}
  
 
   
SvgRoot.fitBounds = function (fitFactor,bounds) {
  let cn = this.contents;
  let xf = this.fitBoundsInto(bounds,fitFactor);
  //return xf;
  let cxf = cn.transform;
  if (cxf) {
    cn.__removeAttribute("transform");
  }
  this.contents.set("transform",xf);
  this.draw();
}

  
svg.drawAll = function () { // svg and trees
  svg.draw();//  __get all the latest into svg
  svgMain.fitContents();
  svg.draw();
}

svg.fitContents = function (ifit) {
  let fit = ifit?ifit:0.9
   svgMain.fitContents(fit);
}
core.ArrayNode.__svgClear = function () { 
  let el = this.__element;
  if (el) {
    this.forEach(function (x) {
      if (typeof x === 'object') {
        x.remove();
      }
    });
  }
  this.length = 0;
}


core.ObjectNode.__svgClear = function () {
  let el = this.__element;
  if (el) {
    this.__iterDomTree(function (x) {
      x.remove();
    });
  }
}

SvgElement.mk = function (s) {
  let hasVis = false;
  let rs,ops,pv;
  if (s) {
    rs = parseWithDOM(s,true);
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
    rs = Object.create(SvgElement);
  }
  if (!hasVis) {
    rs.visibility = "inherit";
  }
  return rs;
}
  
SvgRoot.eventToNode = function (e) {
  return e.target.__protoPediaElement;
}


SvgRoot.addBackground = function () {
   let cl = this.contents?this.contents.backgroundColor:"white";
   let el =  this.__element;
   if (el) {
     el.style["background-color"] = cl;
   }
}
  
svg.__rootElement = function (nd) {
  let cv =nd;
  let pr;
  while (true) {
    pr = cv.__get('__parent');
    if (!(core.SvgElement.isPrototypeOf(pr)||core.ArrayNode.isPrototypeOf(pr))) {
      return cv;
    }
    cv = pr;
  }
}


vars.fullUpdateHooks = [];

SvgRoot.updateAndDraw = function (doFit,newFrame=true) {
  let itm = this.contents;
  if (itm.update) {
    itm.__update();
  } else {
    core.updateParts(itm,function (part) {
      return (!core.isPrototype(part)) && SvgElement.isPrototypeOf(part) && part.__visible();
    });
  }
  vars.fullUpdateHooks.forEach((fn) => fn());
  if (itm.draw) {
    itm.draw();
    this.addBackground(); 
    if (doFit) {
      this.fitContents();
    }
  }
}
    
 
svg.stdColors = ["rgb(100,100,200)","rgb(100,200,100)","red","yellow","red","rgb(244,105,33)","rgb(99,203,154)","rgb(207,121,0)","rgb(209,224,58)","rgb(51, 97, 204)","rgb(216,40,165)",
                   "rgb(109,244,128)","rgb(77,134,9)","rgb(1,219,43)","rgb(182,52,141)","rgb(48,202,20)","rgb(191,236,152)",
                   "rgb(112,186,127)","rgb(45,157,87)","rgb(80,205,24)","rgb(250,172,121)","rgb(200,109,204)","rgb(125,10,91)",
                   "rgb(8,188,123)","rgb(82,108,214)"];
const stdColor = function (n) {
  if (n < svg.stdColors.length) {
    return svg.stdColors[n];
  } else {
    return svg.randomRgb();
  }
}
  
  // fills in an  array mapping categories to colors with default values
svg.stdColorsForCategories = function (colors,categories) {
  let cnt = 0;
  let ln = svg.stdColors.length;
  categories.forEach(function (category) {
    if (!colors[category]) {
      colors[category] = svg.stdColors[cnt%ln];
    }
    cnt++;
  });
}

core.defineSpread(tag.g.mk);

const isGeometric = function (nd) {
  return SvgElement.isPrototypeOf(nd);
}
geom.defineGeometric(SvgElement,isGeometric); 

svg.svgAncestor = function (node) {
  let current = node;
  while (true) {
    if (svg.tag.svg.isPrototypeOf(current)) {
      return current;
    } else {
      if (current.__container) {
        return svgMain;
      }
      current = current.__parent;
      if (!current) {
        return undefined;
      }
    }
  }
}

tag.text.__getExtent = function () {
  let bb = this.getBBox();
  return Point.mk(bb.width,bb.height);
}

tag.text.__holdsExtent = function () {
  return this.hasOwnProperty('font-size');
}

SvgElement.__getExtent = function () {
  return Point.mk(this.width,this.height);
}


SvgElement.__removeIfHidden = function () {
  if (this.__hidden()) {
    this.remove();
  } else {
    this.__iterDomTree(function (ch) {
        ch.__removeIfHidden();
      },true); 
  }
}

SvgElement.getScale = function () {
  let xf = this.transform;
  if (xf) {
    return xf.scale;
  }
  return 1;
}
core.ArrayNode.__removeIfHidden = SvgElement.__removeIfHidden;


// color utilities

svg.colorTable = {blue:'#0000FF',
                  red:'#FF0000',
                  green:'#00FF00'};
                  
const parseColor  =  function (color) {
  if (color[0] === '#') {
    return {r:parseInt(color.substr(1,2),16),
            g:parseInt(color.substr(3,2),16),
            b:parseInt(color.substr(5,2),16)};
  }
  let m = color.match(/^rgb\( *(\d*) *, *(\d*) *, *(\d*) *\)$/);
  if (m) {
    return {r:Number(m[1]),g:Number(m[2]),b:Number(m[3])}
  } else {
    let lkup = svg.colorTable[color];
    if (lkup) {
      return svg.parseColor(lkup);
    } else {
      return null;
    }
  }
}

const isVisible =  function (inh) {
      return SvgElement.isPrototypeOf(inh) && inh.__visible()
    //code
};

core.ObjectNode.__updateVisibleInheritors = function () {
  core.updateInheritors(this,function (x) {x.__update()},isVisible);
 
}


core.ObjectNode.__forVisibleInheritors = function (fn) {
  core.forInheritors(this,fn,isVisible);
}

const updateVisibleParts = function (node) {
  core.updateParts(node,
    function (part) {
      return SvgElement.isPrototypeOf(part) && part.__visible();
  });
}

const newDomItem = function () {
  return svg.Element.mk('<g/>');
}

core.setItemConstructor(newDomItem);


const stdTransferredProperties = ['stroke','stroke-width','fill','role','text'];


export {SvgRoot,SvgElement,tag as SvgTag,setSvgMain,svgMain,unhighlight,svg,highlightNodes,
        highlightExtraNode,centerOnOrigin,fullUpdate,stdTransferredProperties};