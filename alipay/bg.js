log("background");

var tabid_record = undefined;
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
  sndMsg(tabid_record, "queryDetail", cur)
  .then(onDetailReceived)
  .catch(onRecordError);
}

function onDetailReceived(m) {
  log(m);
  cur++;
  handleRecords();
}

function onRecordError(error) {
  err(`Error: ${error}`);
  cur++;
  handleRecords();
}
/* interaction with content scripts */
function sndMsg(id, a, d) {
  log(`send message to ${id} : action is ${a}, data is ${d}`);
  return browser.tabs.sendMessage(id, {action: a, data: d});
}
