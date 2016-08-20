(function (pj) {
var geom  = pj.geom;
var dom = pj.dom;

// This is one of the code files assembled into pjdom.js. //start extract and //end extract indicate the part used in the assembly
//start extract
debugger;
var html =  pj.set("html",pj.Object.mk());

html.__builtIn = true;

html.set("Element",Object.create(dom.Element)).__namedType(); // dom elements other than svg

var htag = html.set("tag",pj.Object.mk());
htag.set("html",html.Element.instantiate()).__namedType();// the top level doc
htag.set("head",html.Element.instantiate()).__namedType();
htag.set("body",html.Element.instantiate()).__namedType();
htag.set("div",html.Element.instantiate()).__namedType();
htag.set("span",html.Element.instantiate()).__namedType();
htag.set("select",html.Element.instantiate()).__namedType();
htag.set("option",html.Element.instantiate()).__namedType();
htag.set("pre",html.Element.instantiate()).__namedType();
htag.set("img",html.Element.instantiate()).__namedType();
htag.set("p",html.Element.instantiate()).__namedType();
htag.set("a",html.Element.instantiate()).__namedType();
htag.set("input",html.Element.instantiate()).__namedType();
htag.set("iframe",html.Element.instantiate()).__namedType();
htag.set("textarea",html.Element.instantiate()).__namedType();

htag.textarea.set("attributes",pj.lift({rows:"S",cols:"S"}));

htag.select.set("attributes",pj.lift({selectedindex:"N"}));
htag.option.set("attributes",pj.lift({selected:"N"}));

html.commonAttributes = {"href":"S","type":"S","value":"S","src":"S","width":"S","height":"S","scrolling":"S"};

html.Element.__mkFromTag = function (tag) {
  var tv,rs;
  if (tag) {
    tv = html.tag[tag];
  }
  if (tv) {
    rs  = Object.create(tv);
    rs.set("_eventListeners",pj.Object.mk());
  } else {
    pj.error("This html tag is not implemented",tag);
  }
  return rs;
}
  
  
html.wrap = function (nm,tg,prps) {
  var el,rs;
  if (nm) {
    el = document.getElementById(nm);
  }
  if (el) {
    if (tg !== el.tagName.toLowerCase()) {
      pj.error('Tag mismatch for wrap of ',nm);
      return;
    }
  }    
  rs = dom.Element.__mkFromTag(tg);
  pj.setProperties(rs,prps);
  if (el) rs.__element = el;
  rs.__wraps = nm;
  return rs;
}

/* this will be used for compatability with old scheme for a while */
  
html.Element.addChild = function (a1,a2) {
  var ch;
  if (a2 === undefined) {
    ch = a1;
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
  var rs;
  if (s) {
    rs = dom.parseWithDOM(s,false);
  }
  if (!rs) {
    debugger;
  }
  return rs;
}
  
html.Element.$html = function (h) {
  var eel = this.__element;
  var txt;
  if (typeof h === 'string') {
    this.text = h;
    if (eel) { 
      eel.innerHTML = h;
    }
  } else { 
    if (eel) {
      txt = eel.innerHTML;
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
  return cl.join(";");
}
  

html.Element.$css = function (ist,v) {
  var cst = dom.getStyle(this);
  var eel,st,prps;
  if (typeof ist === "string") {
    if (v) {
      cst[ist] = v;
      eel =  this.__element;
      if (eel) {
        eel.style[ist] = v;
      }
      return;
    }
    st = dom.parseStyle(ist);
  } else {
    st = ist;
  }
  prps=Object.getOwnPropertyNames(st);
  prps.forEach(function (p) {cst[p] = st[p]});
  this.__setStyle();
}

html.Element.$attr = function (att,v) {
  var prps;
  if (typeof att==="string") {
    this.__setAttribute(att,v);
  } else {
    prps=Object.getOwnPropertyNames(att);
    prps.forEach(function (p) {el[p] = att[p]});
    this.__setAttributes();
  }
}

  
html.Element.$prop= function (p,v) {
  var eel;
  this[p] = v;
  eel = this.__element;
  if (eel) {
    eel[p] = v;
  }
}


html.Element.$setStyle = function (att,value) {
  var cst = dom.getStyle(this);
  var eel;
  cst[att] = value;
  eel = this.__element;
  if (eel) {
    eel.style[att] = value;
  }
}

html.Element.$hide = function () {
  this.$setStyle('display','none');
  /*return;
  var cst = dom.getStyle(this);
  var eel;
  cst.display = "none";
  eel = this.__element;
  if (eel) {
    eel.style.display = "none";
  }*/
}

html.Element.$show = function () {
  this.$setStyle('display','');
  /*return;
  var cst = dom.getStyle(this);
  var eel;
  cst.display = "";
  eel = this.__element;
  if (eel) {
    eel.style.display = "";
  }*/
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


html.Element.$mouseup = function (fn) {
  this.addEventListener("mouseup",fn);
}
  
  
html.Element.$change = function (fn) {
  this.addEventListener("change",fn);
}


html.Element.$enter = function (fn) {
  this.addEventListener("enter",fn);
}
  
  
  
html.Element.$dblclick = function (fn) {
   this.addEventListener("dblclick",fn);
}
  
  
html.Element.$offset = function () {
  var eel = this.__element;
  var rect,x,y;
  if (eel) {
    rect = eel.getBoundingClientRect();
    y = rect.top + document.body.scrollTop;
    x = rect.left + document.body.scrollLeft;
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
    if (v !== undefined) {
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
