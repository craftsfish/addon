console.log("content script of sz is loaded!");

var item = 5;

var myPort = browser.runtime.connect({name:"port-from-sz"});
myPort.postMessage({greeting: "hello from SZ script"});

myPort.onMessage.addListener(onBGMsg);

function onBGMsg(m) {
  console.log("In sz script, received message from background script: ");
  console.log(m);

  if (m.query == "rate") {
    var visit = $("table:eq(0) th:eq(5) span")[0];
    if (visit == undefined) {
      myPort.postMessage({reply: "try again"});
    } else {
      while (visit.childNodes[2].className != "ng-scope grace-icon-sort-down") {
        visit.click();
      }
      var i = 0;
      for (i=0; i<5; i++) {
        rate = parseFloat($("tbody tr:eq(" + i.toString() + ") td:eq(6) span span")[0].innerHTML);
        if (rate < 8) {
          if (i <= 1) { /* for first 2 items, manipulate rate mandatory */
            break;
          } else {
            if (Math.random() == 1) { /* for items from 3, manipulate rate randomly */
              break;
            }
          }
        }
      }
      i = 0; /* TODO: for test only */
      if (i < 5) {
        console.log("Planning to manipulate item " + i.toString());
        item = i;
        myPort.postMessage({reply: "found item", data: i.toString()});
      } else {
        myPort.postMessage({reply: "no item"});
      }
    }
  } else if (m.query == "detail") {
    $("tbody tr:eq(" + item.toString() + ") td:eq(0) a:eq(1)")[0].click();
    myPort.postMessage({reply: "detail"});
  }
}
