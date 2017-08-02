function outOrder(postID)
{
  $("#custom")[0].value = "2465";
  $("#tempField")[0].value = postID;
  var btn = $("#out")[0];
  new Promise((resolve)=>{resolve("ok")}).then(()=>{btn.click();});
  return Promise.resolve("ok");
}

function back()
{
  new Promise((resolve)=>{resolve("ok")}).then(()=>{window.history.back();});
  return Promise.resolve("ok");
}

function onMsg(m)
{
  if (m.action == "outOrder") {
    return outOrder(m.data);
  } else if (m.action == "back") {
    return back();
  }
}
browser.runtime.onMessage.addListener(onMsg);
