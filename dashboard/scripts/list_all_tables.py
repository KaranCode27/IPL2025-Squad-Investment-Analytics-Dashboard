import requests
from bs4 import BeautifulSoup
import sys

sys.stdout.reconfigure(encoding='utf-8')

url = "https://en.wikipedia.org/wiki/List_of_2025_Indian_Premier_League_personnel_changes"
headers = {"User-Agent": "Mozilla/5.0"}
resp = requests.get(url, headers=headers)
soup = BeautifulSoup(resp.text, 'html.parser')
tables = soup.find_all('table')

for i in range(19, len(tables)):
    t = tables[i]
    headers_text = [th.text.strip() for th in t.find_all('th')]
    rows = t.find_all('tr')
    # print class and how many rows
    print(f"Table {i}: class={t.get('class')}, rows={len(rows)}, headers={headers_text[:5]}")
