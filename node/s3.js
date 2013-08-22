  /**
     * This is our Node.JS code, running server-side.
     * from http://arguments.callee.info/2010/04/20/running-apache-and-node-js-together/
     */
  


var AWS = require('aws-sdk');
AWS.config.loadFromPath('./keys/aws.json');

var util = require('./util.js');

var fs = require('fs');
var buffer = require('buffer');
var pj_bucket = "s3.prototypejungle.org";
var page = require('./page.js');
var user = require('./user.js');
var session = require('./session.js');

exports.save = function (path,value,contentType,encoding,cb) {
  var S3 = new AWS.S3(); // if s3 is not rebuilt, it seems to lose credentials, somehow
  util.log("s3","save to s3 at ",path," with contentType",contentType,"encoding",encoding);
  var bf = new buffer.Buffer(value,encoding);
  if (path[0]=="/") {
    path = path.substr(1);
  }
  var p = {
    Bucket:pj_bucket,
    Body:bf,
    ContentType:contentType,
    ACL:'public-read',
    Key:path
  }
  S3.putObject(p,cb);
}

var beginsWith = function (s,p) {
  var ln = p.length;
  return s.substr(0,ln)==p;
}


var viewToS3 = function(pth,cb) {
  util.log("s3","VIEWTOS3",pth);
  var cwd = process.cwd();
  var vwt = fs.readFileSync("view_template_for_s3");
  exports.save(pth,vwt,"text/html","utf8",cb);
}
   
exports.saveHandler = function (request,response,cob) {
  var fail = function (msg) {page.failResponse(response,msg);}
  session.check(cob,function (sval) {
    foob();
    if (typeof sval == "string") {
      fail(sval);
      return;
    }
    var uname = sval.user;
    user.get(uname,function (u) {
      var h = u.handle;
      if (!h) {
        fail("noHandle");
        return;
      }
      var path = cob.path;
      if (!path) {
        fail("noPath");
        return;
      }
      if (!beginsWith(path,"/"+h+"/")) {
        fail(response,"wrongHandle");//  you can only store to your own tree
        return;
      }
      var vl = cob.value;
      var jpeg = cob.jpeg; // might be an image
      if (!vl && !jpeg) {
        fail("noContent");
        return;
      }
      
      if (jpeg) {
        var ctp = "image/jpeg";
        var encoding = "binary";
        var cm = jpeg.indexOf(",")
        var jpeg64 = jpeg.substr(cm+1);
        vl = new Buffer(jpeg64,"base64").toString("binary");
      } else {
        ctp = "application/javascript";
        var encoding = "utf8"
      }
      util.log("s3"," s3 save",path,ctp,encoding);

      exports.save(path,vl,ctp, encoding,function (e,d) {
        util.log("s3","FROM s3 save",e,d);
        vwf = cob.viewFile;
        if (vwf) {
          viewToS3(vwf,function (e,d) {
            util.log("s3","FROM viewTOS3",e,d);
            page.okResponse(response);
          });
        }
        page.okResponse(response);
      });
    });
  });
}

/*
# now send to s3
def postCanvas(webin):
  " featured images; ie images with featured albums "
  cob=json.loads(webin.content())
  pth = cob["name"]
  wjpeg = cob["jpeg"]
  cm = wjpeg.find(",")
  jpeg64 = wjpeg[cm+1:]
  jpeg = base64.b64decode(jpeg64)
  vprint("posting canvas image ",pth)
  kex = s3SetContents(pth,jpeg,"image/jpeg",1)
  if type(kex)==str:
    return failResponse(kex)
  return okResponse()
  fln  = "/mnt/ebs0/termite/www/stills/"+nm+".jpg"
  fl = open(fln,"wb")
  fl.write(jpeg)
  fl.close()
  return okResponse(jpeg64[0:50])

 */ 

 
/*
ef toS3(webin):
  cob=json.loads(webin.content())
  cs = models.apiCheckSession(cob)
  if type(cs)==str:
    return failResponse(cs)
  handle = getattr(cs,"handle",None)
  if not handle:
    return failResponse("noHandle")
  pth = cob["path"]
  hs = "/"+handle+"/"
  ln = len(hs)
  if not pth[0:ln] == hs:
    return  failResponse("wrongHandle") 
  vprint("toS3",pth)
  vl = cob["value"]
  isim = cob["isImage"]
  if isim:
    ctp = "image/jpeg"
  else:
    ctp = "application/javascript"
  kex = s3SetContents(pth,vl,ctp,True)
  if type(kex)==str:
    return failResponse(kex)
  vwf = cob.get("viewFile")
  if vwf:
    viewToS3(vwf)
  
  return okResponse()
  */
