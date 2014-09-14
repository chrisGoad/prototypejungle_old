

var util = require('./util.js');
var dyndb = require('./dynamo.js').db;
var pjdb = require('./db.js').pjdb;
var page = require('./page.js');
var session = require('./session');
var s3 = require('./s3');
util.activateTag("user");

var setProperties = function (dest,source,props,propTypes) {
  props.forEach(function (prop) {
    var propName = prop[0];
    var propType = prop[1];
    var value = source[propName];
    if (value) {
      dest[propName] = value[propType];
    }
  });
}

var fromDyn = function (u) {
  var i = u.Item;
  if (i) {
    var rs = {name:i.name.S}
    setProperties(rs,i,[['handle','S'],['count','N'],['maxCount'],['createTime','N']]);
    return rs;
  }
  return undefined;
}

exports.get = function(name,cb) {
  dyndb.getItem({TableName:'pj_user',Key:{'name':{'S':name}}},function (e,d) {
    var u = fromDyn(d);
    if (u) util.log("user","got user ",u.name);
    if (e) util.log("error","in user.get",name);
    if (cb) cb(e,u);
  });
}


exports.getCount = function(cb) {
  util.log("count");
  dyndb.getItem({TableName:'pj_count',Key:{'name':{'S':'user'}}},function (e,d) {
    var u = fromDyn(d);
    var count = parseInt(u.count);
    var maxCount = parseInt(u.maxCount);
    util.log("user","gotCount ",count,maxCount,JSON.stringify(u));
    if (cb) cb(e,{count:count,maxCount:maxCount});
  });
}

// when the user count is exceeded, prototypejungle/js/userlimit.js is overwritten with
// prototypeJungle.userLimitExceeded = 1;
// this in turn has its effect on the signup page.

var declareUserLimitExceeded =  function (cb) {
  var vl = '\nprototypeJungle.userLimitExceeded = 1;\n';
  s3.save('js/userlimit.js',vl,{contentType:"application/javascript",encoding:"utf8",maxAge:0,dontCount:1},cb);
}

// when the count === maxCount-1,  this one more user is allowed, but then max users is declared exceeded
exports.newUser = function(name,cb) {
  util.log("user","get Item");
  var tm = Math.floor(Date.now()/1000)+'';
  exports.getCount(function (e,counts) {
    var count = counts.count;
    var maxCount = counts.maxCount;
    if (count >=  maxCount) {
      util.log("user","User max already exceeded");
      cb("maxUsersExceeded");
      return;
    }
    dyndb.putItem(
      {TableName:'pj_user',Item:{'name':{'S':name},'create_time':{'N':tm}}},function (e,d) {
        var ncount = (count + 1) + '';
        util.log("user","putUser ",e,d);
        dyndb.putItem({TableName:'pj_count',Item:{'name':{'S':'user'},
                      'count':{'N':ncount},'maxCount':{'N':maxCount}}},function (e,d) {
          util.log("user","putCount",ncount);
          var alldone = function () {
            if (cb) {
              cb(e,d);
            }
          }
          if ((count + 1) >= maxCount) {
            util.log("user","USER LIMIT EXCEEDED");

            declareUserLimitExceeded(alldone);
          } else {
            alldone();
          }
        });
    });
  });
}


exports.signIn = function (res,uname,forApiCall) {
  var ses = session.newSession(uname);
  exports.get(uname,function (e,d) {
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
        util.log("user","NEW USER ",uname,"error",e);
        if (forApiCall) {
          if (e) {
            page.failResponse(res,"maxUsersExceeded");
          } else {
            page.okResponse(res,{userName:uname,sessionId:ses});
          }
        } else {
          page.serveSession(res,ses,uname,null,e);
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

exports.setHandle = function (user,handle,cb) {
  var uname = user.name;
  var tm = user.create_time;
  if (!tm) {
    tm = Math.floor(Date.now()/1000)+'';
  }
  dyndb.putItem(
    {TableName:'pj_user',Item:{'name':{'S':uname},'handle':{'S':handle},'create_time':{'N':tm}}},function (e,d) {
      util.log("user","putHandle in pj_user ",uname,handle,e,d);
      dyndb.putItem(
        {TableName:'pj_handle',Item:{'handle':{'S':handle},'user':{'S':uname}}},function (e,d) {
          util.log("user","putHandle in pj_handle ",handle,e,d);
          s3.listHandle(handle,cb);
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
      exports.get(uname,function (e,usr) {
        var oldh = usr.handle;
        util.log("USERRRR",usr.create_time);
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
          exports.setHandle(usr,newh,function (d) {
             page.okResponse(response);
          });
        });
      });
    }
  });
}
    
    
    