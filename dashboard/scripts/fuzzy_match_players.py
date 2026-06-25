import requests
from bs4 import BeautifulSoup
import openpyxl
import re
import difflib

# Fetch and parse Wikipedia retentions and auction tables
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

# Retained players
retention_tables = {4: 'CSK', 5: 'DC', 7: 'GT', 8: 'KKR', 10: 'LSG', 11: 'MI', 13: 'PBKS', 14: 'RR', 16: 'RCB', 17: 'SRH'}
extracted_ret = {}

def clean_name(name):
    name = name.replace('*', '').replace('†', '').strip()
    name = re.sub(r'\[[a-z0-9]+\]', '', name).strip()
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

# Auctioned players
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

# Merge
all_extracted = {}
all_extracted.update(extracted_ret)
all_extracted.update(extracted_auc)

# Load Excel players
wb = openpyxl.load_workbook(r'd:\PowerBI\archive\IPL Player 2025_full.xlsx')
sheet = wb['Sheet1']
excel_players = []
for r in list(sheet.iter_rows(values_only=True))[1:]:
    if r[0]:
        excel_players.append(r[0].strip())

missing = []
for ep in excel_players:
    if ep in all_extracted:
        continue
    # Check close match
    closest = difflib.get_close_matches(ep, all_extracted.keys(), n=1, cutoff=0.3)
    print(f"Excel Name: '{ep}' | Closest extracted: {closest}")
