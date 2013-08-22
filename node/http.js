  /**
     * This is our Node.JS code, running server-side.
     * from http://arguments.callee.info/2010/04/20/running-apache-and-node-js-together/
     */
 

var pjdb = require('./db.js').pjdb;
var session = require('./session');

var url = require('url');
var fs = require('fs');
var send = require('send');
var util = require('./util');
var page = require('./page.js');
var user = require('./user.js');
var s3 = require('./s3');

var pages = page.pages;
var twitter = require('./twitter.js');
var persona = require('./persona.js');


var port = util.isDev?8000:80;

// not in use at the moment
  var allowCrossDomain = function(res) {
    util.log("http",'allowingCrossDomain');
    res.setHeader('Access-Control-Allow-Origin', 'http://prototypejungle.org');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');
	  
   
};

var sys = require('sys');
var http = require('http');

   
    
    var endsIn = function (s,p) {
    var ln = s.length;
    var pln = p.length;
    if (pln > ln) return false;
    var es = s.substr(ln-pln);
    return es == p;
    }
    
    
    // This installation supports other hosts at another port using another webserver
    var otherHosts = {"imagediver.org":8080,"mapbureau.com":8080};
  
    var otherHostRedirect = function (host,url) {  // only works correctly for GETs
      for (var h in otherHosts) {
        if (host.indexOf(h)==0) {
          var port = otherHosts[h];
          return "http://"+h+":"+port+url;
        
        }
      }
    }
    
    var server = http.createServer(function(request, response) {
        var m = request.method;
        var iurl = request.url;
        var purl = url.parse(iurl,true);
        util.log("web",JSON.stringify(iurl));
        var pn = purl.pathname;
        var rhost = request.headers.host;
        util.log("headers",JSON.stringify(request.headers));
        //Deal with other hostnames
        var rdir = otherHostRedirect(rhost,iurl);
        if (rdir) {
          util.log("web","Redirecting to another web server",rdir);
          response.writeHead(302,{'Location':rdir})
          response.end();
          return;
        }
        util.log("web","FROM",rhost,"METHOD=",request.method,"URL",request.url,'PATHNAME',pn,'QUERY',purl.query);
        var cPage = pages[pn];
        
        var isJsOrHtml = endsIn(pn,".js") || endsIn(pn,".html");
        var sendError =  function (err) {
          page.servePage(response,"missing.html");
          //response.statusCode = err.status || 500;
          response .end(err.message);
        }
        if (m=="GET") {
          if (isJsOrHtml || (!cPage) || typeof cPage == "string") { //static page
            var pnts = isJsOrHtml?pn:(cPage=="html")?(pn+".html"):(cPage?pn:"missing.html");
            util.log("http","SENDING ",pnts, "from",util.docroot);
            send(request, pnts)
             .root(util.docroot)
             .on('error', sendError)
             .pipe(response);
            return;
          }
          cPage(request,response,purl);
          return;
        }
        if (m == "POST") {
          var chunks = [];
          request.on('data',function (idt) {
          chunks.push(idt);
          util.log("http","REQUEST DATA",idt)})
          .on('end',function () {
            var dt = Buffer.concat(chunks);
            var dts = dt.toString();
            util.log("http","REQUEST DATA DONE",dts,".");
            var js = JSON.parse(dts);
            util.log("http","json",js);
            if (cPage) {
              cPage(request,response,js);
            } else {
              page.failResponse(response,"missingMethod");
            }
          });
          return;
        }
        util.log("http","********* ANOTHER METHOD *********",m);
        page.okResponse(response);
         
        response.end();
    }).listen(port);
  //  }).listen(port,'http://dev.prototypejungle.org');
    util.log("web",'Server listening on port ' + port);
    
    