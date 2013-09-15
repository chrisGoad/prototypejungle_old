(function (__pj__) {
  var om = __pj__.om;
  __pj__.set("dom",om.DNode.mk());
  var dom = __pj__.dom;
  
  
  // lines for a tree
  dom.installType("JQ");
  
  
  dom.newJQ = function (o,tp) {
    if (tp) {
      var rs = Object.create(tp);
    } else {
      var rs = Object.create(dom.JQ);
    }
    if (o) {
      rs.setProperties(o,["tag","html","click","id","type","class","hidden"]);
      rs.setN("hoverIn",o.hoverIn);
       rs.setN("hoverOut",o.hoverOut);
      rs.setN("style",o.style);
      rs.setN("attributes", o.attributes);
    }
    rs.set("theChildren",om.LNode.mk());
    return rs;
  }
  
  dom.wrapJQ = function (jq,o,tp) {
    var rs = dom.newJQ(o,tp);
    if (typeof jq == "string") {
      rs.__elementSelector__ = jq;
    } else {
      rs.__element__ = jq;
    }
    return rs;
  }
 
  dom.JQ.addChild = function (id,c) { // if only one arg, it is the child
    if (c) {
      this.theChildren.pushChild(c);
      if (id !== undefined) c.id = id;
      //return this;
      return c;
    } else {
      this.theChildren.pushChild(id);//id is the child in this case
      //return this;
      return id;
    }
  }
  
  dom.JQ.addChildren  = function (ch) {
    var thisHere = this;
    ch.forEach(function (c) {
      thisHere.addChild(c);
    });
    return this;
  }
  
  dom.JQ.removeChildren = function () {
    var jel = this.__element__;
    if (jel) {
      jel.empty();
    }
    this.theChildren.length = 0;
  }
  
  dom.JQ.lastChild = function () { // if only one arg, it is the child
    var ch = this.theChildren;
    var ln = ch.length;
    if (ln>0) {
      return ch[ln-1];
    }
    return undefined;
  }
  
  // add c as a sibling of this, just before this
  dom.JQ.addBefore = function (c) {
    var ch = this.__parent__;
    var nch = dom.LNode.mk();
    var ln = ch.length;
    for (var i=0;i<ln;i++) {
      var cc = ch[i]
      if (cc == this) {
        nch.pushChild(c);
      }
      nch.pushChild(cc);
    }
    var pr = ch.__parent__;
    pr.set("theChildren",nch);
  }
  
  dom.JQ.selectChild = function (id) {
    var c = this.theChildren;
    var ln = c.length;
    for (var i=0;i<ln;i++) {
      var cc = c[i];
      if (cc.id == id) return cc;
    }
  }
  
  
  
  dom.JQ.parent = function () {
    var ipr = this.get('__parent__'); // if an LNode this is children of another JQ element
    if (om.LNode.isPrototypeOf(ipr))  { // an LNode
      var rs = ipr.get('__parent__');
      if (dom.JQ.isPrototypeOf(rs)) return rs;
    }
  }
  
  dom.JQ.cssSelect = function (sl) {
    // only #a>#b... supported for now
    var pth = sl.split(">");
    var nms = pth.map(function (el) {return el.substr(1);});
    var ln = nms.length;
    var cv = this;
    for (var i=0;i<ln;i++) {
      cv = cv.selectChild(nms[i]);
      if (!cv) return cv;
    }
    return cv;
  }
  // keep track of depth of recursion for debugging
  dom.JQ.install = function (appendEl,afterEl,dp) {
    function installHandler(x,nm) {
      if (x[nm]) {
        if (nm == "enter") { // special case
          x.__element__.keyup(function (e) {
            if (e.keyCode == 13) {
              x[nm]();
            }
          });
        } else {
          x.__element__[nm](x[nm]);
        }
      }
    }
    
    function installHandlers(x,nms) {
      nms.forEach(function (nm) {installHandler(x,nm)});
    }
      
    if (!dp) dp = 0;
    var pr = this.parent();
    if (appendEl) {
      this.__treeTop__ = 1;
    } else {
      if (pr && pr.__element__) {
        appendEl = pr.__element__;
      }
    }
    // if the element is already present, no need to build it. but still, reset styles.
    var jel = this.__element__;
    var jelsel = this.__elementSelector__;
    if (jelsel) {
      if (jelsel == '"#topbar') {
        debugger;
      }
      jel = $(jelsel);
      if (!jel) {
        om.error("NO SUCH ELEMENT ",jelsel);
        return;
      }
      this.__element__ = jel;
    }
    var nm = this.id;
    if (!nm) nm = this.__name__;
    if (!nm) nm = "uiRoot";
    if (!jel) {
      var html = this.html;
      var tag = this.tag;
      if (tag) {
        jel = $('<'+tag+'/>');
        if (html) {
          jel.html(html);
        }
      } else {
        jel = $(html);
      }
     
      if (afterEl) {
        afterEl.__element__.after(jel);
      } else {
        //if (!appendEl) {
        //  debugger;
        //}
        appendEl.append(jel);
      }
      this.__element__ = jel;
      jel.attr("id",nm);
      installHandlers(this,["click","blur","focus","enter"]);
      var cl = this["class"];
      if (cl) {
        jel.addClass(cl);
      }
      var hi = this.hoverIn;
      var hif,hof;
      if (hi) {
        var hist = hi.stripOm();
        hif = function () {jel.css(hist)};
      }
      var ho = this.hoverOut
      if (ho) {
        var host = ho.stripOm();
        hof = function () {jel.css(host)};
      }
      if (hi || ho) {
        jel.hover(hif,hof);
      }
    
  
      if (this.hidden) {
        jel.hide();
      }
    }
    var st = this.style;
    if (st) {
      var sst = st.stripOm();
      jel.css(sst);
    }
    var att = this.attributes;
    if (att) {
      att.iterInheritedTreeItems(function (v,k) {
        jel.attr(k,v);
      });
    }
    var props = this.props;
    if (props) {
      props.iterInheritedTreeItems(function (v,k) {
        jel.prop(k,v);
      });
    }
    var ndp = dp + 1;
    var ch = this.theChildren;
    var ael = undefined;
    var ln = ch.length;
    for (var i=0;i<ln;i++) {
      var vk = ch[i];
      vk.install(null,ael,ndp);
      ael = vk;
    };
  }
  
  dom.JQ.uninstall = function () {
    this.__element__ = undefined;
    this.theChildren.forEach(function (c) {
      c.uninstall();
    });
  }
  
  dom.JQ.hide = function () {
    if (this.hidden) return;
    this.hidden = 1;
    var el = this.__element__;
    if (el) {
      el.hide();
    }
  }
  
  
  dom.JQ.show = function () {
    if (!this.hidden) return;
    this.hidden = 0;
    var el = this.__element__;
    if (el) {
      el.show();
    }
  }
  
  // as an aid to debugging: make the tree visible
  
  dom.JQ.dpytree = function () {
    var rs = {};
    rs.tag = this.tag;
    rs.html = this.html;
    rs.id = this.id;
    var st = this.style;
    if (st) {
      rs.style = st.stripOm();
    }
    var att = this.attributes;
    if (att) {
      rs.attributes = att.stripOm();
    }
    var ch = this.theChildren;
    var ca = [];
    rs.theChildren = ca;
    var ln = ch.length;
    for (var i=0;i<ln;i++) {
      var cj = ch[i];
      var dch = cj.dpytree();
      ca.push(dch);
    }
    return rs;
  }
  
  dom.toHtml = function (x) {
    var rs = "";
    var tg = x.tag;
    rs += "<"+tg+">";
    var htm = x.html;
    if (htm) {
      rs += htm;
    }
    var fc = x.theChildren;
    if (fc) {
      fc.forEach(function (v) {
        rs += dom.toHtml(v);
      })
    }
    rs += "</"+tg+">";
    return rs;
  }
  
  dom.JQ.toHtml = function () {
    var x = this.dpytree();
    return dom.toHtml(x);
  }
  
  dom.JQ.dpy = function () {
    return JSON.stringify(this.dpytree());
  }
  
  dom.JQ.css = function (css) {
    var jel = this.__element__;
    if (jel) {
      jel.css(css);
    }
  }
  
  dom.JQ.attr = function (attr,x) {
    var jel = this.__element__;
    if (jel) {
      if (x==undefined) {
        return jel.attr(attr);
      } else {
        jel.attr(attr,x);
      }
    }
  }
  
  
  
  dom.JQ.prop = function (p,x) {
    var jel = this.__element__;
    if (jel) {
      if (x==undefined) {
        return jel.prop(p);
      } else {
        jel.prop(p,x);
      }
    }
  }
  
  dom.JQ.empty = function () {
    var jel = this.__element__;
    if (jel) {
      jel.empty();
    }
  }
  
  dom.JQ.setHtml = function (h) {
    this.html = h;
    var jel = this.__element__;
    if (jel) {
      jel.html(h);
    }
  }

  
  dom.JQ.offset = function () {
    var jel = this.__element__;
    if (jel) {
      return jel.offset();
    }
  }
  
  dom.JQ.width = function () {
    var jel = this.__element__;
    if (jel) {
      return jel.width();
    }
  }
  
  
  dom.JQ.height = function () {
    var jel = this.__element__;
    if (jel) {
      return jel.height();
    }
  }
  
  
  
  
  dom.JQ.html = function (h) {
    var jel = this.__element__;
    if (jel) {
      return jel.html(h);
    }
  }
  
  dom.installType("Select");
  
  dom.Select.mk = function (o) {
    var rs = Object.create(dom.Select);
    rs.setProperties(rs,o);
    return rs;
  }
  
  dom.Select.toJQ = function () {
    var jq = this.jq;
    if (jq) return jq;
    var opts = this.options;
    var cnt = this.containerP.instantiate();
    var op = this.optionP;
    var ln=opts.length;
    var thisHere = this;
    // generate a separate closure for each n
    function selector(n) {
      return function () {
        thisHere.select(n);
      }
    }
    var opels = [];
    var sl = this.selected;
    var disabled = this.disabled;

    for (var i=0;i<ln;i++) {
      var o = opts[i];
      var opel = op.instantiate();
      opels.push(opel);
      if (disabled && disabled[i]) {
        opel.style.color = "gray";
      } else {
        opel.click = selector(i);
      }
      opel.html = (this.isOptionSelector)&(i===sl)?"&#x25CF; "+o:o
      cnt.addChild(opel);
     
    }
    this.optionElements = opels;
    this.jq = cnt;
    return cnt;
  
  }
 
   dom.Select.select = function (n) {
    this.selected = n;
    var opts = this.options;
    var optels = this.optionElements;
    var ln = opts.length;
    for (var i=0;i<ln;i++) {
      var oi = opts[i];
      var oe  = optels[i];
      if (i==n) {
        oe.__element__.html(((this.isOptionSelector)?"&#x25CF; ":"") + oi);
      } else {
        oe.__element__.html(oi);
      }
    }
    if (this.onSelect) {
      this.onSelect(n);
    }
  }
 
  dom.popped = {};
  
  dom.popFromButton = function (nm,button,toPop) {
    dom.unpop(nm);
    var p = dom.popped;
    if (p[nm]) {
      toPop.css({"display":"none"});
      p[nm] = 0;
      return;
    }
    var pr = toPop.parent();
    var pof = pr.offset();
    var ht = button.height();
    var ofs = button.offset();
    var rofL = ofs.left-pof.left;
    var rofT = ofs.top-pof.top;
    toPop.css({"display":"block","left":rofL+"px","top":(rofT+ht)+"px"});
    p[nm] = toPop;
  }
  

  dom.unpop = function (except) {
    var p = dom.popped;
    for (k in p) {
      if (k == except) continue;
      var pp = p[k];
      if (pp) {
        pp.css({"display":"none"});
        p[k] = 0;
      }
    }
  }

})(__pj__);

