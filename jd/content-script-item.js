const ID = "Item";
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

  if (m.query == "skuname") {
    sendMsg({reply: "skuname", data: getSKUName()});
  } else if (m.query == "skuimageload") {
    loadSKUImage();
    sendMsg({reply: "skuimageload", data: "ok"});
  } else if (m.query == "skuimage") {
    sendMsg({reply: "skuimage", data: getSKUImage()});
  }
}

function getSKUName() {
  return $(".sku-name")[0].innerHTML;
}

function loadSKUImage() {
  $("#spec-img")[0].click();
}

function getSKUImage() {
  return $("#popup-big-img")[0].src;
}
