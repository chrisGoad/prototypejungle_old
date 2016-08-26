<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="description" content="An open catalog of drawing elements and chart types, based on deep prototypes">
<title>PrototypeJungle</title>
</head>
<body style="background-color:#eeeeee">

<script>

var writeSvg = function (rs) {
  document.open();
  document.write(rs);
  document.close();
}
var parseQuerystring = function(){
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
  
  function loadSvg() {
    var q = parseQuerystring();
    if (q.src) {
      //var svgFile = '/twitter:14822695/svg/bb';
      //var url = 'https://prototypejungle.firebaseio.com'+svgFile+'.json?callback=writeSvg'
      var url = 'https://prototypejungle.firebaseio.com'+q.src+'.json?callback=writeSvg'
      var  onError = function (errorEvent) {
        debugger;
      }
      var element = document.createElement('script');
      var  head = document.getElementsByTagName('head')[0];
      element.setAttribute('type', 'text/javascript');
      element.setAttribute('src', url);
      element.addEventListener('error', onError);
      head.appendChild(element); 

    }
  }

  var ready = function (fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
   
ready(loadSvg);
  /*
   
http://127.0.0.1:3000/svg.html?src=/twitter:14822695/svg/bb

*/
 
  

</script>
 





</body>
</html>
