
(function (__pj__) {
  var om = __pj__.om;
  var geom = __pj__.geom;
  
  var dataOps = __pj__.set("dataOps",__pj__.om.DNode.mk());
  dataOps.__externalReferences__ = [];

  // utilities for data
  // notation
  //[{type:}] means an array or lnode with members of the given tp
  //N means a number, S  a string,SN
  // A seriesDatum  is either a pair [N,N] or a triple [S,N,N]
  //A series has the form {data:[seriesData]} where the series might have other properites
  //LineGraphData has the form {value:[series]}
  
  
  function datumGet(d,f) {
    return (d.length==2)?(f=="x"?d[0]:d[1]):
                         (f=="x"?d[1]:(f=="y"?d[2]:d[0]));
  }
  
  
  dataOps.datumGet = datumGet;
  
  dataOps.unpackDatum = function (d) {
    var ln = d.length;
    if (ln == 2) return {x:d[0],y:d[1]};
    if (ln == 3) return {caption:d[0],x:d[1],y:d[2]};
    om.error("NOT YET");
  }
   
  // A scale describes a mapping from data space to image space. The coverage of a scale is an interval
  // in data space, and its extent an interval in image space
  
  
  dataOps.set("LinearScale",om.DNode.mk()).namedType();
  dataOps.LinearScale.set("coverage",geom.Interval.mk(0,100));
  dataOps.LinearScale.set("extent",geom.Interval.mk(0,100));

  
  
  dataOps.LinearScale.setExtent = function (xt) {
    this.set("extent",(typeof xt=="number")?geom.Interval.mk(0,xt):xt);
  }

  dataOps.LinearScale.mk = function (cv,xt) {
    var rs = dataOps.LinearScale.instantiate();
    if (cv) rs.set("coverage",cv);
    if (xt) {
      this.setExtent(xt);
    }
    return rs;
  }
  
  dataOps.LinearScale.eval = function (v) {
    var cv = this.coverage;
    var xt = this.extent;
    var sc = (xt.ub - xt.lb)/(cv.ub - cv.lb);
    return (this.isY)?xt.ub - sc * (v - cv.lb):xt.lb + sc * (v - cv.lb); // Y up 
   
  }
  
  
  
  
  dataOps.LinearScale.dtToImScale = function () {
     var cv = this.coverage;
     var xt = this.extent;
     return (xt.ub-xt.lb)/(cv.ub - cv.lb);
  }
  
  dataOps.LinearScale.label = function (dv) {
    return dv;
  }
  
  dataOps.set("Series",om.DNode.mk()).namedType();
  
  dataOps.Series.mk = function (o) {
    var rs = dataOps.Series.instantiate();
    rs.setIfExternal("data",om.lift(o.data));
    rs.setProperties(o,["caption"]);
    return rs;
  }
  
  dataOps.Series.extreme = function (which,fld,isofar) {
    var sofar = (isofar===undefined)?(which==="max"?-Infinity:Infinity):isofar;
    this.data.forEach(function (p) {
      var v = datumGet(p,fld);
      if ((v!==undefined) && (which==="max"?v>sofar:v<sofar)) {
        sofar = v;
      }
    });
    return sofar;
  }
  
  
  dataOps.Series.min =function (fld,isofar) {
    return this.extreme("min",fld,isofar);
  }
  dataOps.Series.max =function (fld,isofar) {
    return this.extreme("max",fld,isofar);
  }
  
  
  
  
  
  dataOps.Series.map = function (fn) {
    var opnts = this.data.map(fn);
    var rs = dataOps.Series.mk({data:opnts});
    rs.setProperties(this,["caption"]);
    return rs;
  }
  
  dataOps.Series.scale = function (xScale,yScale) {
    function scaleDatum(p) {
      var ln = p.length;
      var npx = xScale.eval(datumGet(p,"x"));
      var npy = yScale.eval(datumGet(p,"y"));
      var np = om.LNode.mk((ln===2)?[npx,npy]:[p[0],npx,npy]);
      return np;
    }
    return dataOps.Series.map(scaleDatum);
  }
  
  dataOps.set("Collection",om.DNode.mk()).namedType;
  dataOps.set("SeriesCollection",Object.create(dataOps.Collection)).namedType;

  dataOps.SeriesCollection.mk = function (o) {
    var rs = dataOps.SeriesCollection.instantiate();
    var mems = o.data;
    var smems = om.LNode.mk();
    mems.forEach(function (m) {
      smems.pushChild(dataOps.Series.mk(m));
    });
    rs.set("data",smems);
    return rs;
  }
  
  dataOps.Collection.map = function (fn) {
    var nmems = this.data.map(fn);
    var rs = dataOps.Collection.mk({data:nmems});
    rs.setProperties(this,["caption"]);
    return rs;
  }

  
  
  dataOps.Collection.extreme = function (which,fld,isofar) {
    var sofar = (isofar===undefined)?(which==="max"?-Infinity:Infinity):isofar;
    this.data.forEach(function (dt) {
      var c = dt.extreme(which,fld,sofar);
      if ((which==="max")?c>sofar:c<sofar) {
        sofar = c;
      }
    });
    return sofar;
  }
  
  
  dataOps.Collection.max =function (fld,isofar) {
    return this.extreme("max",fld,isofar);
  }
  
  dataOps.Collection.min =function (fld,isofar) {
    return this.extreme("min",fld,isofar);
  }
  
  dataOps.Collection.scale = function (xScale,yScale) {
    return dataOps.Collection.map(function (m) {
      return m.scale(xScale,yScale);
    });
  }
  
  dataOps.lift = function (dt) { // raw json; for now assumed to be a series collection; later dig into it so see what it looks like
    return dataOps.SeriesCollection.mk(dt);
  }
  
  
  om.installType("DataSource");
  
  om.DataSource.mk = function (url) {
    var rs = Object.create(om.DataSource);
    rs.url = url;
    rs.setf("link",""); // for display in the tree
   // rs.set("data",om.LNode.mk());
    rs.link = "<a href='"+url+"'>"+url+"</a>";
    rs.__current__ = 0;
    rs.oneShot = 1; // only load once, and keep the data around in saves
    return rs;
  }
  
  om.loadDataErrors = [];
  om.loadDataNewWay = 1;
  
  om.DataSource.grabData = function(cb) {// get the static list for the pj tree
    var thisHere = this;
    var scb = function (rs) {
      om.log("loadData","successfully grabbed "+thisHere.url);
      if (thisHere.afterLoad) {
        thisHere.afterLoad(rs);
      } else {
        var pr = thisHere.__parent__;
        var  lrs = dataOps.lift(rs);
        if (pr.setData !== om.DNode.setData) { // if setData is overriden
          pr.setData(lrs);
          thisHere.setIfExternal("data",lrs); //
        } else {
          thisHere.set("data", lrs);
        }
        thisHere.__current__ = 1;
      }
      
      if (cb) cb(thisHere);
      

    }
    var ecb = function (rs) {
      var msg = "failure to load "+thisHere.url;
      om.loadDataErrors.push(msg);
      this.__current__ = 1;
      thisHere.error = "LoadFailure";
      if (cb) cb(thisHere);

    }
    if (om.loadDataNewWay) {
      var opts = {type: 'GET',url: this.url,async: false,jsonpCallback: 'callback',contentType: "application/json",
               dataType: 'jsonp',success: scb,error:ecb};
    } else {
      var opts = {type:"GET",cache:false,dataType:"json",url: this.url,success:scb,error:ecb};
    }
    $.ajax(opts);

  }
  
  // OBSOLETE
  // start the loading of the data if missing
  om.DataSource.getData = function (cb) {
    if (this.data) return this.data;
    var thisHere = this;
    var gcb = function () {
      if (cb) cb(thisHere);
    }
    this.grabData(gcb);
    return false;
  }
      
    
  
  
  
  
  om.dataSourceBeingLoaded = null;
  om.loadedData = [];
  om.loadDataTimeout = 2000;
  
  om.collectedDataSources = undefined;
  
  om.DataSource.collectThisDataSource = function () {
    //  uninherit link
    this.link = this.link;
    om.collectedDataSources.push(this);
  }
  
  // collect below x
  om.collectDataSources = function (x) {
    om.collectedDataSources = [];
    x.deepApplyMeth("collectThisDataSource");
    return om.collectedDataSources;
  }
  
  om.loadNextDataSource  = function (n,cb) {
    var ds = om.collectedDataSources;
    var ln = ds.length;
    if (n === ln) {
      cb();
      return;
    }
    var dts = ds[n];
    
    var afterLoad = function(vl) {
      om.loadNextDataSource(n+1,cb);
    }
    if (dts.__current__) { // already in loaded state
      om.loadNextDataSource(n+1,cb);
    } else {
      dts.grabData(afterLoad);
    }
  }
  
  
  om.loadTheDataSources = function (itm,cb) {
    om.loadedData = [];
    om.collectDataSources(itm);
    om.loadNextDataSource(0,cb);
  }
  
  om.clearDataSources = function (itm) {
    om.collectDataSources(itm);
    om.collectedDataSources.forEach(function (ds) {
      ds.__current__ = 0;
    });
  }
  
  om.newDataSource = function(url,dts) {
    dts.url = url;
    dts.__current__ = 0;
    var afterLoad = function(vl) {
      __pj__.tree.updateAndShow();
    }
    dts.grabData(afterLoad);
    return url;
  }
  
  
  om.setDataSourceLink = function(url,dts) {
    var durl = dts.url;
    dts.link = "<a href='"+durl+"'>"+durl+"</a>";
    return url;
  }
  om.DataSource.setInputF('url',om,'newDataSource');
  om.DataSource.setOutputF('url',om,'setDataSourceLink');
  
  
  om.theDataUrl = function () { // returns it, if there is just one
    om.collectDataSources(om.root);
    var c = om.collectedDataSources;
    if (c.length === 1) {
      return c[0].url;
    }
  }
   
  // data should not be saved with items, at least most of the time (we assume it is never saved for now)
  // in the save process, a way is needed to remove data, and then restore it when the save is done
  om.stashedData = [];
  om.stashData = function () {
    om.stashedData = [];
    om.collectedDataSources.forEach(function (dt) {
      if (dt.__current__ && !dt.oneShot) {
        om.stashedData.push(dt.data);
        delete dt.data;
        dt.__current__ = 0;
      }
    });
  }
  
  om.restoreData = function () {
    var cl = om.collectedDataSources;
    var ln = cl.length;
    for (var i=0;i<ln;i++) {
      cl[i].data = om.stashedData[i];
      cl[i].__current__ = 1;
    }
    om.stashedData = [];
  }
 
 
  
  
})(prototypeJungle);