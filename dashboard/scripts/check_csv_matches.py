import csv
import openpyxl
import difflib

# Load batters and bowlers names from CSVs
batters_names = []
with open(r'd:\PowerBI\archive\IPL2025Batters.csv', encoding='utf-8-sig') as f:
    r = csv.reader(f)
    next(r)
    for row in r:
        if row:
            batters_names.append(row[0].strip())

bowlers_names = []
with open(r'd:\PowerBI\archive\IPL2025Bowlers.csv', encoding='utf-8-sig') as f:
    r = csv.reader(f)
    next(r)
    for row in r:
        if row:
            bowlers_names.append(row[0].strip())

all_csv_names = set(batters_names) | set(bowlers_names)

# Load Excel players
wb = openpyxl.load_workbook(r'd:\PowerBI\archive\IPL Player 2025_full.xlsx')
sheet = wb['Sheet1']
excel_players = []
for r in list(sheet.iter_rows(values_only=True))[1:]:
    if r[0]:
        excel_players.append(r[0].strip())

print("Checking CSV stats matches for Excel players:")
missing_in_csv = []
for ep in excel_players:
    if ep in all_csv_names:
        continue
    # Try fuzzy match
    closest = difflib.get_close_matches(ep, all_csv_names, n=1, cutoff=0.7)
    if closest:
        print(f"Excel Name: '{ep}' | Closest CSV Match: {closest}")
    else:
        # Check if they are just not in CSV (i.e. did not play)
        # We can find out if they played by searching their name in CSV case-insensitively
        cleaned_ep = ep.replace(' ', '').lower()
        found_in_csv = False
        for cn in all_csv_names:
            if cn.replace(' ', '').lower() == cleaned_ep:
                found_in_csv = True
                print(f"Case/space mismatch: '{ep}' -> '{cn}'")
                break
        if not found_in_csv:
            missing_in_csv.append(ep)

print("\nTotal Excel players not in batters/bowlers CSVs (likely did not play):", len(missing_in_csv))
print("Sample missing in CSV:", missing_in_csv[:15])
