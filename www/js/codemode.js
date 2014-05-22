// support for loading and viewing items from code, rather than a PrototypeJungle UI
// The functions are set up for enabling multiple svg divs, but for now, this only works for one: svg.main
(function (pj) {
  var om = pj.om;
  var _draw = pj._draw;
 
    
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
            _draw.main.setContents(om.root);
            om.performUpdate();
            _draw.refresh();//  _get all the latest into svg
            _draw.main.fitContents();
            _draw.refresh();
            return;
          }
     }
// vw not used until multiple svg's supported
  _draw.Root.installAsRoot = function (path,cb) {
    om.install(pj.om.unpackUrl(path).url,
        function (ars) {afterInstall(ars);if (cb) cb(om.root)});
}
  
  
})(prototypeJungle);

