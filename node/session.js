
var util = require('./util.js');
var crypto = require('crypto');
var timeout = 24 * 60 * 60;
var pjdb = require('./db.js').pjdb;
var page = require('./page.js');
var util = require('./util.js');
util.activateTag("session");

var deleteSessionsOlderThan =  30 * (24*60*60);

function genId() {
  return crypto.randomBytes(30).toString('hex');
}

exports.newSession = function(uname) { // uname is "twitter_screenname of persona_email, maybe others later
  var sid = genId();
  var tm = Math.floor(Date.now()/1000);
  pjdb.put("session_"+sid,{user:uname,startTime:tm,lastTime:tm},{valueEncoding:'json'},function (e,d) {
            util.log("session","new session",uname,sid);
            exports.deleteOld(deleteSessionsOlderThan);
  });
  return sid;
}

exports.delete = function(sid) {
  util.log("session","DELETING SESSION",sid);
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
     
      util.log("session","got sesssion elapsed time",etm);
      if (etm > timeout) {
        cba = "timedOut";
        util.log("session","TIMED OUT");
        exports.delete(sid);
      } else {
          pjdb.put("session_"+sid,{user:uname,startTime:stm,lastTime:tm},{valueEncoding:'json'});
      }
    }
    cb(cba);
  });
}

exports.check = function (inputs,cb) {
  sid = inputs.sessionId
  if (!sid) {
    cb("noSessionAtClient");
    return;
  }
  exports.getSession(sid,cb);
}

/* which is "new","old", or "all".
 * If which=new apply cbAction to each session which
 * has been active within timeInterval (in seconds) , and if which=old, to each
 * session which has not been active within timeInterval.
 */

exports.selectSessions = function (cbAction,cbDone,which,timeInterval) {
  var rrs = [];
  var tm = Math.floor(new Date().getTime()/1000);
  var rs = pjdb.createReadStream();
  rs.on('data', function (data) {
    var vl = data.value;
    if ((typeof(vl)==="string") && (vl.indexOf("startTime")>0)) {
      var jv = JSON.parse(vl);
      var ky = data.key;
      var st = parseInt(jv.startTime);
      var lt = jv.lastTime?parseInt(jv.lastTime):undefined;
      if (((which === "new") && (lt && ((tm-lt) < timeInterval)))||
          ((which === "old") && ((lt === undefined) || ((tm-lt) > timeInterval))) ||
          (which === "all")) {
        //rrs.push(jv);
        // times are given in fractions of days, for legibility
        var sessionDescription = [ky,jv.user,(tm - st)/(24*60*60),lt?(tm - lt)/(24*60*60):undefined];
        rrs.push(sessionDescription);
        if (cbAction) {
          cbAction(sessionDescription);
        }
      } 
    }
  })
  .on('error', function (err) {
    util.log("error",'LEVEL DB ERROR', err)
  })
  .on('close', function () {
    if (cbDone) cbDone(rrs);
  })
  .on('end', function () {
    if (cbDone) cbDone(rrs);
  });
}


exports.showSessions = function (which,timeInterval) {
  exports.selectSessions(function (s) {
      console.log(s);
    },null,
    which,timeInterval);
}

var numDeletions  = 0;
exports.deleteOld = function (timeInterval) {
  numDeletions = 0;
  exports.selectSessions(function (s) {
      pjdb.del(s[0]);
      numDeletions++;
    },function (rs) {
      util.log("session","Deleted "+numDeletions+" old sessions");
    },
    'old',timeInterval);
}
    
  
exports.deleteAll = function () {
  var rs = pjdb.createReadStream();
  rs.on('data', function (data) {
    pjdb.del(data.key);
  });
}

