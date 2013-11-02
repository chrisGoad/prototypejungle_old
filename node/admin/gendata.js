 /*
  node admin/gendata.js
 
  a utility for generating test data

  
*/

var s3 = require('../s3.js');
var fs = require('fs');

// first random walks,eg; generated from iterators

function walk(o) {
  var sp = o.start;
  var bias = o.bias?o.bias:0;
  var stepX= o.step.x;
  var stepY = o.step.y;
  var count = o.count;
  var cx = sp.x;
  var cy = sp.y;
  var series = [[cx,cy]];
  var obias = bias + (-0.5 * stepY);
  var next = function () {
    var r = Math.random();
    var nx = cx + stepX;
    var ny = cy + obias + r * stepX;
    series.push([nx,ny]);
    cx = nx;
    cy = ny;
  }
  for (var i=0;i<count;i++) next();
  return series;
}

var o0 = {start:{x:10,y:50},step:{x:10,y:10},bias:0,count:50};

function nSeries (n,o) {
  var sa = []
  for (var i=0;i<n;i++) {
    var w  = walk(o);
    sa.push({caption:"Series"+i,data:w});
  }
  return {data:sa};
}

var series3 = nSeries(3,o0);

function saveData(path,dt) {
  var ctp = "application/javascript"
  console.log("saving data to",path);
  var vl = "callback("+JSON.stringify(dt)+")"
  s3.save(path,vl,ctp,"utf8",function (v) {
    console.log("DONE",v);
  },0);
}

saveData('sys/repo0/data/walk3_0.jsonp',series3);