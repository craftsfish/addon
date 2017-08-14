var resolve_setwindow = undefined;

function jdLogin() {
  sndMsg(ID_JDLOGIN, "getWindowSize")
  .then(onJDComposeLogin)
  .then(() => {throw new Error("Currently, we cannot set login info automatically.");})
  .catch(onJDLoginError);
}

function onJDComposeLogin(m) {
  port.postMessage(m);
  return new Promise((resolve)=>{resolve_setwindow = resolve;});
}

function onJDLoginError(error) {
  err(`Error: ${error}`);
}
