log("Content script of TMall Candidate is running");

function collect(data)
{
  var r = ''
  $("div .table-wrapper").find("tr").each(function(){
    var s = ''
    s += this.childNodes[0].childNodes[0].innerHTML
    for (var i=3; i<=7; i++) {
      s += ',' + this.childNodes[i].innerHTML
    }
    r += s + '\n'
  });
  console.log(r)
  return Promise.resolve("ok");
}

function onMsg(m)
{
  log('onMsg')
  if (m.action == "collect") {
    return collect(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
