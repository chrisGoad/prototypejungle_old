/*
 * repo2 is the development repo. This copies items from repo2 to repo1
 * 
cd /mnt/ebs0/prototypejungledev/node;node admin/item2production.js  lib/text_layout 
cd /mnt/ebs0/prototypejungledev/node;node admin/item2production.js  chart/component/Axis1
cd /mnt/ebs0/prototypejungledev/node;node admin/item2production.js  chart/component/Label1
cd /mnt/ebs0/prototypejungledev/node;node admin/item2production.js  chart/component/Legend2
cd /mnt/ebs0/prototypejungledev/node;node admin/item2production.js  chart/Bar1
cd /mnt/ebs0/prototypejungledev/node;node admin/item2production.js  chart/Bar1
cd /mnt/ebs0/prototypejungledev/node;node admin/item2production.js  chart/marksPart/Bar1

cd /mnt/ebs0/prototypejungledev/node;node admin/listHandle.js  sys

*/
var isrc = process.argv[2]; // should be core,dom,ui,inspect or rest (topbar,chooser,view,loginout,worker,bubbles)
var src = "sys/repo2/"+isrc;
var dst = "sys/repo1/"+isrc;
console.log("src",src,"dst",dst);

var s3 = require('../s3.js');

s3.copyTree(src,dst, function (e,d) {
    console.log("rs",e,d);
 });
