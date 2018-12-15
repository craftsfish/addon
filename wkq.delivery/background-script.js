log("WeiKeQuan background is running");

const ID_JD_DELIVER = 0;
const ID_WKQ_DELIVER = 1;
var map = [
83309349390,
83307474926,
83298810823,
82399215803,
82410878111,
83293593415,
82416330970,
83254703271,
82966524719,
82278001300,
];
var cur_order = 0;
var delayPromise = {expireAt: -1, resolve: undefined, reject: undefined};
var cur_express_info;

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
  browser.tabs.remove(Pages[ID_JD_DELIVER].tabId);
  return sndMsg(ID_WKQ_DELIVER, 'select', cur_express_info)
}

function wkq_open_delivery_dialog() {
  return sndMsg(ID_WKQ_DELIVER, 'open', null)
}

function wkq_on_init() {
  return new Promise((resolve, reject) => {Pages[ID_WKQ_DELIVER].resolve = resolve;});
}

function wkq_init() {
  return sndMsg(ID_WKQ_DELIVER, 'init', map[cur_order])
}

function startWkqDelivery(data) {
  cur_express_info = data
  log(data)
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

function getDeliverInfo() {
  return sndMsg(ID_JD_DELIVER, 'getDeliverInfo', null)
}

function openSupplierCandidates() {
  return sndMsg(ID_JD_DELIVER, 'openSupplierCandidates', null)
}

function startJdDelivery() {
  cur_order++;
  if (cur_order >= map.length) {
    return
  }
  browser.tabs.create({active:false, url:"https://neworder.shop.jd.com/order/orderDetail?orderId="+map[cur_order]});
  return new Promise((resolve, reject) => {Pages[ID_JD_DELIVER].resolve = resolve;})
    .then(delay_1)
    .then(getDeliverInfo)
    .then(startWkqDelivery)
}

/*
 * Tabs Updated Handling
 */
var Pages = [
  {name:"jd_deliver", regexp: new RegExp("^https:\/\/neworder.shop.jd.com\/order\/orderDetail\\\?orderId=.*$")},
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
