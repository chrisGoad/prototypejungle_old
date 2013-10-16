

var util = require('./util.js');
var dyndb = require('./dynamo.js').db;
var pjdb = require('./db.js').pjdb;
var page = require('./page.js');
var session = require('./session');
util.activeTags.push('user');


var fromDyn = function (u) {
  var i = u.Item;
  if (i) {
    var rs = {name:i.name.S}
    var th = i.handle;
    if (th) {
      rs.handle = th.S;
    }
    return rs;
  }
  return undefined;
}

exports.get = function(name,cb) {
  util.log("user","get user",name);
  dyndb.getItem({TableName:'pj_user',Key:{'name':{'S':name}}},function (e,d) {
    var u = fromDyn(d);
    util.log("user","gotUser ",e,u);
    if (cb) cb(u);
  });
}

exports.newUser = function(name,cb) {
  util.log("user","get Item");
  dyndb.putItem(
      {TableName:'pj_user',Item:{'name':{'S':name}}},function (e,d) {
    util.log("user","putUser ",e,d);
    if (cb) cb(d);
  });
}


exports.signIn = function (res,uname,forApiCall) {
  var ses = session.newSession(uname);
  exports.get(uname,function (d) {
    util.log("user","GetUser",d);
    if (d) {
      util.log("user","FOUND USERR ",uname);
      // but maybe no handle yet
      var th = d.handle;
      var ch = th?th:"";
      if (forApiCall) {
        page.okResponse(res,{userName:uname,sessionId:ses,handle:ch});
      } else {
        page.serveSession(res,ses,uname,ch);
      }
    } else {
      exports.newUser(uname,function (e,d) {
        util.log("user","NEW USER ",uname);
        if (forApiCall) {
          page.okResponse(res,{userName:uname,sessionId:ses});
        } else {
          page.serveSession(res,ses,uname);
        }
      });
    }
  })
}


exports.logoutHandler = function (request,response,cob) {
  util.log("user","logout",cob.sessionId);
  var sid = cob.sessionId;
  if (sid) {
    session.delete(sid);
  }
  page.okResponse(response);
}
  

exports.getHandle = function (uname,cb) {
  exports.get(uname,function (e,d) {
    util.log("user","GetHandle",d);
    if (d && (d.Item) && (d.Item.handle)) {
      cb(d.Item.handle.S);
    } else {
      cb(undefined);
    }
  });
}


exports.getUserFromHandle = function (handle,cb) {
  dyndb.getItem({TableName:'pj_handle',Key:{'handle':{'S':handle}}},function (e,d) {
    util.log("user","getUserFromHandle ",e,d);
    if (d && (d.Item) && (d.Item.user)) {
      cb(d.Item.user.S);
    } else {
      cb(undefined);
    }
  });
}

exports.setHandle = function (uname,handle,cb) {
  dyndb.putItem(
    {TableName:'pj_user',Item:{'name':{'S':uname},'handle':{'S':handle}}},function (e,d) {
      util.log("user","putHandle in pj_user ",uname,handle,e,d);
      dyndb.putItem(
        {TableName:'pj_handle',Item:{'handle':{'S':handle},'user':{'S':uname}}},function (e,d) {
          util.log("user","putHandle in pj_handle ",handle,e,d);
          if (cb) cb(d);
        });
      });
}

exports.setHandleHandler = function (request,response,cob) {
  util.log("user","setHandleHandler",cob);
  var c = session.check(cob,function (sval) {
    if (typeof sval==="string") {
     page.failResponse(response,c);
    } else {
      var uname = sval.user;
      util.log("user","LOOKED UP USER ",uname,"from session sval",sval,"type",typeof(sval));
      var newh = cob.handle;
      exports.get(uname,function (usr) {
        var oldh = usr.handle;
        util.log("user","OLD HANDLE ",oldh);
        if (oldh === newh) { // the user already had this handle
          util.log("user","HANDLE UNCHANGED",newh);
          page.okResponse(response,"noChange");
          return;
        }
        exports.getUserFromHandle(newh,function (hu) {
          util.log("user","getUserFromHandle",hu);
          var ck = util.checkName(newh);
          if (hu) { //newh is in use
            page.failResponse(response,"taken");
            return;
          }
          exports.setHandle(uname,newh,function (d) {
             page.okResponse(response);
          });
        });
      });
    }
  });
}
    
    
    