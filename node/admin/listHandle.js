/*

cd /mnt/ebs0/prototypejungledev/node;node admin/listHandle.js  sys
*/
var handle = process.argv[2]; // should be core,dom,ui,inspect or rest (topbar,chooser,view,loginout,worker,bubbles)
console.log("Handle",handle);

var s3 = require('../s3.js');

s3.listHandle(handle, function (e,d) {
    console.log("Listed handle for ",handle,e,d);
  });
