var resolve_jdlogin = undefined;

function jdLogin() {
  sndMsg(ID_JDLOGIN, "composeLogin")
  .then(onJDComposeLogin)
  .then(onJDUserInputed)
  .then(onJDPasswordInputed)
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

function onJDPasswordInputed() {
  port.postMessage("login");
  return new Promise((resolve)=>{resolve("ok")});
}

function onJDLoginError(error) {
  err(`Error: ${error}`);
}
