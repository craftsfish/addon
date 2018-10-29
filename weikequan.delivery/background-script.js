log("WeiKeQuan background is running");

var map = [
	[81500013740, 55129],
	[81162947187, 55130],
];
var cur_order = 0;
var reg_jd_deliver = new RegExp("https:\/\/porder.shop.jd.com\/order\/singleOut\/.*\?selectedDelivery=2170$");
var t = new Date();
log(t.toDateString());
log(t.toTimeString());

/* browser action handling */
function handleClick() {
    cur_order = 0;
    log(`handling: ${cur_order}/${map.length}`);
    browser.tabs.create({url:"https://porder.shop.jd.com/order/singleOut/"+map[cur_order][0]+"?selectedDelivery=2170"});
}
browser.browserAction.onClicked.addListener(handleClick);

function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == "complete") { /* loading complete */
    if (tabInfo.url.match(reg_jd_deliver) != null) {
        log("================================" + tabInfo.url + cur_order);
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);