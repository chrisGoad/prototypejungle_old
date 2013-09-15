 /* usage:
  node listpj p
  or
  node listpj d
  
  for production or dev environments, respectively

  Saves the pj list in the json file pjlist.json, at web root
*/

var s3 = require('./s3.js');
var fs = require('fs');

console.log("PJLIST");

var a0 = process.argv[2];

if ((a0 == "p") ||(a0 =="d")) {
  var fln = "/mnt/ebs0/prototypejungle"+((a0=="p")?"":"dev")+ "/www/pjlist.json"
  s3.list(["pj/"],null,['.js'],function (e,keys) {
    console.log("listed keys",keys);
    var rs = JSON.stringify(keys);
    var ln = keys.length;
    fs.writeFileSync(fln,rs,{flag:'w'});
    console.log("WROTE ",ln," KEYS TO ",fln);

  });
} else {
  console.log("Usage: 'node listpj p' or 'node listpj d', for the production or dev environtments, respectively")
}
