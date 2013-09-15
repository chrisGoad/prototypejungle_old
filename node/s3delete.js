 
// eg node tests.js pj/variant/ws/TwoR/
var s3 = require('./s3.js');
var util = require('./util.js');

util.activeTags.push('test');
console.log("TEST");

var a0 = process.argv[2];
console.log("ARGVv",a0);

if (a0) {
  s3.deleteFiles(a0,undefined,undefined,function (e,keys) {
    console.log("listed keys",keys);
  });
}
