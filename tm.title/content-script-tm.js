log("Content script of Taobao is running");

function search(data)
{
  $("#q")[0].value = data
  $("#J_SearchForm").submit()
  return Promise.resolve("ok");
}

function collectElements(data)
{
  var elements = []
  $("span.H").each(function(){
    var hit = false
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
  if (m.action == "search") {
    return search(m.data);
  } else if (m.action == "collectElements") {
    return collectElements(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
