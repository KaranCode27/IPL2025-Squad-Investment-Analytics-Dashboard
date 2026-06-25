import csv

players = [
    'Rishabh Pant', 'Shreyas Iyer', 'Venkatesh Iyer', 'Heinrich Klaasen', 'Virat Kohli',
    'Nicholas Pooran', 'Pat Cummins', 'Jasprit Bumrah', 'Rashid Khan', 'Sanju Samson',
    'Yashasvi Jaiswal', 'Ruturaj Gaikwad', 'Ravindra Jadeja', 'Arshdeep Singh', 'Yuzvendra Chahal',
    'Shubman Gill', 'Suryakumar Yadav', 'Hardik Pandya', 'Rohit Sharma', 'Jos Buttler',
    'KL Rahul', 'Kuldeep Yadav', 'Rinku Singh', 'Jofra Archer', 'Mohammed Siraj',
    'Andre Russell', 'Sunil Narine', 'Varun Chakravarthy', 'Mitchell Starc', 'Ishan Kishan'
]

name_map = {
    'Suryakumar Yadav': 'Surya Kumar Yadav',
    'KL Rahul': 'K L Rahul',
    'Varun Chakravarthy': 'Varun Chakaravarthy'
}

batters = {}
with open(r'd:\PowerBI\archive\IPL2025Batters.csv', encoding='utf-8-sig') as f:
    r = csv.reader(f)
    next(r)
    for row in r:
        if row:
            batters[row[0].strip()] = row

bowlers = {}
with open(r'd:\PowerBI\archive\IPL2025Bowlers.csv', encoding='utf-8-sig') as f:
    r = csv.reader(f)
    next(r)
    for row in r:
        if row:
            bowlers[row[0].strip()] = row

print(f"{'Player':<25} | {'Bat Matches':<11} | {'Bat Innings':<11} | {'Bowl Matches':<12} | {'Bowl Innings':<12}")
print("-" * 80)
for p in players:
    mapped = name_map.get(p, p)
    b_row = batters.get(mapped)
    bo_row = bowlers.get(mapped)
    
    bat_mat = b_row[3] if b_row else "-"
    bat_inn = b_row[4] if b_row else "-"
    bowl_mat = bo_row[3] if bo_row else "-"
    bowl_inn = bo_row[4] if bo_row else "-"
    
    print(f"{p:<25} | {bat_mat:<11} | {bat_inn:<11} | {bowl_mat:<12} | {bowl_inn:<12}")
