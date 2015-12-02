var util = require('./util.js');
// leveldb is used to store sessions
//util.activateTag("count");

var levelup = require('level');
if (!exports.pjdb) {
  util.log("level",'new db');
  var db = levelup('./pjdb');
  exports.pjdb = db;
} else {
  util.log("level","exising db");
}

exports.spew = function () {
  db.createReadStream({keys:true,values:true}).
    on('data',function (data) {
      console.log(data);
    });
}


exports.clear = function () {
  var ops = [];
  db.createReadStream({keys:true}).
    on('data',function (data) {
      ops.push({type:'del',key:data.key});
    }).on('end',function (){
      console.log("END",ops);
      db.batch(ops,function (err) {console.log("DONE");});
    })
    
}
// this counts the number of saves per unit time, both total, and per IP
// if this count exceeds thresholds, cb('totalExceeded') or cb(IP) is called
// If not exceeded, cb(undefined,'ok') is called

exports.maxPerIP = 10; 
exports.maxSaves = 100;
exports.timeUnit = 300;//10000; //seconds
exports.putSave = function (key,cb) {
  //console.log('putSaveKey',key);
  if (key ===  'RA.76.26.102.34') {
     //console.log("NO THROTTLE FROM HOME BASE");
     cb(undefined,'ok');
     return;
  }
  db.get('total',function (terr,itvalue) {
    db.get(key, function (err,ivalue) {
      var tm = Math.floor(new Date().getTime()/(1000*exports.timeUnit)); 
  
      var value = err?{count:0,time:tm}:JSON.parse(ivalue);
      var tvalue = terr?{count:0,time:tm}:JSON.parse(itvalue);
      util.log("count","Before counts",value,"tvalue", tvalue);
      var ttime = tvalue.time;
      var time = value.time;
      var tcount = tvalue.count;
      var count = value.count;
      if ((ttime === tm) && (tcount >= exports.maxSave)) { 
        cb('maxExceeded');
        return;
      }
      if ((time === tm) && (count >= exports.maxPerIP)) {
        cb('maxPerIPExceeded');
        return;
      } 
      if (time === tm) {
        value.count = count+1;
      } else {
        value.count = 1;
        value.time = tm;
      }
      if (ttime === tm) {
        tvalue.count = tcount+1;
      } else {
        tvalue.count = 1;
        tvalue.time = tm;
      }
     util.log("count","After counts",value,"tvalue",tvalue);

      var ops = [
        {type:'put','key':'total',value:JSON.stringify(tvalue)},
        {type:'put','key':key,value:JSON.stringify(value)}];
      db.batch(ops, function (err) {
        cb(undefined,'ok');
      });
    });
    
});
}


/*

cd /mnt/ebs0/prototypejungledev/node;node


var pjdb = require('./db.js');
pjdb.spew();
pjdb.clear();

pjdb.putSave('foob',function (err,rs) {console.log("SAVE DONE",err,rs);});
pjdb.putSave('fobob',function (err,rs) {console.log("SAVE DONE",err,rs);});

*/