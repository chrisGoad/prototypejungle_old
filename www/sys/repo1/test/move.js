(function () {
  var svg = pj.svg;
   var item = pj.svg.Element.mk('<g/>');
   item.set("rect1",svg.Element.mk(
  '<rect x="-50" y="-50" width="100" height="100" fill="red" stroke="black"'+
   ' stroke-width="3"/>'));
   item.rect1.__draw();
  item.set("rect2",svg.Element.mk(
  '<rect x="-10" y="-10" width="20" height="20" fill="yellow" stroke="black"'+
   ' stroke-width="3"/>'));

   pj.returnValue(undefined,item);
})();
