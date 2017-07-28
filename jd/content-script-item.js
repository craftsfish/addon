console.log("content script of ITEM is loaded!");

var myPort = browser.runtime.connect({name:"port-from-item"});
myPort.postMessage({greeting: "hello from item script"});

myPort.onMessage.addListener(onBGMsg);

function onBGMsg(m) {
  console.log("In item script, received message from background script: ");
  console.log(m);
}
