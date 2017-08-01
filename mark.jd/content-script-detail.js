function getOrderID()
{
  var x = $("div.row:contains('平台订单')")[0].childNodes[3].innerHTML.match(/\d+/)[0];
  if (x == undefined) {
    return Promise.reject(new Error("failed to get orderID"));
  } else {
    //return Promise.resolve(x);
    return Promise.resolve("59868468133");
  }
}

function onMsg(m)
{
  if (m.action == "getOrderID") {
    return getOrderID();
  }
}
browser.runtime.onMessage.addListener(onMsg);
