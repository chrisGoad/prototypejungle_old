 
/*

cd /mnt/ebs0/prototypejungledev/node;node admin/tests.js

node tests.js pj/variant/ws/TwoR/
node tests.js pj/repo0/pix/variants/TwoArcs/v3
node admin/tests.js sys/repo0/chart/Linear/source.js
node admin/tests.js http://google.com
node admin/tests.js sys/repo0/data/linedata0.json
node admin/tests.js sys/repo0/data/linedata0.json
node admin/tests.js sys/repo0/examples

*/
//var pjdb = require('./db.js').pjdb;
var dyno = require('./dynamo.js');
var user = require('./user.js');
var util = require('./util.js');
console.log("TEST");


if (1) {
  user.getCount(function (e,d) {
    console.log('COUNT ',d);
  });
}
