
(function (pj) {
  'use strict'
var pt = pj.pt;

// This is one of the code files assembled into pjom.js. //start extract and //end extract indicate the part used in the assembly

//start extract

/* a trivial exception setup.  System is meant to indicate which general system generated the error
 * (eg instantiate, install, externalize, or  what not.
 */

pt.Exception = {};

pt.throwOnError = 0;
pt.debuggerOnError = 1;

pt.Exception.mk = function (message,system,value) {
  var rs = Object.create(pt.Exception);
  rs.message = message;
  rs.system = system;
  rs.value = value;
  return rs;
}

// A default handler
pt.Exception.handler = function () {
  var msg = this.message;
  if (this.system) msg += ' in system '+this.system;
  pt.log('error',msg);
}


pt.error = function (msg,sys) {
  if (sys) {
    pt.log('error',msg+sys?' from '+sys:'');
  } else {
    pt.log('error',msg);
  }
  if (pt.debuggerOnError) {
    debugger;
  }
  if (pt.throwOnError) {
    var ex = pt.Exception.mk(msg,sys);
    throw ex;
  }
}

//end extract

})(prototypeJungle);
