
(function (pj) {
  'use strict'
var om = pj.om;

// This is one of the code files assembled into pjom.js. //start extract and //end extract indicate the part used in the assembly

//start extract

/* a simple event system
 *
 * An Event always has a node and name, and often has many other attributes (eg property)
 * If a field of a node is watched, and its value changes, this generates the change event with given node and property and name "change'
 * om.Event.emit emits the event into the system.
 * Whenever an event is emitted, as search for listeners for that event is made in the ancestry of the noce. Each node may have a __listeners property, which lists listeners
 * by event name.  A listener is just a function which takes the event as input (and may emit other events, of course)
 *
 * om.watch(nd,p)  Means that change events will be generated for that field.
 */

om.set('Event',om.DNode.mk());

om.Event.mk = function (nm,node) {
  var rs = Object.create(om.Event);
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

om.DNode.addListener = function (name,fn) {
  var listeners = this.__get('__listeners');
  if (!listeners) {
    listeners = this.set('__listeners',om.DNode.mk());
  }
  var listenerArray = listeners[name];
  if (!listenerArray) {
    // this is the head of its chain; will not be copied in instantiated
    listenerArray = listeners.set(name,om.LNode.mk());
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
om.fireListenersInChain = function (node,event,startOfChain) {
  var listeners = node.__listeners,
    listenerArray,proto,fn;
  if (listeners) {
    listenerArray = listeners[event.name];
    if (listenerArray) {
      listenerArray.forEach(function (listenerRef) {
        fn = om.evalPath(node,listenerRef);
        if (!fn) om.error('No such listener '+listenerRef,'event');
        om.log('event','firing listener for '+event.name);
        //fn(event,startOfChain);
        fn.call(startOfChain,event);
      });
    }
  }
  proto = Object.getPrototypeOf(node);
  if (proto !== om.DNode) {
    om.fireListenersInChain(proto,event,startOfChain);
  }
}  
*/
om.fireListenersInChain = function (node,event,startOfChain) {
  var listeners = node.__listeners,
    listenerArray,proto,fn;
  if (listeners) {
    listenerArray = listeners.__get(event.name);
    if (listenerArray) {
      listenerArray.forEach(function (listenerRef) {
        fn = om.evalPath(node,listenerRef);
        if (!fn) om.error('No such listener '+listenerRef,'event');
        om.log('event','firing listener ',listenerRef,'for '+event.name);

        //om.log('event','firing  listener for '+event.name);
        //fn(event,startOfChain);
        fn.call(startOfChain,event);
      });
    }
  }
  proto = Object.getPrototypeOf(node);
  if (proto !== om.DNode) {
    om.fireListenersInChain(proto,event,startOfChain);
  }
}
/*
om.fireListeners = function (node,event) {
  var listeners = node.__listeners,
    listenerArray,proto,fn;
  if (listeners) {
    listenerArray = listeners[event.name];
    if (listenerArray) {
      listenerArray.forEach(function (listenerRef) {
        fn = om.evalPath(node,listenerRef);
        if (!fn) om.error('No such listener '+listenerRef,'event');
        om.log('event','firing listener for '+event.name);
        //fn(event,startOfChain);
        debugger; 
        fn.call(node,event);
      });
    }
  }
}

*/

/*
om.fireListenersInAncestry = function (node,event) {
  debugger;
  var parent = node.__parent;
  if (parent && (parent !== pj)) {
    if (om.DNode.isPrototypeOf(parent)) om.fireListenersInChain(parent,event,parent);
    om.fireListenersInAncestry(parent,event);
  }
} 
*/


om.fireListenersInAncestry = function (node,event) {
  debugger;
  if (om.DNode.isPrototypeOf(node)) om.fireListenersInChain(node,event,node);
//om.fireListeners(node,event);
    //om.fireListenersInChain(node,event,node);
  var parent = node.__parent;
  if (parent && (parent !== pj)) {
    om.fireListenersInAncestry(parent,event);
  }
}

/*
 * om.EventQueue contains the unprocessed events. processing an event consists of finding listeners for it in
 * the ancestry of the node where it occurs, and firing them.  Emitting and event is adding it to the queue.
 */

om.EventQueue = [];

om.eventStep = function () {
  var event = om.EventQueue.shift();
  if (event === undefined) return false;
  om.fireListenersInAncestry(event.node,event);
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
    om.error('Event loop','event');
  }
  return cnt;
}

om.Event.emit = function () {
  om.log('event','Emitting event '+this.name);
  om.EventQueue.push(this);
  om.processEvents();
}

/* Usage example:
 * From a Legend for infographs with colored categories.
 
 om.watch(item.colorRectP,"fill"); // watches the field "fill", and emits change events when the fill is modified
 
 

// Transduces the elementary change event into an event named colorChange, which in turn is transmitted up the tree

item.listenForColorChange = function (ev) {
  var nev = pj.om.Event.mk("colorChange",this);
  nev.index = ev.node.__name;
  nev.color = ev.node.fill;
  nev.emit();
}

item.addListener("change","listenForColorChange");

*/
//end extract

})(prototypeJungle);


  
  
  
  