
var pj = prototypeJungle =
(function () {
  var DNode = {}; // dictionary node
  if (!Object.create) { //archaic browser
    pj.om = {};
    pj.page = {};
    return rs;
  }
  var rs = Object.create(DNode);
  var om = Object.create(DNode);
  om.DNode = DNode;
  rs.om = om;
  rs.page = Object.create(DNode);
  om.storage = localStorage;
  om.isDev = location.href.indexOf('prototype-jungle.org:8000')>0;
  om.liveDomain = om.isDev?"prototype-jungle.org:8000":"prototype-jungle.org";
  om.useMinified = !om.isDev;
  return rs;
})();
pj.loadScript = function (url, callback){
    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

pj.loadScripts = function (urls,callback) {
  var st = Date.now();

  var ln = urls.length;
  var cnt = -1;
  var cb = function () {
    cnt++;
    if (cnt === ln) {
      console.log("DONE LOADING");
      callback();
    } else {
      var url = urls[cnt];
      var tm = Date.now()-st;
      console.log("LOADING ",url," at ",tm/1000);
      pj.loadScript(url,cb);
    }
  }
  cb();
  
}
    

