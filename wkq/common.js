/* log function */
function err(m) {
  var t = new Date().toTimeString();
  console.log(`[${t}]xxxxxxxxxxxx>	${m}`);
}

function log(m) {
  var t = new Date().toTimeString();
  console.log(`[${t}]---->	${m}`);
}

log('common is loaded')
