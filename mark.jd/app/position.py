#!/usr/bin/python
import pyautogui
import json

pos = []
f = open('position', 'w')

raw_input('Please move mouse to JDLogin User input!')
p = pyautogui.position()
print p
pos.append(p)
raw_input('Please move mouse to JDLogin Password input!')
p = pyautogui.position()
print p
pos.append(p)
raw_input('Please move mouse to JDLogin Login button!')
p = pyautogui.position()
print p
pos.append(p)
raw_input('Please move mouse to QQLogin button!')
p = pyautogui.position()
print p
pos.append(p)
print pos

json.dump(pos, f)
f.close();
