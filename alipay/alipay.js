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

function getInfo(i, q) {
  var selector = jqItems + ":eq(" + i.toString() + ") " + q;
  log(selector);
  return jQuery(selector)[0].innerHTML.replace(/[\t\n]/g, "");
}

function getDetail(i) {
  var j = 0;
  var result = undefined;

  var r = getInfo(i, ".status p");
  if (r != "交易关闭") {
    result = "";
    for (j=0; j<querys.length; j++) {
      var r = getInfo(i, querys[j]);
      if (j > 0) {
        result += ",";
      }
      result += r;
    }
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
