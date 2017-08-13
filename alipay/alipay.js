log("alipay");

function getTotal() {
  items = jQuery("#tradeRecordsIndex tbody tr")
  return Promise.resolve(items.length);
}

function getDetail(i) {
  var selector = "#tradeRecordsIndex tbody tr:eq(" + i.toString() + ") .time-d";
  return Promise.resolve(jQuery(selector)[0].innerHTML);
}

function onMsg(m)
{
  if (m.action == "queryTotal") {
    return getTotal();
  } else if (m.action == "queryDetail") {
    return getDetail(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
