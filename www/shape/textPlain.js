core.require('/text/textarea.js','/text/combo.js',function (textareaP,combo) {

let item = dom.SvgElement.mk('<g/>');

item.width = 40;
item.height = 10;

item.text = 'Text';       
item["font-size"] = "12";
item["font-style"] = "normal";
item["font-family"] = "arial";
item["font-weight"] = "normal";
item.stroke = "black"; // turned into fill in the actual text. 
item.lineSep = 2;


item.role = 'vertex';
item.resizable = true;


let textProperties = 
         ["font-size",
         "font-style",
         "font-family",
         "font-weight",
        // "fill",
         "lineSep"];
  

 


  item.update = function (whichExtent) {
    combo.updateCombo(this,whichExtent);
  }
  
  graph.installRectanglePeripheryOps(item);
  return item;
});

