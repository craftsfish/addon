log("alipay");

var i = 0;
for (i=0; i<20; i++) {
  var selector = "#tradeRecordsIndex tbody tr:eq(" + i.toString() + ") .time-d";
  log(jQuery(selector)[0].innerHTML);
}

function getTotal() {
  items = jQuery("#tradeRecordsIndex tbody tr")
  return Promise.resolve(items.length);
}

function onMsg(m)
{
  if (m.action == "queryTotal") {
    return getTotal();
  }
}
browser.runtime.onMessage.addListener(onMsg);
