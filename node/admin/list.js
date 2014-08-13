 /* A utility for listing s3 directories 

cd /mnt/ebs0/prototypejungledev/node;node admin/list.js sys/repo0/

*/

var a0 = process.argv[2];
console.log("A0",a0);
var s3 = require('../s3.js');
s3.useNewBucket();
console.log("SYSLIST");

s3.list([a0],null,null,function (e,d) {
    console.log("RESULT:",d);
});
 
