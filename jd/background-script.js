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

var SZ = new Object();
SZ.regexp = new RegExp("^https:\/\/sz.jd.com\/realTime\/realTop.html$");
SZ.contentscript = "content-script-sz.js";
var Item = new Object();
Item.regexp = new RegExp("^https:\/\/item.jd.com\/.*$");
Item.contentscript = "content-script-item.js";
var TMonitor = new Object(); /* check status of fake order */
TMonitor.regexp = new RegExp("^http:\/\/www.dasbu.com\/seller$");
TMonitor.contentscript = "content-script-sd.js";
var TPublisher1 = new Object(); /* task publisher step 1 */
TPublisher1.regexp = new RegExp("^http:\/\/www.dasbu.com\/seller\/renwu\/create\\\?step=1$");
TPublisher1.contentscript = "content-script-publisher-1.js";


function onTabsUpdated(tabId, changeInfo, tabInfo) {
  console.log(changeInfo);
  console.log(tabInfo);
  if (changeInfo.status == "complete") { /* loading complete */
    if (tabInfo.url.match(SZ.regexp) != null) {
      console.log("JD sz is loaded.");
      var executing = browser.tabs.executeScript(null, {file: "jquery/jquery-1.4.min.js"});
      executing.then(onExecuted, onError);
      executing = browser.tabs.executeScript(null, {file: SZ.contentscript});
      executing.then(onExecuted, onError);
    } else if (tabInfo.url.match(Item.regexp) != null) {
      itemTab = tabId;
      console.log("JD item is loaded.");
      var executing = browser.tabs.executeScript(null, {file: "jquery/jquery-1.4.min.js"});
      executing.then(onExecuted, onError);
      executing = browser.tabs.executeScript(null, {file: Item.contentscript});
      executing.then(onExecuted, onError);
    } else if (tabInfo.url.match(TPublisher1.regexp) != null) {
      console.log("Publisher 1 is loaded.");
      var executing = browser.tabs.executeScript(null, {file: "jquery/jquery-1.4.min.js"});
      executing.then(onExecuted, onError);
      executing = browser.tabs.executeScript(null, {file: TPublisher1.contentscript});
      executing.then(onExecuted, onError);
    } else if (tabInfo.url.match(TMonitor.regexp) != null) {
      console.log("SD is loaded.");
      var executing = browser.tabs.executeScript(null, {file: "jquery/jquery-1.4.min.js"});
      executing.then(onExecuted, onError);
      executing = browser.tabs.executeScript(null, {file: TMonitor.contentscript});
      executing.then(onExecuted, onError);
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);

/*
 * Communication Channel
 */
var portFromSZ;

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

function onSZDisconnect(p)
{
  portFromSZ = undefined;
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

function onItemDisconnect(p)
{
  portFromItem = undefined;
}

var portFromSD;

function onSDMsg(m) {
  console.log("In background script, received message from SD");
  console.log(m);
}

function onSDDisconnect(p)
{
  portFromSD = undefined;
}

var portFromPublisher1;

function onPublisher1Msg(m) {
  console.log("In background script, received message from Publisher1");
  console.log(m);
}

function onPublisher1Disconnect(p)
{
  portFromPublisher1 = undefined;
}

function connected(p) {
  if (p.name == "port-from-sz") {
    portFromSZ = p;
    portFromSZ.onDisconnect.addListener(onSZDisconnect);
    portFromSZ.onMessage.addListener(onSZMsg);
  } else if (p.name == "port-from-item") {
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
