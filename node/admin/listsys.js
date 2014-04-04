 /* A listing of the sys s3 directory is stashed in a file, for faster access. See chooser2.js
  * usage
  * 
cd /mnt/ebs0/prototypejungledev/node;node admin/listsys.js test

*/

var a0 = process.argv[2];
console.log("A0",a0);
var s3 = require('../s3.js');
s3.useNewBucket();
console.log("SYSLIST");


  s3.listHandle(a0,function (e,d) {
      console.log("Listed the handle",e,d);});

