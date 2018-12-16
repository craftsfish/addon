log("TMall Candidate background is running");
js_injected = false
tm_tab = -1

function __load_js_common() {
  return browser.tabs.executeScript(tm_tab, {file: '/common.js'})
}

function __load_js_jquery() {
  return browser.tabs.executeScript(tm_tab, {file: '/jquery/jquery-1.4.min.js'})
}

function __load_js_content() {
  return browser.tabs.executeScript(tm_tab, {file: 'content-script-tm.js'})
}

function __load_content_script() {
  return __load_js_common()
    .then(__load_js_jquery)
    .then(__load_js_content)
}

function collect_data() {
  return browser.tabs.sendMessage(tm_tab, {action: 'collect', data: null});
}

function onTmallTabFound(tabs) {
  if (tabs.length == 1) {
    tm_tab = tabs[0].id
    if (js_injected == false) {
      js_injected = true
      __load_content_script()
      .then(collect_data)
    } else {
      collect_data()
    }
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
