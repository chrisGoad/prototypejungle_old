
var util = require('./util.js');

var dyno = require('./dynamo.js');

var pjdb = require('./db.js').pjdb;

var page = require('./page.js');

var session = require('./session');

var querystring = require('querystring');

var user = require('./user');

var https = require('https');

exports.login = function (request,response,cob) {
  util.log("persona","setHandleHandler",cob);
  function onVerifyResponse(vres) {
    util.log("persona","BACK FROM PERSONA");
    var data = "";
    vres.setEncoding('utf8');
    vres.on("data",function (chunk) {data+=chunk;});
    vres.on("end",function () {
      var verified = JSON.parse(data);
      util.log("persona","FROM PERSONA ",verified);
      if (verified.status == "okay") { // verified!
        var email = verified.email;
        util.log("persona","PERSONA USER ",email,"VERIFIED");
        var uname = "persona_T2_"+email;
        user.signIn(response,uname,true);   
      } else {
        page.servePage(response,"bad.html");
      }
    });
  }
  assertion = cob.assertion;
  util.log("persona","assertion ",assertion);
  audience = 'http://prototypejungle.org:8000'; // todo use a var dev vs non-dev
  util.log("persona","audience",audience);
  data = {'assertion':assertion,'audience':audience};
  util.log("persona","DATA",data);
  var datastring = querystring.stringify(data);
  var rq = https.request({'host':'verifier.login.persona.org',
                          'path':'/verify',
                          method:'POST'
                         },onVerifyResponse);
  rq.setHeader('Content-Type','application/x-www-form-urlencoded');
  rq.setHeader('Content-Length',datastring.length);
  util.log("persona","WRITING REQUEST");
  rq.write(datastring);
  rq.end();
}
        
                   