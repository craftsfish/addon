log("WeiKeQuan background is running");

const ID_WKQ_DELIVER = 0;
var delayPromise = {expireAt: -1, resolve: undefined, reject: undefined};

/*
 * Tabs Updated Handling
 */
var Pages = [
  {name:"wkq_deliver", regexp: new RegExp("https:\/\/qqq.wkquan2018.com\/Fine\/VTask")},
];

function createDelayPromise(timeout) {
  delayPromise.expireAt = new Date().getTime() + timeout;
  return new Promise((resolve, reject)=>{delayPromise.resolve = resolve; delayPromise.reject = reject});
}

function delay_1() {
  return createDelayPromise(1*1000);
}

function wkq_get_order_info() {
  return sndMsg(ID_WKQ_DELIVER, 'getOrders', null)
}

function wkq_on_init() {
  new Promise((resolve, reject) => {Pages[ID_WKQ_DELIVER].resolve = resolve;})
    .then(wkq_load_content_script)
    .then(wkq_get_order_info)
  return true
}

function wkq_init() {
  return sndMsg(ID_WKQ_DELIVER, 'init', null)
}

function wkq_load_content_script() {
  browser.tabs.executeScript(Pages[ID_WKQ_DELIVER].tabId, {file: '/common.js'})
  browser.tabs.executeScript(Pages[ID_WKQ_DELIVER].tabId, {file: '/jquery/jquery-1.4.min.js'})
  return browser.tabs.executeScript(Pages[ID_WKQ_DELIVER].tabId, {file: 'content-script-wkq.js'})
}

function startWkqDelivery() {
  browser.tabs.create({active:false, url:"https://qqq.wkquan2018.com/Fine/VTask"});
  return new Promise((resolve, reject) => {Pages[ID_WKQ_DELIVER].resolve = resolve;})
    .then(wkq_load_content_script)
    .then(wkq_init)
    .then(wkq_on_init)
}

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
  startWkqDelivery()
}
browser.browserAction.onClicked.addListener(handleClick);
