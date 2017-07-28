console.log("content script of publisher 1 is loaded!");

var myPort = browser.runtime.connect({name:"port-from-publisher-1"});
myPort.postMessage({greeting: "hello from publisher 1 script"});

myPort.onMessage.addListener(onBGMsg);

function onBGMsg(m) {
  console.log("In publisher 1 script, received message from background script: ");
  console.log(m);
}
