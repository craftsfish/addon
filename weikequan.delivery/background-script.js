log("WeiKeQuan background is running");

var map = [
	[81162507510, 55129],
	[81162947187, 55130],
];
var t = new Date();
log(t.toDateString());
log(t.toTimeString());

/* browser action handling */
function handleClick() {
  var t = new Date();
  log(t.toDateString());
  log(t.toTimeString());
}
browser.browserAction.onClicked.addListener(handleClick);
