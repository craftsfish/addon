const ID = "FakeOrder";
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

  if (m.action == "loadDetail") {
    loadDetail(m.data);
  } else if (m.action == "queryTotal") {
    getTotal();
  } else if (m.action == "markDone") {
    markDone(m.data);
  } else if (m.action == "sureDone") {
    sureDone();
  }
}

function getItem(i)
{
  return $("a.xq")[i];
}

function getTotal() {
  var x = $("a:contains('待审核订单')")[0].childNodes[1];
  if (x == undefined) {
    sendMsg({reply: "total", data: undefined});
  } else {
    sendMsg({reply: "total", data: parseInt(x.innerHTML)});
  }
}

function loadDetail(i) {
  var d = $("a.xq")[i];
  if (d) {
    d.click();
    sendMsg({reply: "detail", data: "ok"});
  } else {
    sendMsg({reply: "detail", data: "failed"});
  }
}

function markDone(i) {
  $("a:contains('确认')")[0].click()
  sendMsg({reply: "markDone", data: "continue"});
}

function sureDone() {
  var btn = $("button:contains('确认返款')")[0];
  if (btn != undefined) {
    btn.click();
    sendMsg({reply: "sureDone", data: "ok"});
  } else {
    sendMsg({reply: "sureDone", data: "again"});
  }
}
