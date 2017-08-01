const ID_FAKE = 0;
const ID_DETAIL = 1;
const ID_JD = 2;

var nxt = {
  action: "",
  target: "",
  data: ""
};

var total = -1;
var cur = -1;
var orderID = "";
var progressing = 0;
var d = new Date();
const taskDelay = 5*60*1000;
var lastDone = d.getTime() - taskDelay;

function setProgressStatus(v)
{
  progressing = v;
  if (progressing == 0) {
    log("=========================> progress stops!");
    var d = new Date();
    lastDone = d.getTime();
  } else {
    log("=========================> progress starts!");
  }
}

function onSureDone(m) {
  log("=========================> sure done!");
}

function onMarkDone(m) {
  log("=========================> mark done!");
  return sndMsg(Pages[ID_FAKE].tabId, "sureDone");
}

function onSetMark(m) {
  log("=========================> set mark complete!");
  return sndMsg(Pages[ID_FAKE].tabId, "markDone");
}

function onEditMark(m) {
  log("=========================> edit mark pop launched!");
  return sndMsg(Pages[ID_JD].tabId, "setMark");
}

function onQueryResult(m) {
  log("=========================> query result!");
  return sndMsg(Pages[ID_JD].tabId, "editMark", orderID);
}

function onQeuryIssued(m) {
  log("=========================> query issued!");
  return new Promise((resolve, reject) => {Pages[ID_JD].resolve = resolve;});
}

function onDetailClosed(m) {
  log("=========================> detail closed!");
  return sndMsg(Pages[ID_JD].tabId, "queryOrder", orderID);
}

function onOrderGet(m) {
  log("=========================> order ID get!");
  log(m);
  orderID = m;
  return browser.tabs.remove(Pages[ID_DETAIL].tabId);
}

function onDetailLoad() {
  log("=========================> Detail is loaded!");
  return sndMsg(Pages[ID_DETAIL].tabId, "getOrderID");
}

function onOpeningDetail() {
  log("=========================> Detail is opening!");
  return new Promise((resolve, reject) => {Pages[ID_DETAIL].resolve = resolve;});
}

function handleOrders() {
  sndMsg(Pages[ID_FAKE].tabId, "openDetail", cur)
  .then(onOpeningDetail)
  .then(onDetailLoad)
  .then(onOrderGet)
  .then(onDetailClosed)
  .then(onQeuryIssued)
  .then(onQueryResult)
  .then(onEditMark)
  .then(onSetMark)
  .then(onMarkDone)
  .then(onSureDone)
  .catch(onError);
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
  return sndMsg(Pages[ID_FAKE].tabId, "queryTotal");
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
  setProgressStatus(0);
}

function onBrowserActionClicked(tab) {
  /* clear existing port */
  var i = 0;
  for (i=0; i<Pages.length; i++) {
    Pages[i].port = undefined;
  }

  setProgressStatus(1);

  browser.tabs.query({currentWindow: true, url: [
    "https://order.shop.jd.com/order/sSopUp_allList.action*"
  ]})
  .then(onJDFound)
  .then(onJDReload)
  .then(onFakeOrderFound)
  .then(onFakeOrderReload)
  .then(onTotalReceived)
  .catch(onError);
}

browser.browserAction.onClicked.addListener(onBrowserActionClicked);

/*
 * Tabs Updated Handling
 */
var Pages = [
  {name:"FakeOrder", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller\/order\/jd\\\?ss%5Bstatus%5D=2&ss%5Bstart%5D=.*$"),
    onMsg: onFakeOrderMsg, onDisconnect: onPortDisconnect},
  {name:"Detail", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller\/order\/detail.*$"),
    onMsg: onDetailMsg, onDisconnect: onPortDisconnect},
  {name:"JD", regexp: new RegExp("^https:\/\/order.shop.jd.com\/order\/sSopUp_allList.action.*$"),
    onMsg: onJDMsg, onDisconnect: onPortDisconnect}
];

function getPage(name) {
  var i = 0;
  for (i=0; i<Pages.length; i++) {
    if (Pages[i].name == name) {
      return Pages[i];
    }
  }
  return undefined;
}

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
 * Communication Channel
 */
function onFakeOrderMsg(m) {
  console.log(m);

  if (m.reply == "total") {
    cur = 0;
    total = 0;
    if (m.data != undefined) {
      total = m.data;
    }
    handleNext();
  } else if (m.reply == "detail") {
    if (m.data == "ok") {
      nxt.action = "getOrderID";
      nxt.target = "Detail";
    }
  } else if (m.reply == "markDone") {
    nxt.action = "sureDone";
    nxt.target = "FakeOrder";
  } else if (m.reply == "sureDone") {
    if (m.data == "ok") {
      total--;
      handleNext();
    } else {
      cur++;
      handleNext();
    }
  }
}

function handleNext()
{
  if (cur < total) {
    log(`=============> progressing : ${cur} / ${total}`);
    nxt.action = "loadDetail";
    nxt.target = "FakeOrder";
    nxt.data = cur;
  } else {
    setProgressStatus(0);
  }
}

function onDetailMsg(m) {
  console.log(m);

  if (m.reply == "orderID") {
    if (m.data != undefined) {
      orderID = m.data;
      nxt.action = "closeDetail";
      nxt.target = "Background";
    } else {
      cur++;
      handleNext();
    }
  }
}

function onJDMsg(m) {
  console.log(m);
  if (m.reply == "queryOrder") {
    if (m.data == "ok") {
      nxt.action = "editMark";
      nxt.target = "JD";
      nxt.data = orderID;
    } else {
      cur++;
      handleNext();
    }
  } else if (m.reply == "editMark") {
    if (m.data == "ok") {
      nxt.action = "setMark";
      nxt.target = "JD";
      nxt.data = "";
    } else {
      cur++;
      handleNext();
    }
  } else if (m.reply == "setMark") {
    if (m.data == "ok") {
      nxt.action = "markDone";
      nxt.target = "FakeOrder";
      nxt.data = cur;
    } else {
      cur++;
      handleNext();
    }
  }
}

function onPortDisconnect(p)
{
  log(`=======================> port : ${p.name} disconnect!`);
  getPage(p.name).port = undefined;
}

function connected(p) {
  var Page =  getPage(p.name);
  if (Page != undefined) {
    Page.port = p;
    p.onDisconnect.addListener(Page.onDisconnect);
    p.onMessage.addListener(Page.onMsg);
  }
}

browser.runtime.onConnect.addListener(connected);

/*
 * periodic task
 */
const delayInMinutes = 0.05;
const periodInMinutes = 0.05;
browser.alarms.create("my-periodic-alarm", {
  delayInMinutes,
  periodInMinutes
});

function onAction(a) {
  if (a.target == "Background") {
    if (a.action == "closeDetail") {
      browser.tabs.remove(getPage("Detail").tabId);
      a.action = "queryOrder";
      a.target = "JD";
      a.data = orderID;
    }
    return;
  }

  var p = getPage(a.target);
  if (p.port != undefined) {
    p.port.postMessage(a);
    a.action = "";
    a.target = "";
    a.data = "";
  }
}

function handleAlarm(alarmInfo) {
//  console.log("on alarm: " + alarmInfo.name);

  if (nxt.action != "") {
    onAction(nxt);
  } else if (progressing == 0) {
    var d = new Date();
    if (d.getTime() - lastDone - taskDelay > 0) {
      lastDone += 1000 * taskDelay;
      onBrowserActionClicked(undefined);
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
  return browser.tabs.sendMessage(id, {action: a, data: d});
}
