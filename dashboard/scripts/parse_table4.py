import requests
from bs4 import BeautifulSoup
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "https://en.wikipedia.org/wiki/List_of_2025_Indian_Premier_League_personnel_changes"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
soup = BeautifulSoup(resp.text, 'html.parser')
tables = soup.find_all('table')

# Print Table 4 (CSK Retentions) rows
t = tables[4]
print("CSK Retentions Table 4 rows:")
for r in t.find_all('tr'):
    cells = [c.text.strip() for c in r.find_all(['td', 'th'])]
    print(cells)
