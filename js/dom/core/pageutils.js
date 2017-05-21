
// minimal utilities needed for a PrototypeJungle web page (used in the minimal and firebase_only modules)



pj.endsIn = function (string,p) {
  var ln = string.length;
  var  pln = p.length;
  var es;
  if (pln > ln) return false;
  es = string.substr(ln-pln);
  return es === p;
}

pj.beginsWith = function (string,p) {
  var ln = string.length;
  var pln = p.length;
  var es;
  if (pln > ln) return false;
  es = string.substr(0,pln);
  return es === p;
}


pj.ready = function (fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}


pj.httpGet = function (iurl,cb) { // there is a fancier version in core/install.js
/* from youmightnotneedjquery.com */
  var url = pj.mapUrl?pj.mapUrl(iurl):iurl;
  var request = new XMLHttpRequest();
  request.open('GET',url, true);// meaning async
  request.onload = function() {
    if (cb) {
      if (request.status >= 200 && request.status < 400) {
      // Success!
        cb(undefined,request.responseText);
      } else {
        cb('http GET error for url='+url);
      }
      // We reached our target server, but it returned an error
    }
  };
  
  request.onerror = function() {
      cb('http GET error for url='+url);
  };
  request.send();
}


var ff = () => 33;
pj.parseQuerystring = function(){
    var nvpair = {};
    var qs = window.location.search.replace('?', '');
    var pairs = qs.split('&');
    pairs.forEach(function(v){
      var pair = v.split('=');
      if (pair.length>1) {
        nvpair[pair[0]] = pair[1];
      }
    });
    return nvpair;
}