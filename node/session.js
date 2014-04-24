
var util = require('./util.js');
var crypto = require('crypto');
var timeout = 60;//24 * 60 * 60;
var pjdb = require('./db.js').pjdb;
var page = require('./page.js');
var util = require('./util.js');
//util.activateTagForDev("session");
util.activateTagForDev("newSession");
util.activateTag("newSession");

function genId() {
  return crypto.randomBytes(30).toString('hex');
}

exports.newSession = function(uname) { // uname is "twitter_screenname of persona_email, maybe others later
  var sid = genId();
  var tm = Math.floor(Date.now()/1000);
  pjdb.put("session_"+sid,{user:uname,startTime:tm,lastTime:tm},{valueEncoding:'json'});
  util.log("newSession",uname,sid);
  return sid;
}

exports.delete = function(sid) {
  util.log("newSession","DELETING SESSION",sid);
  pjdb.del("session_"+sid);
}

exports.getSession = function(sid,cb) {
  pjdb.get("session_"+sid,{valueEncoding:'json'},function (e,d) {
    if (e) {
      var cba = "noSession";
    } else {
      cba = d;
      var tm = Math.floor(Date.now()/1000);
      var stm = d.startTime;
      var ltm  = d.lastTime;
      var uname = d.user;
      var etm = tm - ltm;
     
      util.log("session","GOTSESSION",cba,stm,ltm,etm);
      if (etm > timeout) {
        cba = "timedOut";
        exports.delete(sid);
      } else {
          pjdb.put("session_"+sid,{user:uname,startTime:stm,lastTime:tm},{valueEncoding:'json'});
      }
    }
    cb(cba);
  });
}

exports.check = function (cob,cb) {
  sid = cob.sessionId
  if (!sid) {
    cb("noSessionAtClient");
    return;
  }
  exports.getSession(sid,cb);
}

