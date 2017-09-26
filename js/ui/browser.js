
// This is one of the code files assembled into pjui.js. 

// <Section> browser ====================================================

pj.safariSupported = true;

pj.browser = function () {
  var userAgent = window.navigator.userAgent,
    match,version;
  var genResult = function (browser) {
    if ((browser === 'Safari') || (browser === 'Googlebot')) {
      return {browser:browser}
    }
    version = parseInt(match[1]);
    return {browser:browser,version:version};
  }
  match = userAgent.match(/Edge\/(\d*)/);
  if (match) return genResult('Edge');
  match = userAgent.match(/Chrome\/(\d*)/);
  if (match) return genResult('Chrome');
  match = userAgent.match(/Firefox\/(\d*)/);
  if (match) return genResult('Firefox');
  match = userAgent.match(/MSIE (\d*)/);
  if (match) return genResult('IE');
  match = userAgent.match(/Safari/);
  if (match) return genResult('Safari');
  match = userAgent.match(/Googlebot/);
  if (match) return genResult('Googlebot');
  match = userAgent.match(/rv\:(\d*)/);
  if (match) return genResult('IE');
  return undefined;
}
