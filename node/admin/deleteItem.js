/*


cd /mnt/ebs0/prototypejungledev/node;node admin/deleteItem.js  sys/repo2/lib/text_layout1

cd /mnt/ebs0/prototypejungledev/node;node admin/listHandle.js  sys

*/
var src = process.argv[2]; // should be core,dom,ui,inspect or rest (topbar,chooser,view,loginout,worker,bubbles)
console.log("src",src);
var pjutil = require('../util.js');

var s3 = require('../s3.js');
pjutil.activateTag("s3");

s3.deleteItem(src, function (e,d) {
    console.log("rs",e,d);
 });
