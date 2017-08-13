log("background");

var tabid_record = undefined;

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
  log(m);
}

function onError(error) {
  err(`Error: ${error}`);
}

/* interaction with content scripts */
function sndMsg(id, a, d) {
  log(`send message to id : action is ${a}, data is ${d}`);
  return browser.tabs.sendMessage(id, {action: a, data: d});
}
