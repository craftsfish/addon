log("WeiKeQuan background is running");

var map = [
	[81500013740, 99999999],
	[81162947187, 55130],
];
var cur_order = 0;
var reg_jd_deliver = new RegExp("https:\/\/porder.shop.jd.com\/order\/singleOut\/.*\?selectedDelivery=2170$");
var t = new Date();
var delayPromise = {expireAt: -1, resolve: undefined, reject: undefined};
var tab = 0;
log(t.toDateString());
log(t.toTimeString());

function handleOrder() {
  cur_order++;
  if (cur_order >= map.length) {
    return
  }
  log(`handling: ${cur_order}/${map.length}`);
  browser.tabs.create({url:"https://porder.shop.jd.com/order/singleOut/"+map[cur_order][0]+"?selectedDelivery=2170"});
}

function createDelayPromise(timeout) {
  delayPromise.expireAt = new Date().getTime() + timeout;
  return new Promise((resolve, reject)=>{delayPromise.resolve = resolve; delayPromise.reject = reject});
}

function onJdOrderDone() {
  browser.tabs.sendMessage(tab, map[cur_order][1])
  .then(handleOrder);
}


/*
 * periodic task
 */
const delayInMinutes = 0;
const periodInMinutes = 0.05;
browser.alarms.create("my-periodic-alarm", {
  delayInMinutes,
  periodInMinutes
});

function handleAlarm(alarmInfo) {
  console.log("on alarm: " + alarmInfo.name);
  if (delayPromise.expireAt != -1) {
    if (new Date().getTime() > delayPromise.expireAt) {
      delayPromise.resolve("TimeOut");
      delayPromise.expireAt = -1;
    }
  }
}
browser.alarms.onAlarm.addListener(handleAlarm);


/* browser action handling */
function handleClick() {
  cur_order = -1;
  handleOrder()
}
browser.browserAction.onClicked.addListener(handleClick);

function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == "complete") { /* loading complete */
    if (tabInfo.url.match(reg_jd_deliver) != null) {
      log("正在处理订单: " + map[cur_order][0] + ", 快递单号: " + map[cur_order][1]);
      tab = tabId
      createDelayPromise(5*1000).then(onJdOrderDone)
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);
