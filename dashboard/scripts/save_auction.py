import openpyxl
import csv

# Load workbook
wb_path = r'd:\PowerBI\archive\IPL 2025 Auction Data.xlsx'
wb = openpyxl.load_workbook(wb_path)
sheet1 = wb['Sheet1']

# Read rows
rows = list(sheet1.iter_rows(values_only=True))

# Save as CSV file
csv_path = r'd:\PowerBI\archive\IPL_2025_Auction_Data.csv'
with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerows(rows)

print("Auction CSV file created successfully.")
