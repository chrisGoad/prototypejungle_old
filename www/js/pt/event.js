
(function (pj) {
  'use strict'


// This is one of the code files assembled into pjom.js. //start extract and //end extract indicate the part used in the assembly

//start extract

/* a simple event system
 *
 * An Event always has a node and name, and often has many other attributes (eg property)
 * If a field of a node is watched, and its value changes, this generates the change event with given node and property and name "change'
 * pj.Event.emit emits the event into the system.
 * Whenever an event is emitted, as search for listeners for that event is made in the ancestry of the noce. Each node may have a __listeners property, which lists listeners
 * by event name.  A listener is just a function which takes the event as input (and may emit other events, of course)
 *
 * pj.watch(nd,p)  Means that change events will be generated for that field.
 */

pj.set('Event',pj.DNode.mk());

pj.Event.mk = function (nm,node) {
  var rs = Object.create(pj.Event);
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

pj.DNode.addListener = function (name,fn) {
  var listeners = this.__get('__listeners');
  if (!listeners) {
    listeners = this.set('__listeners',pj.DNode.mk());
  }
  var listenerArray = listeners[name];
  if (!listenerArray) {
    // this is the head of its chain; will not be copied in instantiated
    listenerArray = listeners.set(name,pj.LNode.mk());
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
pj.fireListenersInChain = function (node,event,startOfChain) {
  var listeners = node.__listeners,
    listenerArray,proto,fn;
  if (listeners) {
    listenerArray = listeners[event.name];
    if (listenerArray) {
      listenerArray.forEach(function (listenerRef) {
        fn = pj.evalPath(node,listenerRef);
        if (!fn) pj.error('No such listener '+listenerRef,'event');
        pj.log('event','firing listener for '+event.name);
        //fn(event,startOfChain);
        fn.call(startOfChain,event);
      });
    }
  }
  proto = Object.getPrototypeOf(node);
  if (proto !== pj.DNode) {
    pj.fireListenersInChain(proto,event,startOfChain);
  }
}  
*/
pj.fireListenersInChain = function (node,event,startOfChain) {
  var listeners = node.__listeners,
    listenerArray,proto,fn;
  if (listeners) {
    listenerArray = listeners.__get(event.name);
    if (listenerArray) {
      listenerArray.forEach(function (listenerRef) {
        fn = pj.evalPath(node,listenerRef);
        if (!fn) pj.error('No such listener '+listenerRef,'event');
        pj.log('event','firing listener ',listenerRef,'for '+event.name);

        //pj.log('event','firing  listener for '+event.name);
        //fn(event,startOfChain);
        fn.call(startOfChain,event);
      });
    }
  }
  proto = Object.getPrototypeOf(node);
  if (proto !== pj.DNode) {
    pj.fireListenersInChain(proto,event,startOfChain);
  }
}


pj.fireListenersInAncestry = function (node,event) {
  debugger;
  if (pj.DNode.isPrototypeOf(node)) pj.fireListenersInChain(node,event,node);
//pj.fireListeners(node,event);
    //pj.fireListenersInChain(node,event,node);
  var parent = node.parent;
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
  var event = pj.EventQueue.shift();
  if (event === undefined) return false;
  pj.fireListenersInAncestry(event.node,event);
  return true;
}

pj.MaxEventSteps = 1000;// throw an error if the queue doesn't empty out after this number of steps

pj.processEvents = function () {
  var cnt=0,notDone=true;
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
  pj.log('event','Emitting event '+this.name);
  pj.EventQueue.push(this);
  pj.processEvents();
}

/* Usage example:
 * From a Legend for infographs with colored categories.
 
 pj.watch(item.colorRectP,"fill"); // watches the field "fill", and emits change events when the fill is modified
 
 

// Transduces the elementary change event into an event named colorChange, which in turn is transmitted up the tree

item.listenForColorChange = function (ev) {
  var nev = pj.pj.Event.mk("colorChange",this);
  nev.index = ev.node.name;
  nev.color = ev.node.fill;
  nev.emit();
}

item.addListener("change","listenForColorChange");

*/
//end extract

})(prototypeJungle);


  
  
  
  