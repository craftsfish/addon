var orderID = "";
var PC = 0;
var Instructions = [
  {name: "idle", instruction: "", target: ""},					/* 0 */
  {name: "open detail", instruction: "load", target: "FakeOrder"},
  {name: "get order id", instruction: "getOrderID", target: "Detail"},
  {name: "close detail", instruction: "closeDetail", target: "Background"},
  {name: "query detail", instruction: "queryOrder", target: "JD"}
];

/*
 * Browser Action Handling
 */
function onBrowserActionClicked(tab) {
  console.log("JD pluging starts.");
  PC = 1;
}

browser.browserAction.onClicked.addListener(onBrowserActionClicked);

/*
 * Tabs Updated Handling
 */
function onExecuted(result) {
  console.log("Success: executeScript.");
  console.log(result);
}

function onError(error) {
  console.log("Error: executeScript.");
  console.log(error);
}

var Pages = [
  {name:"FakeOrder", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller\/order\/jd\\\?ss%5Bstatus%5D=2&ss%5Bstart%5D=.*$"), script: "content-script-fakeorder.js", port: undefined,
    onMsg: onFakeOrderMsg, onDisconnect: onPortDisconnect},
  {name:"Detail", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller\/order\/detail.*$"), script: "content-script-detail.js", port: undefined,
    onMsg: onDetailMsg, onDisconnect: onPortDisconnect},
  {name:"JD", regexp: new RegExp("^https:\/\/order.shop.jd.com\/order\/sSopUp_allList.action.*$"), script: "content-script-jd.js", port: undefined,
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
    console.log(changeInfo);
    console.log(tabInfo);

    var i = 0;
    for (i=0; i<Pages.length; i++) {
      if (tabInfo.url.match(Pages[i].regexp) != null) {
        console.log("============================= load script for page : " + Pages[i].name);
        var executing = browser.tabs.executeScript(null, {file: "jquery/jquery-1.4.min.js"});
        executing.then(onExecuted, onError);
        executing = browser.tabs.executeScript(null, {file: Pages[i].script});
        executing.then(onExecuted, onError);
        Pages[i].tabId = tabId;
      }
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);

/*
 * Communication Channel
 */
function onFakeOrderMsg(m) {
  console.log("In background script, received message from FakeOrder");
  console.log(m);
}

function onDetailMsg(m) {
  console.log("In background script, received message from Detail");
  console.log(m);

  if (m.reply == "orderID") {
    orderID = m.data;
    PC = 3;
  }
}

function onJDMsg(m) {
  console.log("In background script, received message from JD");
  console.log(m);
}

function onPortDisconnect(p)
{
  getPage(p.name).port = undefined;
  console.log("============================ Port : " + p.name +" is null!");
}

function connected(p) {
  var Page =  getPage(p.name);
  if (Page != undefined) {
    Page.port = p;
    p.onDisconnect.addListener(Page.onDisconnect);
    p.onMessage.addListener(Page.onMsg);
    console.log("Page : " + p.name + " has been connected!");
  }
}

browser.runtime.onConnect.addListener(connected);

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
  console.log("on alarm: " + alarmInfo.name);
  console.log(PC);

  if (PC == 0) {
    return;
  }

  /* get target page */
  var i = Instructions[PC];

  if (i.target == "Background") { /* background message */
    if (i.instruction == "closeDetail") {
      browser.tabs.remove(getPage("Detail").tabId);
      PC = 4;
      Instructions[PC].data = orderID;
    }
  }

  var p = getPage(i.target);
  if (p == undefined) {
    return;
  }
  if (p.port == undefined) {
    return;
  }

  p.port.postMessage({action: i.instruction, data: i.data});
  if (i.target == "FakeOrder") {
    if (i.instruction == "load") {
      PC = 2;
    }
  } else if (i.target == "Detail") {
    if (i.instruction == "getOrderID") {
      PC = 0;
    }
  }
}

browser.alarms.onAlarm.addListener(handleAlarm);
