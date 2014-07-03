// support for loading and viewing items from code, rather than a PrototypeJungle UI
// The functions are set up for enabling multiple svg divs, but for now, this only works for one: svg.main
(function (pj) {
  var om = pj.om;
  var __draw = pj.__draw;
 
    
     function afterInstall(ars) {
          var ln  = ars.length;
          if (ln>0) {
            var rs = ars[ln-1]
            om.root = rs;
            pj.ws = rs;
            var bkc = rs.backgroundColor;
            if (!bkc) {
              rs.backgroundColor="rgb(255,255,255)";
            }
            __draw.main.setContents(om.root);
            om.performUpdate();
            __draw.refresh();//  __get all the latest into svg
            __draw.main.fitContents();
            __draw.refresh();
            return;
          }
     }
// vw not used until multiple svg's supported
  __draw.Root.installAsRoot = function (path,cb) {
    om.install(pj.om.unpackUrl(path).url,
        function (ars) {afterInstall(ars);if (cb) cb(om.root)});
}
  
  
})(prototypeJungle);

