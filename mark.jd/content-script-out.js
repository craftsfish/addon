function outOrder()
{
  $("#custom")[0].value = "2465";
  $("#tempField")[0].value = "";
  var btn = $("#out")[0];
  throw new Error("xxxxxxxxxxxx   NO express id");
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
    return outOrder();
  } else if (m.action == "back") {
    return back();
  }
}
browser.runtime.onMessage.addListener(onMsg);
