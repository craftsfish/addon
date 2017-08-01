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

function openDetail(i) {
  var d = $("a.xq")[i];
  return Promise.resolve("opening"); /* TODO : remove it */
  if (d) {
    d.click();
    return Promise.resolve("opening");
  } else {
    return Promise.reject(new Error("no detail item"));
  }
}


function queryTotal()
{
  var x = $("a:contains('待审核订单')")[0].childNodes[1];
  return Promise.resolve(1); /* TODO : remove it */
  if (x == undefined) {
    return Promise.reject(new Error("no order to be handled"));
  } else {
    return Promise.resolve(parseInt(x.innerHTML));
  }
}

function onMsg(m)
{
  console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx test message received!");
  console.log(m);
  if (m.action == "queryTotal") {
    return queryTotal();
  } else if (m.action == "openDetail") {
    return openDetail(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
