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
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);

/*
 * Communication Channel for SZ
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
    next = "query xetail"
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

function connected(p) {
  if (p.name == "port-from-sz") {
    portFromSZ = p;
    portFromSZ.onDisconnect.addListener(onSZDisconnect);
    portFromSZ.onMessage.addListener(onSZMsg);
  }
}

browser.runtime.onConnect.addListener(connected);

/*
 * periodic task
 */
const delayInMinutes = 1;
const periodInMinutes = 1;
browser.alarms.create("my-periodic-alarm", {
  delayInMinutes,
  periodInMinutes
});

function handleAlarm(alarmInfo) {
  console.log("on alarm: " + alarmInfo.name);
  if (next == "query rate") {
    portFromSZ.postMessage({query: "rate"});
    next = "";
  } else if (next == "query detail") {
    portFromSZ.postMessage({query: "detail"});
    next = "";
  }
}

browser.alarms.onAlarm.addListener(handleAlarm);
