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

function onMsg(m)
{
  if (m.action == "showMobile") {
    return showMobile();
  }
}
browser.runtime.onMessage.addListener(onMsg);
