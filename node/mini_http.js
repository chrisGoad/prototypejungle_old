  /**
    
     */
 

var url = require('url');
var send = require('send');
var http = require('http');node
var docroot = "/mnt/ebs0/prototypejungle/www/"

var port = 80


    var fRedirect = 1; // redirect imagediver and mapbureau, rather than putting up "maintainence" pages
    http.createServer(function(request, response) {
        var m = request.method;
        var purl = url.parse(request.url,true);
        var pn = purl.pathname;
        var rhost = request.headers.host;
        
        //Deal with other hostnames
        var imdiver=0,mapb=0;
        if (rhost) {
          imdiver = rhost.indexOf('imagediver.org') == 0;
          mapb = rhost.indexOf('mapbureau.com') == 0;
        }
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
          rdir = rdir + pn;
          console.log("rdir ",rdir);
          response.writeHead(302,{'Location':rdir})
          response.end();
          return;
        }
        
        //console.log("PURL",purl)
        console.log("FROM",rhost,"METHOD",request.method,"URL",request.url,'PATHNAME',pn,'QUERY',purl.query);
        var sendError =  function (err) {
          response.statusCode = err.status || 500;
          response .end(err.message);
        }
        if (m=="GET") {
            var pnts = fpage?fpage:"missing.html";
            console.log("SENDING ",pnts, "from",fdocroot);
            send(request, pnts)
             .root(fdocroot)
             .on('error', sendError)
             .pipe(response);
            return;
  
        }
        response.statusCode = 404;
        response.end();
      
    }).listen(port);
  //  }).listen(port,'http://dev.prototypejungle.org');
    console.log('Server listening on port ' + port);
    