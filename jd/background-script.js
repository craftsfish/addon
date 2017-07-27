var running = 0;

/*
 * Browser Action Handling
 */
function onBrowserActionClicked(tab) {
  if (running == 0) {
    running = 1;
    console.log("JD pluging starts.");
    console.log(tab);
  } else {
    running = 0;
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
    if (tabInfo.url == "https://sz.jd.com/index.html") {
      console.log("JD sz is loaded.");
      var executing = browser.tabs.executeScript(null, {file: "content-script-sz.js"});
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
}

function connected(p) {
  if (p.name == "port-from-sz") {
    portFromSZ = p;
    portFromSZ.postMessage({greeting: "hi there content script!"});
    portFromSZ.onMessage.addListener(onSZMsg);
  }
}

browser.runtime.onConnect.addListener(connected);
