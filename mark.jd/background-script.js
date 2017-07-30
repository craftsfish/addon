var nxt = {
  action: "",
  target: "",
  data: ""
};

var total = -1;
var cur = -1;

var orderID = "";
var PC = 0;
var Instructions = [
  {name: "idle", instruction: "", target: ""},					/* 0 */
  {name: "open detail", instruction: "load", target: "FakeOrder"},
  {name: "get order id", instruction: "getOrderID", target: "Detail"},
  {name: "close detail", instruction: "closeDetail", target: "Background"},
  {name: "query order", instruction: "queryOrder", target: "JD"},
  {name: "edit mark", instruction: "editMark", target: "JD"},			/* 5 */
  {name: "set mark", instruction: "setMark", target: "JD"},
  {name: "query total", instruction: "queryTotal", target: "FakeOrder"}
];

/*
 * Browser Action Handling
 */
function onBrowserActionClicked(tab) {
  console.log("JD pluging starts.");
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
    total = m.data;
    cur = 0;
    console.log("=============> total order : " + total.toString());

    nxt.action = "loadDetail";
    nxt.target = "FakeOrder";
    nxt.data = cur;
  } else if (m.reply == "detail") {
    if (m.data == "ok") {
      nxt.action = "getOrderID";
      nxt.target = "Detail";
    }
  }
}

function onDetailMsg(m) {
  console.log(m);

  if (m.reply == "orderID") {
    if (m.data != undefined) {
      orderID = m.data;
      nxt.action = "closeDetail";
      nxt.target = "Background";
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
      nxt.action = "";
      nxt.target = "";
      nxt.data = "";
    }
  }
}

function onPortDisconnect(p)
{
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
    return;
  }

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
    if (i.instruction == "queryTotal") {
      PC = 0;
    } else if (i.instruction == "load") {
      PC = 2;
    }
  } else if (i.target == "Detail") {
    if (i.instruction == "getOrderID") {
      PC = 0;
    }
  } else if (i.target == "JD") {
    if (i.instruction == "queryOrder") {
      PC = 5;
    } else if (i.instruction == "editMark") {
      PC = 6;
    } else if (i.instruction == "setMark") {
      cur++;
      console.log("=====================> handling order : " + cur.toString());
      if (cur < total) {
        PC = 1;
        Instructions[PC].data = cur;
      } else {
        PC = 0;
      }
    }
  }
}

browser.alarms.onAlarm.addListener(handleAlarm);
