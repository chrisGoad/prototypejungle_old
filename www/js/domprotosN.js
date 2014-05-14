(function (__pj__) {
  // DOM prototypes
  var om = __pj__.om;
  var dom = __pj__.dom;
    
  var jqp = om.DNode.mk();
  __pj__.set("jqPrototypes",jqp);
  
 
  jqp.set("ubutton",dom.El({tag:"div",html:"prototype",class:"ubutton",style:{}}));
  jqp.set("ulink",dom.El({tag:"a",html:"prototype",class:"ubutton",style:{}}));
  jqp.set("button",dom.El({tag:"div",html:"prototype",class:"button",style:{}}));
  jqp.set("roundButton",dom.El({tag:"div",class:"roundButton",style:{}}));
  jqp.set("smallButton",dom.El({tag:"div",html:"prototype",class:"smallButton",style:{}}));
  jqp.set("funbutton",dom.El({tag:"div",html:"prototype",class:"ubutton",style:{"font-size":"8pt"}}));
  jqp.set("tabElement",dom.El({tag:"div",html:"prototype",class:"smallButton",style:{}}));

  
  
  
  jqp.set("textInput" ,dom.El({tag:"input",type:"input",style:{display:"inline-block",width:"150px","background-color":"white","margin-left":"10px"}}));

  
  jqp.set("pulldown",dom.El({tag:"div",style:{position:"absolute","padding-left":"5px","padding-right":"5px","padding-bottom":"15px","border":"solid thin black",
"background-color":"white"}}));
  
  
  jqp.set("pulldownEntry",dom.El({tag:"div",html:"prototype",class:"pulldownEntry",style:{}}));
          
  
})(prototypeJungle);

