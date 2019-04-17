// imageContainer
//let initialURL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/220px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg';


core.require('/text/textarea.js',
            // 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg/220px-Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_%28454045%29.jpg',
    alert('obsolete: image/imageContainer');
    function (textareaP) {

/* the box is always enlarged enough vertically to contain the text. */
let item = svg.Element.mk('<g/>');
//let imageP =  ui.mkImageProto(10,10,'none');
/* adjustable parameters */
//item.bold = true; //putBack when bold is fixed for exporting svg
item.fill = 'white';
item.stroke = 'black';
item['stroke-width'] = 3;
item['font-size'] = 8;
item['font-family'] = 'arial';
item.lineSep = 5;
item.multiline = true;
item.textBelowImage = true;
item.textWidthFraction = 0.3;// textwidth = textWidthFactor * this.width; only meaningful if textBelowImage is false
item.width = 100;
item.height = 100;
item.imVpad = 10; // vertical padding between image and text
item.imHpad = 10; //horizontal padding between image and text
item.topPad = 5; // padding above image in text beside case
item.bottomPad = 5; //padding below image in text beside case
item.hPadding = 5;//left right padding
item.textColor = 'black';
item.includeOutline = true;
item.fixedWidth = false;
item.fixedHeight = true;
/*  end adjustable parameters */


item.transferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['multiline','font-size','font-family','lineSep','fill','text','stroke','textColor','fixedWidth'],own);
}

//item.role = 'image';
item.role = 'vertex';
item.resizable = true;
item.text = 'Text';
item.draggableInKit = true;
item.disableRevertToPrototype = true;

/*
 *let im = imageP.instantiate();

item.set('image',im);
item.image.unselectable = true;
*/

item.text = '';


let textPropValues = 
         core.lift({"font-size":"12",
         "stroke-width":"0.2",
         "font-style":"normal",
         "font-family":"arial",
         "font-weight":"normal",
         "fill":"black",
         "vPadding":5,
         "hPadding":5,
         "lineSep":5
         });

let textPropList = Object.getOwnPropertyNames(textPropValues);

item.set('textProperties',textPropValues);

//let defaultTextProperties = {'font-size':'10','font-family':'arial','font':'arial','fill':'black','text-anchor':'middle'};

/*
// when properties are initialized for textual part, they need to be set in the prototype of the item, if not already present
item.setTextProperty = function (child,prop) {
  let itemPropName;
  let itemProto = Object.getPrototypeOf(this);
  if (prop === 'fill') {
    itemPropName = 'textFill';
  } else {
    itemPropName = prop;
  }
  let itemPropVal = this[itemPropName];
  if (itemPropVal !== undefined) {
    child[prop] = itemPropVal;
  } else {
    child[prop] = defaultTextProperties[prop];
    itemProto[itemPropName] = child[prop];
  }
}

//item.setTextProperties= function (child) {
  let prop;
  for (prop in defaultTextProperties) {
    this.setTextProperty(child,prop);
  }
}
*/
item.updateTextAndImage = function (whichExtent) {
  // always cause the instance
  if (!this.__get('__element')) { //not in DOM yet
    return;
  }
  let hPadding = this.hPadding;
  let topPad = this.topPad;
  let bottomPad = this.bottomPad;
  let textBelow = this.textBelowImage;
  let textarea = this.textarea;
  let textProps = this.textProperties;
  let image = this.image;
  let outline = this.outline;
  let txt = this.text?this.text:'';
  let textEmpty = !txt;
  let imPad,width,imWidth,imHeight,textHt,dimsComputed,textWd;
  if (!textarea) { //textarea is a computed object, thence added at runtime
    textarea = this.set('textarea',textareaP.instantiate());
    core.declareComputed(textarea,true);
    textarea.unselectable = true;
  }
  core.setProperties(textarea,textProps,ui.stdTextTransferredProperties);

  //this.setTextProperties(textarea);
  textarea.text = txt;
  if (!whichExtent  && txt) {
    textarea.__update();
  }
  if (whichExtent === 'width') {
    textarea.setWidth(this.width-2 * hPadding);
  }
  if (textBelow) {
    imPad = this.imVpad;// padding between image and text
    
    if ((whichExtent === 'width') || !whichExtent) {
      width = this.width;
      // need an estimate of minimum dimensionn for calculating the outline padding - targeted at rounded rectangles but works for eg circles too
      let minDimension = (image.aspectRatio<1)?width:width/(image.aspectRatio);
      let outlinePad = outline?(outline.outlinePadFraction?outline.outlinePadFraction*minDimension:0):0;

      imWidth = this.width - (2*hPadding+outlinePad);
      imHeight = imWidth/(image.aspectRatio);
      if (textEmpty) {
        textarea.hide();
        textHt = 0;
      } else {
        textarea.show();
        textarea.setWidth(imWidth);   
        textHt = textarea.height;
        textarea.moveto(geom.Point.mk(0,0.5*(imHeight+imPad+0.5*outlinePad)));
      }
      this.height = textHt + imHeight+imPad+topPad+0.5*outlinePad+bottomPad;
      let midIm = -0.5*this.height+topPad+0.5*outlinePad+0.5*imHeight;
       image.moveto(geom.Point.mk(0,midIm));
     //image.moveto(geom.Point.mk(0,-0.5*(textHt+imPad)));
      dimsComputed = true;
    }
  } else { // text beside;
    if (this.fixedWidth) { //height is being adjusted
      width = this.width;
      let minTextWd = textarea.computeMinWidth();
      let maxHeight = (width-minTextWd-2*hPadding)/(image.aspectRatio) + this.topPad + this.bottomPad;
      let height = this.height;
      if (height > maxHeight) {
        height = this.height = maxHeight;
      }
      imHeight = height - this.topPad - this.bottomPad;
      imWidth = imHeight*(image.aspectRatio);
      textWd = width - imWidth - 2*hPadding;
     
      image.moveto(geom.Point.mk(0.5 * (imWidth-width)+ hPadding ,0));
    
      textarea.setWidth(textWd);
      textWd = textarea.width; // actual width after adjustment
      //textarea.moveto(geom.Point.mk(0.5 * (imWidth + 2*hPadding - width),0));
      textarea.moveto(geom.Point.mk(imWidth + 2*hPadding + 0.5*(textWd - width),0));
      dimsComputed = true;
    } else {
      imPad = this.imHpad;
      let w;
      if ((whichExtent === 'width')  || !whichExtent) { // compute the height from the width
        width = this.width;
        imWidth = this.width * (1 - this.textWidthFraction) - imPad - 2*hPadding;
        imHeight = imWidth/(image.aspectRatio);
        // estimate
        let minDimension = Math.min(this.width,imHeight+topPad+bottomPad);
        let outlinePad = outline?(outline.outlinePadFraction?outline.outlinePadFraction*minDimension:0):0;
        // correct the iWidth
        imWidth = imWidth - outlinePad;
        imHeight = imWidth/(image.aspectRatio);

        //textarea.setWidth(this.width-2 *hPadding);
        this.height = imHeight + topPad+bottomPad+0.5*outlinePad;
        textWd = width * this.textWidthFraction;
        textarea.setWidth(textWd);
        let midIm = 0.5*(topPad-bottomPad);
        image.moveto(geom.Point.mk(0.5 * imWidth + 0.5*outlinePad + hPadding - 0.5*width,midIm));
        let textLeft = -0.5*width + 0.5*outlinePad + imWidth + hPadding;
        textarea.moveto(textLeft + 0.5*textWd,0);
        //textarea.moveto(geom.Point.mk(0.5*width + - 0.5*textWd - hPadding,0));
        dimsComputed = true;
      }  else { // adjustment in height not allowed in this case
        return;
      }
   
    }
  }
  if (dimsComputed) {
   image.width = imWidth;
   image.height = imHeight;
   if (outline) {
     outline.width = this.width;
     outline.height = this.height;
   }
  }
}

item.updateOutline = function () {
  let outline = this.outline;
  outline.setExtent(this.getExtent());
  core.setProperties(outline,this,['width','height','fill','stroke','stroke-width']);
  outline.unselectable = true;
  outline.__update();
}
item.update = function (options) {
  if (!this.image) {
    return;
  }
  let whichExtent = options?options.whichExtent:options;
  this.updateTextAndImage(whichExtent);
  this.updateOutline();
}



/**
 * Set accessibility and notes for the UI
*/

ui.hide(item,['width','textarea','text','height','box']);

item.textProperties.setFieldType('fill','svg.Rgb');

item.setFieldType('fill','svg.Rgb');
item.setFieldType('stroke','svg.Rgb');
//item.setFieldType('multiline','boolean');
//item.setFieldType('textBelowImage','boolean');

return item;
});

