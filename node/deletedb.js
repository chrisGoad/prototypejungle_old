/*
For use from shell; usage:

cd /mnt/ebs0/protototypejungledev/node

node deletedb.js
*/

var pjdb = require('./db.js');
pjdb.deleteAll();
