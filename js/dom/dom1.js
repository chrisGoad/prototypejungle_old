// Copyright 2019 Chris Goad
// License: MIT

const domr = codeRoot.set("dom",core.ObjectNode.mk());

/* the two varieties of dom elements are svg.shape and html.Element
 * each particular element, such as an svg rect or an html div, is represented by its own prototype.
 */

domr.set("Element",core.ObjectNode.mk()).__namedType();
let Element = domr.Element;
/* how dom objects are represented: <tag att1=22 att2=23>abcd <tag2 id="abc"></tag2>
 The tag  names the prototype of this item. In svg mode the attributes are primitive __properties of the item.
 The id attribute determines the __name. Shorthand; instead of id="abc"  #abc will also work.

 example
 <chart.component.bubble <#caption>foob</#caption><#value>66</#value>
 item.bubbe.caption
 item.set("rectP","<rectangle style='color:red'>
dom.set("Style",core.ObjectNode.mk()).namedType();
*/
  
  
domr.set("Style",core.ObjectNode.mk()).__namedType();

let Style = domr.Style;

Style.mk = function (o) { 
  let rs = Object.create(Style);
  core.extend(rs,o);
  return rs;   
}
  

const parseStyle = function(st,dst) {
   let rs = dst?dst:Style.mk();
   let sp0 = st.split(';');
   sp0.forEach(function (c) {
     let sp1 = c.split(":");
     if (sp1.length===2) {
       rs[sp1[0]] = sp1[1];
     }
   });
   return rs;
 }


  
core.ObjectNode.__tag = function () {
  // march two prototypes p0 p1, adjacent elements of the prototype chain, down the chain
  // until p1 === svg.shape
  let p0 = this;
  let p1 = Object.getPrototypeOf(p0);
  while (true) {
    if ((p1 === SvgElement) || (codeRoot.html && (p1 === codeRoot.html.Element))) {
      return p0.__name;
    }
    if (p1 === core.ObjectNode) {
      return undefined;
    }
    p0 = p1;
    p1 = Object.getPrototypeOf(p1);
  }
}
// an Array functions as a <g>
core.ArrayNode.__tag = function () {
  return "g";
}

const isSvgTag = function (itag) {
  if (svg) {
    let tag = svg.tag;
    if (tag) {
      return tag[itag];
    }
  }
}
 
const toCamelCase = function (str) {
  let dashPos = str.indexOf("-"),
    beforeDash,oneAfterDash,rs;
  if (dashPos < 0) {
    return str;
  }
  beforeDash = str.substr(0,dashPos);
  oneAfterDash = str.substr(dashPos+2);
  rs = beforeDash + str[dashPos+1].toUpperCase() + oneAfterDash;
  return rs;
}
  
  
domr.Element.__setStyle = function () {
  let st = this.style;
  let el = this.__element;
  if (st && el) {
    core.mapNonCoreLeaves(st,function (sv,iprop) {
      let prop = toCamelCase(iprop); 
      el.style[prop] = sv;
    });
  }
}

Element.__applyDomMap = function () {
  let transfers = this.__domTransfers;
  let el = this.__element;
  let thisHere = this;
  if (transfers) {
    transfers.forEach(function (att) {
      let val = thisHere[att];
      if (val !== undefined) {
        el.setAttribute(att,val);
      }
    });
  }
  if (this.setDomAttributes) {
    this.setDomAttributes(el);
  }
}

Element.__setAttributes = function (tag) {
  let forSvg = isSvgTag(tag);
  let tagv = forSvg?svg.tag[tag]:codeRoot.html.tag[tag];
  if (!tagv) {
     core.error('dom','uknown tag '+tag);
  }
  let el = this.__get("__element");
  let id,xf,tc,cl;
  if (!el) {
    return;
  }
  id = this.__svgId?this.__svgId:(this.id?this.id:this.__name);
  this.__applyDomMap();
  this.__setStyle();
  el.setAttribute('id',id);
  xf = this.transform;
  if (xf) {
    el.setAttribute("transform",xf.toSvg());
  }
  tc = this.text;
  if (tc  && (tag==="text")) {
    this.updateSvgText();
  }
  cl = this.class;
  if (cl) {
    el.className = cl;
  }
}


Element.__setAttribute = function (att,av) {
  let el;
  this[att] = av;
  el = this.__get("__element");
  if (el) {
    el.setAttribute(att,av);
  }
}

Element.setDomAttribute = Element.__setAttribute;

// the only attribute that an Array has is an id. This is only for use as the g element in svg
core.ArrayNode.__setAttributes = function () {
  let el = this.__get("__element");
  let id,vis;
  if (!el) {
    return;
  }
  id = this.id?this.id:this.__name;
  el.setAttribute("id",id);
  vis = this.visibility;
  if (vis) {
    el.setAttribute("visibility",vis);
  }
};
  
Element.__removeAttribute = function (att) {
  let el = this.__element;
  if (el) {
    el.removeAttribute(att);
  }
}
  
  
const stashDom = function (nd,stash) {
  let el = nd.__element;
  let cn = nd.__container;
  if (!(el||cn)) {
    return;
  }
  if (el) {
    stash.__element = el;
  }
  if (cn) {
    stash.__container = cn;
  }
  delete nd.__element;
  delete nd.__container;
  //delete nd.__domAttributes;
  core.forEachTreeProperty(nd,function (v,k) {
      let chst;
      if (stash) {
        chst = stash[k] = {};
      } else {
        chst = undefined;
      }
      stashDom(v,chst);
    });  
}

const restoreDom = function (nd,stash) {
  if (!stash) {
    return;
  }
  if (stash.__element) {
    nd.__element = stash.__element;
  }
  if (stash.__container) {
    nd.__container = stash.__container;
  }
  core.forEachTreeProperty(nd,function (ch,k) {
    let stch = stash[k];
    restoreDom(ch,stch);
  });
}
  

  
 
// for adding event listeners to the DOM for newly added Elements
const addEventListeners = function (el) {
  let cv = el;
  let eel = el.__element;
  let done = false;
  let evl;
  while (!done) {
    evl = cv.__get("__eventListeners");
    if (evl) {
      core.mapOwnProperties(evl,function (fns,nm) {
        fns.forEach(function (f) {eel.addEventListener(nm,f);});
      });
    }
    cv = Object.getPrototypeOf(cv);
    done = cv === Element;
  }
}
  
/* add this one element to the DOM. Does not recurse.
 * todo need to take __setIndex of this into account
 * appends to to the element of the parent, if present, ow uses rootEl
 */
Element.__addToDom1 = function (itag,rootEl) {
  let pr,pel,isLNode,forSvg,tag;
  let cel = this.__get("__element");
  if (cel) {
    return cel;
  }
  pr = this.__parent;
  if (pr) {
    pel = pr.__get("__element");
  }
  if (rootEl && !pel) {
    pel = rootEl;
    this.__container  = pel;//=rootEl;
  } else {
    if (!pel) {
      return;
    }
  }
  isLNode = core.ArrayNode.isPrototypeOf(this);
  forSvg =  isSvgTag(itag);
  tag = itag?itag:this.tagOf();
  cel = forSvg?document.createElementNS("http://www.w3.org/2000/svg",tag):document.createElement(tag);
  this.__element = cel;
  cel.__prototypeJungleElement = this;
  this.__setAttributes(tag,forSvg);
  if (!pel || !pel.appendChild) {
     core.error('dom','unexpected condition'); 
  }
  pel.appendChild(cel);
  if (this.__color__) {
    $(cel).spectrum({change:this.__newColor__,
      color:this.__color__,showInput:true,showInitial:true,preferredFormat:"rgb"});
  }
  if (!forSvg && this.text) {
    cel.innerHTML = this.text;
  }
   if (!isLNode && !forSvg)  {
    addEventListeners(this);
  }
  return cel;
}

  
  core.ArrayNode.__addToDom1 = Element.__addToDom1

Element.__addToDom =  function (rootEl,idepth) {
  let depth = idepth?idepth:0;
  let el = this.__get("__element");
  let tg = this.__tag();
  let wr;
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
        core.error('Missing element for wrap of ',wr);
        return;
      }
      if (el.tagName.toLowerCase() !== tg) {
        core.error('Tag mismatch for wrap of ',wr);
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
      ch.__addToDom(undefined,depth+1);
    },true); // iterate over objects only
  }
}
  
core.ArrayNode.__addToDom = function (unused,idepth) {
 let depth = idepth?idepth:0;
  Element.__addToDom.call(this,undefined,depth+1);
}

Element.draw = Element.__addToDom;

Element.updateAndDraw = function ()  {
  if (this.update) {
    this.update();
  } else {
    this.__update();
  }
  this.draw();
}

core.ArrayNode.draw = Element.__addToDom;
  
  Element.__installChild = function (nd) {
   let el = this.__element;
   let nel;
   if (!el) {
    return;
   }
   nel = core.getval(nd,"__element");
   if (nel) {
    return;
   }
   nd.__addToDom(el);
 }
 
 core.ArrayNode.__installChild = Element.__installChild;
 
  
Element.__mkFromTag = function (itag) {
  let tag = itag;
  let tv,rs,html,dv;
  if (tag) {
    tv = (svg&&(svg.tag))?svg.tag[tag]:undefined;
  }
  if (tv) {
    rs  = Object.create(tv);
  } else {
    html = codeRoot.html;
    if (!html) {
      core.error("No definition for tag",tag);
    }
    dv = html.tag[tag];
    if (dv) {
      rs = dv.instantiate();
    } else{
      core.error("No definition for tag",tag);
    }
  }
  return rs;
}


const __isDomEl = function (x) {
    if (core.ArrayNode.isPrototypeOf(x)) {
      return !x.__notInDom
    } else {
      return Element.isPrototypeOf(x);
    }
  }
  
  
        
Element.push = function (ind) {
  let nd,scnt;
  if (typeof ind === "string") {
    core.error("OBSOLETE option");
  } else {
    nd = ind;
    if (!__isDomEl(nd)) {
      core.error("Expected dom Element");
    }
  }
  scnt = core.getval(this,'__setCount');
  scnt = scnt?scnt+1:1;
  nd.__name  = scnt;
  this.__setCount = scnt;
  this[scnt] = nd;
  nd.__parent = this;
  this.__installChild(nd);
}
  
  
const removeElement = function (x) {
  let el = x.__element;
  if (el) {
    let pel = el.parentNode;
    if (pel) {
      pel.removeChild(el);
    }
  } 
  delete x.__element;
 // delete x.__domAttributes; 
}
  
  core.removeHooks.push(removeElement);

  // called just  before the main reparenting 
const reparentElement = function (x,newParent,newName) {
  let el = x.__element;
  let npEl = newParent.__element;
  let pel;
  if (el) {
    if (!npEl) {
      core.error(newParent.__name," is not in the svg tree in reparent");
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

core.reparentHooks.push(reparentElement);

  
  
let tryParse = false;
let alwaysXMLparse = true; // didn't have luck with the html variant, for some reason. Later, use resig's javascript html parser
const parseWithDOM = function (s,forXML) {
  let  domParser,rs,dm;
  let prs = domParser;
  if (!prs) {
    domParser = prs = new DOMParser();// built into js
  }
  dm = prs.parseFromString(s,forXML||alwaysXMLparse?'application/xml':'text/html');
  if ((!dm) || (!dm.firstChild) || (dm.firstChild.tagName === "html")) { // an error message
    core.error("Error in parsing XML",s);
  }
  if (tryParse) {
    try {
      rs = domToElement(dm.childNodes[0],forXML);// the DOMParser returns the node wrapped in a document object
    } catch (e) {
      core.error("Error in parsing XML",s);
    }
  } else {
    rs = domToElement(dm.childNodes[0],forXML);// the DOMParser returns the node wrapped in a document object
  }
  return rs;
}

const sortByIndex = function (ar) {
  let cmf = function (a,b) {
    let ai = a.__setIndex;
    let bi;
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
  ar.sort(cmf);
}
  
  
  
core.ObjectNode.__iterDomTree = function (fn) {
  let ownprops = Object.getOwnPropertyNames(this);
  let thisHere = this;
  let sch = [];
  ownprops.forEach(function (k) {
    let ch;
    if (core.treeProperty(thisHere,k,true,true))  { //true: already known to be an owned property
      ch = thisHere[k];
      if (__isDomEl(ch)) {
        sch.push(ch);
      }
    }
  });// now sort by __setIndex
  sortByIndex(sch);
  sch.forEach(function (ch) {
    fn(ch,ch.__name);
  });
  return this;
}
  
core.ArrayNode.__iterDomTree = function (fn) {
  this.forEach((ch) => {
    if (__isDomEl(ch) && (ch.__parent === this)) {
      fn(ch);
    }
  });
  return this;
}
  
// this causes sets of ELements to be added to the DOM
 core.preSetChildHooks.push(function(node,nm) {
  // this needs to work before core.ComputedField is defined
  let prv = node.__get(nm);
  if (prv && __isDomEl(prv)) {
    let isArray = Array.isArray(node);
    removeElement(prv);
   // prv.remove(); changed to removeElement 3/22/19
  }
});
  
  
  
/* since order is important for drawing, order of set operations is preserved here.
 * specifically, each Object has a __setCount just counting how many sets have been done over time
 * each of its Node __children has a __setIndex, which was the value of __setCount when it was set
 * then drawing draws __children in setIndex order
 */

let disableAdditionToDomOnSet = false;


core.setChildHooks.push(function(node,nm,c) {
 // this needs to work before core.ComputedField is defined
 let scnt;
 if (disableAdditionToDomOnSet) {
   return;
 }
 if (__isDomEl(node)) {
   // keep track of shape and Arrays __children order
   if ((nm === "transform") && Transform.isPrototypeOf(c)) { //special treatment for transforms
     node.realizeTransform();
     return;
   }
   if (__isDomEl(c)) {
     scnt = node.__setCount;
     if (scnt === undefined) {
       scnt = 0;
     }
     scnt = scnt?scnt+1:1;
     node.__setCount = scnt;
     c.__setIndex = scnt;
     node.__installChild(c);
   }
 }
});


core.addToArrayHooks.push(function (node,c) {
  let ndom = __isDomEl(node),
    cdom = __isDomEl(c);
    
  if ((ndom || core.ArrayNode.isPrototypeOf(node)) && (cdom || core.ArrayNode.isPrototypeOf(c)) && (ndom || cdom)) {
    node.__installChild(c);
  }
});
   
   // an Element may have a property __eventListeners, which is a dictionary, each of whose
   // values is an array of functions, the listeners for the id of that value
  Element.addEventListener = function (id,fn) {
   let listeners = this.__get("__eventListeners");
   let element,listenerArray;
   if (!listeners) {
     listeners = core.ObjectNode.mk();
     this.set("__eventListeners",listeners);
   }
   element = this.__element;
   listenerArray = listeners[id]; 
   if (listenerArray===undefined) {
     listenerArray = listeners.set(id,core.ArrayNode.mk());
   }
   listenerArray.push(fn);
   if (element) {
     element.addEventListener(id,fn);
   }    
 }
  
  // remove listener needs to be applied at each object in the prototype chain, since __eventListeners can appear at various levels
Element.__removeEventListener1 = function (nm,f) {
  let ev = this.__get("__eventListeners");
  let evl,eel;
  if (!ev) {
    return;
  }
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
      let idx = evl.indexOf(f);
      if (idx >= 0) {
        evl.splice(idx,1);
      }
    }
  }
}
  
Element.removeEventListener = function (nm,f) {
 let eel = this.__element;
 let cv,done;
 if (eel && (f !== undefined)) { // remove all listeners of this type
   eel.removeEventListener(nm,f);
 }

 cv = this;
 done = false;
 while (!done) {
   cv.__removeEventListener1(nm,f);
   done = cv === Element;
   cv = Object.getPrototypeOf(cv);
 }
}
  
  
const getStyle = function (e) {
  let cst = e.style;
  if (!cst) {
    cst = Style.mk();
    e.set("style",cst);
  }
  return cst;
}
  
Element.__rootElement = function () { // find the most distant ancestor which is an Element
  let cv  = this;
  let nv;
  while (true) {
    nv = cv.__parent;
    if (!Element.isPrototypeOf(nv)) {
      return cv;
    }
    cv = nv;
  }
}
  
  // dom events are transduced into PrototypeJungle events if they are listened for  (not in use as of 2/18)
  
const findAncestorListeningFor = function (nd,evn) {
  let cv = nd;
  let lf;
  while (true) {
    lf = cv.__listenFor;
    if (lf && (lf.indexOf(evn)>=0)) {
      return cv;
    }
    cv = cv.__parent;
  }
}
const eventTransducer = function (e) {
  let trg = e.target.__prototypeJungleElement;
  let evn = e.type;
  let ev = core.Event.mk(trg,"dom_"+evn);
  ev.domEvent = e;
  ev.emit();
}
  
const addTransducers = function (nd,events) {
  let el = this.__element;
  if (el) {
    events.forEach(function (evn) {el.addEventListener(evn,svg.eventTransducer)});
  }
}
  
Element.__listenFor = function (events) {
    let el = this.__element;
    let prv = this.__listenFor;
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
      this.set("__listenFor",core.lift(events));
      addTransducers(this,events);
    }
  }
 
  // used when nd is first added to the DOM
const addListenFors = function (nd) {
  let lf = nd.__listenFor;
  if (lf) {
    addTransducers(nd,lf);
  }
}
   
const elementWidth = function (node) {
  let el = node.__element;
  if (el) {
    return el.offsetWidth;
  }
}
  
  
const parentElementWidth = function (node) {
  let el = node.__element;
  let cel;
  if (el) {
    cel = el.parentNode;
    return cel.offsetWidth;
  }
}

  

const elementHeight = function (node) {
  let el = node.__element;
  if (el) {
    return el.offsetHeight;
  }
}
  
  
const parentElementHeight = function (node) {
  let el = node.__element;
  if (el) {
    let cel = el.parentNode;
    return cel.offsetHeight;
  }
}



core.ObjectNode.setData = function (xdt,dontUpdate) {
 this.data = xdt;
 this.__newData = true;
 if (!dontUpdate)  {
    this.__update();
  }
}
// sometimes, data needs processing. In this case, the internalized data is put in __idata
//core.ObjectNode.__dataInInternalForm  = function () {
core.ObjectNode.getData  = function () {
  return this.data;
}

export {Style,removeElement,parseWithDOM};
