 /* A listing of the sys s3 directory is stashed in a file, for faster access. See chooser2.js
  * usage
  * 
  node admin/listsys.js p
  or
  node admin/listsys.js d
  
  for production or dev environments, respectively

*/

var s3 = require('../s3.js');
var fs = require('fs');
s3.useNewBucket();
console.log("SYSLIST");

var a0 = process.argv[2];


  function toS3(dt,cb) {
    var path = dt[0];
    fpth = pjdir + path;
    var ctp = dt[1];
    var vl = fs.readFileSync(fpth);
    console.log("jsToS3 from ",fpth,"to",path);
    s3.save(path,vl,ctp,"utf8",cb,true);
  }
  
if ((a0 === "p") ||(a0 ==="d")) {
  var fln = "/mnt/ebs0/prototypejungle"+((a0==="p")?"":"dev")+ "/www/syslist.json"
  s3.list(["sys/"],null,['.js'],function (e,keys) {
    console.log("listed keys",keys);
    var rs = JSON.stringify(keys);
    var ln = keys.length;
    fs.writeFileSync(fln,rs,{flag:'w'});
    console.log("WROTE ",ln," KEYS TO ",fln);
    s3.save("syslist.json",rs,"application/javascript","utf8",function () {
      console.log("Wrote to S3");},true);

  });
} else {
  console.log("Usage: 'node listpj p' or 'node listpj d', for the production or dev environtments, respectively")
}
