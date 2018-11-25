log("TMall Keyword background is running");

var candidates = [
	['日本泰福高焖烧杯女焖烧壶闷烧罐锅不锈钢焖粥神器超长保温饭盒桶', []],
];

/* browser action handling */
function handleClick() {
  var _key = candidates[0][0]
  var _elements = candidates[0][1]
  _elements[0] = 'a'
  _elements[1] = 'b'
  log(_key)
  log(_elements)
}
browser.browserAction.onClicked.addListener(handleClick);
