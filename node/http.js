 
var pjdb = require('./db.js').pjdb;
var session = require('./session');

var url = require('url');
var fs = require('fs');
var staticServer = require('node-static');

var pjutil = require('./util');
pjutil.activateTag("main");
pjutil.activateTagForDev("http");
pjutil.activateTagForDev("web");

var page = require('./page.js');
var user = require('./user.js');
var s3 = require('./s3');
var util = require('util');
var pages = page.pages;
var twitter = require('./twitter.js');
var persona = require('./persona.js');

var down = 0;

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
  
  var serveAsHtml = {"/inspect":1,"/inspectd":1,"/sign_in":1,"/view":1,"/viewd":1,"/logout":1,"/logoutd":1,"/handle":1,"/handled":1}
  var htmlHeader = {"Content-Type":"text/html"}
  
  var server = http.createServer(function(request, response) {
      var m = request.method;
      var iurl = request.url;
      var purl = url.parse(iurl,true);
      var rhost = request.headers.host;
      pjutil.log("web",JSON.stringify(iurl),"host",rhost);
      var pn = purl.pathname;
      if (pn==="/") {
        pn = down?"down.html":"index.html";
      }
      pjutil.log("headers",JSON.stringify(request.headers));
      //Deal with other hostnames
      var rdir = otherHostRedirect(rhost,iurl);
      if (rdir) {
        pjutil.log("web","Redirecting to another web server",rdir);
        response.writeHead(301,{'Location':rdir})
        response.end();
        return;
      }
      var referer = request.headers.referer;
      pjutil.log("main","HOST:"+rhost+" METHOD:"+request.method+" URL:"+request.url+' PATHNAME:'+pn+' QUERY:'+util.inspect(purl.query));
      if (referer) {
        pjutil.log("web","Referer: "+referer+"\n");
      }
     var cPage = pages[pn];
      var asHtml = serveAsHtml[pn]; // special case for inspect,view
      var staticFileKind = asHtml || pjutil.hasExtension(pn,[".js",".html",".png",".jpeg",".json",".ico",".txt"]);
      var notInUseHost = notInUseHosts[rhost] && (iurl === "/");
      if (notInUseHost) {
        pjutil.log("web","NOT IN USE HOST ",rhost);
      }
      if (m==="GET") {

        if (staticFileKind || (!cPage) || typeof cPage === "string") { //static page
          var pnts = notInUseHost?"redirect.html":(staticFileKind?pn:(cPage==="html")?(pn+".html"):(cPage?pn:"missing.html"));
          if (!fs.existsSync("./../www/"+pnts)) {
            pjutil.log("web","MISSING ",pnts);
            pnts = "missing.html";
          }
          pjutil.log("http","SENDING ",pnts, "from",pjutil.docroot);
          var hdrs = asHtml?htmlHeader:{};
          fileServer.serveFile(pnts,200,hdrs,request,response);              
          return;
        }
        cPage(request,response,purl);
        return;
      }
      if (m === "POST") {
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
            pjutil.log("error","POST DATA was not JSON in call ",pn,dts);
            page.failResponse(response,"postDataNotJSON");
            return;
          }
          pjutil.log("http","json",js);
          if (cPage) {
            cPage(request,response,js);
          } else {
            pjutil.log("web","Method not found",pn);
            page.failResponse(response,"missingMethod");
          }
        });
        return;
      }
      pjutil.log("http","********* ANOTHER METHOD *********",m);
      page.okResponse(response);
       
      response.end();
  }).listen(port);
  pjutil.log("web",'Server listening on port ' + port);
  
    