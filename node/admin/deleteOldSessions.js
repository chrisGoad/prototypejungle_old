/*
For use from shell; usage: Spews out the contents of the  levelup database

cd /mnt/ebs0/prototypejungledev/node
node admin/deleteOldSessions.js 

or

cd /mnt/ebs0/prototypejungle
node admin/spew.js all


*/

var a0 = process.argv[2];

console.log("A0",a0);
var pjdb = require('../db.js');
pjdb.deleteOld();
//pjdb.spew();
