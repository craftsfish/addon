log("WeiKeQuan background is running");

const ID_JD_DELIVER = 0;
const ID_WKQ_DELIVER = 1;
var map = [
  [81218656319,541437526426],
  [81219510418,541561407279],
  [81548316238,541435996191],
  [81546554056,541437526507],
  [81217084190,541558426286],
  [81219470678,541437526661],
  [81545573256,541438291846],
  [81545678240,541561407518],
  [81545655747,541559010137],
  [81544864968,541437056256],
  [81546355919,541437056419],
  [81218546743,541558426362],
  [81546034213,541437056497],
  [81542902698,541435996436],
  [81215367902,541558426449],
  [81544872487,541559010291],
  [81543684929,541561407596],
  [81217232817,541437526824],
  [81201942555,541437526906],
  [81216201426,541559010378],
  [81215026012,541437526989],
  [81222344600,541438292009],
  [81216955028,541435996517],
  [81541125323,541559010536],
  [81215950518,541558426525],
  [81209572729,541558426601],
  [81214040063,541560593906],
  [81215416342,541558426680],
  [81540618433,541438292163],
  [81215125878,541560594141],
  [81541898156,541560593989],
  [81542081453,541561407911],
  [81537654345,541437056573],
  [81210986526,541438292240],
  [81539273388,541437056650],
  [81213041974,541435996595],
  [81530732198,541438292402],
  [81207694484,541437056736],
  [81207171601,541559010617],
  [81527692873,541559010695],
  [81527192872,541437527141],
  [81529223718,541560594304],
  [81527532643,541561408152],
  [81211966136,541559010771],
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
  browser.tabs.create({active:false, url:"https://qqq.wkquan2018.com/Fine/VTask"});
  return new Promise((resolve, reject) => {Pages[ID_WKQ_DELIVER].resolve = resolve;})
    .then(wkq_init)
    .then(wkq_on_init)
    .then(wkq_open_delivery_dialog)
    .then(delay_1)
    .then(wkq_select_supplier)
    .then(delay_1)
    .then(startJdDelivery)
    .catch(onWkqDeliveryError);
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
  startJdDelivery()
}
browser.browserAction.onClicked.addListener(handleClick);
