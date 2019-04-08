
// many basic shapes optionally include text, and so are groups in SVG

core.require('/text/textarea.js','/text/combo.js',function (textareaP,combo) {

let item = dom.SvgElement.mk('<g/>');

/* adjustable parameters */
item.width = 50;
item.height = 35;
item.fill = 'black';
item['font-style'] = "normal";
item['font-size'] = "12";
item.minDimension = 10; // a standard value conveyed up to the container
item.topPadding = 0;
item.vSep = 5; // between image and text
item.bottomPadding = 0;
item.sidePadding = 7;
item.lineSep = 5;
item["font-family"] = "arial";
item["font-weight"]="normal";
/*end adjustable parameters*/


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
    //let imFraction = 1/2; // top fraction allocated to the image
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
   // let imHeightAvail = imFraction * this.height;
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
    // for dummied image
    //image.setDomAttribute('x',-0.5*imWidth);
    //image.setDomAttribute('y',-0.5*imHeight);
    
    let midIm = textHeight?(-0.5*itm.height+itm.topPadding+0.5*imHeight):0;
    image.moveto(geom.Point.mk(0,midIm));
    if (textHeight) {
      let midText = 0.5*itm.height - bottomPadding - 0.5*textHeight;
      //console.log('HHH',this.height,vPadding,textHeight,midText);
      textItem.moveto(geom.Point.mk(0,midText));
    }
  }

item.firstUpdate = true;
item.update = function (whichExtent) {
  combo.updateCombo(this,whichExtent,dealWithImage);
}


let minBorderProperties = ['width','height','dimension','stroke','fill','stroke-width'];
let contentProperties = ['sidePadding','topPadding','vSep','bottomPadding','minDimension'];
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
    //this.border.unselectable = true;
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
      //this.contents.unselectable = true;
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
    //this.contents.text = this.text;
   
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
  core.setProperties(this.contents,this,containerProperties);//['topPadding','vSep','bottomPadding','sidePadding','lineSep']);
  if (this.border.topSize) { // borders might need areas to themselves
     topSize = this.border.topSize();
     bottomSize = this.border.bottomSize();
     sideSize = this.border.sideSize();
     this.contents.extraTopPadding = topSize;
     this.contents.extraBottomPadding = bottomSize;
    this.contents.extraSidePadding = sideSize;
  }
  this.contents.update();
  return; // now, we omit the code for enlarging the container when the contents are too big, since this causes the user to lose control of connection to the prototype
 // The code is kept, though for future reference
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
}

item.containerSetImage = function (image) {
  image.role = undefined;
  //image.unselectable = true;
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
  }
  if (src.textProperties) {
    core.setProperties(this.textProperties,src.textProperties,dom.textProperties,own);
  }
}





item.installContainerMethods = function (container,iborderPP,icontentsPP) {
   container.stdUpdate = this.containerUpdate;
   container.setImage = this.containerSetImage;
   container.transferState = this.containerTransferState;
   //container.initialize = this.containerInit;
   container.set('textProperties',core.lift(dom.defaultTextPropertyValues));
   borderPP = iborderPP;
   contentsPP = icontentsPP;
   core.setPropertiesIfMissing(container,this,contentProperties);
   container.textProperties.__setFieldType('stroke','svg.Rgb');
   ui.hide(container,['text','borderProperties','containerPropertiesShown','containerPropertiesHidden','border']);
   hideContainerProperties(container,true);

}



ui.hide(item,['outline','singleLine','text','textarea','includeOutline','firstUpdate','plainText']);
item.setFieldType('fill','svg.Rgb');

const hasText = function () {return !!this.text};

item.showConditions  = {
  textProperties:hasText
}



return item;
});

