var next = ""; /* next instruction */

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

function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == "complete") { /* loading complete */
    if (tabInfo.url == "https://sz.jd.com/realTime/realTop.html") {
      console.log("JD sz is loaded.");
      var executing = browser.tabs.executeScript(null, {file: "jquery/jquery-1.4.min.js"});
      executing.then(onExecuted, onError);
      executing = browser.tabs.executeScript(null, {file: "content-script-sz.js"});
      executing.then(onExecuted, onError);
    } else if (tabInfo.url.search(/https:\/\/item.jd.com\//) != -1) {
      console.log("JD item is loaded.");
      var executing = browser.tabs.executeScript(null, {file: "jquery/jquery-1.4.min.js"});
      executing.then(onExecuted, onError);
      executing = browser.tabs.executeScript(null, {file: "content-script-item.js"});
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
  }
}

function onItemDisconnect(p)
{
  portFromItem = undefined;
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
  }
}

browser.runtime.onConnect.addListener(connected);

/*
 * periodic task
 */
const delayInMinutes = 0.2;
const periodInMinutes = 0.2;
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
  }
}

browser.alarms.onAlarm.addListener(handleAlarm);
