(function () {
 
/** 
 * Common code used for management of the colors associated
 * with categories. Used in many charts  implementations.
 * A colors array target.colors 
 * is maintained, with one color for each category.
 * Assumed: the  methond setColorOfCategory does
 * the transfer for  one color, for each chart implementation
 * that uses this library.
*/ 
var item = pj.Object.mk();
item.setColors = function (target) {
  if (target.categorized) {
    target.data.categories.forEach(function (category) {
      var color = target.colors[category];
      target.setColorOfCategory(category,target.colors[category])
    });
  }
}
    
item.initColors = function (target) {
  var categories = target.data.categories;
  var cnt = 0;
  if (categories) {
    if (!target.colors) {
      target.set("colors",pj.Object.mk());
    }
    target.categorized = 1;
    target.categoryCount = categories.length;
    categories.forEach(function (category) {
      if (!target.colors[category]) {
        target.colors[category] = pj.svg.stdColor(cnt++);
      }
    });
  } else {
    target.categorized = 0;
    target.categoryCount = 1;
  }
}
pj.returnValue(undefined,item);
})();

