// Copyright 2019 Chris Goad
// License: MIT

/* a simple event system
 *
 * An Event always has a node and id, and often has many other attributes (eg property)
 * If a field of a node is watched, and its value changes, this generates the change event with given node and property and id "change'
 * pj.Event.emit emits the event into the system.
 * Whenever an event is emitted, as search for listeners for that event is made in the ancestry of the noce. Each node may have a __listeners property, which lists listeners
 * by event id.  A listener is just a function which takes the event as input (and may emit other events, of course)
 *
 * pj.watch(nd,p)  Means that change events will be generated for that field.
 */

// this is not in use at the moment, but is well tested, and might be used again.
// At the ui level  it is left behind the flag ui.vars.eventsEnabled


pj.set('Event',pj.Object.mk());

pj.Event.mk = function (nm,node) {
  let rs = Object.create(pj.Event);
  rs.id=nm;
  rs.node=node;
  return rs;
}

/* add a listener for events with id nm (the listeners for events with id nm under node is held in an Array at node.__listeners)
 * A listener is a reference to a function
 * It has the form /a/b where  a/b is the path below pj
 * or a/b the path below node
 * The  listener function takes two inputs: the event, and the node at which the listener is fired.
 */

pj.Object.__addListener = function (id,fn) {
  let listenerArray;
  let listeners = this.__get('__listeners');
  if (!listeners) {
    listeners = this.set('__listeners',pj.Object.mk());
  }
  listenerArray = listeners[id];
  if (!listenerArray) {
    // this is the head of its chain; will not be copied in instantiated
    listenerArray = listeners.set(id,pj.Array.mk());
    listenerArray.__head = 1; // head of chain for instantiate; 
  }
  if (listenerArray.indexOf(fn) < 0) {
    listenerArray.push(fn);
  }
}


pj.fireListenersInChain = function (node,event,startOfChain) {
  let listeners = node.__listeners;
  let  listenerArray,proto,fn;
  if (listeners) {
    listenerArray = listeners.__get(event.id);
    if (listenerArray) {
      listenerArray.forEach(function (listenerRef) {
        fn = pj.evalPath(listenerRef,node);
        if (!fn) {
          pj.error('No such listener '+listenerRef,'event');
        }
        log('event','firing listener ',listenerRef,'for '+event.id);
        fn.call(startOfChain,event);
      });
    }
  }
  proto = Object.getPrototypeOf(node);
  if (proto !== pj.Object) {
    pj.fireListenersInChain(proto,event,startOfChain);
  }
}


pj.fireListenersInAncestry = function (node,event) {
  let parent;
  if (pj.Object.isPrototypeOf(node)) {
    pj.fireListenersInChain(node,event,node);
  }
  parent = node.__parent;
  if (parent && (parent !== pj)) {
    pj.fireListenersInAncestry(parent,event);
  }
}

/*
 * pj.EventQueue contains the unprocessed events. processing an event consists of finding listeners for it in
 * the ancestry of the node where it occurs, and firing them.  Emitting and event is adding it to the queue.
 */

pj.EventQueue = [];

pj.eventStep = function () {
  let event = pj.EventQueue.shift();
  if (event === undefined) {
    return false;
  }
  pj.fireListenersInAncestry(event.node,event);
  return true;
}

pj.MaxEventSteps = 1000;// throw an error if the queue doesn't empty out after this number of steps

pj.processEvents = function () {
  let cnt=0,notDone=true;
  while (notDone && (cnt < pj.MaxEventSteps)) {
    notDone = pj.eventStep();
    cnt++;
  }
  if (cnt >= pj.MaxEventSteps) {
    pj.error('Event loop','event');
  }
  return cnt;
}

pj.Event.emit = function () {
  pj.log('event','Emitting event '+this.id);
  pj.EventQueue.push(this);
  pj.processEvents();
}

/* Usage example:
 * From a Legend for infographs with colored categories.
 
 pj.watch(item.colorRectP,"fill"); // watches the field "fill", and emits change events when the fill is modified

*/


  
  
  
  