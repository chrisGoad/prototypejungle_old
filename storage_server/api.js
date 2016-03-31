
  
var ssutil = require('./ssutil.js');
//var util = require('util');
var fs = require('fs'); 
var s3 = require('./s3');
var db = require('./db.js');
//var persona = require('./persona');
//var twitter = require('./twitter');


//ssutil.activateTag("save");


 
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

var maxPostLength = 50000;

exports.extractData1 = function (request,expectingJSON,next) {
      // gather the JSON posted data 
  var chunks = [];
  request.on('data',function (idt) {
    chunks.push(idt);
    ssutil.log("http","REQUEST DATA",idt)})
    .on('end',function () {
        var dt = Buffer.concat(chunks);
        var dts = dt.toString();
        ssutil.log("postData",dts);
        var pln = dts.length;
        ssutil.log('main','   POST LENGTH',pln);
        if (pln > maxPostLength) {
          ssutil.log("error","POST DATA TOO LONG ");
          next("postTooLong");
          return;
          //api.failResponse(response,"postTooLong");
        }
        if (expectingJSON) {
          try {
            var postedData = JSON.parse(dts);
          } catch(e) {
            ssutil.log("error","POST DATA was not JSON in call ",pathname,dts);
            next("postDataNotJSON");
            //api.failResponse(response,"postDataNotJSON");
            return;
          }
        } else {
          postedData = dts;
        }
        ssutil.log("http","json",postedData);
        next(undefined,postedData);
    });
}
    
exports.extractData = function (request,next) {
  exports.extractData1(request,false,next);
}

exports.extractJSON = function (request,next) {
  exports.extractData1(request,true,next);
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

exports.anonSaveHandler = function (remoteAddress,inputs,next) {
  var path,extension,ln;
  if (((typeof inputs.value)!=='string') || ((typeof inputs.contentType) !== 'string') ||
       (!(extension = extensionsByContentType[inputs.contentType]))) {
    console.log("BAD");
    next('Bad input to anonSave');
    return;
  }
  console.log("GOOD");
  ln = inputs.value.length;
  if (ln > anonMaxLength) {
    console.log('size FAILLL');
    next('SizeFail '+anonMaxLength);
    return;
  }
  path = '/anon/repo3/'+genRandomString(10)+extension;

  var cb = function (e) { 
    ssutil.log("page","ANON Save COMPLETE");
    if (e) {
      next("Save Failed");
    } else {
      next(undefined,path);
    }
  }
  //var remoteAddress = request.connection.remoteAddress;
  ssutil.log("save","ANON SAVE BY REMOTE ADDRESS",remoteAddress);
  db.putSave('RA.'+remoteAddress,function (err,rs) {
      ssutil.log("save","PUTSAVE",err,rs);
      if (err) {  
        console.log("ANON SAVE FOR ",remoteAddress,"FAILED",err);
        next(err);
        return;
      }
    // lightning better not strike twice
    s3.getObject(path,function (e,d) {
      var extension;
      if (d) {
            next("collision");
      } else {
        //console.log('input for save',JSON.stringify(inputs));
        console.log('content type for save',inputs.contentType);
        console.log('path for save',path);
        s3.save(path,inputs.value,{contentType:inputs.contentType,encoding:'utf-8',sizeLimited:1},cb);
      }
    });
  });
}


exports.saveHandler = function (inputs,next) {
  var path,extension,ln,handle,contentType,value,overwrite;
  path = inputs.path;
  contentType = inputs.contentType;
  value = inputs.value;
  overwrite = inputs.overwrite;
  console.log("saving to ",path,' with content-type',contentType);
  if (((typeof value)!=='string') || ((typeof contentType) !== 'string') ||
      ((typeof path) !== 'string')) {
    console.log("BAD");
    next('Bad input to save');
    return;
  }
  handle = ssutil.handleFromPath(path)
  ln = value.length;
  if (ln > anonMaxLength) {
    console.log('size FAILLL');
    next('SizeFail '+anonMaxLength);
    return;
  }
  var cb = function (e) { 
    ssutil.log("page","Save COMPLETE");
    if (e) {
      next("Save Failed");
    } else {
      next(undefined,path);
    }
  }
  //var remoteAddress = request.connection.remoteAddress;
  ssutil.log("save","SAVE at ",path);
  db.putSave('Handle.'+handle,function (err,rs) {
      ssutil.log("save","PUTSAVE",err,rs);
      if (err) {  
        console.log("ANON SAVE FOR ",handle,"FAILED",err);
        next(err);
        return;
      }
    if (overwrite) {
      s3.save(path,inputs.value,{contentType:inputs.contentType,encoding:'utf-8',sizeLimited:1},cb);
    } else {
      s3.getObject(path,function (e,d) {
        if (d) {
              next("collision");
        } else {
          //console.log('input for save',JSON.stringify(inputs));
          s3.save(path,inputs.value,{contentType:inputs.contentType,encoding:'utf-8',sizeLimited:1},cb);
        }
      });
    }
  });
}


exports.pingHandler = function (request,response) {
  exports.okResponse(response);
}

  