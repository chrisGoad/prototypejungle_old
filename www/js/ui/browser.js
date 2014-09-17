(function (pj) {
  var ui = pj.om;

// This is one of the code files assembled into pjui.js. 'start extract' and 'end extract' indicate the part used in the assembly

//start extract


// <Section> browser ====================================================

ui.safariSupported = 1;

ui.browser = function () {
  var userAgent = window.navigator.userAgent,
    m = userAgent.match(/Chrome\/(\d*)/),
    browser,version;
  if (m) {
    browser = 'Chrome';
  } else {
    m = userAgent.match(/Firefox\/(\d*)/);
    if (m) {
      browser = 'Firefox';
    } else {
      m = userAgent.match(/MSIE (\d*)/);
      if (m) {
        browser = 'IE';
      } else {
        m = userAgent.match(/Safari/);
        if (m) {
          browser = 'Safari';
        } else {
          m = userAgent.match(/rv\:(\d*)/);
          if (m) {
            browser = 'IE';
          }
        }
      }
    }
  }
  if (m) {
    if (browser == 'Safari') {
      return {browser:browser}
    }
    version = parseInt(m[1]);
    return {browser:browser,version:version}
  }
}


ui.supportedBrowser = function () {
  var browserVersion = ui.browser();
  if (!browserVersion) {
    return 0;;
  }
  var browser =  browserVersion.browser;
  if ((browser === 'IE') && (browserVersion.version < 10)) {
    return 0;
  }
  if ((browser === 'Safari') && !ui.safariSupported) {
    return 0;
  }
  return 1;
}

ui.checkBrowser = function () {
  if (!ui.supportedBrowser()) {
    window.location.href = '/unsupportedbrowser';
  }
}
  

//end extract

})(prototypeJungle);


