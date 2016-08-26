(function (pj) {
  var geom = pj.geom;
 
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly

//start extract

var dom = pj.set("dom",pj.Object.mk());
var svg =  pj.set("svg",pj.Object.mk());
dom.__builtIn = true;
svg.__builtIn = true;

/* the two varieties of dom elements are svg.shape and html.Element
 * each particular element, such as an svg rect or an html div, is represented by its own prototype.
 */

dom.set("Element",pj.Object.mk()).__namedType();

/* how dom objects are represented: <tag att1=22 att2=23>abcd <tag2 id="abc"></tag2>
 The tag  names the prototype of this item. In svg mode the attributes are primitive __properties of the item.
 The id attribute determines the __name. Shorthand; instead of id="abc"  #abc will also work.
 
 example
 <chart.component.bubble <#caption>foob</#caption><#value>66</#value>
 item.bubble.caption
 item.set("rectP","<rectangle style='color:red'>
dom.set("Style",pj.Object.mk()).namedType();
*/
  
  
dom.set("Style",pj.Object.mk()).__namedType();

dom.Style.mk = function (o) { 
  var rs = Object.create(dom.Style);
  pj.extend(rs,o);
  return rs;   
}
  

function parseStyle(st,dst) {
   var rs = dst?dst:dom.Style.mk();
   var sp0 = st.split(';');
   sp0.forEach(function (c) {
     var sp1 = c.split(":");
     if (sp1.length==2) {
       rs[sp1[0]] = sp1[1];
     }
   });
   return rs;
 }
  
dom.parseStyle = parseStyle;


dom.set("Elm",pj.Object.mk()); // the methods of Elements

var ccnt = 0;
  
pj.Object.__tag = function () {
  // march two prototypes p0 p1, adjacent elements of the prototype chain, down the chain
  // until p1 === svg.shape
  var p0 = this;
  var p1 = Object.getPrototypeOf(p0);
  while (true) {
    if ((p1 === svg.Element) || (pj.html && (p1 === pj.html.Element))) {
      return p0.__name;
    }
    if (p1 === pj.Object) {
      return undefined;
    }
    p0 = p1;
    p1 = Object.getPrototypeOf(p1);
  }
}
// an Array functions as a <g>
pj.Array.__tag = function () {
  return "g";
}

dom.isSvgTag = function (itag) {
  var svg = pj.svg;
  if (svg) {
    var tag = svg.tag;
    if (tag) {
      return tag[itag];
    }
  }
}
 
dom.toCamelCase = function (str) {
  var dashPos = str.indexOf("-"),
    beforeDash,oneAfterDash,rs;
  if (dashPos < 0) {
    return str;
  }
  beforeDash = str.substr(0,dashPos);
  oneAfterDash = str.substr(dashPos+2);
  rs = beforeDash + str[dashPos+1].toUpperCase() + oneAfterDash;
  return rs;
}
  
  
dom.Element.__setStyle = function () {
  var st = this.style;
  var el = this.__element;
  if (st && el) {
    pj.mapNonCoreLeaves(st,function (sv,iprop) {
      var prop = dom.toCamelCase(iprop); 
      el.style[prop] = sv;
    });
  }
}

/* attributes as they appear in the DOM are also recorded in the transient (non Object), __domAttributes
 * this is a little Reactish
 */
dom.Element.__setAttributes = function (tag) {
  var forSvg = dom.isSvgTag(tag);
  var tagv = forSvg?svg.tag[tag]:pj.html.tag[tag];
  var el = this.__get("__element");
  var atts,op,thisHere,id,setatt,catts,xf,pxf,s,tc,ptxt,cl,prevA;
  if (!el) return;
  prevA = this.__get("__domAttributes");
  if (!prevA) {
    prevA = this.__domAttributes = {};
  }
  thisHere = this;
  id = this.id?this.id:this.__name;
  if (id !== prevA.id) {
    el.setAttribute("id",id);
    prevA.id = id;
  }
 if (!tagv) {
  debugger;
 }
 if (tag === 'select') {
   debugger;
 }
  atts = tagv.attributes;
  op = atts?Object.getOwnPropertyNames(atts):undefined;
  thisHere = this;
  setatt = function (att) {
    var av,pv;
    if (pj.internal(att)||(att==="__setIndex")) return;
    av = thisHere[att];
    if (av !== undefined) {
      pv = prevA[att];
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
  if (op) op.forEach(setatt);
  catts = Object.getOwnPropertyNames(forSvg?svg.commonAttributes:pj.html.commonAttributes);
  // set the common attributes;
  catts.forEach(setatt);
  this.__setStyle();
  xf = this.transform;
  if (xf) {
    s = xf.toSvg();
    pxf = prevA.transform;
    if (pxf !== s) {
      el.setAttribute("transform",s);
      prevA.transform = pxf;
    }
  }
  var tc = this.text;
  if (tc  && (tag==="text")) {
    var ptxt = prevA.text;
    if (ptxt !== tc)  {
      this.updateSvgText();
      prevA.text = tc;
    }
  }
  cl = this.class;
  if (cl) {
    el.className = cl;
  }
}

  
dom.Element.__setAttribute = function (att,av) {
  var el,prevA,pv;
  this[att] = av;
  el = this.__get("__element");
  if (!el) return;
  prevA = this.__get("__domAttributes");
  if (!prevA) {
    prevA = this.__domAttributes = {};
  }
  pv = prevA[att];
  if (pv !== av) {
    el.setAttribute(att,av);
    prevA[att] = av;
  }
}
  
  
// the only attribute that an Array has is an id. This is only for use as the g element in svg
pj.Array.__setAttributes = function () {
  var el = this.__get("__element");
  var id,vis;
  if (!el) return;
  id = this.id?this.id:this.__name;
  el.setAttribute("id",id);
  vis = this.visibility;
  if (vis) {
    el.setAttribute("visibility",vis);
  }
};
  
dom.Element.__removeAttribute = function (att) {
  var el = this.__element;
  if (el) {
    el.removeAttribute(att);
  }
}
  
  
dom.removeDom = function (nd,stash) {
  var el = nd.__element;
  var cn = nd.__container;
  if (!(el||cn))return; 
  if (stash) {
    if (el) stash.__element = el;
    if (cn) stash.__container = cn;
  }
  delete nd.__element;
  delete nd.__container;
  delete nd.__domAttributes;
  pj.forEachTreeProperty(nd,function (v,k) {
      var chst;
      if (stash) {
        chst = stash[k] = {};
      } else {
        chst = undefined;
      }
      dom.removeDom(v,chst);
    });  
}
  
dom.stashDom = dom.removeDom; // for now
  
pj.restoreDom = function (nd,stash) {
  if (!stash) {
    return;
  }
  if (stash.__element) {
    nd.__element = stash.__element;
  }
  if (stash.__container) {
    nd.__container = stash.__container;
  }
  pj.forEachTreeProperty(nd,function (ch,k) {
    var stch = stash[k];
    pj.restoreDom(ch,stch);
  });
}
  
  
  dom.restoreDom = function (nd) {};
  
 
// for adding event listeners to the DOM for newly added dom.Elements
var addEventListeners = function (el) {
  var cv = el;
  var eel = el.__element;
  var done = false;
  var evl;
  while (!done) {
    evl = cv.__get("__eventListeners");
    if (evl) {
      pj.mapOwnProperties(evl,function (fns,nm) {
        fns.forEach(function (f) {eel.addEventListener(nm,f);});
      });
    }
    cv = Object.getPrototypeOf(cv);
    done = cv === dom.Element;
  }
}
  
/* add this one element to the DOM. Does not recurse.
 * todo need to take __setIndex of this into account
 * appends to to the element of the parent, if present, ow uses rootEl
 */
dom.Element.__addToDom1 = function (itag,rootEl) {
  var cel = this.__get("__element");
  var pr,pel,isLNode,forSvg,tag,cel,zz;
  if (cel) return cel;
  if (this.visibility === "hidden") return;
  var pr = this.__parent;
  if (pr) {
    pel = pr.__get("__element");
  }
  if (rootEl && !pel) {
    pel = rootEl;
    this.__container  = pel;//=rootEl;
  } else {
    if (!pel) return;
  }
  isLNode = pj.Array.isPrototypeOf(this);
  forSvg =  dom.isSvgTag(itag);
  tag = itag?itag:this.tagOf();
  cel = forSvg?document.createElementNS("http://www.w3.org/2000/svg", tag):document.createElement(tag);
  this.__element = cel;
  cel.__prototypeJungleElement = this;
  if (tag === 'svgg') { // for the root of an svg tree
    cel.setAttribute("version","1.1");
    svg.setMain(this);
    cel.addEventListener("dragstart",function (event) {
      event.preventDefault();
      pj.log('control','DRAG START!');
    });
  }
  this.__setAttributes(tag,forSvg);
  if (!pel || !pel.appendChild) {
    debugger;
  }
  var zz = pel.appendChild(cel);
  if (this.__color__) {
    $(cel).spectrum({change:this.__newColor__,
      color:this.__color__,showInput:true,showInitial:true,preferredFormat:"rgb"});
  }
  if (!forSvg && this.text) {
    cel.innerHTML = this.text;
  }
   if (!isLNode && !forSvg)  {
    addListenFors(this);
    addEventListeners(this);
  }
  return cel;
}

  
  pj.Array.__addToDom1 = dom.Element.__addToDom1

dom.Element.__addToDom =  function (rootEl) {
  var el = this.__get("__element");
  var tg = this.__tag();
  var wr;
  if (el) {
    this.__setAttributes(tg); // update 
  } else {
    if (this.visibility === 'hidden') {
      return;
    }
    wr = this.__wraps;// if this wraps an element already on the page, no need for a root.
    if (wr) {
      el = document.getElementById(wr);
      if (!el) {
        pj.error('Missing element for wrap of ',wr);
        return;
      }
      if (el.tagName.toLowerCase() !== tg) {
        pj.error('Tag mismatch for wrap of ',wr);
        return;
      }
      this.__element = el;
      this.__setAttributes(tg); // update 
    } else {
      el = this.__addToDom1(tg,rootEl);
    }
  }
  if (el) {
    this.__iterDomTree(function (ch) {
      ch.__addToDom();
    },true); // iterate over objects only
  }
}
  
pj.Array.__addToDom = function () {
  var rs = dom.Element.__addToDom.call(this);
}

dom.Element.__draw = dom.Element.__addToDom;
pj.Array.__draw = dom.Element.__addToDom;

dom.Element.__drawDebug = function () { 
  debugger;
  this.__draw();
}
  
  dom.Element.__installChild = function (nd) {
   var el = this.__element;
   var nel;
   if (!el) return;
   nel = pj.getval(nd,"__element");
   if (nel) return;
   nd.__addToDom(el);
 }
 
 pj.Array.__installChild = dom.Element.__installChild;
 
  
dom.Element.__mkFromTag = function (itag) {
  var tag = itag;
  var tv,rs,html,dv;
  if (tag) {
    tv = (svg&&(svg.tag))?svg.tag[tag]:undefined;
  }
  if (tv) {
    rs  = Object.create(tv);
  } else {
    html = pj.html;
    if (!html) {
      pj.error("No definition for tag",tag);
    }
    dv = html.tag[tag];
    if (dv) {
      rs = dv.instantiate();
    } else{
      pj.error("No definition for tag",tag);
    }
  }
  return rs;
}

        
dom.Element.push = function (ind) {
  var nd,scnt;
  if (typeof ind === "string") {
    pj.error("OBSOLETE option");
  } else {
    nd = ind;
    if (!pj.__isDomEL(nd)) {
      pj.error("Expected dom Element");
    }
  }
  scnt = pj.getval(this,'__setCount');
  scnt = scnt?scnt+1:1;
  nd.__name  = scnt;
  this.__setCount = scnt;
  this[scnt] = nd;
  nd.__parent = this;
  this.__installChild(nd);
}
  
  pj.Object.__isDomEL = function (x) {
    return dom.Element.isPrototypeOf(x);
  }
  
  
dom.removeElement = function (x) {
  var el = x.__element;
  var pel;
  if (el) {
    var pel = el.parentNode;
    if (pel) {
      pel.removeChild(el);
    }
  } 
  delete x.__element;
  delete x.__domAttributes; 
}
  
  pj.removeHooks.push(dom.removeElement);

  // called just  before the main reparenting 
dom.reparentElement = function (x,newParent,newName) {
  var el = x.__element;
  var npEl = newParent.__element;
  var pel;
  if (el) {
    if (!npEl) {
      pj.error(newParent.__name," is not in the svg tree in reparent");
    }
    pel = el.parentNode;
    if (pel) {
      pel.removeChild(el);
    }
    npEl.appendChild(el);
    if (!el.id) {
     el.setAttribute("id",newName);
    }
  } 
}

pj.reparentHooks.push(dom.reparentElement);

  
  
var tryParse = false;
dom.alwaysXMLparse = true; // didn't have luck with the html variant, for some reason. Later, use resig's javascript html parser
dom.parseWithDOM = function (s,forXML) {
  var prs = dom.domParser,rs,dm;
  if (!prs) {
    dom.domParser = prs = new DOMParser();// built into js
  }
  dm = prs.parseFromString(s,forXML||dom.alwaysXMLparse?'application/xml':'text/html');
  if ((!dm) || (!dm.firstChild) || (dm.firstChild.tagName === "html")) { // an error message
    pj.error("Error in parsing XML",s);
  }
  if (tryParse) {
    try {
      rs = dom.domToElement(dm.childNodes[0],forXML);// the DOMParser returns the node wrapped in a document object
    } catch (e) {
      pj.error("Error in parsing XML",s);
    }
  } else {
    rs = dom.domToElement(dm.childNodes[0],forXML);// the DOMParser returns the node wrapped in a document object
  }
  return rs;
}

 
  
pj.Object.__iterDomTree = function (fn) {
  var ownprops = Object.getOwnPropertyNames(this);
  var thisHere = this;
  var sch = [];
  var cmf;
  ownprops.forEach(function (k) {
    var ch;
    if (pj.treeProperty(thisHere,k,true,true))  { //true: already known to be an owned property
      ch = thisHere[k];
      if (pj.__isDomEL(ch) || pj.Array.isPrototypeOf(ch)) {
        sch.push(ch);
      }
    }
  });// now sort by __setIndex
  cmf = function (a,b) {
    var ai = a.__setIndex;
    var bi;
    if (ai === undefined) {
      ai = parseInt(a.__name);
    }
    ai = isNaN(ai)?0:ai;
    bi = b.__setIndex;
    if (bi === undefined) {
      bi = parseInt(b.__name);
    }
    bi = isNaN(bi)?0:bi;
    return (ai < bi)?-1:1;
  }
  sch.sort(cmf);
  sch.forEach(function (ch) {
    fn(ch,ch.__name);
  });
  return this;
}
  
pj.Array.__iterDomTree = function (fn) {
  this.forEach(function (ch) {
    if (pj.__isDomEL(ch) || pj.Array.isPrototypeOf(ch)) {
      fn(ch);
    }
  });
  return this;
}
  
// this causes sets of ELements to be added to the DOM
 pj.preSetChildHooks.push(function(node,nm) {
  // this needs to work before pj.ComputedField is defined
  var prv = node[nm];
  if (prv && pj.__isDomEL(prv)) {
    prv.remove();
  }
});
  
  
  
/* since order is important for drawing, order of set operations is preserved here.
 * specifically, each Object has a __setCount just counting how many sets have been done over time
 * each of its Node __children has a __setIndex, which was the value of __setCount when it was set
 * then drawing draws __children in setIndex order
 */

pj.setChildHooks.push(function(node,nm,c) {
 // this needs to work before pj.ComputedField is defined
 var scnt;
 if (pj.__isDomEL(node)) {
   // keep track of shape and Arrays __children order
   if ((nm === "transform") && geom.Transform.isPrototypeOf(c)) { //special treatment for transforms
     node.__transformToSvg();
     return;
   }
   if (pj.__isDomEL(c) || pj.Array.isPrototypeOf(c)) {
     scnt = pj.getval(node,'__setCount');
     scnt = scnt?scnt+1:1;
     node.__setCount = scnt;
     c.__setIndex = scnt;
     node.__installChild(c);
   }
 }
});

  
pj.pushHooks.push(function (node,c) {
  var ndom = pj.__isDomEL(node),
    cdom = pj.__isDomEL(c);
    
  if ((ndom || pj.Array.isPrototypeOf(node)) && (cdom || pj.Array.isPrototypeOf(c)) && (ndom || cdom)) {
    node.__installChild(c);
  }
});
   
   // an Element may have a property __eventListeners, which is a dictionary, each of whose
   // values is an array of functions, the listeners for the id of that value
  dom.Element.addEventListener = function (id,fn) {
   var listeners = this.__get("__eventListeners");
   var element,listenerArray;
   if (!listeners) {
     listeners = pj.Object.mk();
     this.set("__eventListeners",listeners);
   }
   var element = this.__element;
   var listenerArray = listeners[id]; 
   if (listenerArray===undefined) {
     listenerArray = listeners.set(id,pj.Array.mk());
   }
   listenerArray.push(fn);
   //ev[nm] = fn;
   if (element) {
     element.addEventListener(id,fn);
   }    
 }
  
  // remove listener needs to be applied at each object in the prototype chain, since __eventListeners can appear at various levels
dom.Element.__removeEventListener1 = function (nm,f) {
  var ev = this.__get("__eventListeners");
  var evl,eel;
  if (!ev) return;
  evl = ev[nm];
  eel = this.__element;
  if (evl) {
    if (f === undefined) { // remove all listeners of this type
      delete ev[nm];
      if (eel) {
        evl.forEach(function (ff) {
          eel.removeEventListener(nm,ff);
        });
      }
    } else {
      var idx = evl.indexOf(f);
      if (idx >= 0) {
        evl.splice(idx,1);
      }
    }
  }
}
  
dom.Element.removeEventListener = function (nm,f) {
 var eel = this.__element;
 var cv,done;
 if (eel && (f !== undefined)) { // remove all listeners of this type
   eel.removeEventListener(nm,f);
 }

 cv = this;
 done = false;
 while (!done) {
   cv.__removeEventListener1(nm,f);
   done = cv === dom.Element;
   cv = Object.getPrototypeOf(cv);
 }
}
  
  
dom.getStyle = function (e) {
  var cst = e.style;
  if (!cst) {
    cst = dom.Style.mk();
    e.set("style",cst);
  }
  return cst;
}
  
dom.Element.__rootElement = function () { // find the most distant ancestor which is an Element
  var cv  = this;
  var nv;
  while (true) {
    nv = cv.__parent;
    if (!dom.Element.isPrototypeOf(nv)) {
      return cv;
    }
    cv = nv;
  }
}
  
  // dom events are transduced into prototypejungle events if they are listened for
  
dom.findAncestorListeningFor = function (nd,evn) {
  var cv = nd;
  var lf;
  while (true) {
    lf = cv.__listenFor;
    if (lf && (lf.indexOf(evn)>=0)) {
      return cv;
    }
    cv = cv.__parent;
  }
}
dom.eventTransducer = function (e) {
  var trg = e.target.__prototypeJungleElement;
  var evn = e.type;
  var ev = pj.Event.mk(trg,"dom_"+evn);
  ev.domEvent = e;
  ev.emit();
}
  
dom.addTransducers = function (nd,events) {
  var el = this.__element;
  if (el) {
    events.forEach(function (evn) {el.addEventListener(evn,svg.eventTransducer)});
  }
}
  
dom.Element.__listenFor = function (events) {
    var el = this.__element;
    var prv = this.__listenFor;
    if (prv) {
      events.forEach(function (evn) {
        if (prv.indexOf(evn)<0) {
          prv.push(evn);
          if (el) {
            el.addEventListener(evn,svg.eventTransducer);
          }
        }
      });
    } else {
      this.set("__listenFor",pj.lift(events));
      dom.addTransducers(this,events);
    }
  }
 
  // used when nd is first added to the DOM
var addListenFors = function (nd) {
  var lf = nd.__listenFor;
  if (lf) {
    dom.addTransducers(nd,lf);
  }
}
   
dom.elementWidth = function (node) {
  var el = node.__element;
  if (el) {
    return el.offsetWidth;
  }
}
  
  
dom.parentElementWidth = function (node) {
  var el = node.__element;
  var cel;
  if (el) {
    cel = el.parentNode;
    return cel.offsetWidth;
  }
}

  

dom.elementHeight = function (node) {
  var el = node.__element;
  if (el) {
    return el.offsetHeight;
  }
}
  
  
dom.parentElementHeight = function (node) {
  var el = node.__element;
  if (el) {
    var cel = el.parentNode;
    return cel.offsetHeight;
  }
}

//end extract

})(prototypeJungle);

