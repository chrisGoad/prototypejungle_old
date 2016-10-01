
(function (pj) {
  var ui = pj.ui;
  var dom = pj.dom;
  var html = pj.html;

  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly


//start extract
  
/* For secure access to prototypejungle. Scheme: md4 hash Date.md5 of Date.getTime()/100000 (a value that changes every
100 seconds ) +  secret. This is sent as the session key. To check at the server to see if the session is ok, check this
against. hashes for the same time indicator, and + or - 1  */

pj.sessionId = function () {
  var pjkey = 'abc';
  var md5 =  CryptoJS.MD5(pjkey);
  var sid = CryptoJS.enc.Hex.stringify(md5);
  return sid;
}

//end extract