import json
import urllib.request
import os
from datetime import datetime

# Supabase details
SUPABASE_URL = "https://mjbsxfewgnpkijtwwzbu.supabase.co"
SUPABASE_KEY = "sb_publishable_4yKTA50rOX6nss26Swzn0g_oDXCoXJ3"

# Backup folder in Google Drive
BACKUP_DIR = "/Users/zibis/Library/CloudStorage/GoogleDrive-dpdltmwjd@gmail.com/내 드라이브/ZIBIS_Backup"

def fetch_table(table_name):
    url = f"{SUPABASE_URL}/rest/v1/{table_name}?select=*"
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }
    )
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching {table_name}: {e}")
    return None

def main():
    if not os.path.exists(BACKUP_DIR):
        try:
            os.makedirs(BACKUP_DIR)
        except Exception as e:
            print(f"Error creating backup dir: {e}")
            return
            
    today_str = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    
    print("Starting backup...")
    sheets = fetch_table("spec_sheets")
    requests = fetch_table("raw_requests")
    
    backup_data = {
        "backup_date": datetime.now().isoformat(),
        "spec_sheets": sheets if sheets else [],
        "raw_requests": requests if requests else []
    }
    
    backup_file = os.path.join(BACKUP_DIR, f"supabase_backup_{today_str}.json")
    try:
        with open(backup_file, "w", encoding="utf-8") as f:
            json.dump(backup_data, f, ensure_ascii=False, indent=2)
        print(f"Backup successfully saved to: {backup_file}")
    except Exception as e:
        print(f"Failed to write backup file: {e}")

if __name__ == "__main__":
    main()
