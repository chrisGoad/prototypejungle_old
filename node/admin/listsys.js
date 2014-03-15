 /* A listing of the sys s3 directory is stashed in a file, for faster access. See chooser2.js
  * usage
  * 
  cd /mnt/ebs0/prototypejungledev/node;node admin/listsys.js 

*/

var s3 = require('../s3.js');
s3.useNewBucket();
console.log("SYSLIST");


  s3.listHandle("sys",function (e) {
      console.log("Wrote to S3",e);});

