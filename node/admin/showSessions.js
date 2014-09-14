/*
A utility for showing the sessions in the leveldb database

cd /mnt/ebs0/prototypejungledev/node
node admin/showSessions.js

or

cd /mnt/ebs0/prototypejungle/node
node admin/showSessions.js


*/
var timeInterval = 1;//26 * (24*60*60);
var session = require('../session.js');
session.showSessions('old',timeInterval);

//pjdb.spew();
