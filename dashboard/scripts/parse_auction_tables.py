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

auction_data = {}

# Map long team names to short team names
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

# Parse Tables 19 to 36
for idx in range(19, 37):
    t = tables[idx]
    rows = t.find_all('tr')
    headers_text = [th.text.strip() for th in t.find_all('th')]
    
    # We need to determine the index of the columns:
    # 1. Name
    # 2. 2025 IPL team
    # 3. Auctioned price
    # Let's inspect headers. Since headers might have spanned columns, let's find the header text that matches
    # "Name", "2025 IPL team", and "Auctioned price".
    name_col = -1
    team_col = -1
    price_col = -1
    
    for i, h in enumerate(headers_text):
        if h == "Name":
            name_col = i
        elif "2025 IPL team" in h or "2025 team" in h:
            team_col = i
        elif "Auctioned price" in h or "Price" in h:
            price_col = i
            
    # Fallback if headers are not found directly
    # E.g. in some tables the columns might be in fixed positions
    # Let's see: Table 21 row is: ['13', 'Harry Brook', 'England', '11', '200', 'Delhi Capitals', '625', 'Delhi Capitals']
    # Length = 8.
    # Col index: 1 is Name, 5 is 2025 IPL team, 6 is Auctioned price.
    # In Table 19 row is: ['1', 'Jos Buttler', 'England', 'Wicket-keeper', '107', 'Capped', '200', 'Gujarat Titans', '1575', 'Rajasthan Royals']
    # Length = 10.
    # Col index: 1 is Name, 7 is 2025 IPL team, 8 is Auctioned price.
    
    for r in rows[1:]:
        cells = [c.text.strip() for c in r.find_all(['td', 'th'])]
        if len(cells) < 6:
            continue
            
        # Determine cols based on row length
        if len(cells) == 10:
            name = cells[1]
            team_long = cells[7]
            price_str = cells[8]
        elif len(cells) == 8:
            name = cells[1]
            team_long = cells[5]
            price_str = cells[6]
        else:
            # Let's search by trying to find the team name in cells
            name = cells[1]
            team_long = ""
            price_str = ""
            for cell in cells:
                if cell in team_map:
                    team_long = cell
                    # price is usually the cell next to it or before it, or has digits
                    # Let's see: in Wikipedia, Auctioned price is usually after the team, or let's inspect the headers
            # If we couldn't find, let's use default positions
            # Let's print out rows that don't match length 8 or 10
            # E.g. Table 36 has length 10
            if not team_long:
                print(f"Mismatch row length {len(cells)}: {cells}")
                continue
                
        # Clean name
        rtm = False
        if '†' in name:
            rtm = True
        name = name.replace('*', '').replace('†', '').strip()
        # Remove footnotes like [b]
        name = re.sub(r'\[[a-z0-9]+\]', '', name).strip()
        
        # Clean team
        team = team_map.get(team_long, team_long)
        
        # Clean price (in lakhs, convert to Crore)
        # e.g. "1575" -> 15.75, "30" -> 0.3
        try:
            # remove commas or other chars
            price_val = price_str.replace(',', '').strip()
            if price_val == 'Unsold' or not price_val.isdigit():
                price = 0.0
            else:
                price = float(price_val) / 100.0 # Lakhs to Crore
        except Exception as e:
            price = 0.0
            
        if price > 0:
            acq = "RTM" if rtm else "Auction"
            auction_data[name] = (team, price, acq)
            print(f"Auctioned: {name} | Team: {team} | Price: {price} Cr | Acq: {acq}")

print("\nTotal auctioned players extracted:", len(auction_data))
