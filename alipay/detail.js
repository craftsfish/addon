log("detail");

function getFunders() {
  var funders = jQuery(".fundTool");
  var i = 0;
  var result = "";

  for (i=0; i<funders.length; i++) {
    if (i > 0) {
      result += ",";
    }

    var f = undefined;
    var a = funders[i].getElementsByTagName("a");
    if (a.length == 0) {
      f = funders[i];
    } else {
      f = a[0];
    }
    result += f.innerHTML.replace(/[\t\n]/g, "");
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
