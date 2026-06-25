import csv

players = [
    'Rishabh Pant', 'Shreyas Iyer', 'Venkatesh Iyer', 'Heinrich Klaasen', 'Virat Kohli',
    'Nicholas Pooran', 'Pat Cummins', 'Jasprit Bumrah', 'Rashid Khan', 'Sanju Samson',
    'Yashasvi Jaiswal', 'Ruturaj Gaikwad', 'Ravindra Jadeja', 'Arshdeep Singh', 'Yuzvendra Chahal',
    'Shubman Gill', 'Suryakumar Yadav', 'Hardik Pandya', 'Rohit Sharma', 'Jos Buttler',
    'KL Rahul', 'Kuldeep Yadav', 'Rinku Singh', 'Jofra Archer', 'Mohammed Siraj',
    'Andre Russell', 'Sunil Narine', 'Varun Chakravarthy', 'Mitchell Starc', 'Ishan Kishan'
]

# We need mappings for the names that don't match exactly
name_map = {
    'Suryakumar Yadav': 'Surya Kumar Yadav',
    'KL Rahul': 'K L Rahul',
    'Varun Chakravarthy': 'Varun Chakaravarthy'
}

batters = {}
with open(r'd:\PowerBI\archive\IPL2025Batters.csv', encoding='utf-8-sig') as f:
    r = csv.reader(f)
    header = next(r)
    header = [h.strip().replace('\ufeff', '').replace('"', '') for h in header]
    for row in r:
        if row:
            batters[row[0].strip()] = row

bowlers = {}
with open(r'd:\PowerBI\archive\IPL2025Bowlers.csv', encoding='utf-8-sig') as f:
    r = csv.reader(f)
    header = next(r)
    header = [h.strip().replace('\ufeff', '').replace('"', '') for h in header]
    for row in r:
        if row:
            bowlers[row[0].strip()] = row

print("Compilation of statistics:")
for p in players:
    mapped_name = name_map.get(p, p)
    
    # Batter stats: Matches, Runs, StrikeRate, Average
    # Bowler stats: Matches, Wickets, Economy
    # Let's inspect what we have in batters and bowlers
    b_row = batters.get(mapped_name)
    bo_row = bowlers.get(mapped_name)
    
    print(f"Player: {p}")
    if b_row:
        # Header: ['Player Name', 'Team', 'Runs', 'Matches', 'Inn', 'No', 'HS', 'AVG', 'BF', 'SR', '100s', '50s', '4s', '6s']
        print(f"  Batter row: Runs={b_row[2]}, Matches={b_row[3]}, AVG={b_row[7]}, SR={b_row[9]}")
    else:
        print("  Not in batters")
    if bo_row:
        # Header: ['Player Name', 'Team', 'WKT', 'MAT', 'INN', 'OVR', 'RUNS', 'BBI', 'AVG', 'ECO', 'SR', '4W', '5W']
        print(f"  Bowler row: Wickets={bo_row[2]}, Matches={bo_row[3]}, AVG={bo_row[8]}, ECO={bo_row[9]}")
    else:
        print("  Not in bowlers")
