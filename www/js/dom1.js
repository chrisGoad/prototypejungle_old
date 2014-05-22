(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var geom = __pj__.geom;
  dom = __pj__.set("dom",om.DNode.mk());// added for prototypeJungle; this is where symbols are added, rather than at the global level
  dom._external = 1;
  var svg =  __pj__.set("svg",__pj__.om.DNode.mk());
  svg._external = 1;
  dom.commonAttributes = {"href":"S","type":"S","value":"S","src":"S","width":"S","height":"S","scrolling":"S"};

  dom.set("tags",om.DNode.mk());
  /* how dom objects are represented: <tag att1=22 att2=23>abcd <tag2 id="abc"></tag2>
   The tag  names the prototype of this item. In svg mode the attributes are primitive _properties of the item.
   The id attribute determines the _name. Shorthand; instead of id="abc"  #abc will also work.
   
   example
   <chart.component.bubble <#caption>foob</#caption><#value>66</#value>
   item.bubble.caption
   item.set("rectP","<rectangle style='color:red'>
  dom.set("Style",om.DNode.mk())._namedType();
*/
  
  
  dom.set("Style",om.DNode.mk())._namedType();

  dom.Style.mk = function (o) { 
    var rs = Object.create(dom.Style);
    rs._setProperties(o);
    return rs;   
  }
  
  dom.Style._setFieldType("fill","svg.Rgb");

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
  dom.set("ELement",om.DNode.mk())._namedType();
  dom.set("Element",Object.create(dom.ELement))._namedType(); // dom elements other than svg
  dom.Element.set("$",om.DNode.mk()); // holds a few jqueryish methods
  //dom.Element.set("eventListeners",om.DNode.mk());
  //dom.Element.mk = function () {
  //  debugger;
  //  return dom.Element.instantiate(dom.Element);
 // };
  
  
dom.ELement.mkFromTag = function (tag) {
  if (tag) {
    var tv = svg[tag];
  }
  if (tv) {
    var rs  = Object.create(tv);
  } else {
    var dv = dom.tags[tag];
    if (dv) {
      rs = dv.instantiate();
    } else{
      rs = dom.ELement.instantiate();
    }
    //vResult  = om.DNode.mk();
    rs.tag = tag;
    rs.set("_eventListeners",om.DNode.mk());
  }
  //rs.set("$",Object.create(dom.Elm));
  //rs.set("eventListeners",om.DNode.mk());
  return rs;
}

  dom.ELement.installChild = function (nd) {
    var el = this._element;
    if (!el) return;
    var nel = nd._element;
    if (nel) return;
    nd._addToDom(el);
  }
  dom.ELement.push = function (ind) {
    if (typeof ind === "string") {
      var nd = dom.ELement.mk(ind);
    } else {
      nd = ind;
      if (!om._isDomEL(nd)) {
        om.error("Expected dom Element");
      }
    }
    var scnt = om.getval(this,'_setCount');
    scnt = scnt?scnt+1:1;
    nd._name  = scnt;
    this._setCount = scnt;
    this[scnt] = nd;
    nd._parent = this;
    this.installChild(nd);
  }
  
  dom.wrap = function (nm,tg,prps) {
    var el = document.getElementById(nm);
    if (el) {
      if (tg !== el.tagName) {
        om.error('Tag mismatch for wrap of ',nm);
        return;
      }
    }    
    var rs = dom.ELement.mkFromTag(tg);
    rs._setProperties(prps);
    if (el) rs._element = el;
    rs._wraps = nm;
    return rs;
  }
  
  om.DNode._svgTag = function () {
    // march two prototypes p0 p1, adjacent elements of the prototype chain, down the chain
    // until p1 === svg.shape
    var p0 = this;
    var p1 = Object.getPrototypeOf(p0);
    while (true) {
      if (p1 === svg.shape) {
        return p0._name;
      }
      if (p1 === om.DNode) {
        return undefined;
      }
      p0 = p1;
      p1 = Object.getPrototypeOf(p1);
    }
  }
  // an LNode functions as a <g>
  om.LNode._svgTag = function () {
    return "g";
  }
  
  om.DNode._domTag = function () {
    // march two prototypes p0 p1, adjacent elements of the prototype chain, down the chain
    // until p1 === svg.shape
    var p0 = this;
    var p1 = Object.getPrototypeOf(p0);
    while (true) {
      if (p1 === dom.Element) {
        return p0._name;
      }
      if (p1 === om.DNode) {
        return undefined;
      }
      p0 = p1;
      p1 = Object.getPrototypeOf(p1);
    }
  }
  
  dom.tags.set("div",dom.Element.instantiate())._namedType();
  dom.tags.set("span",dom.Element.instantiate())._namedType();
   dom.tags.set("img",dom.Element.instantiate())._namedType();
  dom.tags.set("p",dom.Element.instantiate())._namedType();
  dom.tags.set("a",dom.Element.instantiate())._namedType();
  dom.tags.set("input",dom.Element.instantiate())._namedType();
  dom.tags.set("iframe",dom.Element.instantiate())._namedType();

  dom.ELement.setStyle = function () {
    var st = this.style;
    var el = this._element;
    if (st && el) {
      st._iterAtomicNonstdProperties(function (sv,sp) {
        el.style[sp] = sv;
      });
    }
  }
  //dom.tags.div.set("attributes",om.LNode.mk(["style"]));
  // attributes as they appear in the DOM are also recorded in the transient (non DNode), _domAttributes
  // this is a little Reactish
dom.ELement.setAttributes = function (tag,forSvg) {
    var el = this._get("_element");
    if (!el) return;
    var prevA = this._get("_domAttributes");
    if (!prevA) {
      prevA = this._domAttributes = {};
    }
    var thisHere = this;
    var nm = this._name;
    if (nm !== prevA._name) {
      el.setAttribute("id",nm);
      prevA._name = nm;
    }
    var atts = this.attributes;
    var op = atts?Object.getOwnPropertyNames(atts):undefined;
    var thisHere = this;
    var setatt = function (att) {
      if (om.internal(att)||(att==="_setIndex")) return;
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
    var catts = Object.getOwnPropertyNames(forSvg?svg.commonAttributes:dom.commonAttributes);
    // set the common attributes;
    catts.forEach(setatt);
    this.setStyle();
    /*
    var st = this.style;
    if (st) {
      el.style = st;
      st._iterAtomicNonstdProperties(function (sv,sp) {
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
        this.setText(tc);
        prevA.text = tc;
      }
    }
    var cl = this.class;
    if (cl) {
      el.className = cl;
    }
  }
  
  
  dom.ELement.setAttribute = function (att,av) {
    this[att] = av;
    var el = this._get("_element");
    if (!el) return;
    var prevA = this._get("_domAttributes");
    if (!prevA) {
      prevA = this._domAttributes = {};
    }
    var pv = prevA[att];
    if (pv !== av) {
      el.setAttribute(att,av);
      prevA[att] = av;
    }
  }
  
  
    // the only attribute that an LNode has is an id. This is only for use as the g element in svg
om.LNode.setAttributes = function () {
    var el = this._get("_element");
    if (!el) return;
    var nm = this._name;
    el.setAttribute("id",nm);
    var vis = this.visibility;
    if (vis) {
      el.setAttribute("visibility",vis);
    }
  };
  
  
  dom.ELement.removeAttribute = function (att) {
    var el = this._element;
    if (el) {
      el.removeAttribute(att);
    }
  }
  
  dom.ELement.getEventListeners = function () {
    var rs = this._eventListeners;
    if (!rs) {
      rs = om.DNode.mk();
      this.set("eventListeners",rs);
    }
    return rs;
  }
  
  dom.ELement.tagOf = function () {
    var rs = this._svgTag();
    if (!rs) {
      rs = this._domTag();
    }
    return rs;
  }
  
  om.LNode.tagOf = function () {
    return "g";
  }
  
  
  // add this one element to the DOM. Does not recurse.
  // todo need to take _setIndex of this into account
  dom.ELement.addToDom1 = function (itag,rootEl) {
    var isLNode = om.LNode.isPrototypeOf(this);
    var forSvg =  isLNode || !dom.Element.isPrototypeOf(this);
    var tag = itag?itag:this.tagOf();//itag?itag:this._svgTag();
    var cel = this._get("_element");
    if (cel) return cel;
    if (this.visibility === "hidden") return;
    var pr = this._parent;
    var pel = pr._get("_element");
    if (!pel) {
      this._container  = pel=rootEl;
    }
    var cel = forSvg?document.createElementNS("http://www.w3.org/2000/svg", tag):document.createElement(tag);
    this._element = cel;
    this.setAttributes(tag,forSvg);
    if (!pel.appendChild) {
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
    if (!isLNode) {//  might be an LNode
      var ev = this.getEventListeners();
      ev._iterAtomicNonstdProperties(function (v,p) {
        cel.addEventListener(p,v);
      },1); //1 means allow functions
    }
    return cel;
  }
  
  /*
  dom.ELement.setHtml = function (ht) {
    this.text = ht;
    var el = this._element;
    if (el) {
      el.innerHTML = ht;
    }
  }
  */
  om.LNode.addToDom1 = dom.ELement.addToDom1

   om.nodeMethod("_addToDom",function (rootEl) {
    var el = this._get("_element");
    var tg = this.tagOf();
    if (el) {
      this.setAttributes(tg); // update 
    } else {
      var wr = this._wraps;// if this wraps an element already on the page, no need for a root.
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
        this._element = el;
        this.setAttributes(tg); // update 
      } else {
        var el = this.addToDom1(tg,rootEl);
      }
    }
    if (el) {
      this._iterDomTree(function (ch) {
        ch._addToDom();
      },true); // iterate over objects only
    }
   
  });
  
  dom.Element.install = om._addToDom;
  
  
  // cn assumed to be not yet installed in the dom
  dom.ELement.setChild = function (nm,icn) {
    if (typeof icn === "string") {
      var cn = dom.Element.mk(icn);
    } else {
      cn = icn;
    }
    this.set(nm,cn);
    return cn;
  }
  /*
    var ocn = this[nm];
    if (ocn) {
      var oidx = ocn._setIndex;
      ocn._remove();
      cn._setIndex = oidx;
    }
    var el = this._element;
    if (el) {
      cn._addToDom(el);
      //code
    }
    this.set(nm,cn);
    cn._setIndex = oidx;
  }
  */
        
        
  om.DNode._isDomEL = function () {
    return dom.ELement.isPrototypeOf(this);
  }
  
  dom.ELement._remove = function () {
    var el = this._element;
    if (el) {
      el.parentNode.removeChild(el);
    }
    var pr = this._parent;
    if (pr) {
      var nm = this._name;
      delete pr[nm];
    }
  }
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
  dom.parseXML = function (s) {
    var prs = dom.domParser;
    if (!prs) {
      dom.domParser = prs = new DOMParser();// built into js
    }
    var dm = prs.parseFromString(s,'application/xml');
    if ((!dm) || (!dm.firstChild) || (dm.firstChild.tagName === "html")) { // an error message
      om.error("Error in parsing XML",s);
      //om.error(dm,dm.firstChild?dm.firstChild.outerHTML:"parse error"," in ",s);
    }
    try {
      var rs = dom.domToELement(dm.childNodes[0]);// the DOMParser returns the node wrapped in a document object
    } catch (e) {
      om.error("Error in parsing XML",s);
    }

    return rs;//.firstChild();
  }
  
  /* this will be used for compatability with old scheme for a while */
  
  dom.ELement.addChild = function (a1,a2) {
    if (a2 === undefined) {
      var ch = a1;
      if (!ch) {
        debugger;
      }
      if (ch._get("_name")) {
        this.set(ch._name,ch);
      } else {
        this.push(ch);
      }
    } else {
      this.set(a1,a2);
    }
    return this;
  }
  
  dom.ELement.addChildren = function (ch) {
    var thisHere = this;
    ch.forEach(function (c) {
      thisHere.addChild(c);
    });
    return this;
  }
  
  
  dom.ELement.mk = function (s,inheritFrom) {
     
    if (s) {
      var rs = dom.parseXML(s,inheritFrom);
    } else {
      debugger;
      rs = Object.create(dom.Element);
    }
    //rs.set("$",Object.create(dom.Elm));  // the methods, so as to leave the namespace of an ELement pure in its representation
    rs.set("_eventListeners",om.DNode.mk());
    return rs;
  }
  
  dom.Element.$.html = function (h) {
    var el = this._parent;
    var eel = el._element;
    el.text = h;
    if (eel) {
      eel.innerHTML = h;
    }
  }
  
  dom.styleToString = function (st) {
    var prps=Object.getOwnPropertyNames(st);
    var rs = "";
    var cl = prps.map(function (p) {return '"'+prp+'":"'+st[prp]+'"'});
    var rs = cl.join(";");
  }
  
  dom.ELement.getStyle = function () {
    var cst = this.style;
    if (!cst) {
      cst = dom.Style.mk();
      this.set("style",cst);
    }
    return cst;
  }
  
  dom.Element.$.css = function (ist,v) {
    var el = this._parent;
    var cst = el.getStyle();
    if (typeof ist === "string") {
      if (v) {
        cst[ist] = v;
        var eel = el._element;
        if (eel) {
          eel.style[ist] = v;
        }
        return;
      }
      var st = dom.parseStyle(ist);
    } else {
      st = ist;
    }
    var prps=Object.getOwnPropertyNames(st);
    prps.forEach(function (p) {cst[p] = st[p]});
    el.setStyle();
  }
  
  dom.Element.$.attr = function (att,v) {
    var el = this._parent;
    if (typeof att==="string") {
      el.setAttribute(att,v);
    } else {
      var prps=Object.getOwnPropertyNames(att);
      prps.forEach(function (p) {el[p] = att[p]});
      el.setAttributes();
    }
  }

  
  dom.Element.$.prop= function (p,v) {
    var el = this._parent;
    el[p] = v;
    var eel = el._element;
    if (eel) {
      eel[p] = v;
    }
  }

  
  
  dom.Element.$._hide = function () {
    var el = this._parent;
    //el.__hidden__ = 1;
    var cst = el.getStyle();
    cst.display = "none";
    var eel = el._element;
    if (eel) {
      //el.__preHideDisplay__ = el.style.display;
      eel.style.display = "none";
    }
  }
  
  dom.Element.$._show = function () {
    var el = this._parent;
    //el.__hidden__ = 1;
    var cst = el.getStyle();
    cst.display = "";
    var eel = el._element;
    if (eel) {
      //el.__preHideDisplay__ = el.style.display;
      eel.style.display = "";
    }
  }
  // for now, one handler per event
  dom.ELement._addEventListener = function (nm,fn) {
    var ev = this._eventListeners;
    if (!ev) {
      debugger;
    }
    var eel = this._element;
    ev[nm] = fn;
    if (eel) {
      eel.addEventListener(nm,fn);
    }    
  }
  
  dom.ELement._removeEventListener = function (nm) {
    var f = this._eventListeners[nm];
    if (f) {
      delete this._eventListeners[nm];
      var eel = this._element;
      if (eel) {
        eel.removeEventListener(nm,f);
      }
    }
  }
  
  
  dom.Element.$.click = function (fn) {
    var el = this._parent;
    el._addEventListener("click",fn);
  }
  
  
  dom.Element.$.dblclick = function (fn) {
    var el = this._parent;
    el._addEventListener("dblclick",fn);
  }
  
  
  dom.Element.$.offset = function () {
    var el = this._parent;
    var eel = el._element;
    if (eel) {
      var rect = eel.getBoundingClientRect();
      var y = rect.top + document.body.scrollTop;
      var x = rect.left + document.body.scrollLeft;
      return geom.Point.mk(x,y);
    }
  }
  
  dom.Element.$.height = function () {
    var el = this._parent;
    var eel = el._element;
    if (eel) {
      return eel.offsetHeight;
    }
  }
  
  
  dom.Element.$.width = function () {
    var el = this._parent;
    var eel = el._element;
    if (eel) {
      return eel.offsetWidth;
    }
  }
  
  dom.Element.$.prop = function (nm,v) {
    var el = this._parent;
    var eel = el._element;
    if (eel !== undefined) {
      if (v) {
        eel[nm] = v;
      } else {
        return eel[nm];
      }
    }
  }
  
  dom.Element.$.empty = function () {                            
    this.html('');
    this._iterDomTree(function (ch) {
      ch._remove();
    },true); // iterate over objects only
  }

  
  om.nodeMethod("_removeDom",function () {
    
    if (dom.ELement.isPrototypeOf(this)) {
      this._element = undefined;
    } else {
      this._iterTreeItems(function (nd) {
        nd._removeDom();
      },true);  
    }
  });
 
})(prototypeJungle);

