
(function (pj) {
  "use strict"
var om = pj.om;

// This is one of the code files assembled into pjcs.js. //start extract and //end extract indicate the part used in the assembly
//start extract

// a simple event system

// An Event always has a node and name, and often has many other attributes (eg property)
// If a field of a node is watched, and its value changes, this generates the change event with given node and property and name "change"
// om.Event.emit emits the event into the system.
// Whenever an event is emitted, as search for listeners for that event is made in the ancestry of the noce. Each node may have a __listeners property, which lists listeners
// by event name.  A listener is just a function which takes the event as input (and may emit other events, of course)

// om.watch(nd,p)  Means that change events will be generated for that field.

om.set("Event",om.DNode.mk());

om.Event.mk = function (nm,nd) {
  var rs = Object.create(om.Event);
  rs.name=nm;
  rs.node=nd;
  return rs;
}
// add a listener for events named nm
// A listener is a reference to a function
// It has the form /a/b where  a/b ia the path below pj
// or a/b the path below nd.
// The  listener function takes two inputs: the event, and the node at which the listener is fired.

om.DNode.addListener = function (nm,fn) {
  var lst = this.__get("__listeners");
  if (!lst) {
    lst = this.set("__listeners",om.DNode.mk());
  }
  var nml = lst[nm];
  if (!nml) {
    nml = lst.set(nm,om.LNode.mk());
  }
  if (nml.indexOf(fn) < 0) {
    nml.push(fn);
  }
}

// fire the listeners for event k along the prototype chain of nd.  The start st of the cruise down the chain is passed to the listener as the firing origin.

om.fireListenersInChain = function (nd,event,st) {
  var lst = nd.__listeners;
  if (lst) {
    var v = lst[event.name];
    if (v) {
      v.forEach(function (listenerRef) {
        var fn = om.evalPath(nd,listenerRef);
        if (!fn) om.error("No such listener "+listenerRef,"event");
        om.log("event","firing listener for "+event.name);
        fn(event,st);
      });
    }
  }
  var p = Object.getPrototypeOf(nd);
  if (p !== om.DNode) {
    om.fireListenersInChain(p,event,st);
  }
}




om.fireListenersInAncestry = function (nd,event) {
  var pr = nd.__parent;
  if (pr && (pr!==pj)) {
    if (om.DNode.isPrototypeOf(pr)) om.fireListenersInChain(pr,event,pr);
    om.fireListenersInAncestry(pr,event);
  }
}

// om.EventQueue contains the unprocessed events. processing an event consists of finding listeners for it in
// the ancestry of the node where it occurs, and firing them.  Emitting and event is adding it to the queue.

om.EventQueue = [];

om.eventStep = function () {
  var ev = om.EventQueue.shift();
  if (ev===undefined) return false;
  om.fireListenersInAncestry(ev.node,ev);
  return true;
}

om.MaxEventSteps = 1000;// throw an error if the queue doesn't empty out after this number of steps

om.processEvents = function () {
  var cnt=0,notDone=true;
  while (notDone && (cnt < om.MaxEventSteps)) {
    notDone = om.eventStep();
    cnt++;
  }
  if (cnt >= om.MaxEventSteps) {
    om.error("Event loop","event");
  }
  return cnt;
}

om.Event.emit = function () {
  om.log("event","Emitting event "+this.name);
  om.EventQueue.push(this);
  om.processEvents();
}
//end extract
})(prototypeJungle);


  
  
  
  