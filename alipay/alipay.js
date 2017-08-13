log("alipay");
items = jQuery("#tradeRecordsIndex tbody tr")
log(items.length);

var i = 0;
for (i=0; i<20; i++) {
  var selector = "#tradeRecordsIndex tbody tr:eq(" + i.toString() + ") .time-d";
  log(jQuery(selector)[0].innerHTML);
}
