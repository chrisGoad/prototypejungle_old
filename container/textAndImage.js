
// many basic shapes optionally include text, and so are groups in SVG

core.require('/text/textarea.js','/text/combo.js',function (textareaP,combo) {

let item = dom.SvgElement.mk('<g/>');

/* adjustable parameters */
item.width = 50;
item.height = 35;
item.fill = 'black';
item['font-style'] = "normal";
item['font-size'] = "12";
item.topPadding = 0;
item.vSep = 5; // between image and text
item.bottomPadding = 0;
item.sidePadding = 7;
item.lineSep = 5;
item["font-family"] = "arial";
item["font-weight"]="normal";
/*end adjustable parameters*/

item.lastWidth = item.width;
item.lastHeight = item.height;
item.lastDim = item.dimension;

item.text = '';



 const dealWithImage =  (itm,textItem,textHeight) => {
    let image = itm.__parent.image;
    if (!image) {
      return;
    } 
    let extraTopPadding = itm.extraTopPadding?itm.extraTopPadding:0;
    let topPadding = extraTopPadding+itm.topPadding;
    let extraBottomPadding = itm.extraBottomPadding?itm.extraBottomPadding:0;
    let bottomPadding = extraBottomPadding+itm.bottomPadding;
    let extraSidePadding = itm.extraSidePadding?itm.extraSidePadding:0;
    let sidePadding = extraSidePadding+itm.sidePadding;
    let imHeight=0;
    let imWidth = 0;
    let aspectRatio = image.aspectRatio;
    let maxImHeight = itm.height - topPadding - (textHeight?itm.vSep:0) - textHeight - bottomPadding;
    let maxImWidth = itm.width - 2*sidePadding;
    if ((maxImHeight < 0) || (maxImWidth < 0)) {
      image.hide();
    } else {
      image.show();
    }
    let imWidthAtMaxHeight = maxImHeight * aspectRatio; // how wide would the image be if its height were at max
    if (imWidthAtMaxHeight < maxImWidth) { // bounded by height
       imHeight = maxImHeight;
       imWidth = imWidthAtMaxHeight;
    } else { // bounded by width
      imWidth = maxImWidth;
      imHeight = imWidth/aspectRatio;
    }
    image.width = imWidth;
    image.height = imHeight;
    let midIm = textHeight?(-0.5*itm.height+itm.topPadding+0.5*imHeight):0;
    image.moveto(geom.Point.mk(0,midIm));
    if (textHeight) {
      let midText = 0.5*itm.height - bottomPadding - 0.5*textHeight;
      textItem.moveto(geom.Point.mk(0,midText));
    }
  }

item.firstUpdate = true;
item.update = function (whichExtent) {
  combo.updateCombo(this,whichExtent,dealWithImage);
}


let minBorderProperties = ['width','height','dimension','stroke','fill','stroke-width'];
let contentProperties = ['sidePadding','topPadding','vSep','bottomPadding'];
let borderPP,contentsPP;


const containerProperties = ['topPadding','vSep','bottomPadding','sidePadding','lineSep','textProperties'];
 
 //once shown, they stay shown                            
const hideContainerProperties  = (container,hideEm) => {
    if (!container.containerPropertiesShown) {
      if (hideEm) {
        if (!container.containerPropertiesHidden) {
          containerProperties.forEach((prop) =>  ui.hide(container,prop));
          container.containerPropertiesHidden = true;
        }
      } else {
        containerProperties.forEach((prop) =>  ui.show(container,prop));
        container.containerPropertiesShown = true;
      }
    }

  };
    
item.containerUpdate =  function () {
  let borderProperties = this.borderProperties;
  if (!this.border) {
    this.set('border',this.borderP.instantiate()).show();
    this.__hideInUI = true;
    this.border.neverselectable = true;
  }
  this.border.role = undefined;

  core.setProperties(this.border,this,minBorderProperties);
  if (borderProperties) {
    core.setProperties(this.border,this,borderProperties);
  }
  this.border.update();
  if (this.contents || this.text || this.image) {
    if (!this.contents) {
      this.set('contents',this.contentsP.instantiate()).show();
      this.contents.neverselectable = true;
      this.contents.__hideInUI = true;
    }
    core.setProperties(this.contents,this.textProperties,dom.textProperties);
    core.setProperties(this.contents,this,contentProperties);
    if (this.width) {
      this.contents.width = this.width;
      this.contents.height = this.height;
    } else {
      this.contents.width = this.dimension;
      this.contents.height = this.dimension;
    }   
  }
  let topSize=0;
  let bottomSize=0;
  let sideSize=0;
  let proto = Object.getPrototypeOf(this);
  if (!this.contents) {
    hideContainerProperties(proto,true);
    return;
  }
  hideContainerProperties(proto,false);
  core.setProperties(this.contents,this,containerProperties);
  if (this.border.topSize) { // borders might need areas to themselves
     topSize = this.border.topSize();
     bottomSize = this.border.bottomSize();
     sideSize = this.border.sideSize();
     this.contents.extraTopPadding = topSize;
     this.contents.extraBottomPadding = bottomSize;
    this.contents.extraSidePadding = sideSize;
  }
  // rearranging text is too expensive for every inheritor during a resize 
  if ((ui.controlActivity !== 'draggingResizeControl') || (this === (ui.controlled)))  {
    this.contents.update();
  }
 /* now, we omit the code for enlarging the container when the contents are too big, since this causes the user to lose control 
 of connection to the prototype
 The code is kept here , though for future reference
   if (this.dimension) {
    let maxDim = sideSize + Math.max(this.contents.width,this.contents.height);
    
    if (maxDim > this.dimension) {
      this.dimension = maxDim;
    }
    return;
  }
  if ((this.contents.width+sideSize)>this.width) {
    this.width = this.contents.width+sideSize;
  }
  if ((this.contents.height+topSize+bottomSize) > this.height) {
    this.height = this.contents.height+topSize+bottomSize;
  }
  */
}

item.containerInitialize = function () {
  if (this.borderP.initialize) {
    this.borderP.initialize();
  }
}

item.containerSetImage = function (image) {
  image.role = undefined;
  image.neverselectable = true;
  this.set('image',image);
};



item.containerTransferState = function (src,own) { //own = consider only the own properties of src
  core.setProperties(this,src,['text'],own);
  if (own) {
    let im = src.__get('image');
    if (im) {
     let newIm = core.deepCopy(im);
     newIm.__element = undefined;
     this.set('image',newIm);
    }
  }
  let borderProperties = this.borderProperties;
  if (borderProperties) {
    core.setProperties(this,src,borderProperties,own);
    let protos = core.isPrototype(this) && core.isPrototype(src);
    let outerFill,fill;
    if (own) {
      outerFill = src.__get('outerFill');
      fill = src.__get('fill');
    } else {
      outerFill = src.outerFill;
      fill = src.fill;
    }
    //special case transfer  fill to outerfill if outerfill is missing in the source, but present in the dest
    if ((outerFill === undefined) && (fill !== undefined) && (fill !== 'transparent') && borderProperties.includes('outerFill')) { 
        this.outerFill = src.fill;
    }

  }
  // to avoid disappearance eg of a rectangle when swapped for a shaded circle, for example
  const invis = function (vl) {
    return (typeof vl === undefined) || (vl === 'transparent');
  }
  if (invis(this.stroke) && invis(this.fill)){ 
    this.stroke = 'black';
  }
  if (src.textProperties) {
    core.setProperties(this.textProperties,src.textProperties,dom.textProperties,own);
  }
}


item.installContainerMethods = function (container,borderPP,contentsPP) {
  container.role = 'vertex';
  container.resizable = true;
  container.text = '';
  container.stdUpdate = this.containerUpdate;
  container.update = this.containerUpdate;
  container.initialize = this.containerInitialize;
  container.setImage = this.containerSetImage;
  container.transferState = this.containerTransferState;
  container.set('textProperties',core.lift(dom.defaultTextPropertyValues));
  core.setPropertiesIfMissing(container,this,contentProperties);
  container.textProperties.__setFieldType('stroke','svg.Rgb');
  ui.hide(container,['text','borderProperties','containerPropertiesShown','containerPropertiesHidden','border']);
  hideContainerProperties(container,true);
  container.initializePrototype = function () {
    core.assignPrototypes(this,'borderP',borderPP,'contentsP',contentsPP);
  }
}



ui.hide(item,['outline','singleLine','text','textarea','includeOutline','firstUpdate','plainText']);
item.setFieldType('fill','svg.Rgb');

const hasText = function () {return !!this.text};

item.showConditions  = {
  textProperties:hasText
}



return item;
});

