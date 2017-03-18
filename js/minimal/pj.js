// Support for top level pages (eg svg.html), that only need a few PrototypeJungle utilities.


window.prototypeJungle =  (function () {

pj = {};
pj.decodeUrl = function (iurl,uid) {
  var m= iurl.match(/\[(.*)\](.*)/);
  if (m) {
    return [m[1],m[2]];
  } else {
    return [uid,iurl];
  }
}

pj.storageUrl = function (ipath,iuid) {
  var uid,path;
  var durl = pj.decodeUrl(ipath);
  uid = durl[0];
  path = durl[1];
  if (uid) {
    return 'https://firebasestorage.googleapis.com/v0/b/project-5150272850535855811.appspot.com/o/'+
      encodeURIComponent(uid+path)+'?alt=media';
  } else {
    return ipath;
  }
}


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
  
pj.ready = function (fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}


pj.httpGet = function (url,cb) {
/* from youmightnotneedjquery.com */

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
//return pj;
//})();