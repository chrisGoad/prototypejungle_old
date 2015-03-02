(function (pj) {
  var  pt = pj.pt;
  var ui = pj.ui;
  
// This is one of the code files assembled into pjui.js. //start extract and //end extract indicate the part used in the assembly
//start extract

  if (!ui) {
    ui = pj.set("ui",pt.DNode.mk());
  }
  ui.sessionTimeout = 24 * 60 * 60;
  ui.useCloudFront =  0;
  ui.useS3 = 1;
  ui.cloudFrontDomain = "d2u4xuys9f6wdh.cloudfront.net";
  ui.s3Domain = "prototypejungle.org.s3.amazonaws.com";

  ui.itemDomain = ui.useCloudFront?"d2u4xuys9f6wdh.cloudfront.net":"prototypejungle.org";
  ui.setUIconstants = function () {
  //ui.isDev = location.href.indexOf('http://prototype-jungle.org:8000')===0;
  //ui.devAtProd = location.href.indexOf('http://prototypejungle.org/inspectd')===0;
    ui.atLive = location.href.indexOf('http://prototype-jungle.org')===0;
    ui.liveDomain = ui.isDev?"prototype-jungle.org:8000":"prototype-jungle.org";
    ui.useMinified = !ui.isDev;
    if (ui.isDev) {
      ui.homePage = "/indexd.html";
    }
  }
  
  ui.homePage = "";///tindex.html"; // change to "" on release
  //pt.activeConsoleTags = (ui.isDev)?["error","updateError","installError"]:["error"];//,"drag","util","tree"];

//end extract

})(prototypeJungle);
