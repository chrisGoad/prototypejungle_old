
/*
// html -> json, specialized for the noaa weather data


To run this script:
cd /mnt/ebs0/prototypejungledev/node
node admin/weather_event_data.js

*/
var util = require('../util.js');
util.activeTags = ["s3"];

var fs = require('fs');
var s3 = require('../s3');

var htmlparser = require("htmlparser2");

var inputFile = "/sys/repo0/data/noaa_weather_events.html";
var outputFile =  "/sys/repo0/data/noaa_weather_events.json";

var events = [];
var cEvent = {};
var cTag,cAtts;
var verbose = 0;
function onOpen(name,atts) {
  if (name === "tr") {
    //console.log("tr",atts.class);
    cEvent.class = atts.class;
  
  } else {
    cTag = name;
    cAtts = atts;
  }

  if (verbose) console.log("open  ",name,atts);
}

function onText(txt) {
  console.log("CTAG",cTag);
  if (cTag === "td") {
    
    if (cAtts) {
      var cl = cAtts.class;
      if (cl === "date") {
        var dts = cEvent.dates;
        if (dts) {
          dts.push(txt);
        } else {
          cEvent.dates = [txt];
        }
      } else {
        cEvent[cl] = txt;
      }
    }
  } else if ((cTag === "div")||(cTag == "a")) {
    console.log("DIV",cAtts);
    if (cAtts) {
      var cl = cAtts.class;
      var hr = cAtts.href;
      if ((cl === "name")|| hr) {
        if ((txt==="Sandy") || (txt.indexOf('Hurricane ')>=0)) {// for some reason, Sandy is not labeled as a hurricane
           txt = txt.replace('Hurricane ','');
           cEvent.caption  = txt;
        } 
   
      }
    }
  }
  if (verbose) console.log("Text",txt);
}

function  onClose(name) {
  if (name == "tr") {
    events.push(cEvent);
    cEvent = {};
  }
  cAtts = undefined;
  cTag = undefined;
  if (verbose) console.log("close ",name);
  //code
}

function processEvent(ev) {
  var dts = ev.dates;
  if (!dts || (dts.length !== 2)) {
    console.log("PROBLEM ",ev);
    return 0;
  } else {
    ev.initialDate = dts[0];
    ev.finalDate = dts[1];
    var idn = Date.parse(dts[0]);
    var fdn = Date.parse(dts[1]);
    var mdtn = (idn + fdn)/2;
    var mdt = new Date(mdtn);
    var mdts = mdt.getFullYear() + "-"+(mdt.getMonth()+1)+"-"+mdt.getDate();
    //console.log(dts[0],dts[1],mdts);
    ev.date = mdts;
    delete ev.dates;
  }
  var cst = ev.cost;
  if (cst) {
    var re = /(\(.*\))/
    var m = cst.match(re);
    if (m) {
      var crs = m[1].substr(1,m[1].length-2);
    } else {
      crs = cst.substr(1);
    }
    if (verbose) console.log("COST",cst," => ",crs);
    ev.cost = crs;
  } else {
    console.log("PROBLEM WITH COST ",cst);
  }
  delete ev["event-name"]; // always just a bunch of tabs and returns
  var cl = ev.class.split(" ")[1];
  ev.category= cl.replace("-","_");
  console.log("kind",cl);
  //console.log("description",ev.details);
  delete ev.class;
  ev.description = ev.details;
  delete ev.details;
  console.log("the caption",ev.caption);
  return 1;
}

function processEvents() {
  var rs = [];
  events = events.filter(processEvent);
}
function job() {
  var parser = new htmlparser.Parser(
    {onopentag:onOpen,ontext:onText,onclosetag:onClose}
  );
  s3.getObject(inputFile,function (e,d) {
    parser.write(d);
    parser.end();
    processEvents();
    var flds = ["caption","date","cost","description","deaths","category"];
    var ftps = ["string","date","number","string","integer","string"];

    var fln = flds.length;
    var eventArrays = events.map(function (e) {
      //console.log(e.kind);
      var rs = [];
      for (var i=0;i<fln;i++) {
        rs.push(e[flds[i]]);
      }
      return rs;
    });
    var evc = {fields:flds,fieldTypes:ftps,"domain":"date","range":"cost","value":eventArrays};
    var rs = JSON.stringify(evc);
    var wrs = "callback("+rs+")";
    var cnt = events.length;
   // console.log(rs);
    s3.save(outputFile,wrs,"application/javascript","utf8",function (rs) {console.log("DONE with ",cnt,"events");},1);

  });
  
}

job();

  

