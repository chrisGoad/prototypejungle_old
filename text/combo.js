core.require('/text/textarea.js',function (textareaP) {

// this is a library that deals with text that might be a single line, or multi line (represented by textarea)
// used in /shape/textPlain.js and in containers via /container/textAndImage.js

//bounds on text are over estimated, so we throw in

const textExtent = function (bnds,fontSize) {
  let xt = bnds.extent;
  return geom.Point.mk(xt.x-0,xt.y-0);
  
  
}
let item = core.ObjectNode.mk();



let textProperties = 
         ["font-size",
         "font-style",
         "font-family",
         "font-weight",
         "lineSep"];
  

 


item.updateCombo = function (itm,whichExtent,dealWithImage) {
   if (!itm.__element) { // not yet in DOM
    return;
  }
  let sidePadding,bottomPadding,oneWord;
  if (dealWithImage) {
    let extraBottomPadding = itm.extraBottomPadding?itm.extraBottomPadding:0;
    bottomPadding = extraBottomPadding+itm.bottomPadding;
    let extraSidePadding = itm.extraSidePadding?itm.extraSidePadding:0;
    sidePadding = extraSidePadding+itm.sidePadding;
  } else {
    bottomPadding = 0;
    sidePadding = 0;
  }
  let textHeight = 0;
  let textItem;// single line or text area
  let txt = dealWithImage?itm.__parent.text:itm.text;
  let textarea = itm.textarea;
  let singleLine = itm.singleLine;
  let multiLine = txt.indexOf('\n') > -1;
  if (txt === undefined) {  
    textHeight = 0;
    if (dealWithImage) {
      dealWithImage(itm,textItem,textHeight);
    }
    return;
  }
   if (!multiLine) {
    if (!singleLine) {
      singleLine = itm.set('singleLine',dom.SvgElement.mk('<text stroke-width="0"  text-anchor="middle"/>'));
      singleLine.unselectable = true;
    }
    if (!singleLine.__element) {
      singleLine.show();
    }
    singleLine.setText(txt);
    let bnds = singleLine.boundsWithHidden();
    if (!bnds) {
      return;
    }
    let xt = textExtent(bnds);
    textHeight = xt.y;
    textItem = singleLine;
    oneWord = (txt.split(' ')).length === 1;
    const toSingleLine = () => {
      singleLine.show();
      core.setProperties(singleLine,itm,textProperties);
      singleLine.fill = itm.stroke;
      let fs = itm['font-size'];
      singleLine['font-size'] = fs;
      //singleLine.y = fs/3; // nudge down for vertical centering
      singleLine.y = 0;
      textItem = singleLine;
      if (textarea) {
        textarea.hide();
        textarea.text = '';
        textarea.update();
      }
    }
    const limitHeight =  () => {
      let minHt = xt.y + 2*bottomPadding;
      if (minHt > itm.height) {
        if (itm.dimension) {
          itm.width = itm.height = itm.dimension = minHt;
        } else {
          itm.height = minHt;
        }
      }
    }
    if (oneWord) {
      let minWd = xt.x + 2*sidePadding;
      if (itm.width < minWd)  {
        if (itm.dimension) {
          itm.width = itm.height = itm.dimension = minWd;
        }
        itm.width = minWd;
      }
      limitHeight();
      toSingleLine();
      singleLine.show();
      if (dealWithImage) {
       dealWithImage(itm,textItem,textHeight);
      }
      return;
    }
    if (xt.x <= itm.width - 2*sidePadding) { //  fits
      limitHeight();
      toSingleLine();
      if (dealWithImage) {
       dealWithImage(itm,textItem,textHeight);
      }
      return;
    }
  }// either multi line, or multi word which doesn't fit in a single line
  if (!textarea) {
    textarea = itm.set('textarea',textareaP.instantiate());
    core.declareComputed(textarea,true);
    textarea.unselectable = true;
  }
  if (singleLine) {
    singleLine.hide();
  }
  itm.isSingleLine = false;
  textarea.show();
  textItem = textarea;
  core.setProperties(textarea,itm,textProperties);
  textarea.fill = itm.stroke;
  textarea.text = txt;
  if (!whichExtent) {
    textarea.update();
  }
  if ((whichExtent === 'width')||(whichExtent === 'dimension') || (whichExtent === undefined)) {
    textarea.setWidth(itm.width-2 * sidePadding);
  }
  let minHt = textarea.height + 2*bottomPadding;
  let minWd = textarea.width + 2*sidePadding;
  textHeight = textarea.height;
  if (minHt > itm.height) {
    if (itm.dimension) {
      itm.width = itm.height = itm.dimension = minHt;
    } 
    itm.height = minHt;
  }
  if (minWd > itm.width) {
    if (itm.dimension) {
      itm.width = itm.height = itm.dimension = minWd;
    }
    itm.width = minWd;
  }
   if (dealWithImage) {
     dealWithImage(itm,textItem,textHeight);
    }
}

  item.update = function (whichExtent) {
    this.updateCombo(this,whichExtent);
  }
  
  graph.installRectanglePeripheryOps(item);
  return item;
});


