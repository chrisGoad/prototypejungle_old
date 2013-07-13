(function () {
  var om = __pj__.om;
  var dom = __pj__.dom;
    
  var jqp = om.DNode.mk();
  __pj__.set("jqPrototypes",jqp);
  
 
  jqp.button = dom.newJQ({tag:"div",html:"prototype",hoverOut:{"background-color":"#444444"}, hoverIn:{"background-color":"#777777"} ,style:{cursor:"pointer",color:"white",display:"inline-block","margin-left":"10px","padding-left":"5px","padding-right":"5px","border":"solid thin black",
"background-color":"#444444"}});
  
  
  jqp.textInput =  dom.newJQ({tag:"input",type:"input",style:{display:"inline-block",width:"150px","background-color":"white","margin-left":"10px"}});

  
  jqp.pulldown = dom.newJQ({tag:"div",style:{position:"absolute","padding-left":"5px","padding-right":"5px","border":"solid thin black",
"background-color":"white"}});
  
  
  jqp.pulldownEntry = dom.newJQ({tag:"div",html:"prototype",style:{cursor:"pointer",color:"black","padding-left":"5px","padding-right":"5px",
"background-color":"white"}});
  
})();

