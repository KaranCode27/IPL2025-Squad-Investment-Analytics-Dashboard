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

# We want to extract player prices from the auction tables (Tables 19 to 36)
# Let's inspect the headers of these tables first.
# Tables 19-36 generally contain sold/unsold players.
# Wait, let's check what headers they have.
# In Table 19: Jos Buttler, Shreyas Iyer, Rishabh Pant...
# Let's print the headers and first row for each table from 19 to 36.
for i in range(19, 37):
    t = tables[i]
    headers_text = [th.text.strip() for th in t.find_all('th')]
    rows = t.find_all('tr')
    print(f"\n--- Table {i} (rows: {len(rows)}) ---")
    print("Headers:", headers_text[:10])
    if len(rows) > 1:
        cells = [c.text.strip() for c in rows[1].find_all(['td', 'th'])]
        print("First row:", cells)
