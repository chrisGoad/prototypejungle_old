/*
For use from shell; usage: Spews out the contents of the  levelup database

cd /mnt/ebs0/prototypejungledev/node
node admin/spew.js

or

cd /mnt/ebs0/prototypejungle
node admin/spew.js

*/


var pjdb = require('../db.js');
pjdb.activeSessions(function (rs) {
  console.log(rs);
})
//pjdb.spew();
