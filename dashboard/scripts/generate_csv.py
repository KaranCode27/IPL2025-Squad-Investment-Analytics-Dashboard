import csv
import openpyxl

# Load player details from Sheet2 of IPL 2025 Auction Data.xlsx to make sure we match them exactly
wb = openpyxl.load_workbook(r'd:\PowerBI\archive\IPL 2025 Auction Data.xlsx')
sheet2 = wb['Sheet2']
rows = list(sheet2.iter_rows(values_only=True))
header = rows[0]
data_rows = rows[1:]

players = [r[0] for r in data_rows]
teams = {r[0]: r[1] for r in data_rows}
roles = {r[0]: r[2] for r in data_rows}

# Mappings for exact match checks
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

output_rows = []
for p in players:
    mapped = name_map.get(p, p)
    
    b_row = batters.get(mapped)
    bo_row = bowlers.get(mapped)
    
    # Determine matches played
    matches = 0
    if b_row and bo_row:
        matches = int(b_row[3]) # matches in batter sheet
    elif b_row:
        matches = int(b_row[3])
    elif bo_row:
        matches = int(bo_row[3])
        
    # Batting stats
    if b_row:
        runs = int(b_row[2])
        avg = b_row[7]
        sr = b_row[9]
    else:
        runs = 0
        avg = '0'
        sr = '0'
        
    # Bowling stats
    if bo_row:
        wickets = int(bo_row[2])
        eco = bo_row[9]
    else:
        wickets = 0
        eco = '0'
        
    # Determine source & highlighting name mismatch
    if p in name_map:
        source = f"IPL Official Website (Name Mismatch: '{name_map[p]}')"
    else:
        source = "IPL Official Website"
        
    output_rows.append([
        p,
        teams[p],
        roles[p],
        str(matches),
        str(runs),
        str(sr),
        str(avg),
        str(wickets),
        str(eco),
        source
    ])

# Print CSV output to console
print("Player,Team,Role,Matches,Runs,StrikeRate,Average,Wickets,Economy,Source")
for row in output_rows:
    print(",".join(row))
