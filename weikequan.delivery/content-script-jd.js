console.log("Content script of JD is running");

function delivery(id)
{
  console.log("11111111111111111");
  console.log($("div.ivu-select-selection"))
  if ($("div.ivu-select-selection").length == 1) {
    $("div.ivu-select-selection")[0].click()
    $("ul.ivu-select-dropdown-list li").each(function(){
      if ($(this).text() == '中通速递') {
        $(this).click()
        console.log("设置物流公司为: 中通速递");
        return false
      }
    });
    $("div.out-delivery-input.ivu-input-wrapper.ivu-input-type input")[0].value = id;
    console.log("设置物流单号为: " + id);
    //$("button.btn-so.ivu-btn.ivu-btn-primary")[0].click();
    return Promise.resolve("ok");
  }
  console.log("22222222222");
  return Promise.reject(new Error("设置物流信息失败"));
}

function onMsg(m)
{
  return delivery(m)
}

browser.runtime.onMessage.addListener(onMsg);
