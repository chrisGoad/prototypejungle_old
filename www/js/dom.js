(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  
  var aa = document.createElement('p')
  function parseStyle(st) {
    var rs = {};
    var sp0 = st.split(';');
    sp0.forEach(function (c) {
      var sp1 = c.split(":");
      if (sp1.length==2) {
        rs[sp1[0]] = sp1[1];
      }
    });
    return rs;
  }
  dom.parseHtml = function (s) {
    var st = []; // the stack of elements being processed
    var cc,ce,rs; // the current children and element, and new element
    function attrsToObject(attrs) {
      var rs = {};
      attrs.forEach(function (a) {
        rs[a.name] = a.value;
      });
      return rs;
    }
  
    var handler = {
      start:function (tag,attrs,unary) {
        var nc = [];
        var ao = attrsToObject(attrs);
        var ne = {tag:tag,attributes:ao,theChildren:nc};
        rs = ne; // for the case of a top level unary element
        if (ao.id) {
          ne.id = ao.id;
          delete ao.id;
        }
        if (ao.style) {
          ne.style = parseStyle(ao.style);
          delete ao.style;
        }
        if (cc) cc.push(ne);
        if (!unary) {
          st.push(ce);
          ce = ne;
          cc = nc;
        }
      },
      end:function (tag) {
        rs = ce;
        ce = st.pop();
        cc = ce?ce.children:undefined;
      },
      chars:function (txt) {
        ce.html = txt;
      },
      comment:function (txt) {
       }
    }
    dom.HTMLParser(s,handler);
    return rs;
  }
  
  
  /* there are two representations of a dom object; om-form and dom-form. The latter mirrors the "real"
   DOM - nodes  have the following fields: tag,id,class,attributes,click,hoverIn,hoverOut,theChildren
   (an LNode)

   In the om representation, the children are ordinary tree children instead, __name__ed by their ids.
   There is an __order__ field which records the order of children , by __name__
   This makes for better inspection and prototyping. tag, attibutes, style,class,click,hoverIn,hoverOut remain
   */
  
  
  /*
  ee = p.dom.parseHtml('<div id="ab" style="width:20px" width ="45"><p>foob</p><p>hr.m</p></div>');
  ee = p.dom.parseHtmel('<div id="aa"/>');
  */
  // lines for a tree
  dom.set("Element",om.DNode.mk()).namedType();
  dom.set("OmElement",om.DNode.mk()).namedType();
  dom.OmElement.mk = function (o) {
    if (typeof o == "string") {
      var dm = dom.El(o);
      return dm.omify();
    }
    return Object.create(dom.OmElement);
  }
  dom.Element.domify = function () {
    return this;
  }
  dom.OmElement.omify = function () {
    return this;
  }
  
  dom.OmEl = function (o) {
    return dom.OmElement.mk(o);
  }
  
  dom.set("Table",dom.OmElement.mk()).namedType();
          
  dom.Table.mk = function (o) {
    var rs=Object.create(dom.Table);
    rs.setProperties(o,["table","tr","td","rows","columns"]);
    rs.tag = "table";
    return rs;
  }
    
  om.DNode.copyAtomic = function () { // copies the non internal non functional  atomic fields
    var rs = om.DNode.mk();
    this.iterInheritedItems(function (nd,k) {
      var tp = typeof nd;
      if ((tp !== "object")&&(tp !== "function")) {
        rs[k] = nd;
      }
    });
    return rs;
  }
  //  domify has some of the role of draw; overriden for constructs such as TableOmElement
  dom.OmElement.domify = function () {
    var rs = Object.create(dom.Element);
    this.__dom__ = rs;
    var ch = om.LNode.mk();
    rs.set("theChildren",ch);
    this.iterInheritedItems(function (nd,k) {
      if ((k === "style")||(k === "attributes")) {
        rs.set(k,nd.copyAtomic());
      } else if (typeof nd === "object") {
        var dnd = nd.domify();
        dnd.id = k;
        ch.pushChild(dnd);
      } else {
        rs[k] = nd;
      }
    });
    return rs;
  }
  
  dom.OmElement.mirrorToDom = function () {
    
  
  dom.Element.omify = function () {
    var rs = dom.OmElement.mk();
    if (this.id) {
      rs.__name__ = this.id;
    }
    // no children yet
    if (this.attributes) {
      rs.attributes = this.attributes.copyAtomic();
    }
    if (this.style) {
      rs.style = this.style.copyAtomic();
    }
    rs.setProperties(this,["click","tag","html"]);
    return rs;
  }
  
  
  dom.Table.update  = function () {
    var rows= this.rows;
    var cols = this.columns;
    var drows =  om.LNode.mk();
    for (var i=0;i<rows;i++) {
      var tr = this.tr.instantiate();
      this.set("row_"+i,tr);
      for (var j=0;j<cols;j++) {
        var td = this.td.instantiate();
        td.html = "HO";
        tr.set("col_"+j,td);
      }
    }
    return rs;
  }
  /*
  dom.Table.domify  = function () {
    var rs = this.table.instantiate().domify();
    var rows= this.rows;
    var cols = this.columns;
    var drows =  om.LNode.mk();
    rs.set("theChildren",drows);
    for (var i=0;i<rows;i++) {
      var tr = this.tr.instantiate().domify();
      drows.pushChild(tr);
      var dcols = om.LNode.mk();
      tr.set("theChildren",dcols);
      for (var j=0;j<cols;j++) {
        var td = this.td.instantiate();
        td.html = "HO";
        dcols.pushChild(td.domify());
      }
    }
    return rs;
  }
    
  */
    
    
        
  
  dom.Element.mk = function (io,tp) {
    if (typeof io=="string") {
      var o = dom.parseHtml(io);
    } else {
      o = io;
    }
    if (tp) {
      var rs = Object.create(tp);
    } else {
      var rs = Object.create(dom.Element);
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
  
  // less verbose
  dom.El = function (o,tp) {
    return dom.Element.mk(o,tp);
  }
  
  
  dom.wrapJQ = function (jq,o,tp) {
    if (o) {
      var st = o.style;
      if (st && (typeof st == "string")) {
        o.style = parseStyle(st);
      }
    }
    var rs = dom.El(o,tp);
    if (typeof jq === "string") {
      rs.__elementSelector__ = jq;
    } else {
      rs.__element__ = jq;
    }
    return rs;
  }
 
  dom.Element.addChild = function (id,c) { // if only one arg, it is the child
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
  
  dom.Element.addChildren  = function (ch) {
    var thisHere = this;
    ch.forEach(function (c) {
      thisHere.addChild(c);
    });
    return this;
  }
  
  dom.Element.removeChildren = function () {
    var jel = this.__element__;
    if (jel) {
      jel.empty();
    }
    this.theChildren.length = 0;
  }
  
  dom.Element.lastChild = function () { // if only one arg, it is the child
    var ch = this.theChildren;
    var ln = ch.length;
    if (ln>0) {
      return ch[ln-1];
    }
    return undefined;
  }
  
  // add c as a sibling of this, just before this
  dom.Element.addBefore = function (c) {
    var ch = this.__parent__;
    var nch = dom.LNode.mk();
    var ln = ch.length;
    for (var i=0;i<ln;i++) {
      var cc = ch[i]
      if (cc === this) {
        nch.pushChild(c);
      }
      nch.pushChild(cc);
    }
    var pr = ch.__parent__;
    pr.set("theChildren",nch);
  }
  
  dom.Element.selectChild = function (id) {
    var c = this.theChildren;
    var ln = c.length;
    for (var i=0;i<ln;i++) {
      var cc = c[i];
      if (cc.id === id) return cc;
    }
  }
  
  
  
  dom.Element.parent = function () {
    var ipr = this.get('__parent__'); // if an LNode this is children of another Element element
    if (om.LNode.isPrototypeOf(ipr))  { // an LNode
      var rs = ipr.get('__parent__');
      if (dom.Element.isPrototypeOf(rs)) return rs;
    }
  }
  
  dom.Element.cssSelect = function (sl) {
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
  dom.Element.install = function (appendEl,afterEl,dp) {
    function installHandler(x,nm) {
      if (x[nm]) {
        if (nm === "enter") { // special case
          x.__element__.keyup(function (e) {
            if (e.keyCode === 13) {
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
      jel = $(jelsel);
      if (!jel) {
        om.error("NO SUCH ELEMENT ",jelsel);
        return;
      }
      this.__element__ = jel;
    }
    var nm = this.id;
    if (!nm) nm = this.__name__;
    //if (!nm) nm = "uiRoot";
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
        appendEl.append(jel);
      }
      this.__element__ = jel;
      if (nm) jel.attr("id",nm);
      installHandlers(this,["click","blur","focus","enter","keydown","mousedown"]);
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
  
  dom.Element.uninstall = function () {
    this.__element__ = undefined;
    this.theChildren.forEach(function (c) {
      c.uninstall();
    });
  }
  
  dom.Element.hide = function () {
    if (this.hidden) return;
    this.hidden = 1;
    var el = this.__element__;
    if (el) {
      el.hide();
    }
  }
  
  
  dom.Element.show = function () {
    if (!this.hidden) return;
    this.hidden = 0;
    var el = this.__element__;
    if (el) {
      el.show();
    }
  }
  
  // as an aid to debugging: make the tree visible
  
  dom.Element.dpytree = function () {
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
  
  dom.Element.toHtml = function () {
    var x = this.dpytree();
    return dom.toHtml(x);
  }
  
  dom.Element.dpy = function () {
    return JSON.stringify(this.dpytree());
  }
  
  dom.Element.css = function (css) {
    var jel = this.__element__;
    if (jel) {
      jel.css(css);
    }
  }
  
  dom.Element.attr = function (attr,x) {
    var jel = this.__element__;
    if (jel) {
      if (x==undefined) {
        return jel.attr(attr);
      } else {
        jel.attr(attr,x);
      }
    }
  }
  
  
  
  dom.Element.prop = function (p,x) {
    var jel = this.__element__;
    if (jel) {
      if (x==undefined) {
        return jel.prop(p);
      } else {
        jel.prop(p,x);
      }
    }
  }
  
  dom.Element.empty = function () {
    var jel = this.__element__;
    if (jel) {
      jel.empty();
    }
  }
  
  dom.Element.setHtml = function (h) {
    this.html = h;
    var jel = this.__element__;
    if (jel) {
      jel.html(h);
    }
  }

  
  dom.Element.offset = function () {
    var jel = this.__element__;
    if (jel) {
      return jel.offset();
    }
  }
  
  dom.Element.width = function () {
    var jel = this.__element__;
    if (jel) {
      return jel.width();
    }
  }
  
  
  dom.Element.height = function () {
    var jel = this.__element__;
    if (jel) {
      return jel.height();
    }
  }
  
  
  
  
  dom.Element.html = function (h) {
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
  
  // update the nth disabled element to v
  dom.Select.setDisabled = function (n,iv) {
    var v = iv?1:0; 
    var  disabled = this.disabled;
    var cd = disabled[n];
    if (cd == v) return;//no change
    disabled[n] = v;  
    var jq = this.jq;
    if (!jq) return;
    var jel = jq.__element__;
    if (!jel) return;
    var opels = this.optionElements;
    var thisHere = this;
    function selector(n) {
      return function () {
        thisHere.select(n);
      }
    }
    var opel = opels[n];
    var oel = opel.__element__;
    if (v) {
      oel.click('off');
      oel.css('color','gray');
    } else {
      oel.click(selector(n));
      oel.css('color','black');
    }
  }
   

   dom.Select.select = function (n) {
    this.selected = n;
    var opts = this.options;
    var optels = this.optionElements;
    var ln = opts.length;
    for (var i=0;i<ln;i++) {
      var oi = opts[i];
      var oe  = optels[i];
      if (i===n) {
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
      if (k === except) continue;
      var pp = p[k];
      if (pp) {
        pp.css({"display":"none"});
        p[k] = 0;
      }
    }
  }
  
  // for processing an input field; checking the value, inserting it if good, and alerting otherwise. Returns a message if there is an error
  // the value true if there was a change, and false otherwise (no change);
  // inherited will be set to false if this fellow is at the frontier;
  dom.processInput = function (inp,nd,k,inherited,computeWd) {
    var ipv = nd.get(k);
    var pv = ipv?nd.applyOutputF(k,ipv):"inherited";  // previous value
    var vl = inp.__element__.prop("value");
    if (vl === "") {
      if (inherited) {
        inp.__element__.prop("value","inherited");
      } else {
        delete nd[k];
      }
    } else {
      if (vl === "inherited") return false;
      var inf = nd.getInputF(k);
      if (inf) {
        var nv = inf(vl,nd);
        if (om.isObject(nv)) { // an object return means that the value is illegal for this field
          //page.alert(nv.message);
          inp.__element__.prop("value",pv);// put previous value back in
          return nv.message;
        }
      } else {
        var nv = parseFloat(vl);
        if (isNaN(nv)) {
          nv = $.trim(vl);
        }
      }
      if (pv == nv) {
        om.log("tree",k+" UNCHANGED ",pv,nv);
        return false;
      } else {
        om.log("tree",k+" CHANGED",pv,nv);
      }
      //page.setSaved(false);
      nd[k] =  nv;
      if (nd.isComputed()){
        nd.transferToOverride(om.overrides,om.root,[k]);
      }
      var nwd = computeWd(String(nv));
      inp.css({'width':nwd+"px"});
      om.root.__changedThisSession__ = 1;
      //if (nd.isComputed()){
      //  nd.addOverride(om.overrides,k,om.root);
      //}
      return true;
    }
  }

})(prototypeJungle);

