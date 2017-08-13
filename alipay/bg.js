log("background");

var tabid_record = undefined;

/* browser action handling */
browser.browserAction.onClicked.addListener(startProcessing);

function startProcessing() {
  browser.tabs.query({currentWindow: true, url: [
    "https://consumeprod.alipay.com/record/advanced.htm"
  ]})
  .then(onRecordFound)
  .catch(onError);
}

function onRecordFound(tabs) {
  if (tabs.length == 1) {
    tabid_record = tabs[0].id;
    log(tabid_record);
  } else {
    throw new Error("Cannot find tab of Alipay Record!");
  }
}

function onError(error) {
  err(`Error: ${error}`);
}
