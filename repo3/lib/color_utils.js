(function () {
 
/** 
 * Common code used to initialize colors by category from the pj.svg.stdColor dictionary
*/ 
var item = pj.Object.mk();

item.initColors = function (target) {
  var categories = target.data.categories;
  var cnt = 0;
  if (categories && !target.colorsInitialized) {
    target.categorized = 1;
    target.categoryCount = categories.length;
    categories.forEach(function (category) {
      target.setColorOfCategory(category, pj.svg.stdColor(cnt++));
    target.colorsInitialized = 1;
    });
  } else {
    target.categorized = 0;
    target.categoryCount = 1;
  }
}
pj.returnValue(undefined,item);
})();

