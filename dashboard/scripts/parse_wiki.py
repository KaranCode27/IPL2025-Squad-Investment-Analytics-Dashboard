import requests
from bs4 import BeautifulSoup

url = "https://en.wikipedia.org/wiki/List_of_2025_Indian_Premier_League_personnel_changes"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}
resp = requests.get(url, headers=headers)
print("Status code:", resp.status_code)
print("HTML length:", len(resp.text))
soup = BeautifulSoup(resp.text, 'html.parser')

tables = soup.find_all('table')
print("Total tables found:", len(tables))

for i, t in enumerate(tables[:15]):
    headers_text = [th.text.strip() for th in t.find_all('th')]
    print(f"Table {i}: class={t.get('class')}, Headers length = {len(headers_text)}, Sample headers = {headers_text[:8]}")

