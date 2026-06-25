import csv
import openpyxl
import difflib

# Load batters and bowlers names from CSVs
with open(r'd:\PowerBI\archive\IPL2025Batters.csv', encoding='utf-8-sig') as f:
    batters = {r[0].strip() for r in csv.reader(f) if r}
with open(r'd:\PowerBI\archive\IPL2025Bowlers.csv', encoding='utf-8-sig') as f:
    bowlers = {r[0].strip() for r in csv.reader(f) if r}
all_csv = batters | bowlers

# Load Excel players
wb = openpyxl.load_workbook(r'd:\PowerBI\archive\IPL Player 2025_full.xlsx')
sheet = wb['Sheet1']
excel_players = [r[0].strip() for r in list(sheet.iter_rows(values_only=True))[1:] if r[0]]

print("Searching for similar names in CSV for the missing ones:")
missing_not_played = []

for ep in excel_players:
    if ep in all_csv:
        continue
    
    # Let's find close matches
    matches = difflib.get_close_matches(ep, all_csv, n=3, cutoff=0.5)
    
    # Let's also do a word-subset check (e.g., "Abhishek Porel" and "Abishek Porel")
    # or case-insensitive checks
    cleaned_ep = ep.replace(' ', '').lower()
    exact_subset = []
    for c_name in all_csv:
        cleaned_c = c_name.replace(' ', '').lower()
        # check if they have common words
        ep_words = set(ep.lower().split())
        c_words = set(c_name.lower().split())
        common = ep_words & c_words
        if len(common) >= 2 or cleaned_ep in cleaned_c or cleaned_c in cleaned_ep:
            exact_subset.append(c_name)
            
    all_candidates = list(set(matches) | set(exact_subset))
    if all_candidates:
        print(f"Excel Name: '{ep}' | Candidates: {all_candidates}")
    else:
        missing_not_played.append(ep)

print("\nTotal players with NO candidates (very likely did not play):", len(missing_not_played))
print(missing_not_played)
