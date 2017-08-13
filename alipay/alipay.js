log("alipay");

var jqItems = "#tradeRecordsIndex tbody tr";

function getTotal() {
  items = jQuery(jqItems);
  return Promise.resolve(items.length);
}

var querys = [
  ".time-d",
  ".consume-title a",
  ".amount-pay"
];

function getDetail(i) {
  var j = 0;
  var result = undefined;
  for (j=0; j<querys.length; j++) {
    var selector = jqItems + ":eq(" + i.toString() + ") " + querys[j];
    result += jQuery(selector)[0].innerHTML;
  }
  return Promise.resolve(result);
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
