console.log("content script of sz is loaded!");

var myPort = browser.runtime.connect({name:"port-from-sz"});
myPort.postMessage({greeting: "hello from content script"});

myPort.onMessage.addListener(onBGMsg);

function onBGMsg(m) {
  console.log("In sz script, received message from background script: ");
  console.log(m);
}
