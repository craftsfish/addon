console.log("Content script of JD is running");

function delivery(id)
{
  $("div.ivu-select-selection")[0].click()
  $("ul.ivu-select-dropdown-list li")[2].click()
  $("div.out-delivery-input.ivu-input-wrapper.ivu-input-type input")[0].value = id;
  //$("button.btn-so.ivu-btn.ivu-btn-primary")[0].click();
  return Promise.resolve("ok");
}

function onMsg(m)
{
  return delivery(m)
}

browser.runtime.onMessage.addListener(onMsg);
