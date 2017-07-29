const ID = "ShangZhi"
console.log("content script of " + ID + " is loaded!");

var item = 5;

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

  if (m.query == "rate") {
    var visit = $("table:eq(0) th:eq(5) span")[0];
    if (visit == undefined) {
      sendMsg({reply: "try again"});
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
        sendMsg({reply: "found item", data: i.toString()});
      } else {
        sendMsg({reply: "no item"});
      }
    }
  } else if (m.query == "detail") {
    $("tbody tr:eq(" + item.toString() + ") td:eq(0) a:eq(1)")[0].click();
    sendMsg({reply: "detail"});
  }
}
