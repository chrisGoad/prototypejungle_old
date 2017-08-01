
/* a trivial exception setup.  System is meant to indicate which general system generated the error
 * (eg instantiate, install, externalize, or  what not.
 */

pj.Exception = {};

pj.throwOnError = false;
pj.debuggerOnError = true;

pj.Exception.mk = function (message,system,value) {
  let rs = Object.create(pj.Exception);
  rs.message = message;
  rs.system = system;
  rs.value = value;
  return rs;
}

// A default handler
pj.Exception.handler = function () {
  let msg = this.message;
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
