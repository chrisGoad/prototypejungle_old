
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
  
})(prototypeJungle);