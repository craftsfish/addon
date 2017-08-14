console.log("============== jd login content script loaded");

function getWindowSize()
{
  var x = $("#account-login")[0];
  new Promise((resolve)=>{resolve("ok")}).then(()=>{x.click()});
  return Promise.resolve({m: "window size", w: window.innerWidth, h: window.innerHeight});
}

function onMsg(m)
{
  if (m.action == "getWindowSize") {
    return getWindowSize();
  }
}
browser.runtime.onMessage.addListener(onMsg);
