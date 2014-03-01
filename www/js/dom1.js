(function (__pj__) {
  var om = __pj__.om;
  var dom = __pj__.dom;
  dom = __pj__.set("dom",om.DNode.mk());// added for prototypeJungle; this is where symbols are added, rather than at the global level
  dom.__external__ = 1;

  /* how dom objects are represented: <tag att1=22 att2=23>abcd <tag2 id="abc"></tag2>
   The tag  names the prototype of this item. In svg mode the attributes are primitive properties of the item.
   The id attribute determines the __name__. Shorthand; instead of id="abc"  #abc will also work.
   
   example
   <chart.component.bubble <#caption>foob</#caption><#value>66</#value>
   item.bubble.caption
   item.set("rectP","<rectangle style='color:red'>
  dom.set("Style",om.DNode.mk()).namedType();
*/
  
  
  dom.set("Style",om.DNode.mk()).namedType();

  dom.Style.mk = function (o) { 
    rs = Object.create(dom.Style);
    rs.setProperties(o);
    return rs;   
  }
  
  dom.Style.setFieldType("fill","svg.Rgb");




 function parseStyle(st,dst) {
    var rs = dst?dst:dom.Style.mk();
    var sp0 = st.split(';');
    sp0.forEach(function (c) {
      var sp1 = c.split(":");
      if (sp1.length==2) {
        rs[sp1[0]] = sp1[1];
      }
    });
    return rs;
  }
dom.parseStyle = parseStyle;



})(prototypeJungle);

