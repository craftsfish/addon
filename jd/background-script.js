var next = ""; /* next instruction */
var itemTab;

/*
 * Browser Action Handling
 */
function onBrowserActionClicked(tab) {
  if (next == "") {
    next = "query rate";
    console.log("JD pluging starts.");
    console.log(tab);
  }
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
  {name:"ShangZhi", regexp: new RegExp("^https:\/\/sz.jd.com\/realTime\/realTop.html$"), script: "content-script-sz.js", port: undefined,
    onMsg: onSZMsg, onDisconnect: onPortDisconnect},
  {name:"Item", regexp: new RegExp("^https:\/\/item.jd.com\/.*$"), script: "content-script-item.js", port: undefined,
    onMsg: onItemMsg, onDisconnect: onPortDisconnect},
  {name:"TMonitor", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller$"), script: "content-script-sd.js", port: undefined,
    onMsg: onTMonitorMsg, onDisconnect: onPortDisconnect},
  {name:"TPublisher1", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller\/renwu\/create\\\?step=1$"), script: "content-script-publisher-1.js", port: undefined,
    onMsg: onTPublisher1Msg, onDisconnect: onPortDisconnect}
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
  console.log(changeInfo);
  console.log(tabInfo);
  if (changeInfo.status == "complete") { /* loading complete */
    var i = 0;
    for (i=0; i<Pages.length; i++) {
      if (tabInfo.url.match(Pages[i].regexp) != null) {
        console.log("============================= load script for page : " + Pages[i].name);
        var executing = browser.tabs.executeScript(null, {file: "jquery/jquery-1.4.min.js"});
        executing.then(onExecuted, onError);
        executing = browser.tabs.executeScript(null, {file: Pages[i].script});
        executing.then(onExecuted, onError);
        if (Pages[i].name == "Item") {
          itemTab = tabId;
        }
      }
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);

/*
 * Communication Channel
 */
function onSZMsg(m) {
  console.log("In background script, received message from SZ");
  console.log(m);
  if (m.reply == "found item") {
    next = "query detail";
  } else if (m.reply == "try again") {
    next = "query rate"
  } else if (m.reply == "no item") {
    /* do nothing */
  } else if (m.reply == "detail") {
    next = "query skuname"
    /* do nothing */
  } else {
    console.log("Unhandled msg from SZ.");
    console.log(m);
  }
}

function onPortDisconnect(p)
{
  getPage(p.name).port = undefined;
  console.log("============================" + p.name +" is null!");
}

var portFromItem;

function onItemMsg(m) {
  console.log("In background script, received message from item");
  console.log(m);
  if (m.reply == "skuname") {
    next = "sku image load";
    console.log(m.data);
  } else if (m.reply == "skuimageload") {
    next = "sku image";
  } else if (m.reply == "skuimage") {
    console.log(m.data);
    next = "item close";
  }
}

var portFromSD;

function onTMonitorMsg(m) {
  console.log("In background script, received message from TMonitor");
  console.log(m);
}

var portFromPublisher1;

function onTPublisher1Msg(m) {
  console.log("In background script, received message from Publisher1");
  console.log(m);
}

function connected(p) {
  var Page =  getPage(p.name);
  if (Page != undefined) {
    Page.port = p;
    p.onDisconnect.addListener(Page.onDisconnect);
    p.onMessage.addListener(Page.onMsg);
    console.log("Page : " + p.name + " has been connected!");
  }
  if (p.name == "port-from-item") {
    portFromItem = p;
    portFromItem.onDisconnect.addListener(onItemDisconnect);
    portFromItem.onMessage.addListener(onItemMsg);
    portFromItem.postMessage("hello there item");
  } else if (p.name == "port-from-sd") {
    portFromSD = p;
    portFromSD.onDisconnect.addListener(onSDDisconnect);
    portFromSD.onMessage.addListener(onSDMsg);
    portFromSD.postMessage("hello there sd");
  } else if (p.name == "port-from-publisher-1") {
    portFromPublisher1 = p;
    portFromPublisher1.onDisconnect.addListener(onPublisher1Disconnect);
    portFromPublisher1.onMessage.addListener(onPublisher1Msg);
    portFromPublisher1.postMessage("hello there sd");
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
  console.log(next);

var portFromSZ = getPage("ShangZhi").port;
var portFromItem = getPage("Item").port;
var portFromSD = getPage("TMonitor").port;

  if (next == "query rate") {
    if (portFromSZ != undefined) {
      portFromSZ.postMessage({query: "rate"});
      next = "";
    }
  } else if (next == "query detail") {
    if (portFromSZ != undefined) {
      portFromSZ.postMessage({query: "detail"});
      next = "";
    }
  } else if (next == "query skuname") {
    if (portFromItem != undefined) {
      portFromItem.postMessage({query: "skuname"});
      next = "";
    }
  } else if (next == "sku image load") {
    if (portFromItem != undefined) {
      portFromItem.postMessage({query: "skuimageload"});
      next = "";
    }
  } else if (next == "sku image") {
    if (portFromItem != undefined) {
      portFromItem.postMessage({query: "skuimage"});
      next = "";
    }
  } else if (next == "item close") {
    browser.tabs.remove(itemTab);
    itemTab = undefined;
    next = "publish order"
  } else if (next == "publish order") {
    if (portFromSD != undefined) {
      portFromSD.postMessage({query: "publish load"});
      next = "";
    }
  }
}

browser.alarms.onAlarm.addListener(handleAlarm);
