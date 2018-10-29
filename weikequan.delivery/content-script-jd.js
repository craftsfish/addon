console.log("Content script of JD is running");

function delivery(id)
{
  if ($("div.ivu-select-selection").length == 1) {
    $("div.ivu-select-selection")[0].click()
    var supplier;
    $("ul.ivu-select-dropdown-list li").each(function(){
      console.log($(this).text());
      if ($(this).text() == '中通速递') {
        supplier = $(this)
        return false;
      }
    });
    console.log(supplier.text());
    supplier.click()
    console.log("设置物流公司为: 中通速递");
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
