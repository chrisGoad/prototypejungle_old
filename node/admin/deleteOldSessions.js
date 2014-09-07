/*
For use from shell; usage: Spews out the contents of the  levelup database

cd /mnt/ebs0/prototypejungledev/node
node admin/deleteOldSessions.js

or

cd /mnt/ebs0/prototypejungle
node admin/deleteOldSessions.js


*/
var timeInterval = 26 * (24*60*60);
var session = require('../session.js');
session.deleteOld(timeInterval);
