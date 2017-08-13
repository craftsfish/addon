#!/usr/bin/python
# -*- coding: UTF-8 -*-

import sys
import json
import struct

def log(m):
  f.write(m)
  f.flush()

def getMessage():
    rawLength = sys.stdin.read(4)
    if len(rawLength) == 0:
        sys.exit(0)
    messageLength = struct.unpack('@I', rawLength)[0]
    message = sys.stdin.read(messageLength)
    return json.loads(message)

# Encode a message for transmission,
# given its content.
def encodeMessage(messageContent):
    encodedContent = json.dumps(messageContent)
    encodedLength = struct.pack('@I', len(encodedContent))
    return {'length': encodedLength, 'content': encodedContent}

# Send an encoded message to stdout
def sendMessage(encodedMessage):
    sys.stdout.write(encodedMessage['length'])
    sys.stdout.write(encodedMessage['content'])
    sys.stdout.flush()

while True:
    receivedMessage = getMessage()
    if receivedMessage == "open":
      f = open('/tmp/alipay.csv', 'w')
      sendMessage(encodeMessage("opened"))
    elif receivedMessage == "close":
      f.close();
      sendMessage(encodeMessage("closed"))
    else:
      log(receivedMessage.encode('utf8'))
      sendMessage(encodeMessage("recorded"))
