import requests
from bs4 import BeautifulSoup
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "https://en.wikipedia.org/wiki/List_of_2025_Indian_Premier_League_personnel_changes"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
soup = BeautifulSoup(resp.text, 'html.parser')
tables = soup.find_all('table')

for i, t in enumerate(tables):
    for row in t.find_all('tr'):
        if 'Natarajan' in row.text:
            cells = [c.text.strip() for c in row.find_all(['td', 'th'])]
            print(f"Table {i} contains Natarajan | Cells count: {len(cells)} | Cells: {cells}")
