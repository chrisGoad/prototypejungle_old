
(function (pj) {
  'use strict'

// This is one of the code files assembled into pjcore.js. //start extract and //end extract indicate the part used in the assembly

//start extract

/* a trivial exception setup.  System is meant to indicate which general system generated the error
 * (eg instantiate, install, externalize, or  what not.
 */

pj.Exception = {};

pj.throwOnError = 0;
pj.debuggerOnError = 1;

pj.Exception.mk = function (message,system,value) {
  var rs = Object.create(pj.Exception);
  rs.message = message;
  rs.system = system;
  rs.value = value;
  return rs;
}

// A default handler
pj.Exception.handler = function () {
  var msg = this.message;
  if (this.system) msg += ' in system '+this.system;
  pj.log('error',msg);
}


pj.error = function (msg,sys) {
  if (sys) {
    pj.log('error',msg+sys?' from '+sys:'');
  } else {
    pj.log('error',msg);
  }
  if (pj.debuggerOnError) {
    debugger;
  }
  if (pj.throwOnError) {
    var ex = pj.Exception.mk(msg,sys);
    throw ex;
  }
}

//end extract

})(prototypeJungle);
