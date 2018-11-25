log("WeiKeQuan background is running");

const ID_JD_DELIVER = 0;
const ID_WKQ_DELIVER = 1;
var map = [
[81811853977,541797531991],
[81816960114,541671869550],
[81817247479,541797531913],
[81816372722,541671869636],
[82226976709,541674480406],
[81809868409,541674480489],
[82226062380,541673310017],
[82224258498,541673310095],
[82222918987,541673976028],
[81800459323,541673976104],
[82223274882,541671869712],
];
var cur_order = 0;
var delayPromise = {expireAt: -1, resolve: undefined, reject: undefined};

function createDelayPromise(timeout) {
  delayPromise.expireAt = new Date().getTime() + timeout;
  return new Promise((resolve, reject)=>{delayPromise.resolve = resolve; delayPromise.reject = reject});
}

function delay_1() {
  return createDelayPromise(1*1000);
}

function onWkqDeliveryError(error) {
  err(error);
  //browser.tabs.remove(Pages[ID_WKQ_DELIVER].tabId);
  startJdDelivery();
}

function wkq_remove_tab() {
  return browser.tabs.remove(Pages[ID_WKQ_DELIVER].tabId);
}

function wkq_select_supplier() {
  return sndMsg(ID_WKQ_DELIVER, 'select', map[cur_order][1])
}

function wkq_get_order_info() {
  return sndMsg(ID_WKQ_DELIVER, 'getOrders', null)
}

function wkq_on_init() {
  return new Promise((resolve, reject) => {Pages[ID_WKQ_DELIVER].resolve = resolve;});
}

function wkq_init() {
  return sndMsg(ID_WKQ_DELIVER, 'init', null)
}

function startWkqDelivery() {
  browser.tabs.create({active:false, url:"https://qqq.wkquan2018.com/Fine/VTask"});
  return new Promise((resolve, reject) => {Pages[ID_WKQ_DELIVER].resolve = resolve;})
    .then(wkq_init)
    .then(wkq_on_init)
    .then(wkq_get_order_info)
//    .then(delay_1)
//    .then(wkq_select_supplier)
//    .then(delay_1)
//    .then(startJdDelivery)
//    .catch(onWkqDeliveryError);
}

function onJdDeliveryError(error) {
  err(error);
  //browser.tabs.remove(Pages[ID_JD_DELIVER].tabId);
  startWkqDelivery();
}

function remove_jd_tab() {
  return browser.tabs.remove(Pages[ID_JD_DELIVER].tabId);
}

function deliver() {
  return sndMsg(ID_JD_DELIVER, 'deliver', null)
}

function setExpressId() {
  return sndMsg(ID_JD_DELIVER, 'setExpressId', map[cur_order][1])
}

function selectSupplier() {
  return sndMsg(ID_JD_DELIVER, 'selectSupplier', null)
}

function openSupplierCandidates() {
  return sndMsg(ID_JD_DELIVER, 'openSupplierCandidates', null)
}

function startJdDelivery() {
  cur_order++;
  if (cur_order >= map.length) {
    return
  }
  browser.tabs.create({active:false, url:"https://porder.shop.jd.com/order/singleOut/"+map[cur_order][0]+"?selectedDelivery=2170"});
  return new Promise((resolve, reject) => {Pages[ID_JD_DELIVER].resolve = resolve;})
    .then(delay_1)
    .then(openSupplierCandidates)
    .then(selectSupplier)
    .then(delay_1)
    .then(setExpressId)
    .then(startWkqDelivery)
    .catch(onJdDeliveryError);
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

  log("loadcomplete")
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
  log(`send message to ${Pages[id].name} : action is ${a}, data is ${d}`);
  return browser.tabs.sendMessage(Pages[id].tabId, {action: a, data: d});
}

/* browser action handling */
function handleClick() {
  cur_order = -1;
  startWkqDelivery()
}
browser.browserAction.onClicked.addListener(handleClick);
