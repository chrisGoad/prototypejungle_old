  (function (pj) {
  var om = pj.om;
  var geom  = pj.geom;
  var dom = pj.dom;
  var html = pj.html;
  
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  html.set("Element",Object.create(dom.Element)).namedType(); // dom elements other than svg
  //html.Element.set("$",om.DNode.mk()); // holds a few jqueryish methods
  //dom.Element.set("eventListeners",om.DNode.mk());
  //dom.Element.mk = function () {
  //  debugger;
  //  return dom.Element.instantiate(dom.Element);
 // };
  
  var htag = html.set("tag",om.DNode.mk());
   htag.set("html",html.Element.instantiate()).namedType();// the top level doc
   htag.set("head",html.Element.instantiate()).namedType();
   htag.set("body",html.Element.instantiate()).namedType();
   htag.set("div",html.Element.instantiate()).namedType();
  htag.set("span",html.Element.instantiate()).namedType();
   htag.set("img",html.Element.instantiate()).namedType();
  htag.set("p",html.Element.instantiate()).namedType();
  htag.set("a",html.Element.instantiate()).namedType();
  htag.set("input",html.Element.instantiate()).namedType();
  htag.set("iframe",html.Element.instantiate()).namedType();

  html.commonAttributes = {"href":"S","type":"S","value":"S","src":"S","width":"S","height":"S","scrolling":"S"};

html.Element.mkFromTag = function (tag) {
  if (tag) {
    var tv = html.tag[tag];
  }
  if (tv) {
    var rs  = Object.create(tv);
    rs.set("_eventListeners",om.DNode.mk());
  } else {
    om.error("This html tag is not implemented",tag);
  }
  return rs;
}
/*
  dom.Element.installChild = function (nd) {
    var el = this.__element;
    if (!el) return;
    var nel = nd.__element;
    if (nel) return;
    nd.__addToDom(el);
  }
  dom.Element.push = function (ind) {
    if (typeof ind === "string") {
      var nd = dom.Element.mk(ind);
    } else {
      nd = ind;
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
    this.installChild(nd);
  }
  */
  
  
  html.wrap = function (nm,tg,prps) {
    if (nm) {
      var el = document.getElementById(nm);
    }
    if (el) {
      if (tg !== el.tagName.toLowerCase()) {
        om.error('Tag mismatch for wrap of ',nm);
        return;
      }
    }    
    var rs = dom.Element.mkFromTag(tg);
    om.setProperties(rs,prps);
    if (el) rs.__element = el;
    rs.__wraps = nm;
    return rs;
  }
  
   /* this will be used for compatability with old scheme for a while */
  
  html.Element.addChild = function (a1,a2) {
    if (a2 === undefined) {
      var ch = a1;
      if (!ch) {
        debugger;
      }
      if (ch.__get("__name")) {
        this.set(ch.__name,ch);
      } else {
        this.push(ch);
      }
    } else {
      this.set(a1,a2);
    }
    return this;
  }
  
  html.Element.addChildren = function (ch) {
    var thisHere = this;
    ch.forEach(function (c) {
      thisHere.addChild(c);
    });
    return this;
  }
  
  
  html.Element.mk = function (s,inheritFrom) {
     
    if (s) {
      var rs = dom.parseWithDOM(s,false);

      //var rs = dom.parseXML(s,inheritFrom);
    }
    if (!rs) {
      debugger;
    }
    return rs;
  }
  
  html.Element.$html = function (h) {
    var eel = this.__element;
    this.text = h;
    if (eel) {
      eel.innerHTML = h;
    }
  }
  
  html.styleToString = function (st) {
    var prps=Object.getOwnPropertyNames(st);
    var rs = "";
    var cl = prps.map(function (p) {return '"'+prp+'":"'+st[prp]+'"'});
    var rs = cl.join(";");
  }
  

  html.Element.$css = function (ist,v) {
    var cst = dom.getStyle(this);
    if (typeof ist === "string") {
      if (v) {
        cst[ist] = v;
        var eel =  this.__element;
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
    this.setStyle();
  }
  
  html.Element.$attr = function (att,v) {
    if (typeof att==="string") {
      this.setAttribute(att,v);
    } else {
      var prps=Object.getOwnPropertyNames(att);
      prps.forEach(function (p) {el[p] = att[p]});
      this.setAttributes();
    }
  }

  
  html.Element.$prop= function (p,v) {
    this[p] = v;
    var eel = this.__element;
    if (eel) {
      eel[p] = v;
    }
  }

  
  
  html.Element.$hide = function () {
    //el.__hidden__ = 1;
    var cst = dom.getStyle(this);
    cst.display = "none";
    var eel = this.__element;
    if (eel) {
      //el.__preHideDisplay__ = el.style.display;
      eel.style.display = "none";
    }
  }
  
  html.Element.$show = function () {
    //el.__hidden__ = 1;
    var cst = dom.getStyle(this);
    cst.display = "";
    var eel = this.__element;
    if (eel) {
      //el.__preHideDisplay__ = el.style.display;
      eel.style.display = "";
    }
  }
  
  html.Element.setVisibility = function (v) {
    if (v) {
      this.$show();
    } else {
      this.$hide();
    }
  }
  
  // for now, one handler per event
  /*dom.Element._addEventListener = function (nm,fn) {
    var ev = this._eventListeners;
    if (!ev) {
      debugger;
    }
    var eel = this.__element;
    ev[nm] = fn;
    if (eel) {
      eel.addEventListener(nm,fn);
    }    
  }
  
  dom.Element._removeEventListener = function (nm) {
    var f = this._eventListeners[nm];
    if (f) {
      delete this._eventListeners[nm];
      var eel = this.__element;
      if (eel) {
        eel.removeEventListener(nm,f);
      }
    }
  }
  */
  
  html.Element.$click = function (fn) {
    this.addEventListener("click",fn);
  }
  
  
  html.Element.$enter = function (fn) {
    this.addEventListener("enter",fn);
  }
  
  
  
  html.Element.$dblclick = function (fn) {
     this.addEventListener("dblclick",fn);
  }
  
  
  html.Element.$offset = function () {
    var eel = this.__element;
    if (eel) {
      var rect = eel.getBoundingClientRect();
      var y = rect.top + document.body.scrollTop;
      var x = rect.left + document.body.scrollLeft;
      return geom.Point.mk(x,y);
    }
  }
  
  dom.Element.$height = function () {
    var eel = this.__element;
    if (eel) {
      return eel.offsetHeight;
    }
  }
  
  
  dom.Element.$width = function () {
    var eel = this.__element;
    if (eel) {
      return eel.offsetWidth;
    }
  }
  
  html.Element.$prop = function (nm,v) {
    var eel = this.__element;
    if (eel !== undefined) {
      if (v) {
        eel[nm] = v;
      } else {
        return eel[nm];
      }
    }
  }
  
  html.Element.$empty = function () {                            
    this.$html('');
    this.__iterDomTree(function (ch) {
      ch.remove();
    },true); // iterate over objects only
  }

//end extract


})(prototypeJungle);
