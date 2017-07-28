console.log("content script of SD is loaded!");

var myPort = browser.runtime.connect({name:"port-from-sd"});
myPort.postMessage({greeting: "hello from sd script"});

myPort.onMessage.addListener(onBGMsg);

function onBGMsg(m) {
  console.log("In sd script, received message from background script: ");
  console.log(m);

  if (m.query == "publish load") {
    loadPublisher();
  }
}

function loadPublisher() {
  $("a:contains('发布任务')")[0].click();
}
