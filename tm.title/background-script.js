log("TMall Keyword background is running");

const ID_TM_SEARCH = 0;
var cur_order = 0;
var candidates = [
	['日本泰福高焖烧杯女焖烧壶闷烧罐锅不锈钢焖粥神器超长保温饭盒桶'],
    ['焖烧杯'],
    ['闷烧杯'],
    ['焖烧杯 焖粥神器'],
    ['焖烧杯女'],
    ['闷烧杯 日本'],
    ['保温桶'],
    ['焖烧杯 焖粥神器 超长保温'],
    ['焖烧杯 24小时 焖粥'],
    ['保温桶女 便携 大容量'],
    ['焖烧杯女 泰福高'],
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
    log(candidates)
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
