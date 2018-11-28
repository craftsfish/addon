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

function select(data)
{
  var supplier = '中通快递'
  if ((data.supplier == '邮政EMS标准') || (data.supplier == '邮政EMS经济')) {
    supplier = '其他快递'
  }
  log(data.supplier)
  $("iframe").contents().find("#ExpressCompany option").each(function(){
    if ($(this).text() == supplier) {
      $(this).attr('selected', 'selected')
    }
  });
  $("iframe").contents().find(".input_305")[0].value = data.id;
  //$("iframe").contents().find("#btnSubmit")[0].click();
  return Promise.resolve("ok");
}

function onMsg(m)
{
  if (m.action == "init") {
    return init(m.data);
  } else if (m.action == "open") {
    return openDeliveryDialog(m.data);
  } else if (m.action == "select") {
    return select(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
