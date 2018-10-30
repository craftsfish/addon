log("WeiKeQuan background is running");

const ID_JD_DELIVER = 0;
const ID_WKQ_DELIVER = 1;
var reg_jd_deliver = new RegExp("https:\/\/porder.shop.jd.com\/order\/singleOut\/.*\?selectedDelivery=2170$");
var reg_wkq_deliver = new RegExp("https:\/\/qqq.wkquan2018.com\/Fine\/VTask");

var map = [
	[81162947187, 55130],
	[81506877675, ''],
];
var cur_order = 0;
var tab = -1;
var delayPromise = {expireAt: -1, resolve: undefined, reject: undefined};
var wkq_query = false

function createDelayPromise(timeout) {
  delayPromise.expireAt = new Date().getTime() + timeout;
  return new Promise((resolve, reject)=>{delayPromise.resolve = resolve; delayPromise.reject = reject});
}

function onJdDeliveryError(error) {
  err(error);
  openWkq()
}

function handleOrder() {
  startJdDelivery()
  .then(onJdLoaded)
  .then(openSupplierCandidates)
  .then(selectSupplier)
  .then(setExpressId)
  .then(deliver)
  .then(openWkq)
  .catch(onJdDeliveryError);
}

function wkq_init() {
  wkq_query = true
  return sndMsg(tab, 'init', map[cur_order][0])
}

function openWkq() {
  browser.tabs.create({url:"https://qqq.wkquan2018.com/Fine/VTask"});
}

function deliver() {
  return sndMsg(tab, 'deliver', null)
}

function setExpressId() {
  return sndMsg(tab, 'setExpressId', map[cur_order][1])
}

function selectSupplier() {
  return sndMsg(tab, 'selectSupplier', null)
}

function openSupplierCandidates() {
  return sndMsg(tab, 'openSupplierCandidates', null)
}

function onJdLoaded() {
  return createDelayPromise(1*1000);
}

function startJdDelivery() {
  cur_order++;
  if (cur_order >= map.length) {
    return
  }
  browser.tabs.create({url:"https://porder.shop.jd.com/order/singleOut/"+map[cur_order][0]+"?selectedDelivery=2170"});
  return new Promise((resolve, reject) => {Pages[ID_JD_DELIVER].resolve = resolve;});
}

function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == "complete") { /* loading complete */
    if (tabInfo.url.match(reg_jd_deliver) != null) {
      log("京东出库: " + map[cur_order][0] + ", 快递单号: " + map[cur_order][1]);
      tab = tabId
      createDelayPromise(1*1000)
      .then(openSupplierCandidates)
      .then(selectSupplier)
      .then(setExpressId)
      .then(deliver)
      .then(openWkq)
      .catch(onError);
    } else if (tabInfo.url.match(reg_wkq_deliver) != null) {
      log("威客圈出库: " + map[cur_order][0] + ", 快递单号: " + map[cur_order][1]);
      tab = tabId
      if (!wkq_query) {
        wkq_init()
      } else {
        wkq_query = false
      }
    }
  }
}

/*
 * Tabs Updated Handling
 */
var Pages = [
  {name:"jd_deliver", regexp: new RegExp("https:\/\/porder.shop.jd.com\/order\/singleOut\/.*\?selectedDelivery=2170$")},
  {name:"wkq_deliver", regexp: new RegExp("https:\/\/qqq.wkquan2018.com\/Fine\/VTask")},
];

function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status != "complete") { /* loading complete */
    return
  }

  var i = 0;
  for (i=0; i<Pages.length; i++) {
    if (tabInfo.url.match(Pages[i].regexp) != null) {
      Pages[i].tabId = tabId;
      if (Pages[i].resolve) {
        Pages[i].resolve("ok");
        Pages[i].resolve = undefined;;
      }
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);

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
  //console.log("on alarm: " + alarmInfo.name);
  if (delayPromise.expireAt != -1) {
    if (new Date().getTime() > delayPromise.expireAt) {
      delayPromise.resolve("TimeOut");
      delayPromise.expireAt = -1;
    }
  }
}
browser.alarms.onAlarm.addListener(handleAlarm);

/* interaction with content scripts */
function sndMsg(id, a, d) {
  log(`send message to ${id} : action is ${a}, data is ${d}`);
  return browser.tabs.sendMessage(id, {action: a, data: d});
}

/* browser action handling */
function handleClick() {
  cur_order = -1;
  handleOrder()
}
browser.browserAction.onClicked.addListener(handleClick);

function onError(error) {
  err(`Error: ${error}`);
  openWkq()
}
