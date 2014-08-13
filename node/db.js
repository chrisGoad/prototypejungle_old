var util = require('./util.js');
// leveldb is used to store sessions

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

exports.selectSessions = function (cbAction,cbDone,which) {
  var rrs = [];
  var tm = Math.floor(new Date().getTime()/1000);
  var rs = db.createReadStream();
  var tmo = 24 * 60 * 60;
  rs.on('data', function (data) {
    var vl = data.value;
    if ((typeof(vl)==="string") && (vl.indexOf("startTime")>0)) {
      var jv = JSON.parse(vl);
      var ky = data.key;
      var st = parseInt(jv.startTime);
      var lt = jv.lastTime?parseInt(jv.lastTime):undefined;
      if (((which === "new") && (lt && ((tm-lt) < tmo*10)))||
          ((which === "old") && ((lt === undefined) || ((tm-lt) > tmo*10))) ||
          (which === "all")) {
        //rrs.push(jv);
        var sd = [ky,jv.user,(tm - st)/(24*60*60),lt?(tm - lt)/(24*60*60):undefined];
        rrs.push(sd);
        if (cbAction) {
          cbAction(sd);
        }
      } 
    }
  })
  .on('error', function (err) {
    console.log("level",'Oh my!', err)
  })
  .on('close', function () {
    console.log("level",'Stream closed');
    cbDone(rrs);
  })
  .on('end', function () {
    console.log("level",'Stream closed');
    cbDone(rrs);
  });
}




exports.deleteOld = function () {
  exports.selectSessions(function (s) {
      console.log("deleting ",s);
      db.del(s[0]);
    },function (rs) {
      console.log("DONE DELETING");
    },
    'old');
}
    
  
exports.deleteAll = function () {
  var rs = db.createReadStream();
  rs.on('data', function (data) {
    console.log("level","deleting ",data.key);
    db.del(data.key);
  })
}