(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  dom = __pj__.set("dom",om.DNode.mk());// added for prototypeJungle; this is where symbols are added, rather than at the global level
  dom.__external__ = 1;
  var svg =  __pj__.set("svg",__pj__.om.DNode.mk());
  svg.__external__ = 1;

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
  dom.set("ELement",om.DNode.mk()).namedType();

  
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
  
  // attributes as they appear in the DOM are also recorded in the transient (non DNode), __domAttributes__
  // this is a little Reactish
dom.ELement.setAttributes = function (tag) {
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
    if (!atts) return;
    var thisHere = this;
    var op = Object.getOwnPropertyNames(atts);
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
    this.setAttributes(tag);
    var zz = pel.appendChild(cel);
    return cel;
  }
  
  om.LNode.addToDom1 = dom.ELement.addToDom1

  
   om.nodeMethod("addToDom",function (rootEl) {
    var el = this.get("__element__");
    var tg = this.domTag();
    if (el) {
      this.setAttributes(tg); // update 
    } else {
      this.addToDom1(tg,rootEl);
    }
    if (tg === "g") {
      this.iterDomTree(function (ch) {
        ch.addToDom();
      },true); // iterate over objects only
    }
  });
        
        
        
  om.DNode.isDomEl = function () {
    return dom.ELement.isPrototypeOf(this);
  }
})(prototypeJungle);

