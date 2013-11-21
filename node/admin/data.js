
/*
Utility for copying trees in at s3



To run this script:
cd /mnt/ebs0/prototypejungledev/node
node admin/data.js
(eg 
or 
node admin/data.js sys/repo0/data/state_coords.csv sys/repo0/data/state_coords.jso
cd /mnt/ebs0/prototypejungle/node
*/
var util = require('../util.js');
util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');

var a0 = process.argv[2];
var a1 = process.argv[3];
console.log("ARGVv",a0,a1);

coordf = "/sys/repo0/data/state_coords.csv"
tlaf = "/sys/repo0/data/state_tla.csv"
popf = "sys/repo0/data/state_population.csv"
dstf = "sys/repo0/data/state_pop_coords.json"
function numify(x) { // this is crude; turns "1.a" into 1
  if (Array.isArray(x)) {
    return x.map(numify);
  } else if (typeof x === "string") {
    var n = parseFloat(x);
    if (isNaN(n)) return x.replace("\r","");
    return n; 
  }
  
}

function csvToArray(src,isep) {
  var sep = sep?sep:",";
  var sp = src.split("\n");
  var ln = sp.length;
  rs = {};
  rs.fields = sp[0].split(sep);
  var dt = [];
  for (var i=1;i<ln;i++) {
    var cline = sp[i];
    //console.log("LINE ",i,cline);
    dt.push(numify(cline.split(sep)));
  }
  rs.data = dt;
  return rs;
}

// turn into a table
function csvToObject(src,isep,idx) {
  var sep = sep?sep:",";
  var sp = src.split("\n");
  var ln = sp.length;
  rs = {};
  rs.fields = sp[0].split(sep);
  var dt = {};
  
  for (var i=1;i<ln;i++) {
    var cline = sp[i];
    //console.log("LINE ",i,cline);
    var a = numify(cline.split(sep));
    var ifld = a[idx];
    dt[ifld] = a;
  }
  rs.data = dt;
  return rs;
}

function s3job() {
  var rs = [];
  s3.getObject(tlaf,function (e,d) {
    tlat = csvToObject(d,",",0).data;
    console.log(tlat);
    s3.getObject(coordf,function (e,d) {
      var coords = csvToObject(d,",",0).data;
      console.log(coords);
      s3.getObject(popf,function (e,d) {
        var pops = csvToObject(d,",",0).data;
        console.log("POPS",pops);
        console.log("JOIN");
        // now join up
        var rsa = [];
        for (var fulln in tlat) {
          var tla = tlat[fulln][1];
          var crds = coords[tla];
          var pop = pops[fulln];
          console.log("full ",fulln,"crds",crds,"pop",pop);
          var rsl = [pop[1],crds[1],crds[2],tla,fulln];
          console.log(rsl);
          rsa.push(rsl);
            //exports.save = function (path,value,contentType,encoding,cb,dontCount) {
        }
        var frs = {'data':rsa};
        var frsj = "callback("+JSON.stringify(frs)+")";
        console.log(frsj,dstf);
        s3.save(dstf,frsj,"application/javascript","utf8",function (rs) {console.log("DONE ",rs);},1);
      
      });
      
    });
  });
}
s3job();

function s3csvToJson(src,dst) {
  s3.getObject(a0,function (e,d) {
    if (e) {
      console.log("ERROR ",e);
    } else {
      var sto = csvToObject(d,",",0);
      console.log(sto);
       console.log(sto.data['Wyoming']);
     console.log(sto.data['West Virginia']);
    }
  });
}

//s3csvToArray(sc);
//s3csvToJson(tlas);


