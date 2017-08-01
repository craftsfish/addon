const ID_FAKE = 0;
const ID_DETAIL = 1;
const ID_JD = 2;
const ID_ORDER = 3;
const taskDelay = 5*60*1000;

var total = -1;
var cur = -1;
var orderID = "59868468133";
var delayPromise = {expireAt: -1, resolve: undefined, reject: undefined};

function createDelayPromise(timeout) {
  delayPromise.expireAt = new Date().getTime() + timeout;
  return new Promise((resolve, reject)=>{delayPromise.resolve = resolve; delayPromise.reject = reject});
}

/* fire progress immediately */
createDelayPromise(0)
.then(startProcessing);

function onOrderError(error) {
  console.log(`Error: ${error}`);
  cur++;
  handleOrders();
}

function onSureDone(m) {
  log("=========================> sure done!");
  total--;
  handleOrders();
}

function onSureDoneIssued(m) {
  log("=========================> sure done issued!");
  return new Promise((resolve, reject) => {Pages[ID_FAKE].resolve = resolve;});
}

function onMarkDone(m) {
  log("=========================> mark done!");
  return sndMsg(ID_FAKE, "sureDone");
}

function onMarkDoneIssued(m) {
  log("=========================> mark done issued!");
  return createDelayPromise(5*1000);
}

function onSetMark(m) {
  log("=========================> set mark complete!");
  return sndMsg(ID_FAKE, "markDone");
}

function onEditMark(m) {
  log("=========================> edit mark pop launched!");
  return sndMsg(ID_JD, "setMark");
}

function onShowMobile() {
  log("=========================> show launched!");
  throw new Error("xxxxxxxxxxxxxxxxxxxxxxxxxxx");
}

function onOrderOpened(m) {
  log("=========================> order opened!");
  return sndMsg(ID_ORDER, "showMobile");
}

function onOpenOrderIssued(m) {
  log("=========================> open order issued!");
  return new Promise((resolve, reject) => {Pages[ID_ORDER].resolve = resolve;});
}

function onQueryResult(m) {
  log("=========================> query result!");
  return sndMsg(ID_JD, "openOrder", orderID);
  //return sndMsg(ID_JD, "editMark", orderID);
}

function onQeuryIssued(m) {
  log("=========================> query issued!");
  return new Promise((resolve, reject) => {Pages[ID_JD].resolve = resolve;});
}

function onDetailClosed(m) {
  log("=========================> detail closed!");
  return sndMsg(ID_JD, "queryOrder", orderID);
}

function onDetailCloseDelayed(m) {
  log("=========================> detail closed command fired!");
  return browser.tabs.remove(Pages[ID_DETAIL].tabId);
}

function onOrderGet(m) {
  log("=========================> order ID get!");
  log(m);
  orderID = m;
  return createDelayPromise(5*1000);
}

function onDetailLoad() {
  log("=========================> Detail is loaded!");
  return sndMsg(ID_DETAIL, "getOrderID");
}

function onOpeningDetail() {
  log("=========================> Detail is opening!");
  return new Promise((resolve, reject) => {Pages[ID_DETAIL].resolve = resolve;});
}

function handleOrders() {
  if (cur >= total) {
    log("------------ stop processing");
    createDelayPromise(taskDelay).then(startProcessing);
    return;
  }

  log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>  handling: ${cur}/${total}`);
  sndMsg(ID_FAKE, "openDetail", cur)
  .then(onOpeningDetail)
  .then(onDetailLoad)
  .then(onOrderGet)
  .then(onDetailCloseDelayed)
  .then(onDetailClosed)
  .then(onQeuryIssued)
  .then(onQueryResult)
  .then(onOpenOrderIssued)
  .then(onOrderOpened)
  .then(onEditMark)
  .then(onSetMark)
  .then(onMarkDoneIssued)
  .then(onMarkDone)
  .then(onSureDoneIssued)
  .then(onSureDone)
  .catch(onOrderError);
}

function onTotalReceived(m){
  log("=========================> Total received!");
  log(m);
  cur = 0;
  total = m;
  handleOrders();
}

function onFakeOrderReload() {
  log("=========================> FakeOrder reloaded!");
  //return sndMsg(ID_FAKE, "queryTotal");
  return createDelayPromise(1000);
}

function onFakeOrderFound(tabs) {
  if (tabs.length == 1) {
    browser.tabs.reload(tabs[0].id);
    return new Promise((resolve, reject) => {Pages[ID_FAKE].resolve = resolve;});
  } else {
    throw new Error('failed to found FakeOrder tab');
  }
}

function onJDReload() {
  log("=========================> JD reloaded!");
  return browser.tabs.query({currentWindow: true, url: [
    "http://www.dasbu.com/seller/order/jd?ss%5Bstatus%5D=2&ss%5Bstart%5D="
  ]});
}

function onJDFound(tabs) {
  if (tabs.length == 1) {
    browser.tabs.reload(tabs[0].id);
    return new Promise((resolve, reject) => {Pages[ID_JD].resolve = resolve;});
  } else {
    throw new Error('failed to found JD tab');
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
  log("------------ stop processing");
  createDelayPromise(taskDelay).then(startProcessing);
}

function startProcessing() {
  log("------------ start processing");

  /* TODO : for test only */
  browser.tabs.query({currentWindow: true, url: [
    "https://order.shop.jd.com/order/sopUp_waitOutList.action*"
  ]})
  .then(onJDFound)
  .then(onJDReload)
  .then(onFakeOrderFound)
  .then(onFakeOrderReload)
  .then(onDetailClosed)
  .then(onQeuryIssued)
  .then(onQueryResult)
  .then(onOpenOrderIssued)
  .then(onOrderOpened)
  .then(onShowMobile)
  .then(onEditMark)
  .then(onSetMark)
  .then(onMarkDoneIssued)
  .then(onMarkDone)
  .then(onSureDoneIssued)
  .then(onSureDone)
  .catch(onOrderError);
  return;

  browser.tabs.query({currentWindow: true, url: [
    "https://order.shop.jd.com/order/sopUp_waitOutList.action*"
  ]})
  .then(onJDFound)
  .then(onJDReload)
  .then(onFakeOrderFound)
  .then(onFakeOrderReload)
  .then(onTotalReceived)
  .catch(onError);
}

/*
 * Tabs Updated Handling
 */
var Pages = [
  {name:"FakeOrder", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller\/order\/jd\\\?ss%5Bstatus%5D=2&ss%5Bstart%5D=.*$")},
  {name:"Detail", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller\/order\/detail.*$")},
  {name:"JD", regexp: new RegExp("^https:\/\/order.shop.jd.com\/order\/sopUp_waitOutList.action.*$")},
  {name:"ORDER", regexp: new RegExp("^https:\/\/neworder.shop.jd.com\/order\/orderDetail\\\?orderId=.*$")}
];

function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == "complete") { /* loading complete */
/*
    console.log(changeInfo);
    console.log(tabInfo);
*/

    var i = 0;
    for (i=0; i<Pages.length; i++) {
      if (tabInfo.url.match(Pages[i].regexp) != null) {
//        log("================================" + Pages[i].name + "loaded");
        Pages[i].tabId = tabId;
        if (Pages[i].resolve) {
          Pages[i].resolve("ok");
          Pages[i].resolve = undefined;;
        }
      }
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);

/*
 * periodic task
 */
const delayInMinutes = 0.1;
const periodInMinutes = 0.1;
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

function err(m) {
  console.log(m);
}

function log(m) {
  console.log(m);
}

function sndMsg(id, a, d) {
  log(`----------> send message to ${Pages[id].name} : action is ${a}, data is ${d}`);
  return browser.tabs.sendMessage(Pages[id].tabId, {action: a, data: d});
}
