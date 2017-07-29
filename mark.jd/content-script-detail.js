const ID = "Detail";
console.log("content script of " + ID + " is loaded!");

var myPort = browser.runtime.connect({name: ID});
function sendMsg(m)
{
  m.id = ID;
  myPort.postMessage(m);
}
sendMsg({greeting: "hello from " + ID + " script"});
myPort.onMessage.addListener(onBGMsg);

function onBGMsg(m) {
  console.log("In " + ID + " script, received message from background script: ");
  console.log(m);

  if (m.action == "getOrderID") {
    sendMsg({reply: "orderID", data: getOrderID()});
  }
}

function getOrderID() {
  return $("div.row:contains('平台订单')")[0].childNodes[3].innerHTML;
}
