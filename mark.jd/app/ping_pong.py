#!/usr/bin/python

import sys
import json
import struct
import smtplib
import os
import pyautogui
from email.mime.text import MIMEText
from email.header import Header

x_offset = 0;
y_offset = 0;

def sendmail():
    mail_host="smtp.163.com"
    mail_user="craftsfish@163.com" 
    mail_pass="xxxxxxxx"


    sender = 'craftsfish@163.com'
    receivers = ['craftsfish@163.com']

    msg = MIMEText('ok', 'plain', 'utf-8')
    msg['From'] = Header("lcj", 'utf-8')
    msg['To'] =  Header("lcj", 'utf-8')

    subject = 'heartbeat'
    msg['Subject'] = Header(subject, 'utf-8')

    try:
        smtpObj = smtplib.SMTP_SSL()
        smtpObj.connect(mail_host, 465)
        smtpObj.login(mail_user,mail_pass)
        smtpObj.sendmail(sender, receivers, msg.as_string())
        return "ok"
    except smtplib.SMTPException:
        return "failed"

# Python 2.x version (if sys.stdin.buffer is not defined)
# Read a message from stdin and decode it.
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
    if receivedMessage == "ping":
        sendMessage(encodeMessage(sendmail()))
    elif receivedMessage == "inputUser":
        sendMessage(encodeMessage("xxx"))
    else:
        sendMessage(encodeMessage("unknown background message"))
