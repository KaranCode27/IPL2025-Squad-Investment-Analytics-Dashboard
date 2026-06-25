import csv
import difflib

players = [
    'Rishabh Pant', 'Shreyas Iyer', 'Venkatesh Iyer', 'Heinrich Klaasen', 'Virat Kohli',
    'Nicholas Pooran', 'Pat Cummins', 'Jasprit Bumrah', 'Rashid Khan', 'Sanju Samson',
    'Yashasvi Jaiswal', 'Ruturaj Gaikwad', 'Ravindra Jadeja', 'Arshdeep Singh', 'Yuzvendra Chahal',
    'Shubman Gill', 'Suryakumar Yadav', 'Hardik Pandya', 'Rohit Sharma', 'Jos Buttler',
    'KL Rahul', 'Kuldeep Yadav', 'Rinku Singh', 'Jofra Archer', 'Mohammed Siraj',
    'Andre Russell', 'Sunil Narine', 'Varun Chakravarthy', 'Mitchell Starc', 'Ishan Kishan'
]

# Load batters
batters = []
with open(r'd:\PowerBI\archive\IPL2025Batters.csv', encoding='utf-8-sig') as f:
    r = csv.reader(f)
    next(r)
    for row in r:
        if row:
            batters.append(row[0].strip())

# Load bowlers
bowlers = []
with open(r'd:\PowerBI\archive\IPL2025Bowlers.csv', encoding='utf-8-sig') as f:
    r = csv.reader(f)
    next(r)
    for row in r:
        if row:
            bowlers.append(row[0].strip())

all_csv_names = set(batters) | set(bowlers)

print("Exact match check:")
for p in players:
    if p in all_csv_names:
        print(f"{p}: Match found")
    else:
        # find closest match
        closest = difflib.get_close_matches(p, all_csv_names, n=1)
        print(f"{p}: MISMATCH. Closest in CSV: {closest}")
