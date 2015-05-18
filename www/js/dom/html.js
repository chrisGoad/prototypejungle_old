  (function (pj) {
  var geom  = pj.geom;
  var dom = pj.dom;
  var html = pj.html;
  
// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  html.set("Element",Object.create(dom.Element)).namedType(); // dom elements other than svg
  
  var htag = html.set("tag",pj.Object.mk());
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
  htag.set("textarea",html.Element.instantiate()).namedType();

  htag.textarea.set("attributes",pj.lift({rows:"S",cols:"S"}));


  html.commonAttributes = {"href":"S","type":"S","value":"S","src":"S","width":"S","height":"S","scrolling":"S"};

html.Element.__mkFromTag = function (tag) {
  if (tag) {
    var tv = html.tag[tag];
  }
  if (tv) {
    var rs  = Object.create(tv);
    rs.set("_eventListeners",pj.Object.mk());
  } else {
    pj.error("This html tag is not implemented",tag);
  }
  return rs;
}
  
  
  html.wrap = function (nm,tg,prps) {
    if (nm) {
      var el = document.getElementById(nm);
    }
    if (el) {
      if (tg !== el.tagName.toLowerCase()) {
        pj.error('Tag mismatch for wrap of ',nm);
        return;
      }
    }    
    var rs = dom.Element.__mkFromTag(tg);
    pj.setProperties(rs,prps);
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
    if (typeof h === 'string') {
      this.text = h;
      if (eel) { 
        eel.innerHTML = h;
      }
    } else { 
      if (eel) {
        var txt = eel.innerHTML;
        this.text = txt;
        return txt;
      }
    }
  }
  
  html.Element.$focus = function () {
    var eel = this.__element;
    if (eel) {
      eel.focus();
    }
  }
  
    
  html.Element.$select = function () {
    var eel = this.__element;
    if (eel) {
      eel.select();
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
    this.__setStyle();
  }
  
  html.Element.$attr = function (att,v) {
    if (typeof att==="string") {
      this.setAttribute(att,v);
    } else {
      var prps=Object.getOwnPropertyNames(att);
      prps.forEach(function (p) {el[p] = att[p]});
      this.__setAttributes();
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
    var cst = dom.getStyle(this);
    cst.display = "none";
    var eel = this.__element;
    if (eel) {
      eel.style.display = "none";
    }
  }
  
  html.Element.$show = function () {
    var cst = dom.getStyle(this);
    cst.display = "";
    var eel = this.__element;
    if (eel) {
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
