/*
For use from shell; usage: Spews out the contents of the  levelup database

cd /mnt/ebs0/prototypejungledev/node
node admin/showSessions.js all

or

cd /mnt/ebs0/prototypejungle
node admin/showSessions.js all


*/

var a0 = process.argv[2];

console.log("A0",a0);
var pjdb = require('../db.js');
pjdb.selectSessions(function (s) {console.log("session",s)},
  function (rs) {
  console.log("RS",rs);
},a0)
//pjdb.spew();
