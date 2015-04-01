/*
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1 backup/sys/repo1_3_30

*/
var src = process.argv[2]; // should be core,dom,ui,inspect or rest (topbar,chooser,view,loginout,worker,bubbles)
var dst = process.argv[3];
console.log("src",src,"dst",dst);

var s3 = require('../s3.js');

s3.copyTree(src,dst, function (e,d) {
    console.log("rs",e,d);
  });
