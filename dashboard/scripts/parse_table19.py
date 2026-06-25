import requests
from bs4 import BeautifulSoup
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

url = "https://en.wikipedia.org/wiki/List_of_2025_Indian_Premier_League_personnel_changes"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
soup = BeautifulSoup(resp.text, 'html.parser')
tables = soup.find_all('table')

# Print Table 19 details
t = tables[19]
print("Table 19 class:", t.get('class'))
headers_text = [th.text.strip() for th in t.find_all('th')]
print("Headers:", headers_text)

# Let's print the first 5 rows of Table 19
rows = t.find_all('tr')
print("Total rows:", len(rows))
for r in rows[1:6]:
    cells = [c.text.strip() for c in r.find_all(['td', 'th'])]
    print(cells)
