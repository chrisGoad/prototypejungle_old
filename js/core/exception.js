// Copyright 2019 Chris Goad
// License: MIT

/* a trivial exception setup.  System is meant to indicate which general system generated the error
 * (eg instantiate, install, externalize, or  what not.
 */

let Exception = {};

let throwOnError = false;
let debuggerOnError = true;

Exception.mk = function (message,system,value) {
  let rs = Object.create(Exception);
  rs.message = message;
  rs.system = system;
  rs.value = value;
  return rs;
}

// A default handler
Exception.handler = function () {
  let msg = this.message;
  if (this.system) {
    msg += ' in system '+this.system;
  }
  log('error',msg);
}


const error = function (msg,sys) {
  if (sys) {
    log('error',msg+sys?' from '+sys:'');
  } else {
    log('error',msg);
  }
  if (debuggerOnError) {
    debugger; //keep
  }
  if (throwOnError) {
    let ex = Exception.mk(msg,sys);
    throw ex;
  }
}

export {error};
