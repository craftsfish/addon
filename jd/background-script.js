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
function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == "complete") { /* loading complete */
    console.log("Load completes.");
    console.log(tabInfo);
    if (tabInfo.url == "https://sz.jd.com/index.html") {
      console.log("JD sz is loaded.");
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);
