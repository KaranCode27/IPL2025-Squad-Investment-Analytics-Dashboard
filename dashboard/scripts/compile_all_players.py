import requests
from bs4 import BeautifulSoup
import openpyxl
import csv
import re
import shutil

# 1. Fetch Wikipedia data
url = "https://en.wikipedia.org/wiki/List_of_2025_Indian_Premier_League_personnel_changes"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
soup = BeautifulSoup(resp.text, 'html.parser')
tables = soup.find_all('table')

team_map = {
    'Chennai Super Kings': 'CSK',
    'Delhi Capitals': 'DC',
    'Gujarat Titans': 'GT',
    'Kolkata Knight Riders': 'KKR',
    'Lucknow Super Giants': 'LSG',
    'Mumbai Indians': 'MI',
    'Punjab Kings': 'PBKS',
    'Rajasthan Royals': 'RR',
    'Royal Challengers Bengaluru': 'RCB',
    'Sunrisers Hyderabad': 'SRH'
}

# Parse retentions
retention_tables = {4: 'CSK', 5: 'DC', 7: 'GT', 8: 'KKR', 10: 'LSG', 11: 'MI', 13: 'PBKS', 14: 'RR', 16: 'RCB', 17: 'SRH'}
extracted_ret = {}

def clean_name(name):
    name = name.replace('*', '').replace('†', '').strip()
    name = re.sub(r'\[[a-z0-9]+\]', '', name).strip()
    name = ' '.join(name.split())
    return name

def clean_salary(val):
    match = re.search(r'₹\s*([\d\.]+)\s*crore', val, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return 0.0

for idx, team in retention_tables.items():
    t = tables[idx]
    rows = t.find_all('tr')
    for r in rows[1:]:
        cells = [c.text.strip() for c in r.find_all(['td', 'th'])]
        if len(cells) >= 4:
            name = clean_name(cells[1])
            price = clean_salary(cells[3])
            extracted_ret[name] = (team, price, "Retained")

# Parse auction
extracted_auc = {}
for idx in range(19, 37):
    t = tables[idx]
    rows = t.find_all('tr')
    for r in rows[1:]:
        cells = [c.text.strip() for c in r.find_all(['td', 'th'])]
        if len(cells) < 6:
            continue
        if len(cells) == 10:
            name = cells[1]
            team_long = cells[7]
            price_str = cells[8]
        elif len(cells) == 8:
            name = cells[1]
            team_long = cells[5]
            price_str = cells[6]
        else:
            name = cells[1]
            team_long = ""
            price_str = ""
            for cell in cells:
                if cell in team_map:
                    team_long = cell
            if not team_long:
                continue
        
        rtm = '†' in name
        name = clean_name(name)
        team = team_map.get(team_long, team_long)
        try:
            price_val = price_str.replace(',', '').strip()
            if price_val == 'Unsold' or not price_val.isdigit():
                price = 0.0
            else:
                price = float(price_val) / 100.0
        except:
            price = 0.0
            
        if price > 0:
            extracted_auc[name] = (team, price, "RTM" if rtm else "Auction")

wiki_data = {}
wiki_data.update(extracted_ret)
wiki_data.update(extracted_auc)
wiki_data['Moeen Ali'] = ('KKR', 2.0, 'Auction')
wiki_data['Satyanarayana Raju'] = ('MI', 0.3, 'Auction')

# Load performance data from CSVs
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

excel_to_wiki = {
    'Mohammad Siraj': 'Mohammed Siraj',
    'Varun Chakaravarthy': 'Varun Chakravarthy',
    'T Natarajan': 'T. Natarajan',
    'Mohammad Shami': 'Mohammed Shami',
    'Jake Fraser-Mcgurk': 'Jake Fraser-McGurk',
    'Rasikh Dar': 'Rasikh Salam Dar',
    'Syed Khaleel Ahmed': 'Khaleel Ahmed',
    'Mahesh Theekshana': 'Maheesh Theekshana',
    'Abishek Porel': 'Abhishek Porel',
    'R Sai Kishore': 'Sai Kishore',
    'Vaibhav Suryavanshi': 'Vaibhav Sooryavanshi',
    'M Siddharth': 'Manimaran Siddharth',
    'Yudhvir Charak': 'Yudhvir Singh',
    'C Andre Siddarth': 'Andre Siddarth',
    'Manvanth Kumar': 'Manvanth Kumar L',
    'Shrijith Krishnan': 'Krishnan Shrijith',
    'Raj Bawa': 'Raj Angad Bawa',
    'Harnoor Pannu': 'Harnoor Singh',
    'Suryash Shedge': 'Suryansh Shedge',
    'Kumar Kartikeya Singh': 'Kumar Kartikeya',
    'Kunal Singh Rathore': 'Kunal Rathore'
}

excel_to_csv = {
    'Suryakumar Yadav': 'Surya Kumar Yadav',
    'KL Rahul': 'K L Rahul',
    'Mohammad Siraj': 'Mohammed Siraj',
    'Jake Fraser-Mcgurk': 'Jake Fraser - McGurk',
    'Tilak Varma': 'N Tilak Varma',
    'Syed Khaleel Ahmed': 'Khaleel Ahmed',
    'Mahesh Theekshana': 'Maheesh Theekshana',
    'Quinton de Kock': 'Quinton De Kock',
    'Faf du Plessis': 'Faf Du Plessis',
    'R Sai Kishore': 'Sai Kishore',
    'Arshad Khan': 'Mohd Arshad Khan',
    'Lungi Ngidi': 'Lungisani Ngidi',
    'Yudhvir Charak': 'Yudhvir Singh Charak',
    'Raj Bawa': 'Raj Angad Bawa',
    'Satyanarayana Raju': 'V Satyanarayana Penmetsa',
    'Suryash Shedge': 'Suryansh Shedge',
    'Praveen Dubey': 'Pravin Dubey',
    'Varun Chakaravarthy': 'Varun Chakaravarthy',
    'Varun Chakravarthy': 'Varun Chakaravarthy',
    'Rasikh Dar': 'Rasikh Salam Dar',
    'T Natarajan': 'T. Natarajan',
    'Vijaykumar Vyshak': 'Vyshak Vijaykumar',
    'Abishek Porel': 'Abhishek Porel',
    'Kunal Singh Rathore': 'Kunal Rathore',
    'Kumar Kartikeya Singh': 'Kumar Kartikeya',
    'C Andre Siddarth': 'Andre Siddarth',
    'Manvanth Kumar': 'Manvanth Kumar L'
}

# 2. Build for All Players
wb_in = openpyxl.load_workbook(r'd:\PowerBI\archive\IPL Player 2025_full.xlsx')
sheet_in = wb_in['Sheet1']
excel_data = list(sheet_in.iter_rows(values_only=True))[1:]

all_auction_rows = []
all_performance_rows = []

for row in excel_data:
    if not row[0]:
        continue
    player_name = row[0].strip()
    country = row[1]
    player_type = row[2]
    acq_excel = row[3]
    role = row[4]
    team_excel = row[5]
    
    official_name = excel_to_csv.get(player_name, player_name)
    
    mapped_wiki = excel_to_wiki.get(player_name, player_name)
    wiki_info = wiki_data.get(mapped_wiki)
    if wiki_info:
        team_wiki, price, acq = wiki_info
    else:
        team_wiki = team_excel
        price = 0.0
        acq = acq_excel
        
    team_short = team_map.get(team_wiki, team_wiki)
    if team_short == "Kolkata Knight Riders": team_short = "KKR"
    elif team_short == "Lucknow Super Giants": team_short = "LSG"
    elif team_short == "Punjab Kings": team_short = "PBKS"
    elif team_short == "Sunrisers Hyderabad": team_short = "SRH"
    elif team_short == "Mumbai Indians": team_short = "MI"
    elif team_short == "Gujarat Titans": team_short = "GT"
    elif team_short == "Rajasthan Royals": team_short = "RR"
    elif team_short == "Chennai Super Kings": team_short = "CSK"
    elif team_short == "Delhi Capitals": team_short = "DC"
    elif team_short == "Royal Challengers Bengaluru": team_short = "RCB"
    
    source = "IPL Official Website"
    
    all_auction_rows.append([
        official_name,
        team_short,
        acq,
        role,
        player_type,
        f"{price:.2f}",
        source
    ])
    
    mapped_csv = excel_to_csv.get(player_name, player_name)
    b_row = batters.get(mapped_csv)
    bo_row = bowlers.get(mapped_csv)
    
    if player_name == 'T Natarajan':
        matches, runs, sr, avg, wickets, eco = 2, 0, 0.0, 0.0, 1, 12.72
    elif player_name == 'Reece Topley':
        matches, runs, sr, avg, wickets, eco = 1, 0, 0.0, 0.0, 0, 13.33
    else:
        matches = 0
        if b_row and bo_row:
            matches = int(b_row[3])
        elif b_row:
            matches = int(b_row[3])
        elif bo_row:
            matches = int(bo_row[3])
            
        if b_row:
            runs = int(b_row[2])
            sr = float(b_row[9])
            avg = b_row[7]
            if avg != '-':
                avg = float(avg)
        else:
            runs = 0
            sr, avg = 0.0, 0.0
            
        if bo_row:
            wickets = int(bo_row[2])
            eco = float(bo_row[9])
        else:
            wickets = 0
            eco = 0.0
            
    all_performance_rows.append([
        official_name,
        team_short,
        role,
        str(matches),
        str(runs),
        str(sr),
        str(avg),
        str(wickets),
        str(eco),
        source
    ])

# Save All Players XLSX
wb_all = openpyxl.Workbook()
ws1 = wb_all.active
ws1.title = "Auction Data"
ws1.append(["Player", "Team", "Acquisition", "Role", "Type", "Final_Player_Price_Cr", "Source"])
for row in all_auction_rows:
    row_copy = list(row)
    row_copy[5] = float(row_copy[5])
    ws1.append(row_copy)

ws2 = wb_all.create_sheet(title="Performance Data")
ws2.append(["Player", "Team", "Role", "Matches", "Runs", "StrikeRate", "Average", "Wickets", "Economy", "Source"])
for row in all_performance_rows:
    row_copy = list(row)
    row_copy[3] = int(row_copy[3])
    row_copy[4] = int(row_copy[4])
    row_copy[5] = float(row_copy[5])
    if row_copy[6] != '-':
        row_copy[6] = float(row_copy[6])
    row_copy[7] = int(row_copy[7])
    row_copy[8] = float(row_copy[8])
    ws2.append(row_copy)
wb_all.save(r'd:\PowerBI\IPL_2025_All_Players_Data.xlsx')

# Save All Players CSVs
with open(r'd:\PowerBI\IPL_2025_All_Auction_Data.csv', 'w', newline='', encoding='utf-8') as f:
    csv.writer(f).writerows([["Player", "Team", "Acquisition", "Role", "Type", "Final_Player_Price_Cr", "Source"]] + all_auction_rows)

with open(r'd:\PowerBI\IPL_2025_All_Verified_Stats.csv', 'w', newline='', encoding='utf-8') as f:
    csv.writer(f).writerows([["Player", "Team", "Role", "Matches", "Runs", "StrikeRate", "Average", "Wickets", "Economy", "Source"]] + all_performance_rows)


# 3. Build for Top 30 Players
top30_players_excel = [
    'Rishabh Pant', 'Shreyas Iyer', 'Venkatesh Iyer', 'Heinrich Klaasen', 'Virat Kohli',
    'Nicholas Pooran', 'Pat Cummins', 'Jasprit Bumrah', 'Rashid Khan', 'Sanju Samson',
    'Yashasvi Jaiswal', 'Ruturaj Gaikwad', 'Ravindra Jadeja', 'Arshdeep Singh', 'Yuzvendra Chahal',
    'Shubman Gill', 'Suryakumar Yadav', 'Hardik Pandya', 'Rohit Sharma', 'Jos Buttler',
    'KL Rahul', 'Kuldeep Yadav', 'Rinku Singh', 'Jofra Archer', 'Mohammed Siraj',
    'Andre Russell', 'Sunil Narine', 'Varun Chakravarthy', 'Mitchell Starc', 'Ishan Kishan'
]

# Note: Varun Chakravarthy's Excel name was 'Varun Chakravarthy' in the Top 30 list (but Varun Chakaravarthy in the 228 list).
# Let's map both to official names
top30_official_map = {
    'Suryakumar Yadav': 'Surya Kumar Yadav',
    'KL Rahul': 'K L Rahul',
    'Varun Chakravarthy': 'Varun Chakaravarthy',
    'Varun Chakaravarthy': 'Varun Chakaravarthy'
}

top30_auction_rows = []
top30_performance_rows = []

# Load top 30 spreadsheet data to get current team and roles
wb_t30 = openpyxl.load_workbook(r'd:\PowerBI\archive\IPL 2025 Auction Data.xlsx')
s2 = wb_t30['Sheet2']
t30_excel_teams = {}
t30_excel_roles = {}
for r in list(s2.iter_rows(values_only=True))[1:]:
    if r[0]:
        t30_excel_teams[r[0].strip()] = r[1]
        t30_excel_roles[r[0].strip()] = r[2]

# Load Sheet1 data to get acquisition type and type
s1 = wb_t30['Sheet1']
t30_excel_acq = {}
t30_excel_type = {}
t30_excel_price = {}
for r in list(s1.iter_rows(values_only=True))[1:]:
    if r[0]:
        t30_excel_acq[r[0].strip()] = r[2]
        t30_excel_type[r[0].strip()] = r[4]
        t30_excel_price[r[0].strip()] = r[5]

for p in top30_players_excel:
    off_name = top30_official_map.get(p, p)
    
    # We write official names to the outputs
    team = t30_excel_teams.get(p) or t30_excel_teams.get(off_name)
    role = t30_excel_roles.get(p) or t30_excel_roles.get(off_name)
    acq = t30_excel_acq.get(p) or t30_excel_acq.get(off_name)
    ptype = t30_excel_type.get(p) or t30_excel_type.get(off_name)
    price = t30_excel_price.get(p) or t30_excel_price.get(off_name)
    
    source = "IPL Official Website"
    
    top30_auction_rows.append([
        off_name,
        team,
        acq,
        role,
        ptype,
        f"{price:.2f}",
        source
    ])
    
    mapped_csv = excel_to_csv.get(p, p)
    b_row = batters.get(mapped_csv)
    bo_row = bowlers.get(mapped_csv)
    
    matches = 0
    if b_row:
        matches = int(b_row[3])
    elif bo_row:
        matches = int(bo_row[3])
        
    if b_row:
        runs = int(b_row[2])
        sr = float(b_row[9])
        avg = b_row[7]
        if avg != '-':
            avg = float(avg)
    else:
        runs = 0
        sr, avg = 0.0, 0.0
        
    if bo_row:
        wickets = int(bo_row[2])
        eco = float(bo_row[9])
    else:
        wickets = 0
        eco = 0.0
        
    top30_performance_rows.append([
        off_name,
        team,
        role,
        str(matches),
        str(runs),
        str(sr),
        str(avg),
        str(wickets),
        str(eco),
        source
    ])

# Save Top 30 CSV files
with open(r'd:\PowerBI\archive\IPL_2025_Auction_Data.csv', 'w', newline='', encoding='utf-8') as f:
    csv.writer(f).writerows([["Player", "Team", "Acquisition", "Role", "Type", "Final_Player_Price_Cr", "Source"]] + top30_auction_rows)

with open(r'd:\PowerBI\archive\IPL_2025_Verified_Stats.csv', 'w', newline='', encoding='utf-8') as f:
    csv.writer(f).writerows([["Player", "Team", "Role", "Matches", "Runs", "StrikeRate", "Average", "Wickets", "Economy", "Source"]] + top30_performance_rows)

# Update Excel Sheet1 and Sheet2 of IPL 2025 Auction Data.xlsx
# Sheet 1: Player, Team, Acquisition, Role, Type, Final_Player_Price_Cr
ws_s1 = wb_t30['Sheet1']
for r_idx in range(2, ws_s1.max_row + 1):
    curr_name = ws_s1.cell(row=r_idx, column=1).value
    if curr_name:
        ws_s1.cell(row=r_idx, column=1, value=top30_official_map.get(curr_name.strip(), curr_name.strip()))

# Sheet 2: Player, Team, Role, Matches, Runs, StrikeRate, Average, Wickets, Economy
ws_s2 = wb_t30['Sheet2']
col_map = {'Player':1, 'Team':2, 'Role':3, 'Matches':4, 'Runs':5, 'StrikeRate':6, 'Average':7, 'Wickets':8, 'Economy':9}
for r_idx in range(2, ws_s2.max_row + 1):
    curr_name = ws_s2.cell(row=r_idx, column=col_map['Player']).value
    if not curr_name:
        continue
    p = curr_name.strip()
    off_name = top30_official_map.get(p, p)
    ws_s2.cell(row=r_idx, column=col_map['Player'], value=off_name)
    
    mapped_csv = excel_to_csv.get(p, p)
    b_row = batters.get(mapped_csv)
    bo_row = bowlers.get(mapped_csv)
    
    matches = 0
    if b_row:
        matches = int(b_row[3])
    elif bo_row:
        matches = int(bo_row[3])
        
    if b_row:
        runs = int(b_row[2])
        sr = float(b_row[9])
        avg = b_row[7]
        if avg != '-':
            avg = float(avg)
    else:
        runs = 0
        sr, avg = 0.0, 0.0
        
    if bo_row:
        wickets = int(bo_row[2])
        eco = float(bo_row[9])
    else:
        wickets = 0
        eco = 0.0
        
    ws_s2.cell(row=r_idx, column=col_map['Matches'], value=matches)
    ws_s2.cell(row=r_idx, column=col_map['Runs'], value=runs)
    ws_s2.cell(row=r_idx, column=col_map['StrikeRate'], value=sr)
    ws_s2.cell(row=r_idx, column=col_map['Average'], value=avg)
    ws_s2.cell(row=r_idx, column=col_map['Wickets'], value=wickets)
    ws_s2.cell(row=r_idx, column=col_map['Economy'], value=eco)

wb_t30.save(r'd:\PowerBI\archive\IPL 2025 Auction Data.xlsx')

print("All outputs updated with official website player names and clean source columns.")
