function setMark()
{
  $("#remarkArea")[0].value = "1 AT";
  $("#tagblue")[0].click();
  $("#rSubmitButton")[0].click();
  return Promise.resolve("ok");
}


function editMark(id)
{
  if ($("span:contains('订单编号')")[0].childNodes[1].innerHTML == id) {
    var x = $("a:contains('修改备注')")[0];
    if (x == undefined) {
      x = $("a:contains('添加备注')")[0];
    }

    if (x != undefined) {
      x.click();
      return Promise.resolve("ok");
    }
  }
  return Promise.reject(new Error("cannot find edit mark button"));
}

function query(v)
{
    $("input#orderId")[0].value = v;
    $("#orderQueryBtn")[0].click();
    return Promise.resolve("ok");
}

function onMsg(m)
{
  if (m.action == "queryOrder") {
    return query(m.data);
  } else if (m.action == "editMark") {
    return editMark(m.data);
  } else if (m.action == "setMark") {
    return setMark(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
