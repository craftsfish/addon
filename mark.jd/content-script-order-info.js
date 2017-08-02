/*
 * $(".hiddenValue")[0].click()
 * $("#mobile")[0].innerHTML
 * $("#mobile")[0].parentNode.parentNode
 * $("#mobile")[0].parentNode.parentNode.childNodes[0].childNodes[3].innerHTML
 * $("#mobile")[0].parentNode.parentNode.childNodes[2].childNodes[3].innerHTML
 */
function showMobile()
{
  var x = $(".hiddenValue")[0]
  if (x) {
    x.click()
    return Promise.resolve("ok");
  } else {
    return Promise.reject(new Error("failed to show mobile"));
  }
}

function getAddress()
{
  var m = $("#mobile")[0].innerHTML;
  var n = $("#mobile")[0].parentNode.parentNode.childNodes[0].childNodes[3].innerHTML;
  var a = $("#mobile")[0].parentNode.parentNode.childNodes[2].childNodes[3].innerHTML;
  return Promise.resolve(n + "," + m + "," + a + ",000000");
}

function onMsg(m)
{
  if (m.action == "showMobile") {
    return showMobile();
  } else if (m.action == "getAddress") {
    return getAddress();
  }
}
browser.runtime.onMessage.addListener(onMsg);
