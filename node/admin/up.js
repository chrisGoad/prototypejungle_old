/*
cd /mnt/ebs0/prototypejungledev/node;node admin/bumpUserLimit.js d


The major parts of the system are assembled into the single files: pjcs, pjdom and pjui
*/



var s3 = require('../s3');

var vl = '\nprototypeJungle.systemDown = 0;\n';
s3.save('js/down.js',vl,{contentType:"application/javascript",encoding:"utf8",maxAge:0,dontCount:1});

