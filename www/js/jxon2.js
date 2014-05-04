// turning DOM object into JSON trees
// from https://developer.mozilla.org/en-US/docs/JXON
/*\
|*|
|*|  JXON Snippet #3 - Mozilla Developer Network
|*|
|*|  https://developer.mozilla.org/en-US/docs/JXON
|*|
\*/



(function(pj){
  var om = pj.om;
  var dom = pj.dom;
  var svg = pj.svg;
  //var tags = pj.tags;

function parseText (sValue) {
  if (/^\s*$/.test(sValue)) { return null; }
  if (/^(?:true|false)$/i.test(sValue)) { return sValue.toLowerCase() === "true"; }
  if (isFinite(sValue)) { return parseFloat(sValue); }
  //if (isFinite(Date.parse(sValue))) { return new Date(sValue); }
  return sValue;
}

function getJXONTree (oXMLParent,tag) {
  var tv,nodeId, nLength = 0, sCollectedTxt = "",xf;
  //if (oXMLParent.hasAttributes && oXMLParent.hasAttributes()) { // cg added the check for existence of method
  if (tag) tv = svg[tag];
  if (tv) {
    var vResult  = Object.create(tv);
  } else {
    vResult  = dom.ELement.mk();
    //vResult  = om.DNode.mk();
    vResult.tag = tag;
  }
  if (oXMLParent.attributes) { // cg added the check for existence of method
    // cg also modified this to stash in attributes rather than things named @att
    //var atts = om.DNode.mk();
    //vResult.set("attributes",atts);
    for (nLength; nLength < oXMLParent.attributes.length; nLength++) {
      var oAttrib = oXMLParent.attributes.item(nLength);
      var attName = oAttrib.name.toLowerCase();
      var attValue = parseText(oAttrib.value.trim());
      if (attName === "style") {
        var st = dom.parseStyle(attValue);
        vResult.set("style",st);
      } else if (attName === "id") {
        vResult.__name__ = attValue;
        //nodeId = attValue;
      } else if (attName === "transform") {
        var gxf = svg.stringToTransform(attValue);
        if (gxf) {
          vResult.set("transform",gxf);
        }
      } else {
        vResult[attName] = attValue;
      }
    }
  }
  if (oXMLParent.hasChildNodes()) {
    for (var oNode, sProp, vContent, nItem = 0; nItem < oXMLParent.childNodes.length; nItem++) {
      oNode = oXMLParent.childNodes.item(nItem);
      if (oNode.nodeType === 4) { sCollectedTxt += oNode.nodeValue; } /* nodeType is "CDATASection" (4) */
      else if (oNode.nodeType === 3) { sCollectedTxt += oNode.nodeValue.trim(); } /* nodeType is "Text" (3) */
      else if (oNode.nodeType === 1 && !oNode.prefix) { /* nodeType is "Element" (1) */
        if (nLength === 0) { }
        vContent = getJXONTree(oNode,oNode.tagName);
        var nm = vContent.get("__name__");
        if (nm) {
          vResult.set(nm,vContent);
        } else {
          vResult.set("__"+nLength,vContent);
        }
        nLength++;
      }
    }
  }
  if (sCollectedTxt) {
    vResult.text= parseText(sCollectedTxt);
  }
  /* if (nLength > 0) { Object.freeze(vResult); } */
  return vResult;
}

dom.domToJSON = getJXONTree;
})(prototypeJungle);
