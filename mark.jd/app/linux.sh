#!/bin/bash
dir="/usr/lib/mozilla/native-messaging-hosts"
app="ping_pong"
sudo cp $app.json $dir
cat $dir/$app.json
