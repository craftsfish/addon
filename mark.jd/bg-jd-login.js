var resolve_jdlogin = undefined;

function jdLogin() {
  sndMsg(ID_JDLOGIN, "composeLogin")
  .then(onJDComposeLogin)
  .then(onJDUserInputed)
  .then(() => {throw new Error("Currently, we cannot set login info automatically.");})
  .catch(onJDLoginError);
}

function onJDComposeLogin(m) {
  port.postMessage("inputUser");
  return new Promise((resolve)=>{resolve_jdlogin = resolve;});
}

function onJDUserInputed() {
  port.postMessage("inputPassword");
  return new Promise((resolve)=>{resolve_jdlogin = resolve;});
}

function onJDLoginError(error) {
  err(`Error: ${error}`);
}
