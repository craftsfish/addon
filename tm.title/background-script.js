log("TMall Keyword background is running");

const ID_TM_SEARCH = 0;
var cur_order = 0;
var candidates = [
	['xxx'],
];

function search() {
  sndMsg(ID_TM_SEARCH, 'search', candidates[cur_order][0])
  return new Promise((resolve, reject) => {Pages[ID_TM_SEARCH].resolve = resolve;})
}

function collectElements() {
  return sndMsg(ID_TM_SEARCH, 'collectElements', null)
}

function updateElements(elements) {
  candidates[cur_order][1] = elements
  processNext()
}

function processNext() {
  cur_order++;
  log(cur_order)
  log(candidates.length)
  if (cur_order >= candidates.length) {
    log("Done")
    var result = ""
    for (var i=0; i<candidates.length; i++) {
      result += candidates[i][0] + ',' + candidates[i][1] + '\n'
    }
    console.log(result)
    return
  }
  browser.tabs.create({active:true, url:"https://s.taobao.com/"});
  return new Promise((resolve, reject) => {Pages[ID_TM_SEARCH].resolve = resolve;})
    .then(search)
    .then(collectElements)
    .then(updateElements)
}

/*******************************************************************************
 * Tabs Updated Handling
 ******************************************************************************/
var Pages = [
  {name:"taobao_search", regexp: new RegExp("^https:\/\/s.taobao.com\/.*$")},
];

function onTabsUpdated(tabId, changeInfo, tabInfo) {
  if (changeInfo.status != "complete") { /* loading complete */
    return
  }

  //log("loadcomplete")
  var i = 0;
  for (i=0; i<Pages.length; i++) {
    if (tabInfo.url.match(Pages[i].regexp) != null) {
      log(Pages[i].name)
      Pages[i].tabId = tabId;
      if (Pages[i].resolve) {
        Pages[i].resolve("ok");
        Pages[i].resolve = undefined;;
      }
    }
  }
}

browser.tabs.onUpdated.addListener(onTabsUpdated);


/*******************************************************************************
 * browser action handling
 ******************************************************************************/
function handleClick() {
  cur_order = -1;
  processNext()
}
browser.browserAction.onClicked.addListener(handleClick);

/* interaction with content scripts */
function sndMsg(id, a, d) {
  log(`send message to ${Pages[id].name} : action is ${a}, data is ${d}`);
  return browser.tabs.sendMessage(Pages[id].tabId, {action: a, data: d});
}
