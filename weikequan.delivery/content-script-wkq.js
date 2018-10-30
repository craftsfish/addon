log("Content script of WKQ is running");

function init(id)
{
  $("#taskCategroy option").each(function(){
    if ($(this).text() == '销量任务') {
      $(this).attr('selected', 'selected')
    }
  });
  $("#status option").each(function(){
    if ($(this).text() == '待发货') {
      $(this).attr('selected', 'selected')
    }
  });
  $("#selSearch option").each(function(){
    if ($(this).text() == '订单编号') {
      $(this).attr('selected', 'selected')
    }
  });
  $("#txtSearch")[0].value = id;
  $("#fm")[0].submit();
  return Promise.resolve("ok");
}

function openDeliveryDialog() {
  if ($(".input-butto100-xls").length == 1) {
    $(".input-butto100-xls")[0].click()
    return Promise.resolve("ok");
  }
  return Promise.reject(new Error("打开发货对话框失败"));
}

function onMsg(m)
{
  if (m.action == "init") {
    return init(m.data);
  } else if (m.action == "open") {
    return openDeliveryDialog(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
