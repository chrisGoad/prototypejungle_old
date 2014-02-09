// support for loading and viewing items from code, rather than a PrototypeJungle UI
(function (pj) {
  var om = pj.om;
  var draw = pj.draw;
 
    
     function afterInstall(ars) {
          var ln  = ars.length;
          if (ln>0) {
            var rs = ars[ln-1]
            om.root = rs;
            var bkc = rs.backgroundColor;
            if (!bkc) {
              rs.backgroundColor="rgb(255,255,255)";
            }
            draw.main.setContents(om.root);
            om.performUpdate();
            draw.refresh();//  get all the latest into svg
            draw.main.fitContents();
            draw.refresh();
            return;
          }
     }

  draw.installAsRoot = function (path,cb) {
    om.install(pj.om.unpackUrl(path).url,
        function (ars) {afterInstall(ars);if (cb) cb()});
}
  
  
})(prototypeJungle);

