console.log("============== fake login content script loaded");

function Login(d)
{
  $("#loginform-username")[0].value = d[0];
  $("#loginform-password")[0].value = d[1];
  var x = $(".dl")[0];
  new Promise((resolve)=>{resolve("ok")}).then(()=>{x.click()});
  return Promise.resolve("ok");
}

function onMsg(m)
{
  if (m.action == "login") {
    return Login(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
