/*
For use from shell; usage: Spews out the contents of the  levelup database

cd /mnt/ebs0/protototypejungledev/node
node admin/spew.js
*/

var pjdb = require('../db.js');
pjdb.spew();
