console.log("============== jd login content script loaded");

function composeLogin()
{
  var x = $("#account-login")[0];
  new Promise((resolve)=>{resolve("ok")}).then(()=>{x.click()});
  return Promise.resolve("ok");
}

function onMsg(m)
{
  if (m.action == "composeLogin") {
    return composeLogin();
  }
}
browser.runtime.onMessage.addListener(onMsg);
