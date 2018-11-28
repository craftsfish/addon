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
    if ($(this).text() == '店铺名称') {
      $(this).attr('selected', 'selected')
    }
  });
  $("#txtSearch")[0].value = '为绿厨具专营店';
  var d = new Date()
  var s_date = "" + d.getFullYear() + "-" + (d.getMonth()+1) + '-' +d.getDate() + ' 00:00'
  $("#EndDate")[0].value = s_date;
  $("#fm")[0].submit();
  return Promise.resolve("ok");
}

function getOrders() {
  var r = ""
  $("tbody tr:gt(0)").each(function(){
    var x = $("td:eq(1)", this).children()[1].innerHTML
    var start = x.indexOf('：')
    r += x.substr(start+1) + '\n'
  });
  console.log(r)
  return Promise.resolve("ok");
}

function openDeliveryDialog() {
  if ($(".input-butto100-xls").length == 1) {
    $(".input-butto100-xls")[0].click()
    return Promise.resolve("ok");
  }
  return Promise.reject(new Error("打开发货对话框失败"));
}

function select(id)
{
  $("iframe").contents().find("#ExpressCompany option").each(function(){
    if ($(this).text() == '中通快递') {
      $(this).attr('selected', 'selected')
    }
  });
  $("iframe").contents().find(".input_305")[0].value = id;
  //$("iframe").contents().find("#btnSubmit")[0].click();
  return Promise.resolve("ok");
}

function onMsg(m)
{
  if (m.action == "init") {
    return init(m.data);
  } else if (m.action == "getOrders") {
    return getOrders(m.data);
  } else if (m.action == "open") {
    return openDeliveryDialog(m.data);
  } else if (m.action == "select") {
    return select(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
