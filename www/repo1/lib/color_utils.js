
/** 
 * Common code used to initialize colors by category from the pj.svg.stdColor dictionary
*/

'use strict';

(function () {
 
var item = pj.Object.mk();

item.initColors = function (target) {
  var categories = target.__data.categories;
  var cnt = 0;
  if (categories) {
    target.categorized = true;
    target.categoryCount = categories.length;
    if (!target.colorsInitialized) {
      categories.forEach(function (category) {
        target.setColorOfCategory(category, pj.svg.stdColor(cnt++));
      });
      target.colorsInitialized = true;
    }
  } else {
    target.categorized = false;
    target.categoryCount = 1;
  }
}
pj.returnValue(undefined,item);
})();

