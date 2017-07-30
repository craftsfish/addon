const ID = "JD";
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

  if (m.action == "queryOrder") {
    query(m.data);
  } else if (m.action == "editMark") {
    editMark(m.data);
  } else if (m.action == "setMark") {
    setMark();
  }
}

function query(v)
{
    $("input#orderId")[0].value = v;
    $("#orderQueryBtn")[0].click();
    sendMsg({reply: "queryOrder", data: "ok"});
}

function editMark(id)
{
  if ($("span:contains('订单编号')")[0].childNodes[1].innerHTML == id) {
    $("a:contains('修改备注')")[0].click();
    sendMsg({reply: "editMark", data: "ok"});
  } else {
    sendMsg({reply: "editMark", data: "failed"});
  }
}

function setMark()
{
  $("#remarkArea")[0].value = "1 AT";
  $("#tagblue")[0].click();
  $("#rSubmitButton")[0].click();
}