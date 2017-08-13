log("detail");

function getFunders() {
  var funders = jQuery(".fundTool");
  var i = 0;
  var result = "";

  for (i=0; i<funders.length; i++) {
    var a = funders[i].getElementsByTagName("a");
    if (a.length == 0) {
      result += funders[i].innerHTML;
    } else {
      result += a[0].innerHTML;
    }
  }
  return Promise.resolve(result);
}

function onMsg(m)
{
  if (m.action == "getFunders") {
    return getFunders();
  }
}
browser.runtime.onMessage.addListener(onMsg);
