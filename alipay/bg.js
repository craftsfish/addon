log("background");

var tabid_record = undefined;
var resolve_detail = undefined;
var regexp_detail = new RegExp("^https:\/\/consumeprod.alipay.com\/record\/detail\/simpleDetail.htm\\\?.*$");
var cur = undefined;
var total = undefined;

/* browser action handling */
browser.browserAction.onClicked.addListener(startProcessing);

function startProcessing() {
  browser.tabs.query({currentWindow: true, url: [
    "https://consumeprod.alipay.com/record/advanced.htm"
  ]})
  .then(onRecordFound)
  .then(onTotalReceived)
  .catch(onError);
}

function onRecordFound(tabs) {
  if (tabs.length == 1) {
    tabid_record = tabs[0].id;
    log(tabid_record);
    return sndMsg(tabid_record, "queryTotal");
  } else {
    throw new Error("Cannot find tab of Alipay Record!");
  }
}

function onTotalReceived(m) {
  total = m;
  cur = 0;
  handleRecords();
}

function onError(error) {
  err(`Error: ${error}`);
}

function handleRecords()
{
  if (cur >= total) {
    return;
  }

  log(`handling: ${cur+1}/${total}`);
  sndMsg(tabid_record, "queryBrief", cur)
  .then(onBriefReceived)
  .then(onDetailOpenIssued)
  .then(onDetailOpened)
  .catch(onRecordError);
}

function onBriefReceived(m) {
  log(m);
  return sndMsg(tabid_record, "openDetail", cur)
}

function onDetailOpenIssued(m) {
  return new Promise((resolve) => {resolve_detail = resolve;});
}

function onDetailOpened(m) {
  throw new Error("xxx");
}

function onRecordError(error) {
  err(`Error: ${error}`);
  //cur++;
  //handleRecords();
}

function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status == "complete") { /* loading complete */
    if (tabInfo.url.match(regexp_detail) != null) {
      if (resolve_detail) {
        resolve_detail("ok");
        resolve_detail = undefined;
      }
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);

/* interaction with content scripts */
function sndMsg(id, a, d) {
  log(`send message to ${id} : action is ${a}, data is ${d}`);
  return browser.tabs.sendMessage(id, {action: a, data: d});
}
