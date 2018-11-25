log("TMall Keyword background is running");

var candidates = [
	['日本泰福高焖烧杯女焖烧壶闷烧罐锅不锈钢焖粥神器超长保温饭盒桶', []],
];

/* browser action handling */
function handleClick() {
  log(candidates[0][0])
}
browser.browserAction.onClicked.addListener(handleClick);
