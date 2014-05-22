 
/*
 Validated
cd /mnt/ebs0/prototypejungledev/node;node admin/backupRepo.js 

*/
var s3 = require('../s3.js');
var util = require('../util.js');

util.activeTags.push('s3');
console.log("TEST");

var src = "sys/repo0"
var dst = "backup/preRename/repo0"

  s3.copyTree(src,dst,function (e,d) {
    console.log("DONE",e,d);
  },true);//true tolerate errors


 



