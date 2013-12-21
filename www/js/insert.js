  /* THis code is not in use but might come back */
  page.insertItem = function(url,pwhr,whr,cb) {
    //pwhr is the internal path at which to  the prototype, and whr is the internal path at which to  the instance
    if (pwhr) {
      var exp = om.evalPath(om.root,"prototypes/"+pwhr); // is the prototype already there?
    }
    if (om.beginsWith(url,"http://")) {
      if (exp) {
        var src = prototypeSource(exp);
        if (url === src) {
          finishInsert(exp,null,whr,cb);
          return;
        }
      }
      om.install([url],function (ars) {
        finishInsert(ars[0],pwhr,whr,cb);
      });
    } else {
      // otherwise this is a primitive
      var prim = lookupPrim(url);
      if (exp) {
        if (Object.getPrototypeOf(exp)===prim) {
          finishInsert(exp,null,whr,cb);
          return;
        }
      }
      var funToAdd = ["update",function () {}];
      finishInsert(prim,pwhr,whr,cb,funToAdd);
    }
  }
  
  page.insertText = function (whr,txt) {
    var url = "sys/repo0/geom/Text";
    var pwhr = "CaptionP";
    var cb = function (inst) {
      inst.text = txt;
      var bnds = om.root.deepBounds();
      var crn = bnds.corner;
      var xt = bnds.extent;
      var fc = 0.1;
      // move the new text out of the way
      var pos = crn.plus(geom.Point.mk(2*fc*xt.x,-fc*xt.y));
      inst.moveto(pos);
      draw.refresh();// to measure text
      draw.mainCanvas.fitContents();
      tree.adjust();
    }
    page.insertItem(url,pwhr,whr,cb);
    
  }
  // which is "Button" or "Caption"
  function insertPanelJQ(which) {
    
 
    function checkNamesInInput (ifld,erre) {
      ifld.keyup(function () {
        var fs = ifld.prop("value");
        if (!fs ||  om.checkName(fs)) {
          erre.html("");
        } else {
          erre.html("The name may not contain characters other than digits, letters, and the underbar");  
        }
      })
    }
    var txti,whri,okBut,cancelBut,errmsg;
  
    var rs = $('<div><p style="text-align:center;font-weight:bold">Insert '+which+'</p></div>').append(
      $('<div/>').append(
        $('<span>Name for  caption: </span>').append(
        whri= $('<input type="text" style="width:100px"/>'))
        )
    ).append($('<div/>').append(
       $('<span>Caption text: </span>').append(
        txti= $('<input type="text" style="width:300px"/>'))
        )
    ).append(
        errmsg = $('<div class="error" style="padding-top:20px"></div>')
    ).append($('<div style="padding-top:20px"/>').append(
      okBut = $('<div class="button">Ok</div>')).append(
      cancelBut = $('<div class="button">Cancel</div>'))
    );
    var txterr = 0; // no null text error has yet occured
    okBut.click(function () {
      var whr = whri.prop("value");
      var txt = txti.prop("value");
      if ($.trim(whr)==="" ){
        errmsg.html("Name for the caption not specified");
        return;
      }
      if (om.root[whr]) {
        errmsg.html("There is already an  object by that name;  please choose another");
        return;
      }
      if ($.trim(txt)==="" ){
        errmsg.html("No text specified");
        txterr = 1;
        return;
      }
      page.insertText(whr,txt);
      mpg.lightbox.dismiss();
    });
    cancelBut.click(function () {mpg.lightbox.dismiss();});
    checkNamesInInput(whri,errmsg);
    txti.keyup(function () {
      if (!txterr) {
        return;
      }
      if (errmsg.html()=="") {
        return;
      }
      var txt = txti.prop("value");
      if ($.trim(txt) != "") {
        errmsg.html("");
      }
    })
    return rs;
  }

  page.popInsertPanel = function (which) {
    mpg.lightbox.pop();
     mpg.lightbox.setContent(insertPanelJQ(which));
  }
  
 