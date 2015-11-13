  
 
var pjutil = require('./util.js');
var util = require('util');
var fs = require('fs'); 
var s3 = require('./s3');
var db = require('./db.js');
//var persona = require('./persona');
//var twitter = require('./twitter');


//pjutil.activateTag("save");


 
exports.failResponse = function (response,msg) {
  var rs = {status:"fail"};
  if (msg) {
    rs.msg = msg;
  }
  var ors = JSON.stringify(rs);
  response.write(ors);
  response.end();
}

exports.okResponse = function (response,vl,otherProps) {
  var rs = {status:"ok"};
  if (vl) {
    rs.value = vl;
  }
  if (otherProps) {
    for (var k in otherProps) {
      rs[k] = otherProps[k];
    }
  }
  var ors = JSON.stringify(rs);
  response.write(ors);
  response.end();
}



var beginsWith = function (string,prefix) {
  var ln = prefix.length;
  return string.substr(0,ln)===prefix;
}
// argToCheck is a path that should be owned  by the current signed in user

  
    

// the general purpose saver for items.
//The inputs.files  should be an array of objects of the form {name:,value:,contentType:} (eg {name:"item",value:<serialized item>}
// value is saved at files.path/name for each name,value in this array,  using the given  content type




    

/* For release 2, a not-logged-on mode of saving is supported.  In this mode, a request for a save is made without specifying
 * a destination.  Save of an item to anon/<randomly generated string> is performed,  and that path is returned. This
 * is called AnonSave */



var genRandomString = function (ln) {
  // first character is alpha
  var r0 = Math.floor(Math.random()*26);
  var charArray = [97+r0];
  for (var i=1;i<ln;i++) {
    var r = Math.floor(Math.random()*36);
    var c = (r<26)?r+97:r+22;//48;
    charArray.push(c);
  }
  return String.fromCharCode.apply(null,charArray);
}

var extensionsByContentType = {'application/javascript':'.js','image/svg+xml':'.svg'}; // for now

var anonMaxLength = 50000;// same  as s3's maxSaveLength, and also js/ui's pj.maxSaveLength

exports.anonSaveHandler = function (request,response,inputs) {
  var path,extension,ln;
  if (((typeof inputs.value)!=='string') || ((typeof inputs.contentType) !== 'string') ||
       (!(extension = extensionsByContentType[inputs.contentType]))) {
    exports.failResponse(response,'Bad input to anonSave');
    return;
  }
  ln = inputs.value.length;
  if (ln > anonMaxLength) {
    console.log('size FAILLL');
    exports.failResponse(response,'SizeFail '+anonMaxLength);
    return;
  }
  path = '/anon/repo3/'+genRandomString(10)+extension;

  var cb = function (e) { 
    pjutil.log("page","ANON Save COMPLETE");
    if (e) {
      exports.failResponse(response,"Save Failed");
    } else {
      exports.okResponse(response,path);
    }
  }
  var remoteAddress = request.connection.remoteAddress;
  pjutil.log("save","ANON SAVE BY REMOTE ADDRESS",remoteAddress);
  db.putSave('RA.'+remoteAddress,function (err,rs) {
      pjutil.log("save","PUTSAVE",err,rs);
      if (err) {  
        console.log("ANON SAVE FOR ",remoteAddress,"FAILED",err);
        exports.failResponse(response,err);
        return;
      }
    // lightning better not strike twice
    s3.getObject(path,function (e,d) {
      var extension;
      if (d) {
            exports.failResponse(response,"collision");
      } else {
        //console.log('input for save',JSON.stringify(inputs));
        console.log('content type for save',inputs.contentType);
        console.log('path for save',path);
        s3.save(path,inputs.value,{contentType:inputs.contentType,encoding:'utf-8',sizeLimited:1},cb);
      }
    });
  });
}


exports.pingHandler = function (request,response) {
  exports.okResponse(response);
}

  
  
  
  