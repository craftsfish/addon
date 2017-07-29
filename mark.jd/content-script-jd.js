const ID = "JD";
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

  if (m.action == "queryOrder") {
    query(m.data);
  }
}

function query(v)
{
    $("input#orderId")[0].value = v;
    $("#orderQueryBtn")[0].click();
}
