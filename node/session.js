
var util = require('./util.js');
var pjkey = require('./keys/pjkey.js');
var crypto = require('crypto');
var timeout = 24 * 60 * 60;
var pjdb = require('./db.js').pjdb;
var util = require('./util.js');
util.activateTag("session");
// simplified session handling for the one user sys, and a session id generated from time.
function sessionId(tm) {// n is divergence in time unit
  var ky = pjkey.pjkey;
  var md5 = crypto.createHash('md5');
  md5.update(ky+tm);
  return md5.digest('hex');
}

  
exports.getSession = function (isid,cb) {
  //cb({user:'sys'});
  //console.log('pjkey',pjkey.pjkey);
  //cb({user:'persona_cagoad@gmail.com'}); 
  //return;
  var rs = 'noSession';
  var tm = Math.floor(new Date().getTime()/1000000);
  console.log('getSession timeee',tm,"SID",isid);
  [0,-1,1].some(function (d) {
    var sid =sessionId(tm+d);
    if (isid === sid) {
      console.log('MATCH at ',d,'with',sid);
      rs = {user:'persona_cagoad@gmail.com'};
      return 1;
    } else {
      console.log("MISMATCH AT ",d,'with',sid);
    }
    return 0;
  });
  cb(rs);
}

exports.check = function (inputs,cb) {
  sid = inputs.sessionId
  if (!sid) {
    cb("noSessionAtClient");
    return;
  }
  exports.getSession(sid,cb);
}

/*  
var deleteSessionsOlderThan =  5 * (24*60*60);

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
*/

/* which is "new","old", or "all".
 * If which=new apply cbAction to each session which
 * has been active within timeInterval (in seconds) , and if which=old, to each
 * session which has not been active within timeInterval.
 */
/*
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
*/
