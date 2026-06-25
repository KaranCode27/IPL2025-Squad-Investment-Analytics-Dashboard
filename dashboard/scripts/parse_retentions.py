import requests
from bs4 import BeautifulSoup
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

url = "https://en.wikipedia.org/wiki/List_of_2025_Indian_Premier_League_personnel_changes"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
soup = BeautifulSoup(resp.text, 'html.parser')
tables = soup.find_all('table')

# Map tables to team short name
retention_tables = {
    4: 'CSK',
    5: 'DC',
    7: 'GT',
    8: 'KKR',
    10: 'LSG',
    11: 'MI',
    13: 'PBKS',
    14: 'RR',
    16: 'RCB',
    17: 'SRH'
}

def clean_salary(val):
    # e.g., "₹18 crore (US$1.9 million)" or "₹16.35 crore" or "₹4 crore"
    # we want to extract the numeric crore value: 18 or 16.35
    match = re.search(r'₹\s*([\d\.]+)\s*crore', val, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return 0.0

retention_data = {}
for idx, team in retention_tables.items():
    t = tables[idx]
    rows = t.find_all('tr')
    # First row is header
    for r in rows[1:]:
        cells = [c.text.strip() for c in r.find_all(['td', 'th'])]
        if len(cells) >= 4:
            # Structure: [No, Player, Nationality, Salary]
            name = cells[1].strip()
            # Clean name (remove footnotes like [b], *, †)
            name = re.sub(r'\[[a-z0-9]+\]', '', name)
            name = name.replace('*', '').replace('†', '').strip()
            salary_str = cells[3]
            price = clean_salary(salary_str)
            retention_data[name] = (team, price)
            print(f"Retained: {name} | Team: {team} | Price: {price} Cr | Original: {salary_str}")

print("\nTotal retained players extracted:", len(retention_data))
