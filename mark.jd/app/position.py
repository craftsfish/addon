#!/usr/bin/python
import pyautogui
import json

pos = []
f = open('position', 'w')

raw_input('Please move mouse to JDLogin User input!')
jd_user = pyautogui.position()
print jd_user
pos.append(jd_user)
raw_input('Please move mouse to JDLogin Password input!')
jd_passwd = pyautogui.position()
print jd_passwd
pos.append(jd_passwd)
raw_input('Please move mouse to JDLogin Login button!')
jd_btn = pyautogui.position()
print jd_btn
pos.append(jd_btn)
print pos

json.dump(pos, f)
f.close();
