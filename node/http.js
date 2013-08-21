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
var docroot = "/mnt/ebs0/prototypejungledev/www/"


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
    
    var serveMissing = function (response) {
      var mf = docroot + "missing.html";
      var m = fs.readFileSync(mf);
      response.write(m);
      response.end();
    }
  
    var fRedirect = 1; // redirect imagediver and mapbureau, rather than putting up "maintainence" pages
    var server = http.createServer(function(request, response) {
        var m = request.method;
        var purl = url.parse(request.url,true);
        var pn = purl.pathname;
        var rhost = request.headers.host;
        
        //Deal with other hostnames
        var imdiver = rhost.indexOf('imagediver.org') == 0;
        var mapb = rhost.indexOf('mapbureau.com') == 0;
        var fpage = imdiver?"imagediver.html":(mapb?"mapbureau.html":undefined);
        if (fpage) {
          var fdocroot = docroot + "foreign/"
          if (pn.indexOf('.css') > 0) {
            fpage = pn;
          }
        } else {
          fdocroot = docroot;
        }
        if (fpage && fRedirect) {
          if (imdiver) {
            var rdir = 'http://imagediver.org';
          } else {
            rdir = 'http://mapbureau.com';
          }
          response.writeHead(302,{'Location':rdir})
          response.end();
          return;
        }
        
        //util.log("http","PURL",purl)
        util.log("web","FROM",rhost,"METHOD",request.method,"URL",request.url,'PATHNAME',pn,'QUERY',purl.query);
        var cPage = pages[pn];
        
        var isJsOrHtml = endsIn(pn,".js") || endsIn(pn,".html");
        var sendError =  function (err) {
          serveMissing(response);
          response.statusCode = err.status || 500;
          response .end(err.message);
        }
        if (m=="GET") {
          if (fpage ||  isJsOrHtml || (!cPage) || typeof cPage == "string") { //static page
            var pnts = isJsOrHtml?pn:(fpage?fpage:((cPage=="html")?(pn+".html"):(cPage?pn:"missing.html")));
            util.log("http","SENDING ",pnts, "from",fdocroot);
            send(request, pnts)
             .root(fdocroot)
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
        //allowCrossDomain(response);
        response.writeHead(200, {
            'Content-Type': 'text/html'
        });
        response.write("<html>");
        response.write("testing");
        response.write("1 2 3");
        response.write("</html>");
        /**
         * Here you can route or process the cPage based on request.url,
         * or you may want to use a module such as node-router.
         */
         
        response.end();
    }).listen(port);
  //  }).listen(port,'http://dev.prototypejungle.org');
    util.log("web",'Server listening on port ' + port);
    
    