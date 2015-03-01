
(function (pj) {
  'use strict'
var pt = pj.pt;

// This is one of the code files assembled into pjom.js. //start extract and //end extract indicate the part used in the assembly

//start extract

/* a simple event system
 *
 * An Event always has a node and name, and often has many other attributes (eg property)
 * If a field of a node is watched, and its value changes, this generates the change event with given node and property and name "change'
 * pt.Event.emit emits the event into the system.
 * Whenever an event is emitted, as search for listeners for that event is made in the ancestry of the noce. Each node may have a __listeners property, which lists listeners
 * by event name.  A listener is just a function which takes the event as input (and may emit other events, of course)
 *
 * pt.watch(nd,p)  Means that change events will be generated for that field.
 */

pt.set('Event',pt.DNode.mk());

pt.Event.mk = function (nm,node) {
  var rs = Object.create(pt.Event);
  rs.name=nm;
  rs.node=node;
  return rs;
}

/* add a listener for events named nm (the listeners for events named name under node is held in an LNode at node.__listeners)
 * A listener is a reference to a function
 * It has the form /a/b where  a/b is the path below pj
 * or a/b the path below node
 * The  listener function takes two inputs: the event, and the node at which the listener is fired.
 */

pt.DNode.addListener = function (name,fn) {
  var listeners = this.__get('__listeners');
  if (!listeners) {
    listeners = this.set('__listeners',pt.DNode.mk());
  }
  var listenerArray = listeners[name];
  if (!listenerArray) {
    // this is the head of its chain; will not be copied in instantiated
    listenerArray = listeners.set(name,pt.LNode.mk());
    listenerArray.__head = 1; // head of chain for instantiate; 
  }
  if (listenerArray.indexOf(fn) < 0) {
    listenerArray.push(fn);
  }
}


/* fire the listeners for event k along the prototype chain of node.
 * startOfChain is the point in the chain at which the call was made, and this is passed to the listeners.
 */
/*
pt.fireListenersInChain = function (node,event,startOfChain) {
  var listeners = node.__listeners,
    listenerArray,proto,fn;
  if (listeners) {
    listenerArray = listeners[event.name];
    if (listenerArray) {
      listenerArray.forEach(function (listenerRef) {
        fn = pt.evalPath(node,listenerRef);
        if (!fn) pt.error('No such listener '+listenerRef,'event');
        pt.log('event','firing listener for '+event.name);
        //fn(event,startOfChain);
        fn.call(startOfChain,event);
      });
    }
  }
  proto = Object.getPrototypeOf(node);
  if (proto !== pt.DNode) {
    pt.fireListenersInChain(proto,event,startOfChain);
  }
}  
*/
pt.fireListenersInChain = function (node,event,startOfChain) {
  var listeners = node.__listeners,
    listenerArray,proto,fn;
  if (listeners) {
    listenerArray = listeners.__get(event.name);
    if (listenerArray) {
      listenerArray.forEach(function (listenerRef) {
        fn = pt.evalPath(node,listenerRef);
        if (!fn) pt.error('No such listener '+listenerRef,'event');
        pt.log('event','firing listener ',listenerRef,'for '+event.name);

        //pt.log('event','firing  listener for '+event.name);
        //fn(event,startOfChain);
        fn.call(startOfChain,event);
      });
    }
  }
  proto = Object.getPrototypeOf(node);
  if (proto !== pt.DNode) {
    pt.fireListenersInChain(proto,event,startOfChain);
  }
}


pt.fireListenersInAncestry = function (node,event) {
  debugger;
  if (pt.DNode.isPrototypeOf(node)) pt.fireListenersInChain(node,event,node);
//pt.fireListeners(node,event);
    //pt.fireListenersInChain(node,event,node);
  var parent = node.parent;
  if (parent && (parent !== pj)) {
    pt.fireListenersInAncestry(parent,event);
  }
}

/*
 * pt.EventQueue contains the unprocessed events. processing an event consists of finding listeners for it in
 * the ancestry of the node where it occurs, and firing them.  Emitting and event is adding it to the queue.
 */

pt.EventQueue = [];

pt.eventStep = function () {
  var event = pt.EventQueue.shift();
  if (event === undefined) return false;
  pt.fireListenersInAncestry(event.node,event);
  return true;
}

pt.MaxEventSteps = 1000;// throw an error if the queue doesn't empty out after this number of steps

pt.processEvents = function () {
  var cnt=0,notDone=true;
  while (notDone && (cnt < pt.MaxEventSteps)) {
    notDone = pt.eventStep();
    cnt++;
  }
  if (cnt >= pt.MaxEventSteps) {
    pt.error('Event loop','event');
  }
  return cnt;
}

pt.Event.emit = function () {
  pt.log('event','Emitting event '+this.name);
  pt.EventQueue.push(this);
  pt.processEvents();
}

/* Usage example:
 * From a Legend for infographs with colored categories.
 
 pt.watch(item.colorRectP,"fill"); // watches the field "fill", and emits change events when the fill is modified
 
 

// Transduces the elementary change event into an event named colorChange, which in turn is transmitted up the tree

item.listenForColorChange = function (ev) {
  var nev = pj.pt.Event.mk("colorChange",this);
  nev.index = ev.node.name;
  nev.color = ev.node.fill;
  nev.emit();
}

item.addListener("change","listenForColorChange");

*/
//end extract

})(prototypeJungle);


  
  
  
  