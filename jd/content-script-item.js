console.log("content script of ITEM is loaded!");

var myPort = browser.runtime.connect({name:"port-from-item"});
myPort.postMessage({greeting: "hello from item script"});

myPort.onMessage.addListener(onBGMsg);

function onBGMsg(m) {
  console.log("In item script, received message from background script: ");
  console.log(m);

  if (m.query == "skuname") {
    myPort.postMessage({reply: "skuname", data: getSKUName()});
  } else if (m.query == "skuimageload") {
    loadSKUImage();
    myPort.postMessage({reply: "skuimageload", data: "ok"});
  } else if (m.query == "skuimage") {
    myPort.postMessage({reply: "skuimage", data: getSKUImage()});
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
