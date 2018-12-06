log("Content script of TMall of TMall Candidate is running");

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
}

function collectElements(data)
{
  $("#q")[0].value = data
  $("#J_SearchForm").submit()
  return Promise.resolve("ok");
  var elements = []
  $("span.H").each(function(){
    var hit = false
    if ($(this).parents().filter("div.item.J_MouserOnverReq.item-ad").length > 0) {
      return
    }
    if ($(this).parents().filter("div.tb-combobar.m-tips").length > 0) {
      return
    }
    for (var i=0; i<elements.length; i++) {
      if ($(this).text() == elements[i]) {
        hit = true
        break
      }
    }
    if (!hit) {
      elements[elements.length] = $(this).text()
    }
  });
  return Promise.resolve(elements);
}

function onMsg(m)
{
  if (m.action == "collect") {
    return collect(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
