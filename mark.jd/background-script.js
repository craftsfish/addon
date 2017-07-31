var nxt = {
  action: "",
  target: "",
  data: ""
};

var total = -1;
var cur = -1;
var orderID = "";
var progressing = 0;

function setProgressStatus(v)
{
  progressing = v;
  if (progressing == 0) {
    log("=========================> progress stops!");
  } else {
    log("=========================> progress starts!");
  }
}

/*
 * Browser Action Handling
 */
function onTabs(tabs) {
  for (let tab of tabs) {
    log(`===============> reload : ${tab.url}`);
    browser.tabs.reload(tab.id);
  }
}

function onError(error) {
  console.log(`Error: ${error}`);
}

function onBrowserActionClicked(tab) {
  /* reload pages */
  var querying = browser.tabs.query({currentWindow: true, url: [
    "https://order.shop.jd.com/order/sSopUp_allList.action*",
    "http://www.dasbu.com/seller/order/jd?ss%5Bstatus%5D=2&ss%5Bstart%5D="
  ]});
  querying.then(onTabs, onError);

  /* clear existing port */
  var i = 0;
  for (i=0; i<Pages.length; i++) {
    Pages[i].port = undefined;
  }

  /* start progress */
  setProgressStatus(1);
  nxt.action = "queryTotal";
  nxt.target = "FakeOrder";
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
  console.log(m);

  if (m.reply == "total") {
    cur = 0;
    if (m.data == undefined) {
      total = 0;
    } else {
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
      nxt.action = "sureDone";
      nxt.target = "FakeOrder";
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
    }
  } else if (m.reply == "editMark") {
    if (m.data == "ok") {
      nxt.action = "setMark";
      nxt.target = "JD";
      nxt.data = "";
    } else {
      nxt.action = "editMark";
      nxt.target = "JD";
      nxt.data = orderID;
    }
  } else if (m.reply == "setMark") {
    if (m.data == "ok") {
      nxt.action = "markDone";
      nxt.target = "FakeOrder";
      nxt.data = cur;
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
  console.log("on alarm: " + alarmInfo.name);

  if (nxt.action != "") {
    onAction(nxt);
  }
}

browser.alarms.onAlarm.addListener(handleAlarm);


function err(m) {
  console.log(m);
}

function log(m) {
  console.log(m);
}
