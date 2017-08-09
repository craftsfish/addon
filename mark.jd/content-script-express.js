function getExpressID(a)
{
  $("#postscript")[0].value = a;
  var btn = $("#imagestijia");
  new Promise((resolve)=>{resolve("ok")}).then(()=>{btn.click()});
  return Promise.resolve("ok");
}

function onMsg(m)
{
  if (m.action == "getExpressID") {
    return getExpressID(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
