'''
Python implementation of Krippendorff's alpha -- inter-rater reliability
(c)2011-17 Thomas Grill (http://grrrr.org)
Python version >= 2.4 required
'''

from __future__ import print_function
try:
	import numpy as np
except ImportError:
	np = None
import json
import csv


def nominal_metric(a, b):
	return a != b


def interval_metric(a, b):
	return (a-b)**2


def ratio_metric(a, b):
	return ((a-b)/(a+b))**2


def krippendorff_alpha(data, metric=interval_metric, force_vecmath=False, convert_items=float, missing_items=None):
	'''
	Calculate Krippendorff's alpha (inter-rater reliability):
	
	data is in the format
	[
		{unit1:value, unit2:value, ...},  # coder 1
		{unit1:value, unit3:value, ...},   # coder 2
		...                            # more coders
	]
	or 
	it is a sequence of (masked) sequences (list, numpy.array, numpy.ma.array, e.g.) with rows corresponding to coders and columns to items
	
	metric: function calculating the pairwise distance
	force_vecmath: force vector math for custom metrics (numpy required)
	convert_items: function for the type conversion of items (default: float)
	missing_items: indicator for missing items (default: None)
	'''
	
	# number of coders
	m = len(data)
	
	# set of constants identifying missing values
	maskitems = list(missing_items)
	if np is not None:
		maskitems.append(np.ma.masked_singleton)
	
	# convert input data to a dict of items
	units = {}
	for d in data:
		try:
			# try if d behaves as a dict
			diter = d.items()
		except AttributeError:
			# sequence assumed for d
			diter = enumerate(d)
			
		for it, g in diter:
			if g not in maskitems:
				try:
					its = units[it]
				except KeyError:
					its = []
					units[it] = its
				its.append(convert_items(g))


	units = dict((it, d) for it, d in units.items() if len(d) > 1)  # units with pairable values
	n = sum(len(pv) for pv in units.values())  # number of pairable values
	
	if n == 0:
		raise ValueError("No items to compare.")
	
	np_metric = (np is not None) and ((metric in (interval_metric, nominal_metric, ratio_metric)) or force_vecmath)
	
	Do = 0.
	for grades in units.values():
		if np_metric:
			gr = np.asarray(grades)
			Du = sum(np.sum(metric(gr, gri)) for gri in gr)
		else:
			Du = sum(metric(gi, gj) for gi in grades for gj in grades)
		Do += Du/float(len(grades)-1)
	Do /= float(n)

	De = 0.
	for g1 in units.values():
		if np_metric:
			d1 = np.asarray(g1)
			for g2 in units.values():
				De += sum(np.sum(metric(d1, gj)) for gj in g2)
		else:
			for g2 in units.values():
				De += sum(metric(gi, gj) for gi in g1 for gj in g2)
	De /= float(n*(n-1))

	return 1.-Do/De if (Do and De) else 1.



if __name__ == '__main__': 
	print("Example from http://en.wikipedia.org/wiki/Krippendorff's_Alpha")


	##########################################
	#Parsing Data
	##########################################



	array = []

	allOutputs = {}
	allOutputsScores = {}

	with open('D5S1_test.json') as data_file:    
		datas = json.load(data_file)

		outputs = datas['output']
		#print(outputs)
		should = False
		allArrFirst = []
		allArrSecond = []
		for key in outputs['session5']:
			log = outputs['session5'][key]['arrLog']
			idss = outputs['session5'][key]['id']
			score = datas['ids'][idss]['score']
			section = outputs['session5'][key]['sectionCompleting']

			scores = []
			arr = []

			for strat in log:
				if (strat['strategy'] == 'SD'):
					arr += '1'
				else:
					arr += '0'
			if (section not in allOutputs):
				allOutputs[section] = [arr]
				allOutputsScores[section] = [score]
			else:
				allOutputs[section] += [arr]
				allOutputsScores[section] += [score]


			# if (len(log) == 108):
			#     allArrFirst += [arr]
			#     scores += [score]
			# else:
			#     allArrSecond += [arr]
			#     #scores += [score]
		#array = allArrSecond


	##########################################
	#Finding Outlier
	##########################################

	# for key in allOutputs:
	# 	allTotals = []
	# 	print(key)
	# 	for i in range(0, len(allOutputs[key])):
	# 		total = 0
	# 		for k in range(0, len(allOutputs[key][i])):
	# 			if (allOutputs[key][i][k] == "1"):
	# 				total = total + 1
	# 		allTotals += [total]

	# 	sumTotals = 0
	# 	for i in range(len(allTotals)):
	# 		sumTotals += allTotals[i]

	# 	avgTotal = sumTotals/len(allTotals)

	# 	farthestPos = 0
	# 	farthestDist = 0



	# 	for i in range(len(allTotals)):
	# 		if (abs(allTotals[i] - avgTotal) > farthestDist):
	# 			farthestDist = abs(allTotals[i] - avgTotal)
	# 			farthestPos = i
	# 	allOutputs[key].pop(farthestPos)
	

	##########################################
	#Handle Expert Data
	##########################################

	allExpert = {}
	tempLog = []

	with open('D5S1_expert.json') as data_file:
	    expert = json.load(data_file)
	    tempLog = expert['tempLog']

	for i in range(0, len(tempLog)):
		expertArr = []
		for j in range(0, len(tempLog[i])):
		    if (tempLog[i][j] == '0'):
		        expertArr += '0'
		    else:
		        expertArr += '1'
		allExpert["D5S1_" + str(i + 1)] = expertArr



	##########################################
	#No weighting
	##########################################


	allNoWeight = {}

	for key in allOutputs:
		arrayNoWeight = []

		for i in range(0, len(allOutputs[key][0])): 
		    tempSum = 0
		    for j in range(0, len(allOutputs[key])):
		        if (allOutputs[key][j][i] == '1'):
		            tempSum = tempSum + 1
		    if (tempSum > 2):
		        arrayNoWeight += '1'
		    else:
		        arrayNoWeight += '0'

		allNoWeight[key] = arrayNoWeight


	# ##########################################
	# #Handle weighting by time (std) using mean 
	# ##########################################


	timesTest2 = [417, 357, 400, 621, 597, 587]
	timesTest3 = [271, 686, 247, 309]
	timesTest4 = [190, 657, 561, 190, 490]
	times = [379, 911, 487, 630, 332]

	# a = np.array(times)
	# std = np.std(a)

	# sumTimes = 0
	# for i in range(len(times)):
	#     sumTimes += times[i]

	# avgTime = sumTimes/len(times)


	# sumStd = 0
	# stdList = []
	# for i in range(len(times)):
	#     temp = abs(avgTime - times[i])
	#     thisStd = temp * 10000 / std
	#     stdList += [thisStd]
	#     sumStd += thisStd



	# timesStd = []
	# for i in range(0, len(stdList)):
	#     perc = (stdList[i] * 10000 / sumStd)
	#     timesStd += [perc]


	# timesAvgArr = []

	# for i in range(0, len(array[0])): 
	#     tempSum = 0
	#     for j in range(0, len(timesStd)):
	#         if (array[j][i] == '1'):
	#             tempSum += (timesStd[j])
	#     if (tempSum > 5000):
	#         timesAvgArr += '1'
	#     else:
	#         timesAvgArr += '0'



	#########################################
	#Handle weighting by time (std) using max as baseline 
	##########################################

	# sumTimesMax = 0
	# sumTimesArr = []

	# for i in range(0, len(times)):
	#     sumTimesMax += times[i]

	# for i in range(0, len(times)):
	#     perc = (times[i] * 10000 / sumTimesMax)
	#     sumTimesArr += [perc]

	# sumTimesArr.pop(3)

	# timesMaxArr = []

	# for i in range(0, len(array[0])): 
	#     tempSum = 0
	#     for j in range(0, len(sumTimesArr)):
	#         if (array[j][i] == '1'):
	#             tempSum += (sumTimesArr[j])
	#     if (tempSum > 5000):
	#         timesMaxArr += '1'
	#     else:
	#         timesMaxArr += '0'


	##########################################
	#Handle weighting by quiz score
	##########################################

	allAvgQuiz = {}

	for key in allOutputsScores:

		avgQuizArr = []
		weightsQuiz = []
		sumScoreQuiz = 0

		for i in range(0, len(allOutputsScores[key])):
		    sumScoreQuiz += allOutputsScores[key][i]

		for i in range(0, len(allOutputsScores[key])):
		    perc = (allOutputsScores[key][i] * 10000 /sumScoreQuiz)
		    weightsQuiz += [perc]

		#weightsQuiz.pop(3)

		for i in range(0, len(allOutputs[key][0])): 
		    tempSum = 0
		    for j in range(0, len(weightsQuiz)):
		        if (allOutputs[key][j][i] == '1'):
		            tempSum += (weightsQuiz[j])
		    if (tempSum > 5000):
		        avgQuizArr += '1'
		    else:
		        avgQuizArr += '0'

		allAvgQuiz[key] = avgQuizArr


	##########################################
	#Handle weighting by quiz score and times
	##########################################

	# timeAndQuizArr = []

	# for i in range(0, len(array[0])): 
	#     tempSum = 0
	#     for j in range(0, len(weightsQuiz)):
	#         if (array[j][i] == '1'):
	#             tempSum += (weightsQuiz[j])
	#             tempSum += (sumTimesArr[j])
	#     if (tempSum > 10000):
	#         timeAndQuizArr += '1'
	#     else:
	#         timeAndQuizArr += '0'


	##########################################
	#Calculating Alpha value
	##########################################

	#nowArray = [expertArr, timesMaxArr]

	missing = '*' # indicator for missing values

	for key in allOutputs:
		nowArray = [allExpert[key], allAvgQuiz[key]]
		print("IRR for " + key + ": %.3f" % krippendorff_alpha(nowArray, nominal_metric, missing_items=missing))
