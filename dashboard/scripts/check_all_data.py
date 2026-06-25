import csv
import openpyxl

# Check length and columns of Batter/Bowler CSVs
with open(r'd:\PowerBI\archive\IPL2025Batters.csv', encoding='utf-8-sig') as f:
    batters = list(csv.reader(f))
print("Batters CSV rows:", len(batters))
print("Batters CSV columns:", batters[0])

with open(r'd:\PowerBI\archive\IPL2025Bowlers.csv', encoding='utf-8-sig') as f:
    bowlers = list(csv.reader(f))
print("Bowlers CSV rows:", len(bowlers))
print("Bowlers CSV columns:", bowlers[0])

# Check if there is any other file in archive directory
import os
print("Archive files:", os.listdir(r'd:\PowerBI\archive'))
