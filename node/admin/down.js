/*
cd /mnt/ebs0/prototypejungledev/node;node admin/down.js d

Declares the storage system / server API down
*/



var s3 = require('../s3');

var vl = '\nprototypeJungle.systemDown = 1;\n';
s3.save('js/down.js',vl,{contentType:"application/javascript",encoding:"utf8",maxAge:0,dontCount:1});

