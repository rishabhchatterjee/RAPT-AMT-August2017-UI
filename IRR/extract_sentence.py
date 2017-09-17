import json

with open('results/amt_sep15.json') as data_file:
    datas = json.load(data_file)
    for key, strat in datas.items():
        for person, sentence in strat['output'].items():
            for s in sentence['arrLog']:
                print(key + ", " + person + ", " + s['sentence'] + ", " + s['strategy'])



