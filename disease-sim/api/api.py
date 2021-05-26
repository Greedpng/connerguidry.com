from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS
from scipy.stats import norm
import matplotlib.pyplot as plt
import tkinter as tk
import random
import time

# start flask server: cd api -> venv\Scripts\activate -> flask startflask ru

app = Flask(__name__)
CORS(app)

numPeople = int(float(100))
startingImmunity = int(float(0))
startingInfecters = int(float(10))
daysContagious = int(float(30))
lockdownDay = int(float(14))
lockdownDayEnd = int(float(100))
maskDay = int(float(14))
maskDayEnd = int(float(100))

peopleDictionary = []
#simulation of a single person
class Person():
    def __init__(self, startingImmunity):
        if random.randint(0,100)<startingImmunity:
            self.immunity = True
        else:
            self.immunity = False
        self.contagiousness = 0
        self.mask = False
        self.contagiousDays = 0
        #use gaussian distribution for number of friends; average is 5 friends
        self.friends = int((norm.rvs(size=1,loc=0.5,scale=0.15)[0]*10).round(0))
    def wearMask(self):
        self.contagiousness /= 2
    def removeMask(self):
        self.contagiousness *= 2

def initiateSim():
    for x in range(0,numPeople):
        peopleDictionary.append(Person(startingImmunity))
    for x in range(0,startingInfecters):
        peopleDictionary[random.randint(0,len(peopleDictionary)-1)].contagiousness = int((norm.rvs(size=1,loc=0.5,scale=0.15)[0]*10).round(0)*10)
    return daysContagious, lockdownDay, maskDay

def runDay(daysContagious, lockdown):
    #this section simulates the spread, so it only operates on contagious people, thus:
    for person in [person for person in peopleDictionary if person.contagiousness>0 and person.friends>0]:
        peopleCouldMeetToday = int(person.friends/2)
        if peopleCouldMeetToday > 0:
            peopleMetToday = random.randint(0,peopleCouldMeetToday)
        else:
            peopleMetToday = 0

        if lockdown == True:
            peopleMetToday= 0

        for x in range(0,peopleMetToday):
            friendInQuestion = peopleDictionary[random.randint(0,len(peopleDictionary)-1)]
            if random.randint(0,100)<person.contagiousness and friendInQuestion.contagiousness == 0 and friendInQuestion.immunity==False:
                friendInQuestion.contagiousness = int((norm.rvs(size=1,loc=0.5,scale=0.15)[0]*10).round(0)*10)
                print("Person ", peopleDictionary.index(person), " infected Person ", peopleDictionary.index(friendInQuestion))

    for person in [person for person in peopleDictionary if person.contagiousness>0]:
        person.contagiousDays += 1
        if person.contagiousDays > daysContagious:
            person.immunity = True
            person.contagiousness = 0
            print("Person ", peopleDictionary.index(person), " gained immunity")

@app.route('/run-sim', methods = ["POST"])
def sim():
    content = request.get_json()

    global numPeople
    global startingImmunity
    global startingInfecters
    global daysContagious
    global lockdownDay
    global lockdownDayEnd
    global maskDay
    global maskDayEnd

    numPeople = int(float(content['population']))
    startingImmunity = int(float(content['immunity']))
    startingInfecters = int(float(content['startInfected']))
    daysContagious = int(float(content['daysContagious']))
    lockdownDay = int(float(content['lockdownStart']))
    lockdownDayEnd = int(float(content['lockdownEnd']))
    maskDay = int(float(content['maskStart']))
    maskDayEnd = int(float(content['maskEnd']))

    lockdown = False
    contagiousList = []
    daysContagious, lockdownDay, maskDay = initiateSim()
    for x in range(0,100):
        if x==lockdownDay:
            lockdown = True
        if x == maskDay:
            for person in peopleDictionary:
                person.wearMask()
        if x==lockdownDayEnd:
            lockdown = False
        if x == maskDayEnd:
            for person in peopleDictionary:
                person.removeMask()

        print("DAY ", x)
        runDay(daysContagious,lockdown)
        numContagious = len([person for person in peopleDictionary if person.contagiousness>0])
        contagiousList.append(numContagious)
        write = str(numContagious) + "\n"
        print((numContagious), " people are contagious on this day.")

    return jsonify({"contagiousList": contagiousList})