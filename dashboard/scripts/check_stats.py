import csv

players = [
    'Rishabh Pant', 'Shreyas Iyer', 'Venkatesh Iyer', 'Heinrich Klaasen', 'Virat Kohli',
    'Nicholas Pooran', 'Pat Cummins', 'Jasprit Bumrah', 'Rashid Khan', 'Sanju Samson',
    'Yashasvi Jaiswal', 'Ruturaj Gaikwad', 'Ravindra Jadeja', 'Arshdeep Singh', 'Yuzvendra Chahal',
    'Shubman Gill', 'Suryakumar Yadav', 'Hardik Pandya', 'Rohit Sharma', 'Jos Buttler',
    'KL Rahul', 'Kuldeep Yadav', 'Rinku Singh', 'Jofra Archer', 'Mohammed Siraj',
    'Andre Russell', 'Sunil Narine', 'Varun Chakravarthy', 'Mitchell Starc', 'Ishan Kishan'
]

batters = {}
with open(r'd:\PowerBI\archive\IPL2025Batters.csv', encoding='utf-8-sig') as f:
    r = csv.reader(f)
    header = next(r)
    # clean header
    header = [h.strip().replace('\ufeff', '').replace('"', '') for h in header]
    print('Batters header:', header)
    for row in r:
        if row:
            batters[row[0].strip()] = row

bowlers = {}
with open(r'd:\PowerBI\archive\IPL2025Bowlers.csv', encoding='utf-8-sig') as f:
    r = csv.reader(f)
    header = next(r)
    header = [h.strip().replace('\ufeff', '').replace('"', '') for h in header]
    print('Bowlers header:', header)
    for row in r:
        if row:
            bowlers[row[0].strip()] = row

print('Found in batters:', len(set(players) & set(batters.keys())))
print('Found in bowlers:', len(set(players) & set(bowlers.keys())))
print('Missing in both:', set(players) - (set(batters.keys()) | set(bowlers.keys())))

# Let's list some elements in batters and bowlers to see their names
print("A few batters names:", list(batters.keys())[:10])
print("A few bowlers names:", list(bowlers.keys())[:10])
