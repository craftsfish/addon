#!/usr/bin/python

import sys
import json
import struct
import smtplib
import os
import time
import pyautogui
from email.mime.text import MIMEText
from email.header import Header

# load positions
f = open('position', 'r')
pos = json.load(f)
f.close()

# load password
f = open('x.pass', 'r')
password = json.load(f)
f.close()

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

def sndMsg(m, d=""):
    msg = {'m': m, 'd': d}
    sendMessage(encodeMessage(msg))

while True:
    receivedMessage = getMessage()
    if receivedMessage == "ping":
        sndMsg(sendmail())
    elif receivedMessage == "inputUser":
        x, y = pos[0]
        pyautogui.moveTo(x, y, duration=0.25)
        pyautogui.doubleClick()
        pyautogui.typewrite(['delete'], 0.25)
        pyautogui.typewrite(password[0][0], 0.25)
        sndMsg("inputUser ok")
    elif receivedMessage == "inputPassword":
        x, y = pos[1]
        pyautogui.moveTo(x, y, duration=0.25)
        pyautogui.click()
        pyautogui.typewrite(password[0][1], 0.25)
        sndMsg("inputPassword ok")
    elif receivedMessage == "login":
        x, y = pos[2]
        pyautogui.moveTo(x, y, duration=0.25)
        pyautogui.click()
    elif receivedMessage == "getFakeAccount":
        sndMsg("fakeaccount", password[1])
    elif receivedMessage == "qqLogin":
        x, y = pos[3]
        pyautogui.moveTo(x, y, duration=0.25)
        pyautogui.click()
    elif receivedMessage == "qqAccountLogin":
        x, y = pos[4]
        pyautogui.moveTo(x, y, duration=0.25)
        pyautogui.click()
        time.sleep(2)
        x, y = pos[5]
        pyautogui.moveTo(x, y, duration=0.25)
        pyautogui.doubleClick()
        pyautogui.typewrite(['delete'], 0.25)
        pyautogui.typewrite(password[2][0], 0.25)
        x, y = pos[6]
        pyautogui.moveTo(x, y, duration=0.25)
        pyautogui.click()
        pyautogui.typewrite(password[2][1], 0.25)
        x, y = pos[7]
        pyautogui.moveTo(x, y, duration=0.25)
        pyautogui.click()
    else:
        sndMsg("unknown background message")
