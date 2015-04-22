/*
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1 backup/sys/repo1_pre_clean_4_10
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/lib/text_layout  sys/repo2/lib/text_layout
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/lib/color_utils  sys/repo2/lib/cplor_utils
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/lib/ref4debug  sys/repo2/lib/ref4debug
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/chart/marksPart/Bar1  sys/repo2/chart/marksPart/Bar1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/chart/marksPart/Scatter1  sys/repo2/chart/marksPart/Scatter1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/chart/marksPart/Line1  sys/repo2/chart/marksPart/Line1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/chart/component/Labels1  sys/repo2/chart/component/Labels1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/chart/component/Axis1  sys/repo2/chart/component/Axis1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/chart/component/Legend2  sys/repo2/chart/component/Legend2
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/chart/Bar5  sys/repo2/chart/Bar1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/chart/Column1  sys/repo2/chart/Column1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/chart/Scatter1  sys/repo2/chart/Scatter1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo1/chart/Line1 sys/repo2/chart/Line1

cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo2/chart/Bar1  sys/repo1/chart/Bar1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo2/lib/text_layout  sys/repo1/lib/text_layout
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo2/lib/color_utils  sys/repo1/lib/cplor_utils
cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo2/lib/ref4debug  sys/repo1/lib/ref4debug

cd /mnt/ebs0/prototypejungledev/node;node admin/copyTree.js  sys/repo2/chart/component/Legend2  sys/repo1/chart/component/Legend2

cd /mnt/ebs0/prototypejungledev/node;node admin/listHandle.js  sys

*/
var src = process.argv[2]; // should be core,dom,ui,inspect or rest (topbar,chooser,view,loginout,worker,bubbles)
var dst = process.argv[3];
console.log("src",src,"dst",dst);

var s3 = require('../s3.js');

s3.copyTree(src,dst, function (e,d) {
    console.log("rs",e,d);
  });
