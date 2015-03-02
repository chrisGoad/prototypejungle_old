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

var api = require('./api.js');
var user = require('./user.js');
var s3 = require('./s3');
var util = require('util');
var apiCalls = api.apiCalls;
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



var cacheTime = pjutil.isDev?10:600;
var fileServer = new staticServer.Server("./../www/",{cache:cacheTime});

// these are the only pages (other than api calls) supported.
var serveAsHtml  = {"/sign_in":1,"/sign_ind":1,"/logout":1,"/handle":1,"/twitter_oauth.html":1,"/worker.html":1,"/workerd.html":1,"/googlee28c8d08ee2e2f69.html":1};

var htmlHeader = {"Content-Type":"text/html"}

var serveAsOther = {"/style.css":1,"/robots.txt":1,"favicon.ico":1};


var server = http.createServer(function(request, response) {
    accessCount++;  
    var method = request.method;
    var requestUrl = request.url;
    var parsedUrl = url.parse(requestUrl,true);
    var remoteAddress = request.connection.remoteAddress;
    var host = request.headers.host;
    pjutil.log("http",JSON.stringify(requestUrl),"host",host,"accessCount",accessCount,"remoteAddress",remoteAddress);
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
    pjutil.log("main"," url "+request.url+' method '+request.method+' pathname ['+pathname+
               '] query '+util.inspect(parsedUrl.query));
    if (referer) {
      pjutil.log("web","Referer: "+referer+"\n");
    }
   var apiCall = apiCalls[pathname]; 
   var asHtml = serveAsHtml[pathname]; 
  var asOther = serveAsOther[pathname];
    if (method==="GET") {
      if (apiCall) {  
        apiCall(request,response,parsedUrl);
        return;
      }
      if (asHtml || asOther)  {
        var fileToEmit = pathname;
      } else {
        var fileToEmit = "redirect.html";
      }
      pjutil.log("http","SENDING ",fileToEmit, "from",pjutil.docroot);
      var hdrs = asHtml?htmlHeader:{};
      fileServer.serveFile(fileToEmit,200,hdrs,request,response);              
      return;
    }
    if (method === "POST") {
      // gather the JSON posted data 
      var chunks = [];
      request.on('data',function (idt) {
      chunks.push(idt);
      pjutil.log("http","REQUEST DATA",idt)})
      .on('end',function () {
        var dt = Buffer.concat(chunks);
        var dts = dt.toString();
        pjutil.log("postData",dts);
        try {
          var postedData = JSON.parse(dts);
        } catch(e) {
          pjutil.log("error","POST DATA was not JSON in call ",pathname,dts);
          api.failResponse(response,"postDataNotJSON");
          return;
        }
        pjutil.log("http","json",postedData);
        if (apiCall) {
          if (apiDown) {
            pjutil.log("web","api down");
            api.failResponse(response,"systemDown");
            return;
          }
          apiCall(request,response,postedData);
        } else {
          pjutil.log("web","Method not found",pathname);
          api.failResponse(response,"missingMethod");
        }
      });
      return;
    }
    pjutil.log("http","********* A REQUEST METHOD OTHER THAN GET,POST *********",method);
    api.okResponse(response);
     
    response.end();
}).listen(port);
pjutil.log("main",'Server listening on port ' + port);
 