/*
cd /mnt/ebs0/prototypejungledev/node;node admin/newUserLimit.js


*/



var s3 = require('../s3');

var vl = '\nprototypeJungle.userLimitExceeded = 0;\n';
s3.save('js/userlimit.js',vl,{contentType:"application/javascript",encoding:"utf8",maxAge:0,dontCount:1},
  function (e,d) {console.log("DONE",e);});
