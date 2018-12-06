log("TMall Candidate background is running");

function onTmallTabFound(tabs) {
  if (tabs.length == 1) {
    browser.tabs.sendMessage(tabs[0].id, {action: 'collect', data: null});
  }
}

/*******************************************************************************
 * browser action handling
 ******************************************************************************/
function handleClick() {
  log('Hello')
  browser.tabs.query({currentWindow: true, url: [
    "https://subway.simba.taobao.com/*"
  ]}).then(onTmallTabFound)
}
browser.browserAction.onClicked.addListener(handleClick);

/* interaction with content scripts */
function sndMsg(id, a, d) {
  log(`send message to ${Pages[id].name} : action is ${a}, data is ${d}`);
  return browser.tabs.sendMessage(Pages[id].tabId, {action: a, data: d});
}
