const ID = "Detail";
console.log("content script of " + ID + " is loaded!");

var myPort = browser.runtime.connect({name: ID});
function sendMsg(m)
{
  m.id = ID;
  myPort.postMessage(m);
}
myPort.onMessage.addListener(onBGMsg);

function onBGMsg(m) {
  console.log("In " + ID + " script, received message from background script: ");
  console.log(m);

  if (m.action == "getOrderID") {
    sendMsg({reply: "orderID", data: getOrderID()});
  }
}

function getOrderID() {
  return $("div.row:contains('平台订单')")[0].childNodes[3].innerHTML.match(/\d+/)[0];
}

function getOrderID1()
{
  var x = $("div.row:contains('平台订单')")[0].childNodes[3].innerHTML.match(/\d+/)[0];
  if (x == undefined) {
    return Promise.reject(new Error("failed to get orderID"));
  } else {
    return Promise.resolve(x);
  }
}

function onMsg(m)
{
  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx test message received!");
  console.log(m);
  if (m.action == "getOrderID") {
    return getOrderID1();
  }
}
browser.runtime.onMessage.addListener(onMsg);
