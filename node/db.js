var util = require('./util.js');

var levelup = require('level');
if (!exports.pjdb) {
  util.log("level",'new db');
  var db = levelup('./pjdb');
  exports.pjdb = db;
} else {
  util.log("level","exising db");
}

exports.spew = function () {
  var rs = db.createReadStream();
  rs.on('data', function (data) {
    console.log("level",data.key, '=', data.value)
  })
  .on('error', function (err) {
    console.log("level",'Oh my!', err)
  })
  .on('close', function () {
    console.log("level",'Stream closed')
  })
  .on('end', function () {
    console.log("level",'Stream closed')
  })
}

exports.activeSessions = function (cb) {
  var rrs = [];
  var tm = Math.floor(new Date().getTime()/1000);
  var rs = db.createReadStream();
  var tmo = 24 * 60 * 60;
  rs.on('data', function (data) {
    var vl = data.value;
    if ((typeof(vl)==="string") && (vl.indexOf("startTime")>0)) {
      var jv = JSON.parse(vl);
      var st = parseInt(jv.startTime);
      if ((tm-st) < tmo) {
        rrs.push([jv.user,tm - st,st]);
      }
    }
    //console.log("level",data.key, '=', data.value)
  })
  .on('error', function (err) {
    console.log("level",'Oh my!', err)
  })
  .on('close', function () {
    console.log("level",'Stream closed');
    cb(rrs);
  })
  .on('end', function () {
    console.log("level",'Stream closed');
    cb(rrs);
  });
}

exports.deleteAll = function () {
  var rs = db.createReadStream();
  rs.on('data', function (data) {
    console.log("level","deleting ",data.key);
    db.del(data.key);
  })
}