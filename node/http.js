 // the http server
var apiDown = 0; // deliver regular pages, but send {status:fail,msg:systemDown} for all api calls.
var pjdb = require('./db.js').pjdb;
var session = require('./session');

var url = require('url');
var fs = require('fs');
var staticServer = require('node-static');

var pjutil = require('./util');
pjutil.activateTag("main");
pjutil.activateTagForDev("http");
//pjutil.activateTag("web");

var page = require('./page.js');
var user = require('./user.js');
var s3 = require('./s3');
var util = require('util');
var pages = page.pages;
var twitter = require('./twitter.js');
var persona = require('./persona.js');

var down = 0;

var accessCount = 0;

var port = pjutil.isDev?8000:80;

// not in use at the moment
var allowCrossDomain = function(res) {
  pjutil.log("http",'allowingCrossDomain');
  res.setHeader('Access-Control-Allow-Origin', 'http://prototypejungle.org');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');  
};

var sys = require('sys');
var http = require('http');

   
    
    
    
  // This installation supports other hosts at another port using another webserver
var otherHosts = {"imagediver.org":8080,"mapbureau.com":8080,"neochronography.com":8080,
              "www.imagediver.org":8080,"www.mapbureau.com":8080,"www.neochronography.com":8080}

var otherHostRedirect = function (host,url) {  // only works correctly for GETs
  if (host) {
    for (var h in otherHosts) {
      if (host.indexOf(h)===0) {
        var port = otherHosts[h];
        return "http://"+h+":"+port+url;
      }
    }
  }
}




var notInUseHosts = {"imsnip.org":1,"imsnip.org:8000":1};

var cacheTime = pjutil.isDev?10:600;
var fileServer = new staticServer.Server("./../www/",{cache:cacheTime});

var serveAsHtml = {"/inspect":1,"/inspectd":1,"/inspectc":1,"/sign_in":1,"/view":1,"/viewd":1,"/logout":1,"/logoutd":1,"/handle":1,"/handled":1}
var htmlHeader = {"Content-Type":"text/html"}

var server = http.createServer(function(request, response) {
    accessCount++;
    var method = request.method;
    var requestUrl = request.url;
    var parsedUrl = url.parse(requestUrl,true);
    var host = request.headers.host;
    pjutil.log("web",JSON.stringify(requestUrl),"host",host,"accessCount",accessCount);
    var pathname = parsedUrl.pathname;
    if (pathname==="/") {
      pathname = down?"down.html":"index.html";
    }
    pjutil.log("headers",JSON.stringify(request.headers));
    //Deal with other hostnames
    var redirect = otherHostRedirect(host,requestUrl);
    if (redirect) {
      pjutil.log("web","Redirecting to another web server",redirect);
      response.writeHead(301,{'Location':redirect})
      response.end();
      return;
    }
    var referer = request.headers.referer;
    pjutil.log("main"," url "+request.url+'method '+request.method+' pathname '+pathname+
               ' query '+util.inspect(parsedUrl.query));
    if (referer) {
      pjutil.log("web","Referer: "+referer+"\n");
    }
   var cPage = pages[pathname];
    var asHtml = serveAsHtml[pathname]; // special case for inspect,view
    var staticFileKind = asHtml || pjutil.hasExtension(pathname,[".js",".html",".png",".jpeg",".json",".ico",".txt"]);
    var notInUseHost = notInUseHosts[host] && (requestUrl === "/");
    if (notInUseHost) {
      pjutil.log("web","NOT IN USE HOST ",host);
    }
    if (method==="GET") {

      if (staticFileKind || (!cPage) || typeof cPage === "string") { //static page
        var pnts = notInUseHost?"redirect.html":(staticFileKind?pathname:(cPage==="html")?(pathname+".html"):(cPage?pathname:"missing.html"));
        if (!fs.existsSync("./../www/"+pnts)) {
          pjutil.log("web","MISSING ",pnts);
          pnts = "missing.html";
        }
        pjutil.log("http","SENDING ",pnts, "from",pjutil.docroot);
        var hdrs = asHtml?htmlHeader:{};
        fileServer.serveFile(pnts,200,hdrs,request,response);              
        return;
      }
      cPage(request,response,parsedUrl);
      return;
    }
    if (method === "POST") {
      var chunks = [];
      request.on('data',function (idt) {
      chunks.push(idt);
      pjutil.log("http","REQUEST DATA",idt)})
      .on('end',function () {
        var dt = Buffer.concat(chunks);
        var dts = dt.toString();
        pjutil.log("postData",dts);
        try {
          var js = JSON.parse(dts);
        } catch(e) {
          pjutil.log("error","POST DATA was not JSON in call ",pathname,dts);
          page.failResponse(response,"postDataNotJSON");
          return;
        }
        pjutil.log("http","json",js);
        if (cPage) {
          if (apiDown) {
            pjutil.log("web","api down");
            page.failResponse(response,"systemDown");
            return;
          }
          cPage(request,response,js);
        } else {
          pjutil.log("web","Method not found",pathname);
          page.failResponse(response,"missingMethod");
        }
      });
      return;
    }
    pjutil.log("http","********* ANOTHER METHOD *********",method);
    page.okResponse(response);
     
    response.end();
}).listen(port);
pjutil.log("main",'Server listening on port ' + port);
 