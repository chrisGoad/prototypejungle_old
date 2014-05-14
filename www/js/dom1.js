(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  dom = __pj__.set("dom",om.DNode.mk());// added for prototypeJungle; this is where symbols are added, rather than at the global level
  dom.__external__ = 1;
  var svg =  __pj__.set("svg",__pj__.om.DNode.mk());
  svg.__external__ = 1;
  dom.commonAttributes = {};

  dom.set("tags",om.DNode.mk());
  /* how dom objects are represented: <tag att1=22 att2=23>abcd <tag2 id="abc"></tag2>
   The tag  names the prototype of this item. In svg mode the attributes are primitive properties of the item.
   The id attribute determines the __name__. Shorthand; instead of id="abc"  #abc will also work.
   
   example
   <chart.component.bubble <#caption>foob</#caption><#value>66</#value>
   item.bubble.caption
   item.set("rectP","<rectangle style='color:red'>
  dom.set("Style",om.DNode.mk()).namedType();
*/
  
  
  dom.set("Style",om.DNode.mk()).namedType();

  dom.Style.mk = function (o) { 
    var rs = Object.create(dom.Style);
    rs.setProperties(o);
    return rs;   
  }
  
  dom.Style.setFieldType("fill","svg.Rgb");

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
  dom.set("ELement",om.DNode.mk()).namedType();
  dom.ELement.mk = function () {return Object.create(dom.ELement);};
  
  
dom.ELement.mkFromTag = function (tag) {
  if (tag) {
    var tv = svg[tag];
  }
  if (tv) {
    var rs  = Object.create(tv);
  } else {
    var dv = dom.tags[tag];
    if (dv) {
      rs = Object.create(dv);
    } else{
      rs = Object.create(dom.ELement);
    }
    //vResult  = om.DNode.mk();
    rs.tag = tag;
  }
  rs.set("$",Object.create(dom.Elm));
  rs.set("eventHandlers",dom.DNode.mk());
  return rs;
}
  dom.ELement.push = function (nd) {
    if (!om.isDomEl(nd)) {
      om.error("Expected dom Element");
    }
    var scnt = om.getval(this,'__setCount__');
    scnt = scnt?scnt+1:1;
    nd.__name__  = scnt;
    this.__setCount__ = scnt;
    this[scnt] = nd;
    nd.__parent__ = this;
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
    rs.setProperties(prps);
    if (el) rs.__element__ = el;
    rs.__wraps__ = nm;
    return rs;
  }
  
  om.DNode.svgTag = function () {
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
  
  om.DNode.domTag = function () {
    // march two prototypes p0 p1, adjacent elements of the prototype chain, down the chain
    // until p1 === svg.shape
    var p0 = this;
    var p1 = Object.getPrototypeOf(p0);
    while (true) {
      if (p1 === dom.ELement) {
        return p0.__name__;
      }
      if (p1 === om.DNode) {
        return undefined;
      }
      p0 = p1;
      p1 = Object.getPrototypeOf(p1);
    }
  }
  
  dom.tags.set("div",dom.ELement.mk()).namedType();
  dom.tags.set("span",dom.ELement.mk()).namedType();
  dom.tags.set("input",dom.ELement.mk()).namedType();
  dom.tags.set("iframe",dom.ELement.mk()).namedType();

  dom.ELement.setStyle = function () {
    var st = this.style;
    var el = this.__element__;
    if (st && el) {
      st.iterAtomicNonstdProperties(function (sv,sp) {
        el.style[sp] = sv;
      });
    }
  }
  //dom.tags.div.set("attributes",om.LNode.mk(["style"]));
  // attributes as they appear in the DOM are also recorded in the transient (non DNode), __domAttributes__
  // this is a little Reactish
dom.ELement.setAttributes = function (tag,forSvg) {
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
    var op = atts?Object.getOwnPropertyNames(atts):undefined;
    var thisHere = this;
    var setatt = function (att) {
      if (om.internal(att)||(att==="__setIndex__")) return;
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
    if (op) op.forEach(setatt);
    var catts = Object.getOwnPropertyNames(forSvg?svg.commonAttributes:dom.commonAttributes);
    // set the common attributes;
    catts.forEach(setatt);
    this.setStyle();
    /*
    var st = this.style;
    if (st) {
      el.style = st;
      st.iterAtomicNonstdProperties(function (sv,sp) {
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
  
  
  dom.ELement.removeAttribute = function (att) {
    var el = this.__element__;
    if (el) {
      el.removeAttribute(att);
    }
  }
  
  // add this one element to the DOM. Does not recurse.
  dom.ELement.addToDom1 = function (itag,rootEl,forSvg) {
    var tag = itag?itag:this.svgTag();
    var cel = this.get("__element__");
    if (cel) return cel;
    if (this.visibility === "hidden") return;
    var pr = this.__parent__;
    var pel = pr.get("__element__");
    if (!pel) pel=rootEl;
    var cel = forSvg?document.createElementNS("http://www.w3.org/2000/svg", tag):document.createElement(tag);
    this.__element__ = cel;
    this.setAttributes(tag,forSvg);
    var zz = pel.appendChild(cel);
    if (!forSvg && this.text) {
      cel.innerHTML = this.text;
    }
    var ev = this.eventHanlders;
    var prps = Object.ownPropertyNames(ev);
    prps.forEach(function (p) {
      var v = ev[p];
      cel.addEventListener(p,v);
    });
    return cel;
  }
  /*
  dom.ELement.setHtml = function (ht) {
    this.text = ht;
    var el = this.__element__;
    if (el) {
      el.innerHTML = ht;
    }
  }
  */
  om.LNode.addToDom1 = dom.ELement.addToDom1

   om.nodeMethod("addToDom",function (rootEl) {
    var el = this.get("__element__");
    var tg = this.domTag();
    if (el) {
      this.setAttributes(tg); // update 
    } else {
      var wr = this.__wraps__;// if this wraps an element already on the page, no need for a root.
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
        this.__element__ = el;
        this.setAttributes(tg); // update 
      } else {
        this.addToDom1(tg,rootEl);
      }
    }
    this.iterDomTree(function (ch) {
      ch.addToDom();
    },true); // iterate over objects only
   
  });
        
        
        
  om.DNode.isDomEl = function () {
    return dom.ELement.isPrototypeOf(this);
  }
  
  om.DNode.firstChild = function () {
    var ps = Object.getOwnPropertyNames(this);
    var ln = ps.length;
    for (var i=0;i<ln;i++) {
      var v = this[ps[i]];
      if (v && (typeof(v)==="object")) {
        return v;
      }
    }
  }
  
  dom.parseXML = function (s) {
    var prs = dom.domParser;
    if (!prs) {
      dom.domParser = prs = new DOMParser();// built into js
    }
    var dm = prs.parseFromString(s,'application/xml');
    if ((!dm) || (!dm.firstChild) || (dm.firstChild.tagName === "html")) { // an error message
      om.error(dm,dm.firstChild?dm.firstChild.outerHTML:"parse error"," in ",s);
    }
    var rs = dom.domToJSON(dm.childNodes[0]);// the DOMParser returns the node wrapped in a document object
    return rs;//.firstChild();
  }
  
  /* this will be used for compatability with old scheme for a while */
  
  dom.ELement.addChild = function (a1,a2) {
    if (a2 === undefined) {
      var ch = a1;
      if (ch.get("__name__")) {
        this.set(ch.__name__,ch);
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
  dom.ELement.mk = function (s) {
     
    if (s) {
      var rs = dom.parseXML(s);
    } else {
      rs = Object.create(dom.ELement);
    }
    rs.set("$",Object.create(dom.Elm));  // the methods, so as to leave the namespace of an ELement pure in its representation
    rs.set("eventHandlers",dom.DNode.mk());
    return rs;
  }
  
  dom.Elm.html = function (h) {
    var el = this.__parent__;
    var eel = el.__element__;
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
  
  dom.Elm.css = function (ist) {
    if (typeof ist === "string") {
      var st = dom.parseStyle(ist);
    } else {
      st = ist;
    }
    var el = this.__parent__;
    var cst = el.getStyle();
    var prps=Object.getOwnPropertyNames(st);
    prps.forEach(function (p) {cst[p] = st[p]});
    el.setStyle();
  }
  
  dom.Elm.attr = function (att) {
    var el = this.__parent__;
    var prps=Object.getOwnPropertyNames(att);
    prps.forEach(function (p) {this[p] = att[p]});
    this.setAttributes();
  }

  
  
  dom.Elm.hide = function () {
    var el = this.__parent__;
    //el.__hidden__ = 1;
    var cst = el.getStyle();
    cst.display = "none";
    var eel = this.__element__;
    if (eel) {
      //el.__preHideDisplay__ = el.style.display;
      eel.style.display = "none";
    }
  }
  
  
  dom.Elm.show = function () {
    var el = this.__parent__;
    //el.__hidden__ = 1;
    var cst = el.getStyle();
    cst.display = "block";
    var eel = this.__element__;
    if (eel) {
      //el.__preHideDisplay__ = el.style.display;
      eel.style.display = "block";
    }
  }
  // for now, one handler per event
  dom.ELement.addEventListener = function (nm,fn) {
    var ev = this.eventListeners;
    var eel = el.__element__;
    ev[nm] = fn;
    if (eel) {
      eel.addEventListener(nm,fn);
    }    
  }
  dom.Elm.click = function (fn) {
    var el = this.__parent__;
    el.addEventListener("click",fn);
  }
  
  
 
})(prototypeJungle);

