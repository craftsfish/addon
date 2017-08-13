#!/bin/bash
dir="/usr/lib/mozilla/native-messaging-hosts"
manifest="alipay.json"
sudo cp $manifest ${dir}
cat ${dir}/${manifest}
