log("WeiKeQuan background is running");

const ID_JD_DELIVER = 0;
const ID_WKQ_DELIVER = 1;
var map = [
  [81206086865,541547145089],
  [81526670018,541549335349],
  [81206072660,541547145241],
  [81527213124,541426977206],
  [81202485534,541549335501],
  [81205672340,541550150954],
  [81526669700,541424774672],
  [81525132451,541547673176],
  [81522749578,541550151036],
  [81524111011,541547673252],
  [81525583301,541426977284],
  [81203625589,541549335742],
  [81525074148,541424775076],
  [81203509974,541426205225],
  [81525115437,541547145886],
  [81203328791,541547673570],
  [81202464242,541426977447],
  [81203175156,541547673656],
  [81523075790,541424775152],
  [81522004257,541547673973],
  [81523509548,541547673732],
  [81202469204,541425855134],
  [81520024523,541424775315],
  [81521256965,541549336702],
  [81521419500,541550151516],
  [81520801956,541547146280],
  [81518905551,541550151675],
  [81517319203,541547674296],
  [81515867371,541547146442],
  [81515097835,541550152079],
  [81509803808,541424775950],
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
  browser.tabs.create({url:"https://qqq.wkquan2018.com/Fine/VTask"});
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
  browser.tabs.remove(Pages[ID_JD_DELIVER].tabId);
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
  browser.tabs.create({url:"https://porder.shop.jd.com/order/singleOut/"+map[cur_order][0]+"?selectedDelivery=2170"});
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
