const ID = "FakeOrder";
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

  if (m.action == "load") {
    getItem(m.data).click();
  } else if (m.action == "queryTotal") {
    sendMsg({reply: "total", data: getTotal()});
  }
}

function getItem(i)
{
  return $("a.xq")[i];
}

function getTotal() {
  return parseInt($("a:contains('待审核订单')")[0].childNodes[1].innerHTML);
}
