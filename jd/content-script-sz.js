console.log("content script of sz is loaded!");

var myPort = browser.runtime.connect({name:"port-from-sz"});
myPort.postMessage({greeting: "hello from content script"});

myPort.onMessage.addListener(onBGMsg);

function onBGMsg(m) {
  console.log("In sz script, received message from background script: ");
  console.log(m);

  if (m.query == "rate") {
    while ($("span:contains('访客数')")[0].childNodes[2].className != "ng-scope grace-icon-sort-down") {
      $("span:contains('访客数')")[0].click();
    }
    rate = parseFloat($("tbody tr:eq(0) td:eq(6) span span")[0].innerHTML);
    if (rate < 8) {
      console.log(rate);
      myPort.postMessage({reply: rate.toString()});
    }
  }
}
