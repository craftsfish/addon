var next = ""; /* next instruction */

/*
 * Browser Action Handling
 */
function onBrowserActionClicked(tab) {
  if (next == "") {
    next = "query rate";
    console.log("JD pluging starts.");
    console.log(tab);
  } else {
    next = "";
    console.log("JD pluging stops.");
    console.log(tab);
  }
}

browser.browserAction.onClicked.addListener(onBrowserActionClicked);

/*
 * Tabs Updated Handling
 */
function onExecuted(result) {
  console.log("Successfully executed! ${result}");
}

function onError(error) {
  console.log(error);
}

function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == "complete") { /* loading complete */
    console.log("Load completes.");
    console.log(tabInfo);
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
    console.log("handle command later");
    console.log(next);
  } else if (m.reply == "no item") {
    next = "";
  } else if (m.reply == "detail") {
    next = "";
  } else {
    console.log("Unhandled msg from SZ.");
    console.log(m);
  }
}

function connected(p) {
  if (p.name == "port-from-sz") {
    portFromSZ = p;
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
  } else if (next == "query detail") {
    portFromSZ.postMessage({query: "detail"});
  }
}

browser.alarms.onAlarm.addListener(handleAlarm);
