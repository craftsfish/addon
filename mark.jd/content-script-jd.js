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
  } else if (m.action == "editMark") {
    editMark();
  } else if (m.action == "setMark") {
    setMark();
  }
}

function query(v)
{
    $("input#orderId")[0].value = v;
    $("#orderQueryBtn")[0].click();
}

function editMark()
{
  return $("div.order_tbl table tbody tr.content a:contains('修改备注')")[0].click();
}

function setMark()
{
  $("#remarkArea")[0].value = "1 AT";
  $("#tagblue")[0].click();
  $("#rSubmitButton")[0].click();
}
