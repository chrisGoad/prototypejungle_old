/*
For use from shell; usage: Spews out the contents of the  levelup database

cd /mnt/ebs0/prototypejungledev/node
node admin/showSessions.js

or

cd /mnt/ebs0/prototypejungle
node admin/showSessions.js


*/
var timeInterval = 1;//26 * (24*60*60);
var session = require('../session.js');
session.showSessions('old',timeInterval);

//pjdb.spew();