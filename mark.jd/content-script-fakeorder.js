function openDetail(i) {
  var d = $("a.xq")[i];
  if (d) {
    d.click();
    return Promise.resolve(d.attributes[1].value.match(/\d+/)[0]);
  } else {
    return Promise.reject(new Error("no detail item"));
  }
}


function queryTotal()
{
  var x = $("a:contains('待审核订单')")[0].childNodes[1];
  if (x == undefined) {
    return Promise.reject(new Error("no order to be handled"));
  } else {
    return Promise.resolve(parseInt(x.innerHTML));
  }
}

function markDone(v) {
  var d = $("a.xq")[v.cur].attributes[1].value.match(/\d+/)[0];
  console.log(`==============makr done with first item ${d} and require item ${v.fakeID}`);
  if (d == v.fakeID) {
    $("a:contains('确认')")[v.cur].click()
    return Promise.resolve("ok");
  }
}

function sureDone() {
  var btn = $("button:contains('确认返款')")[0];
  if (btn != undefined) {
    new Promise((resolve)=>{resolve("ok")}).then(()=>{btn.click()});
    return Promise.resolve("ok");
  } else {
    return Promise.reject(new Error("no sure done button"));
  }
}


function onMsg(m)
{
  if (m.action == "queryTotal") {
    return queryTotal();
  } else if (m.action == "openDetail") {
    return openDetail(m.data);
  } else if (m.action == "markDone") {
    return markDone(m.data);
  } else if (m.action == "sureDone") {
    return sureDone();
  }
}
browser.runtime.onMessage.addListener(onMsg);
