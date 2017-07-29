/*
 * Browser Action Handling
 */
function onBrowserActionClicked(tab) {
    console.log("JD pluging starts.");
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
  {name:"FakeOrder", regexp: new RegExp("^http:\/\/www.dasbu.com\/seller\/order\/jd.*$"), script: "content-script-fakeorder.js", port: undefined,
    onMsg: onFakeOrderMsg, onDisconnect: onPortDisconnect},
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
      console.log(tabInfo.url);
      console.log(Pages[i].regexp);
      if (tabInfo.url.match(Pages[i].regexp) != null) {
        console.log("============================= load script for page : " + Pages[i].name);
        var executing = browser.tabs.executeScript(null, {file: "jquery/jquery-1.4.min.js"});
        executing.then(onExecuted, onError);
        executing = browser.tabs.executeScript(null, {file: Pages[i].script});
        executing.then(onExecuted, onError);
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
}

browser.alarms.onAlarm.addListener(handleAlarm);
