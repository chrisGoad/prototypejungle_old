(function (pj) {
  var om = pj.om;
  var geom = pj.geom;
 
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract
  var dom = pj.set("dom",om.DNode.mk());// added for prototypeJungle; this is where symbols are added, rather than at the global level
  var svg =  pj.set("svg",om.DNode.mk());
  var html =  pj.set("html",om.DNode.mk());
 //dom.__external = 1;
  dom.__builtIn = 1;
  html.__builtIn = 1;
  svg.__builtIn = 1;

  // the two varieties of dom elements are svg.shape and html.Element
  // each particular element, such as an svg rect or an html div, is represented by its own prototype.
  //var svg =  pj.set("svg",pj.om.DNode.mk());
  //var html =  pj.set("html",pj.om.DNode.mk());
  dom.set("Element",om.DNode.mk()).namedType();

  svg.__builtIn = 1;
  //dom.commonAttributes = {"href":"S","type":"S","value":"S","src":"S","width":"S","height":"S","scrolling":"S"};

  
 
  
  /* how dom objects are represented: <tag att1=22 att2=23>abcd <tag2 id="abc"></tag2>
   The tag  names the prototype of this item. In svg mode the attributes are primitive __properties of the item.
   The id attribute determines the __name. Shorthand; instead of id="abc"  #abc will also work.
   
   example
   <chart.component.bubble <#caption>foob</#caption><#value>66</#value>
   item.bubble.caption
   item.set("rectP","<rectangle style='color:red'>
  dom.set("Style",om.DNode.mk()).namedType();
*/
  
  
  dom.set("Style",om.DNode.mk()).namedType();

  dom.Style.mk = function (o) { 
    var rs = Object.create(dom.Style);
    om.extend(rs,o);
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
  
  
  dom.set("Elm",om.DNode.mk()); // the methods of Elements
  //dom.set("Element",om.DNode.mk()).namedType();
 
  var ccnt = 0;
  
  om.DNode.__tag = function () {
    // march two prototypes p0 p1, adjacent elements of the prototype chain, down the chain
    // until p1 === svg.shape
    var p0 = this;
    var p1 = Object.getPrototypeOf(p0);
    while (true) {
      if ((p1 === svg.Element) || (p1 === html.Element)) {
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
  om.LNode.__tag = function () {
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
  
  /*
  om.DNode.__domTag = function () {
    // march two prototypes p0 p1, adjacent elements of the prototype chain, down the chain
    // until p1 === svg.shape
    var p0 = this;
    var p1 = Object.getPrototypeOf(p0);
    while (true) {
      if (p1 === dom.Element) {
        return p0.__name;
      }
      if (p1 === om.DNode) {
        return undefined;
      }
      p0 = p1;
      p1 = Object.getPrototypeOf(p1);
    }
  }
  */
 
  dom.Element.__setStyle = function () {
    var st = this.style;
    var el = this.__element;
    if (st && el) {
      om.mapNonCoreLeaves(st,function (sv,sp) {
        el.style[sp] = sv;
      });
    }
  }
  //dom.tags.div.set("attributes",om.LNode.mk(["style"]));
  // attributes as they appear in the DOM are also recorded in the transient (non DNode), __domAttributes
  // this is a little Reactish
dom.Element.__setAttributes = function (tag) {
    var forSvg = dom.isSvgTag(tag);
    var el = this.__get("__element");
    if (!el) return;
    // Xdom is a special case: it is an svg element which refers to an htmle element
    if (pj.svg.Xdom && pj.svg.Xdom.isPrototypeOf(this)) {
      var dome = this.__domElement;
      var dtg = dome.__tag();
      dome.__setAttributes(dtg);
    }

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
    var op = atts?Object.getOwnPropertyNames(atts):undefined;
    var thisHere = this;
    var setatt = function (att) {
      if (om.internal(att)||(att==="__setIndex")) return;
      var av = thisHere[att];
      if (av !== undefined) {
        var pv = prevA[att];
        if (pv !== av) {
          if ((typeof av === "number")&&(isNaN(av))) {
            debugger;
          }
          if (att==="$") {
            debugger;
          }
          el.setAttribute(att,av);
          prevA[att] = av;
        }
      }
    }
    // set the attributes for this tag
    if (op) op.forEach(setatt);
    var catts = Object.getOwnPropertyNames(forSvg?svg.commonAttributes:pj.html.commonAttributes);
    // set the common attributes;
    catts.forEach(setatt);
    this.__setStyle();
    /*
    var st = this.style;
    if (st) {
      el.style = st;
      st.__iterAtomicNonstdProperties(function (sv,sp) {
        el.style[sp] = sv;
      });
    }
    */
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
        this.updateSvgText();
        //this.setText(tc);
        prevA.text = tc;
      }
    }
    var cl = this.class;
    if (cl) {
      el.className = cl;
    }
  }
  
  
  dom.Element.setAttribute = function (att,av) {
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
  
  
    // the only attribute that an LNode has is an id. This is only for use as the g element in svg
om.LNode.__setAttributes = function () {
    var el = this.__get("__element");
    if (!el) return;
    var nm = this.__name;
    el.setAttribute("id",nm);
    var vis = this.visibility;
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
    om.forEachTreeProperty(nd,function (v,k) {
        if (stash) {
          var chst = stash[k] = {};
        } else {
          chst = undefined;
        }
        dom.removeDom(v,chst);
      });  
  }
  
  dom.stashDom = dom.removeDom; // for now
  
  om.restoreDom = function (nd,stash) {
    if (!stash) {
      return;
    }
    if (stash.__element) {
      nd.__element = stash.__element;
    }
    if (stash.__container) {
      nd.__container = stash.__container;
    }
    om.forEachTreeProperty(nd,function (ch,k) {
      var stch = stash[k];
      om.restoreDom(ch,stch);
    });
  }
  
  
  dom.restoreDom = function (nd) {};
  
  /*
   *dom.Element.getEventListeners = function () {
    var rs = this._eventListeners;
    if (!rs) {
      rs = om.DNode.mk();
      this.set("eventListeners",rs);
    }
    return rs;
  }
  
  om.Element.tagOf = function () {
    var rs = this.__svgTag();
    if (!rs) {
      rs = this.__domTag();
    }
    return rs;
  }
  
  om.LNode.tagOf = function () {
    return "g";
  }
  */
  // for adding event listeners to the DOM for newly added dom.Elements
  var addEventListeners = function (el) {
    var cv = el;
    var eel = el.__element;
    var done = false;
    while (!done) {
      var evl = cv.__get("__eventListeners");
      if (evl) {
        om.mapOwnProperties(evl,function (fns,nm) {
          fns.forEach(function (f) {eel.addEventListener(nm,f);});
        });
      }
      cv = Object.getPrototypeOf(cv);
      done = cv === dom.Element;
      //code
    }
  }
  
  // add this one element to the DOM. Does not recurse.
  // todo need to take __setIndex of this into account
  // appends to to the element of the parent, if present, ow uses rootEl
  dom.Element.__addToDom1 = function (itag,rootEl) {
    var cel = this.__get("__element");
    if (cel) return cel;
    if (this.visibility === "hidden") return;
    var pr = this.__parent;
    // special case: an XDom needs to be added to the rootEl regardless
    if (pr) {
      if (pj.svg.Xdom && pj.svg.Xdom.isPrototypeOf(pr)) {
        var pel = undefined;
      } else {
        pel = pr.__get("__element");
      }
    }
    if (rootEl && !pel) {
      pel = rootEl;
      this.__container  = pel;//=rootEl;
    } else {
      //var pel = pr.__get("__element");
      if (!pel) return;
    }

    var isLNode = om.LNode.isPrototypeOf(this);
    var forSvg =  dom.isSvgTag(itag);//isLNode || (svg.shape && svg.shape.isPrototypeOf(this));
    var tag = itag?itag:this.tagOf();//itag?itag:this.__svgTag();
     
    var cel = forSvg?document.createElementNS("http://www.w3.org/2000/svg", tag):document.createElement(tag);
    this.__element = cel;
    cel.__prototypeJungleElement = this;
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
    if (!isLNode && !(forSvg && om.inspectMode) ) { // in inspection mode, events associated with svg items are excluded
      addListenFors(this);
      addEventListeners(this);
    }
    // special case: xdom elements (external dom)
    if (pj.svg.Xdom && pj.svg.Xdom.isPrototypeOf(this)) {
      pj.svg.addXdom(this);
    }
    return cel;
  }
  
  /*
  dom.Element.setHtml = function (ht) {
    this.text = ht;
    var el = this.__element;
    if (el) {
      el.innerHTML = ht;
    }
  }
  */
  om.LNode.__addToDom1 = dom.Element.__addToDom1

  dom.Element.__addToDom =  function (rootEl) {
    var el = this.__get("__element");
    var tg = this.__tag();
    if (el) {
      this.__setAttributes(tg); // update 
    } else {
      var wr = this.__wraps;// if this wraps an element already on the page, no need for a root.
      if (wr) {
        el = document.getElementById(wr);
        if (!el) {
          om.error('Missing element for wrap of ',wr);
          return;
        }
        if (el.tagName.toLowerCase() !== tg) {
          om.error('Tag mismatch for wrap of ',wr);
          return;
        }
        this.__element = el;
        this.__setAttributes(tg); // update 
      } else {
        var el = this.__addToDom1(tg,rootEl);
      }
    }
    if (el) {
      this.__iterDomTree(function (ch) {
        ch.__addToDom();
      },true); // iterate over objects only
    }
   
  }
  
  om.LNode.__addToDom = dom.Element.__addToDom;

  dom.Element.draw = dom.Element.__addToDom;
  om.LNode.draw = dom.Element.__addToDom;

  // cn assumed to be not yet installed in the dom
  /*
  dom.Element.setChild = function (nm,icn) {
    if (typeof icn === "string") {
      var cn = dom.Element.mk(icn);
    } else {
      cn = icn;
    }
    this.set(nm,cn);
    return cn;
  }
  */
   dom.Element.__installChild = function (nd) {
    var el = this.__element;
    if (!el) return;
    var nel = nd.__element;
    if (nel) return;
    nd.__addToDom(el);
  }
  
  
  
dom.Element.__mkFromTag = function (itag) {
  var tag = itag.toLowerCase();
  if (tag) {
    var tv = (svg&&(svg.tag))?svg.tag[tag]:undefined;
  }
  if (tv) {
    var rs  = Object.create(tv);
  } else {
    var html = pj.html;
    if (!html) {
      om.error("No definition for tag",tag);
    }
    var dv = html.tag[tag];
    if (dv) {
      rs = dv.instantiate();
    } else{
      om.error("No definition for tag",tag);
    }
    //vResult  = om.DNode.mk();
    //rs.tag = tag;
  }
  //rs.set("__eventListeners",om.DNode.mk());
  return rs;
}

  /*
    var ocn = this[nm];
    if (ocn) {
      var oidx = ocn.__setIndex;
      ocn.remove();
      cn.__setIndex = oidx;
    }
    var el = this.__element;
    if (el) {
      cn.__addToDom(el);
      //code
    }
    this.set(nm,cn);
    cn.__setIndex = oidx;
  }
  */
        
        
  dom.Element.push = function (ind) {
    if (typeof ind === "string") {
      om.error("OBSOLETE option");
      //var nd = dom.ELement.mk(ind);
    } else {
      var nd = ind;
      if (!om.__isDomEL(nd)) {
        om.error("Expected dom Element");
      }
    }
    var scnt = om.getval(this,'__setCount');
    scnt = scnt?scnt+1:1;
    nd.__name  = scnt;
    this.__setCount = scnt;
    this[scnt] = nd;
    nd.__parent = this;
    this.__installChild(nd);
  }
  
  om.DNode.__isDomEL = function (x) {
    return dom.Element.isPrototypeOf(x);
  }
  
  
  dom.removeElement = function (x) {
    var el = x.__element;
    if (el) {
      var pel = el.parentNode;
      if (pel) {
        pel.removeChild(el);
      }
    }
  }
  
  om.removeHooks.push(dom.removeElement);

  /*
  dom.Element.remove = function () {
    var el = this.__element;
    if (el) {
      el.parentNode.removeChild(el);
    }
    var pr = this.__parent;
    if (pr) {
      var nm = this.__name;
      delete pr[nm];
    }
  }
  */
  /*om.DNode.firstChild = function () {
    var ps = Object.getOwnPropertyNames(this);
    var ln = ps.length;
    for (var i=0;i<ln;i++) {
      var v = this[ps[i]];
      if (v && (typeof(v)==="object")) {
        return v;
      }
    }
  }
  */
  
  
  var tryParse = 0;
  dom.alwaysXMLparse = 1; // didn't have luck with the html variant, for some reason. Later, use resig's javascript html parser
  dom.parseWithDOM = function (s,forXML) {
    var prs = dom.domParser;
    if (!prs) {
      dom.domParser = prs = new DOMParser();// built into js
    }
    var dm = prs.parseFromString(s,forXML||dom.alwaysXMLparse?'application/xml':'text/html');
    //var dm = prs.parseFromString(s,'application/xml');
    if ((!dm) || (!dm.firstChild) || (dm.firstChild.tagName === "html")) { // an error message
      om.error("Error in parsing XML",s);
      //om.error(dm,dm.firstChild?dm.firstChild.outerHTML:"parse error"," in ",s);
    }
    if (tryParse) {
      try {
        var rs = dom.domToElement(dm.childNodes[0],forXML);// the DOMParser returns the node wrapped in a document object
      } catch (e) {
        om.error("Error in parsing XML",s);
      }
    } else {
      var rs = dom.domToElement(dm.childNodes[0],forXML);// the DOMParser returns the node wrapped in a document object
    }
    return rs;//.firstChild();
  }
  
 
  
  om.DNode.__iterDomTree = function (fn) {
    var ownprops = Object.getOwnPropertyNames(this);
    var thisHere = this;
    var sch = [];
    ownprops.forEach(function (k) {
    //for (var k in this) {
      if (om.treeProperty(thisHere,k,true,true))  { //true: already known to be an owned property
        var ch = thisHere[k];
        if (om.__isDomEL(ch) || om.LNode.isPrototypeOf(ch)) {
          sch.push(ch);
        }
      }
    });// now sort by __setIndex
    var cmf = function (a,b) {
      var ai = a.__setIndex;
      if (ai === undefined) {
        ai = parseInt(a.__name);
      }
      ai = isNaN(ai)?0:ai;
      var bi = b.__setIndex;
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
  
  om.LNode.__iterDomTree = function (fn) {
    this.forEach(function (ch) {
      if (om.__isDomEL(ch) || om.LNode.isPrototypeOf(ch)) {
        fn(ch);
      }
    });
    return this;
  }
  
  // this causes sets of ELements to be added to the DOM
   om.preSetChildHooks.push(function(node,nm) {
    // this needs to work before om.ComputedField is defined
    var prv = node[nm];
    if (prv && om.__isDomEL(prv)) {
      prv.remove();
    }
  });
  
  
  
// since order is important for drawing, order of set operations is preserved here.
// specifically, each dnode has a __setCount just counting how many sets have been done over time
// each of its Node __children has a __setIndex, which was the value of __setCount when it was set
// then drawing draws __children in setIndex order

   om.setChildHooks.push(function(node,nm,c) {
    // this needs to work before om.ComputedField is defined
    if (om.__isDomEL(node)) {
      // keep track of shape and lnode __children order
      if ((nm === "transform") && geom.Transform.isPrototypeOf(c)) { //special treatment for transforms
        node.__transformToSvg();
        return;
      }
      if (om.__isDomEL(c) || om.LNode.isPrototypeOf(c)) {
        var scnt = om.getval(node,'__setCount');
        scnt = scnt?scnt+1:1;
        node.__setCount = scnt;
        c.__setIndex = scnt;
        node.__installChild(c);
      }
    }
  });
  
  
  om.pushHooks.push(function (node,c) {
    if ((om.__isDomEL(node)) && (om.__isDomEL(c) || om.LNode.isPrototypeOf(c))) {
      node.__installChild(c);
    }
  });
   
   
   dom.Element.addEventListener = function (nm,fn) {
    var ev = this.__get("__eventListeners");
    if (!ev) {
      var ev = om.DNode.mk();
      this.set("__eventListeners",ev);
    }
    var eel = this.__element;
    var cev = ev[nm];
    if (cev===undefined) {
      cev = ev.set(nm,om.LNode.mk());
    }
    cev.push(fn);
    //ev[nm] = fn;
    if (eel) {
      eel.addEventListener(nm,fn);
    }    
  }
  
  // remove listener needs to be applied at each object in the prototype chain, since __eventListeners can appear at various levels
  dom.Element.__removeEventListener1 = function (nm,f) {
    var ev = this.__get("__eventListeners");
    if (!ev) return;
    var evl = ev[nm];
    var eel = this.__element;
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
    if (eel && (f !== undefined)) { // remove all listeners of this type
      eel.removeEventListener(nm,f);
    }

    var cv = this;
    var done = 0;
    while (!done) {
      cv.__removeEventListener1(nm,f);
      var done = cv === dom.Element;
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
    while (true) {
      var nv = cv.__parent;
      if (!dom.Element.isPrototypeOf(nv)) {
        return cv;
      }
      cv = nv;
    }
  }
  
  // dom events are transduced into prototypejungle events if they are listened for
  
  dom.findAncestorListeningFor = function (nd,evn) {
    var cv = nd;
    while (true) {
      var lf = cv.__listenFor;
      if (lf && (lf.indexOf(evn)>=0)) {
        return cv;
      }
      cv = cv.__parent;
    }
  }
  dom.eventTransducer = function (e) {
    var trg = e.target.__prototypeJungleElement;
    var evn = e.type;
    //var trg = svg.findAncestorListeningFor(pt,evn);
    var ev = om.Event.mk(trg,"dom_"+evn);
    ev.domEvent = e;
    ev.emit();
  }
  
  dom.addTransducers = function (nd,events) {
    var el = this.__element;
    if (el) {
      events.forEach(function (evn) {el.addEventListener(evn,svg.eventTransducer)});
    }
  }
  
  dom.Element.listenFor = function (events) {
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
      this.set("__listenFor",om.lift(events));
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
   
    
//end extract
})(prototypeJungle);

