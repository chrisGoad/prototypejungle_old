/*
For use from shell; usage:

cd /mnt/ebs0/protototypejungledev/node

node spew.js
*/

var pjdb = require('./db.js');
pjdb.deleteAll();
