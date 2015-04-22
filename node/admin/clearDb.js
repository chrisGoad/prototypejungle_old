/*
A utility for showing the sessions in the leveldb database

cd /mnt/ebs0/prototypejungledev/node;node admin/clearDb.js

or

cd /mnt/ebs0/prototypejungle/node;node admin/clearDb.js


*/
var timeInterval = 1;//26 * (24*60*60);
var db = require('../db.js');
db.clear();
//pjdb.spew();

