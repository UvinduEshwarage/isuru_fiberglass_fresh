import pandas as pd
import json

# Path to your Excel file

# Path to your CSV file
csv_file = "enriched_invoices_cleaned.csv"  # Change this to your file name if needed

# Read the CSV file
df = pd.read_csv(csv_file)

# Convert DataFrame to a list of dicts (JSON array)
data = df.to_dict(orient="records")

# Save to JSON file
with open("enriched_invoices_cleaned.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Converted {len(data)} rows to enriched_invoices_cleaned.json")
