log("WeiKeQuan background is running");

const ID_JD_DELIVER = 0;
const ID_WKQ_DELIVER = 1;
var map = [
	[81529223718, ''],
	[81506877675, ''],
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

function wkq_open_delivery_dialog() {
  return sndMsg(ID_WKQ_DELIVER, 'open', null)
}

function wkq_on_init() {
  return new Promise((resolve, reject) => {Pages[ID_WKQ_DELIVER].resolve = resolve;});
}

function wkq_init() {
  return sndMsg(ID_WKQ_DELIVER, 'init', map[cur_order][0])
}

function startWkqDelivery() {
  browser.tabs.create({url:"https://qqq.wkquan2018.com/Fine/VTask"});
  return new Promise((resolve, reject) => {Pages[ID_WKQ_DELIVER].resolve = resolve;})
    .then(wkq_init)
    .then(wkq_on_init)
    .then(wkq_open_delivery_dialog);
}

function onJdDeliveryError(error) {
  err(error);
  browser.tabs.remove(Pages[ID_JD_DELIVER].tabId);
  startWkqDelivery();
}

function remove_jd_tab() {
  browser.tabs.remove(Pages[ID_JD_DELIVER].tabId);
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
  browser.tabs.create({url:"https://porder.shop.jd.com/order/singleOut/"+map[cur_order][0]+"?selectedDelivery=2170"});
  return new Promise((resolve, reject) => {Pages[ID_JD_DELIVER].resolve = resolve;})
    .then(delay_1)
    .then(openSupplierCandidates)
    .then(selectSupplier)
    .then(setExpressId)
    .then(deliver)
    .then(delay_1)
    .then(remove_jd_tab)
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
  startJdDelivery()
}
browser.browserAction.onClicked.addListener(handleClick);
