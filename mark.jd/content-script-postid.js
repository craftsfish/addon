function getPostID()
{
  var id = $("#userRight tbody")[0].childNodes[4].childNodes[1].childNodes[0].innerHTML;
  var btn = $("#userRight tbody")[0].childNodes[6].childNodes[0].childNodes[1];
  new Promise((resolve)=>{resolve("ok")}).then(()=>{btn.click()});
  return Promise.resolve(id);
}

function onMsg(m)
{
  if (m.action == "getPostID") {
    return getPostID();
  }
}
browser.runtime.onMessage.addListener(onMsg);
