const ID_FAKE = 0;
const ID_DETAIL = 1;
const ID_JD = 2;
const ID_ORDER = 3;
const ID_OUT = 4;
const ID_EXPRESS = 5;
const ID_POSTID = 6;
const ID_JDLOGIN = 7;
const taskDelay = 5*60*1000;

var total = -1;
var cur = -1;
var fakeID = "";
var orderID = "";
var address = "";
var postID = "";
var active = 0;
var delayPromise = {expireAt: -1, resolve: undefined, reject: undefined};
var jd_auto_login = 0;

function createDelayPromise(timeout) {
  delayPromise.expireAt = new Date().getTime() + timeout;
  return new Promise((resolve, reject)=>{delayPromise.resolve = resolve; delayPromise.reject = reject});
}

/* browser action handling */
function handleClick() {
  if (active == 0) {
    startProcessing();
    active = 1;
  } else {
    active = 0;
  }
}
browser.browserAction.onClicked.addListener(handleClick);

/* order handling */
function onOrderError(error) {
  err(`Error: ${error}`);
  cur++;
  handleOrders();
}

function onSureDone(m) {
  log("Confirm fakeorder done completed!");
  total--;
  handleOrders();
}

function onSureDoneIssued(m) {
  log("Confirm fakeorder done issued!");
  return new Promise((resolve, reject) => {Pages[ID_FAKE].resolve = resolve;});
}

function onMarkDone(m) {
  log("Mark fakeorder done completed!");
  return sndMsg(ID_FAKE, "sureDone");
}

function onMarkDoneIssued(m) {
  log("Mark fakeorder done issued!");
  return createDelayPromise(5*1000);
}

function onBack2JD() {
  log("Back to JDOverview completed!");
  return sndMsg(ID_FAKE, "markDone", {cur: cur, fakeID: fakeID});
}

function onBack2JDIssued() {
  log("Back to JDOverview issued!");
  return new Promise((resolve, reject) => {Pages[ID_JD].resolve = resolve;});
}

function onOutOrderComplete() {
  log("Out order request complete!");
  return sndMsg(ID_OUT, "back");
}

function onOutOrder() {
  log("Out order request issued!");
  return createDelayPromise(5*1000);
}

function onOutComplete() {
  log("JDOutput loaded!");
  return sndMsg(ID_OUT, "outOrder", postID);
}

function onOutIssued() {
  log("JDOutput load request issued!");
  return new Promise((resolve, reject) => {Pages[ID_OUT].resolve = resolve;});
}

function onGetPostIDComplete() {
  log("Get express id complete!");
  return sndMsg(ID_JD, "out");
}

function onGetPostIDIssued(m) {
  log("Get express id issued!");
  postID = m;
  log(m);
  return new Promise((resolve, reject) => {Pages[ID_EXPRESS].resolve = resolve;});
}

function onExpressIDLoaded() {
  log("ExpressResult loaded!");
  return sndMsg(ID_POSTID, "getPostID");
}

function onGetExpressIDIssued() {
  log("Compose express complete!");
  return new Promise((resolve, reject) => {Pages[ID_POSTID].resolve = resolve;});
}

function onOrderClose() {
  log("JDDetail closed!");
  return sndMsg(ID_EXPRESS, "getExpressID", address);
}

function onOrderCloseDelayed() {
  log("Close JDDetail issued!");
  return browser.tabs.remove(Pages[ID_ORDER].tabId);
}

function onGetAddress(m) {
  log("Get address complete");
  address = m;
  return createDelayPromise(1*1000);
}

function onMobileShowed() {
  log("Show mobile number complete !");
  return sndMsg(ID_ORDER, "getAddress");
}

function onShowMobile() {
  log("Show mobile number issued!");
  return createDelayPromise(2*1000);
}

function onOrderOpened(m) {
  log("JDDetail opened!");
  return sndMsg(ID_ORDER, "showMobile");
}

function onOpenOrderIssued(m) {
  log("Open JDDetail issued!");
  return new Promise((resolve, reject) => {Pages[ID_ORDER].resolve = resolve;});
}

function onSetMark(m) {
  log("Mark updated!");
  return sndMsg(ID_JD, "openOrder", orderID);
}

function onEditMark(m) {
  log("Edit mark pop launched!");
  return sndMsg(ID_JD, "setMark");
}

function onQueryResult(m) {
  log("Query order request complete!");
  return sndMsg(ID_JD, "editMark", orderID);
}

function onQeuryIssued(m) {
  log("Query order request issued!");
  return new Promise((resolve, reject) => {Pages[ID_JD].resolve = resolve;});
}

function onDetailClosed(m) {
  log("FakeDetail closed!");
  return sndMsg(ID_JD, "queryOrder", orderID);
}

function onDetailCloseDelayed(m) {
  log("FakeDetail close request issued!");
  return browser.tabs.remove(Pages[ID_DETAIL].tabId);
}

function onOrderGet(m) {
  log(`Order ID get : ${m}`);
  orderID = m;
  return createDelayPromise(1*1000);
}

function onDetailLoad() {
  log("FakeDetail is loaded!");
  return sndMsg(ID_DETAIL, "getOrderID");
}

function onOpeningDetail(m) {
  log(`FakeOrder ${m} is opening!`);
  fakeID = m;
  return new Promise((resolve, reject) => {Pages[ID_DETAIL].resolve = resolve;});
}

function handleOrders() {
  if ((cur >= total) || (active == 0)) {
    log("stop processing");
    port.postMessage("ping");
    createDelayPromise(taskDelay).then(startProcessing);
    return;
  }

  log(`handling: ${cur}/${total}`);
  sndMsg(ID_FAKE, "openDetail", cur)
  .then(onOpeningDetail)
  .then(onDetailLoad)
  .then(onOrderGet)
  .then(onDetailCloseDelayed)
  .then(onDetailClosed)
  .then(onQeuryIssued)
  .then(onQueryResult)
  .then(onEditMark)
  .then(onSetMark)
  .then(onOpenOrderIssued)
  .then(onOrderOpened)
  .then(onShowMobile)
  .then(onMobileShowed)
  .then(onGetAddress)
  .then(onOrderCloseDelayed)
  .then(onOrderClose)
  .then(onGetExpressIDIssued)
  .then(onExpressIDLoaded)
  .then(onGetPostIDIssued)
  .then(onGetPostIDComplete)
  .then(onOutIssued)
  .then(onOutComplete)
  .then(onOutOrder)
  .then(onOutOrderComplete)
  .then(onBack2JDIssued)
  .then(onBack2JD)
  .then(onMarkDoneIssued)
  .then(onMarkDone)
  .then(onSureDoneIssued)
  .then(onSureDone)
  .catch(onOrderError);
}

/* overall information handling */
function onTotalReceived(m){
  log(`Total fakeorder number received : ${m}`);
  cur = 0;
  total = m;
  handleOrders();
}

function onEmptyReload() {
  log("ExpressComposer reloaded!");
  return sndMsg(ID_FAKE, "queryTotal");
}

function onEmptyFound(tabs) {
  if (tabs.length == 1) {
    browser.tabs.update(tabs[0].id, {active: true});
    browser.tabs.reload(tabs[0].id);
    return new Promise((resolve, reject) => {Pages[ID_EXPRESS].resolve = resolve;});
  } else {
    log("Create new instance of ExpressComposer");
    browser.tabs.create({url:"http://www.pianyilo.com/flow.php?step=checkout&id=52"});
    return new Promise((resolve, reject) => {Pages[ID_EXPRESS].resolve = resolve;});
  }
}

function onFakeOrderReload() {
  log("FakeOverview reloaded!");
  return browser.tabs.query({currentWindow: true, url: [
    "http://www.pianyilo.com/flow.php?step=checkout&id=52"
  ]});
}

function onFakeOrderFound(tabs) {
  if (tabs.length == 1) {
    browser.tabs.update(tabs[0].id, {active: true});
    browser.tabs.reload(tabs[0].id);
    return new Promise((resolve, reject) => {Pages[ID_FAKE].resolve = resolve;});
  } else {
    log("Create new instance of FakeOverview");
    browser.tabs.create({url:"http://www.dasbu.com/seller/order/jd?ss%5Bstatus%5D=2&ss%5Bstart%5D="});
    return new Promise((resolve, reject) => {Pages[ID_FAKE].resolve = resolve;});
  }
}

function onJDReload() {
  log("JDOverview reloaded!");
  return browser.tabs.query({currentWindow: true, url: [
    "http://www.dasbu.com/seller/order/jd?ss%5Bstatus%5D=2&ss%5Bstart%5D="
  ]});
}

function onJDFound(tabs) {
  jd_auto_login = 1;
  if (tabs.length == 1) {
    browser.tabs.update(tabs[0].id, {active: true});
    browser.tabs.reload(tabs[0].id);
    return new Promise((resolve, reject) => {Pages[ID_JD].resolve = resolve;});
  } else {
    log("Create new instance of JDOverview");
    browser.tabs.create({url:"https://order.shop.jd.com/order/sopUp_waitOutList.action"});
    return new Promise((resolve, reject) => {Pages[ID_JD].resolve = resolve;});
  }
}

function onError(error) {
  err(`Error: ${error}`);
  log("stop processing");
  port.postMessage("ping");
  createDelayPromise(taskDelay).then(startProcessing);
}

function startProcessing() {
  log("start processing");

  cur = 0;
  total = 0;
  browser.tabs.query({currentWindow: true, url: [
    "https://order.shop.jd.com/order/sopUp_waitOutList.action*"
  ]})
  .then(onJDFound)
  .then(onJDReload)
  .then(onFakeOrderFound)
  .then(onFakeOrderReload)
  .then(onEmptyFound)
  .then(onEmptyReload)
  .then(onTotalReceived)
  .catch(onError);
}

/*
 * Tabs Updated Handling
 */
var Pages = [
  {name:"FakeOverview", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller\/order\/jd\\\?ss%5Bstatus%5D=2&ss%5Bstart%5D=.*$")},
  {name:"FakeDetail", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller\/order\/detail.*$")},
  {name:"JDOverview", regexp: new RegExp("^https:\/\/order.shop.jd.com\/order\/sopUp_waitOutList.action.*$")},
  {name:"JDDetail", regexp: new RegExp("^https:\/\/neworder.shop.jd.com\/order\/orderDetail\\\?orderId=.*$")},
  {name:"JDOutput", regexp: new RegExp("^https:\/\/order.shop.jd.com\/order\/sopUp_oneOut.action\\\?.*$")},
  {name:"ExpressComposer", regexp: new RegExp("^http:\/\/www.pianyilo.com\/flow.php\\\?step=checkout&id=52.*$")},
  {name:"ExpressResult", regexp: new RegExp("^http:\/\/www.pianyilo.com\/flow.php\\\?step=orderck.*$")},
  {name:"JDLogin", regexp: new RegExp("^https:\/\/passport.shop.jd.com\/login\/index.action\\\?.*$")}
];

function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == "complete") { /* loading complete */
    //log("========> onTabsUpdated complete");
    //console.log(changeInfo);
    //console.log(tabInfo);

    var i = 0;
    for (i=0; i<Pages.length; i++) {
      if (tabInfo.url.match(Pages[i].regexp) != null) {
 //       log("================================" + Pages[i].name + "loaded");
        Pages[i].tabId = tabId;
        if (Pages[i].resolve) {
          Pages[i].resolve("ok");
          Pages[i].resolve = undefined;;
        }

        if ((i == ID_JDLOGIN) && (jd_auto_login)){
          log("jd login complete!");
          jdLogin();
          jd_auto_login = 0;
        }
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
//  console.log("on alarm: " + alarmInfo.name);
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

/*
On startup, connect to the "ping_pong" app.
*/
var port = browser.runtime.connectNative("ping_pong");

/*
Listen for messages from the app.
*/
port.onMessage.addListener((response) => {
  log("Received Native App Message: " + response);
  if (response == "inputUser ok") {
    resolve_jdlogin("ok");
    resolve_jdlogin = undefined;
  } else if (response == "inputPassword ok") {
    resolve_jdlogin("ok");
    resolve_jdlogin = undefined;
  }
});

port.onDisconnect.addListener((p) => {
  if (p.error) {
    log(`Disconnected due to an error: ${p.error.message}`);
  }
});
