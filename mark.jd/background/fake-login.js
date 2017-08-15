var resolve_fakelogin = undefined;
log("fake login");

function fakeLogin() {
  port.postMessage("getFakeAccount");
  new Promise((resolve)=>{resolve_fakelogin = resolve;})
  .then(onAccountget)
  .then(onDelayLogin)
  .catch(onFakeLoginError);
}

function onAccountget(m) {
  return new Promise((resolve)=>{resolve(m);})
}

function onDelayLogin(m) {
  return sndMsg(ID_FAKELOGIN, "login", m);
}

function onFakeLoginError(error) {
  err(`Error: ${error}`);
}
