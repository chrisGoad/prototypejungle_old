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

console.log("SYSLIST");

var a0 = process.argv[2];

if ((a0 === "p") ||(a0 ==="d")) {
  var fln = "/mnt/ebs0/prototypejungle"+((a0==="p")?"":"dev")+ "/www/syslist.json"
  s3.list(["sys/"],null,['.js'],function (e,keys) {
    console.log("listed keys",keys);
    var rs = JSON.stringify(keys);
    var ln = keys.length;
    fs.writeFileSync(fln,rs,{flag:'w'});
    console.log("WROTE ",ln," KEYS TO ",fln);

  });
} else {
  console.log("Usage: 'node listpj p' or 'node listpj d', for the production or dev environtments, respectively")
}
