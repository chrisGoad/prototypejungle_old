// Copyright 2019 Chris Goad
// License: MIT

let html =  codeRoot.set("html",core.ObjectNode.mk());

html.set("Element",Object.create(Element)).__namedType(); // dom elements other than svg

let htag = html.set("tag",core.ObjectNode.mk());
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

html.commonTransfers = ['href','type','src','width','height','scrolling'];


html.Element.__domTransfers = html.commonTransfers;

htag.select.__domTransfers = html.commonTransfers.concat(['selectedIndex']);

htag.option.__domTransfers = html.commonTransfers.concat(['selected']);

htag.textarea.__domTransfers = html.commonTransfers.concat(['rows','cols']);
htag.input.__domTransfers = html.commonTransfers.concat(['size','value']);

html.Element.__mkFromTag = function (tag) {
  let tv,rs;
  if (tag) {
    tv = html.tag[tag];
  }
  if (tv) {
    rs  = Object.create(tv);
    rs.set("_eventListeners",core.Object.mk());
  } else {
    core.error("This html tag is not implemented",tag);
  }
  return rs;
}
  
  
html.wrap = function (nm,tg,prps) {
  let el,rs;
  if (nm) {
    el = document.getElementById(nm);
  }
  if (el) {
    if (tg !== el.tagName.toLowerCase()) {
      core.error('Tag mismatch for wrap of ',nm);
      return;
    }
  }    
  rs = Element.__mkFromTag(tg);
  core.setProperties(rs,prps);
  if (el) {
    rs.__element = el;
  }
  rs.__wraps = nm;
  return rs;
}

/* this will be used for compatability with old scheme for a while */
  
html.Element.addChild = function (a1,a2) {
  let ch;
  if (a2 === undefined) {
    ch = a1;
    if (!ch) {
       core.error('html','unexpected condition'); 
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

html.Element.__addChildren = function (ch) {
  let thisHere = this;
  ch.forEach(function (c) {
    if (c) {
      thisHere.addChild(c);
    }
  });
  return this;
}
  
  
html.Element.mk = function (s) {
  let rs;
  if (s) {
    rs = parseWithDOM(s,false);
  }
  if (!rs) {
     core.error('html','unexpected condition'); 
  }
  return rs;
}
  
html.Element.$html = function (h) {
  let eel = this.__element;
  let txt;
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
  let eel = this.__element;
  if (eel) {
    eel.focus();
  }
}
  
    
html.Element.$select = function () {
  let eel = this.__element;
  if (eel) {
    eel.select();
  }
}
  
  
  
html.styleToString = function (st) {
  let prps=Object.getOwnPropertyNames(st);
  let cl = prps.map(function (p) {return '"'+p+'":"'+st[p]+'"'});
  return cl.join(";");
}
  

html.Element.$css = function (ist,v) {
  let cst = getStyle(this);
  let eel,st,prps;
  if (typeof ist === "string") {
    if (v) {
      cst[ist] = v;
      eel =  this.__element;
      if (eel) {
        eel.style[ist] = v;
      }
      return;
    }
    st = parseStyle(ist);
  } else {
    st = ist;
  }
  prps=Object.getOwnPropertyNames(st);
  prps.forEach(function (p) {cst[p] = st[p]});
  this.__setStyle();
}

html.Element.$attr = function (att,v) {
  let prps;
  if (typeof att==="string") {
    this.__setAttribute(att,v);
  } else {
    prps=Object.getOwnPropertyNames(att);
    prps.forEach(function (p) {this[p] = att[p]});
    this.__setAttributes();
  }
}

  
html.Element.$prop= function (p,v) {
  let eel;
  this[p] = v;
  eel = this.__element;
  if (eel) {
    eel[p] = v;
  }
}


html.Element.$setStyle = function (att,value) {
  let cst = getStyle(this);
  let eel;
  cst[att] = value;
  eel = this.__element;
  if (eel) {
    eel.style[att] = value;
  }
}

html.Element.$hide = function () {
  this.$setStyle('display','none');
}

html.Element.$show = function () {
  this.$setStyle('display','');
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
  let eel = this.__element;
  let rect,x,y;
  if (eel) {
    rect = eel.getBoundingClientRect();
    y = rect.top + document.body.scrollTop;
    x = rect.left + document.body.scrollLeft;
    return Point.mk(x,y);
  }
}
  
Element.$height = function () {
  let eel = this.__element;
  if (eel) {
    return eel.offsetHeight;
  }
}


Element.$width = function () {
  let eel = this.__element;
  if (eel) {
    return eel.offsetWidth;
  }
}
  
html.Element.$prop = function (nm,v) {
  let eel = this.__element;
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

export {html};
