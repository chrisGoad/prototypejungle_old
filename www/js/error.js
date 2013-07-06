(function () {
  var om = __pj__.om;
  var dom = __pj__.dom;
  var page = __pj__.page;
 

  var errorPage; // main page
  /* the set up:  ws has one child other than transform. This is the subject of the edit; the "page"; the "top".
    The save operation saves this under its name in the selected library. */
   var jqp = __pj__.jqPrototypes;
  var topbarDiv = dom.newJQ({tag:"div",html:"PrototypeJungle",style:{position:"relative",left:"0px","margin":"0px",padding:"0px"}});
  var titleDiv = dom.newJQ({tag:"div",html:"PrototypeJungle",style:{"margin":"0px",padding:"0px"}});
  var errorPage = dom.newJQ({tag:"div",style:{width:"700px","margin-right":"auto","margin-left":"auto",padding:"20px","background-color":"white"}});
  //errorPage.addChild("title",titleDiv);
  errorPage.addChild("tobar",topbarDiv);
   var messageDiv = dom.newJQ({tag:"div",html:"Message"});
  errorPage.addChild(messageDiv);
 

  var actionDiv = dom.newJQ({tag:"div",style:{position:"absolute",margin:"0px",
                              overflow:"none",padding:"5px",height:"20px"}});

  topbarDiv.addChild('action',actionDiv);

 
  page.genError = function (msg) {
    
       $('body').css({"background-color":"#eeeeee"});
    $('body').empty();
    errorPage.install($("body"));
    messageDiv.__element__.html(msg);

  }
   
})();

