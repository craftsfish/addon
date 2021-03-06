log("Content script of JD is running");

function openSupplierCandidates(data)
{
  if ($("div.ivu-select-selection").length == 1) {
    $("div.ivu-select-selection")[0].click()
    return Promise.resolve("ok");
  }
  return Promise.reject(new Error("打开物流供应商列表失败"));
}

function selectSupplier(data)
{
  try {
    $("ul.ivu-select-dropdown-list li").each(function(){
      if ($(this).text() == '中通速递') {
        $(this).click()
      }
    });
  } catch (err) {
    log(`Error: ${err}`)
  }
  return Promise.resolve("ok");
}

function setExpressId(id)
{
  $("div.out-delivery-input.ivu-input-wrapper.ivu-input-type input")[0].value = id+'x';
  return Promise.resolve("ok");
}

function deliver(data)
{
  $("button.btn-so.ivu-btn.ivu-btn-primary")[0].click();
  return Promise.resolve("ok");
}

function onMsg(m)
{
  if (m.action == "openSupplierCandidates") {
    return openSupplierCandidates(m.data);
  } else if (m.action == "selectSupplier") {
    return selectSupplier(m.data);
  } else if (m.action == "setExpressId") {
    return setExpressId(m.data);
  } else if (m.action == "deliver") {
    return deliver(m.data);
  }
}
browser.runtime.onMessage.addListener(onMsg);
