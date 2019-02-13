
let installError,mainUrl,main;

const installMainItem = function (source)  {
  mainUrl = source;
  if (source) {
    core.setRoot(dom.SvgElement.mk('<g/>'));
    core.install(source,afterMainInstall); 
  } else  {
    finishMainInstall();
  }
};

const afterMainInstall = function (e,rs) {
  if (e) {
    installError = e;
    finishMainInstall();
  } else if (rs) {
    main = rs;
  } 
  finishMainInstall();
}

const installAsSvgContents= function (itm) {
  let mn = dom.svgMain;
  if (mn.contents) {
    dom.removeElement(mn.contents);
  }
  mn.contents=itm;
  dom.svgDraw();
}

const mergeIn = function (dst,src) {
  core.forEachTreeProperty(src,(child) => {
    let nm = child.__name;
    let anm = core.autoname(dst,nm);
    dst.set(anm,child);
  }); 
}

const svgInstall = function () {
  let fromItemFile = mainUrl && core.endsIn(mainUrl,'.item');
  if (main && fromItemFile) {
    let svProtos = core.root.prototypes; // loading main may have involved installing prototypes
    core.setRoot(main);
    if (svProtos && main.prototypes) {
      mergeIn(main.prototypes,svProtos);
    }
  } else if (!core.root) {
    core.setRoot(dom.SvgElement.mk('<g/>'));
  }  
  let itm = main?main:core.root;
  dom.svgMain.fitFactor = fitFactor;
  installAsSvgContents(core.root);
  if (main && !fromItemFile) {
      core.root.set('main',main);
  }
  let rmain = core.root.main;
  
  if (rmain) {
    if (rmain.updatePrototype) {
      rmain.updatePrototype();
    }
    if (rmain.initialize) {
      rmain.initialize();
    }
    core.propagateDimension(rmain);
  }
  dom.fullUpdate();
  if (core.root.draw) {
    core.root.draw(dom.svgMain.__element); // update might need things to be in svg
  }
  if (itm.soloInit) { 
    itm.soloInit(); 
  }
}

let fitFactor = 0.8;


const displayError = function (msg) {
  svgMessageDiv.$show();
  svgMessageDiv.$html('<div style="text-align:center">'+msg+'</div>');
}

core.setDisplayError(displayError);

const finishMainInstall = function () {
  let e = installError;
  let emsg;
  
  if (e) {
    emsg = '<p style="font-weight:bold">'+e+'</p>';
    core.displayError(emsg);
    
  }
  if (!e) {
   svgMessageDiv.$hide();
    svgInstall();
  }
  layout();
  dom.svgMain.fitContents();
  window.addEventListener('resize', function () {
      layout();
      dom.svgMain.fitContents();
    });
}



