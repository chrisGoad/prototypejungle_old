
(function (pj) {
  var dat = pj.dat;
  var om = pj.om;
  var ui = pj.ui;
  var svg = pj.svg;
  
  ui.setNote(dat.LinearScale,"coverage","The interval covered by the axis in data space");
  ui.setNote(dat.LinearScale,"extent","The extent of the scale in image space");

  
  om.tryit = function (fn,ep,noCatch,errEl) {
    //noCatch = 1;
    if (noCatch) {
      fn();
    } else {
      try {
        fn();
        return true;
      } catch(e) {
        ui.displayError(errEl,ep+e);
        return false;
      }
    } 
  }
  
  ui.processIncomingData = function (xdt) {
    if (xdt) {
      ui.root.__currentXdata = xdt;
    } else {
      xdt = ui.root.__currentXdata;
    }
    var idt = dat.internalizeData(xdt);
    ui.root.set("data",idt);
  }
  
  ui.performUpdate = function (noCatch,errEl) {
    om.tlog("STARTING UPDATE");
    var trs = om.tryit(function () {ui.root.outerUpdates()},"In update:",noCatch,errEl);
    om.tlog("FINISHED UPDATE");
    return "ok";
  }
  
  ui.afterLoadData = function (xdt,cb,noCatch,errEl) {
    var rs = 1;
    ui.processIncomingData(xdt);
    ui.root.__outsideData = 1;
    svg.main.addBackground(ui.root.backgroundColor);
   // svg.main.set("contents",ui.root);
    svg.main.contents=ui.root;
    if (ui.root.draw) {
      ui.root.draw(svg.main.__element); // update might need things to be in svg
    }
    if (ui.root.soloInit) {
      ui.root.soloInit();
    }
    var rs = ui.performUpdate(noCatch,errEl);
    if (cb) cb(rs);
    return rs;
   
  }

  om.getDataSourceFromHref = function (cuUrl) {
    var q = ui.parseQuerystring();
    var d = q.data;
    if (!d) return;
    if (om.beginsWith(d,"http")) {
      return d;
    } else  if (om.beginsWith(d,"./")) {
      return om.itemHost+"/"+cuUrl.handle+"/"+cuUrl.repo+d.substr(1);
    } else {
      return om.itemHost + d;
    }
  }
  

  om.initializeDataSource  = function (url) {
    var ds = om.getDataSourceFromHref(url);
    if (ds) {
      ui.root.dataSource = ds;
      ui.dataSource = ds;
    }  else if (ui.root.dataSource) {
      ds = ui.dataSource = ui.root.dataSource;
    } else {
      ds = om.pathReplaceLast(url,"data.js");
      ui.dataSource = ds;
      ui.ownDataSource = 1;
    }
    return ds;
  }
  
  
  
  function getOverrides(itm) {
    var ovr = itm.__overrides;
    if (!ovr) {
      ovr = {};
    }
    if (ovr) {
      delete itm.__overrides;
    }
    return ovr;
  }
            
      // this is before loading dat.
  
  ui.processIncomingItem = function (rs) {
    var unbuilt = rs.unbuilt;
    if (unbuilt) {
      var frs = rs;
    } else {
      var inst  = !(rs.__beenModified);// &&  !noInst; // instantiate directly built fellows, so as to share their code
      var ovr = getOverrides(rs);
      if (inst) {
        frs = rs.instantiate();
        // components should not be inherited, since they might be modified in course of builds
        var rsc = rs.__components;
        frs.set("__components",rsc?rsc:om.LNode.mk());
        pj.set("ws",frs);
        frs.__source = ui.repo + "/" + ui.path;
        
      } else {
        frs = rs;
      }
    }
    ui.root =  frs;
   // om.xferInstalledItemsToX();
    pj.ws = frs;
   // om.overrides = ovr;                   
    var bkc = frs.backgroundColor;
    if (!bkc) {
      frs.backgroundColor="white";
    }
  }
  
  
})(prototypeJungle);