import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

# Paths
INPUT_SOLAR = r"c:\Users\AcerAspireLite\Desktop\PS-02\Plant_1_Generation_Data.csv"
INPUT_WIND = r"c:\Users\AcerAspireLite\Desktop\PS-02\sdwpf_245days_v1.csv"

OUTPUT_DIR = r"c:\Users\AcerAspireLite\Desktop\PS-02\YashMade\data\processed"
os.makedirs(OUTPUT_DIR, exist_ok=True)

OUTPUT_SOLAR = os.path.join(OUTPUT_DIR, "solar_clean.csv")
OUTPUT_WIND = os.path.join(OUTPUT_DIR, "wind_clean.csv")

def preprocess_solar(max_assets=30, max_days=30):
    print("Processing Solar Dataset...")
    df = pd.read_csv(INPUT_SOLAR)
    
    # Map columns
    # DATE_TIME,PLANT_ID,SOURCE_KEY,DC_POWER,AC_POWER,DAILY_YIELD,TOTAL_YIELD
    df['timestamp'] = pd.to_datetime(df['DATE_TIME'], format='%d-%m-%Y %H:%M')
    df['asset_id'] = 'INV-' + df['SOURCE_KEY'].astype(str).str[:4] # shorten id for display
    df['actual_power'] = df['AC_POWER']
    df['DC_POWER'] = df['DC_POWER']
    
    # Filter to max_assets
    assets = df['asset_id'].unique()[:max_assets]
    df = df[df['asset_id'].isin(assets)]
    
    # Filter to max_days
    min_date = df['timestamp'].min()
    max_date = min_date + timedelta(days=max_days)
    df = df[df['timestamp'] <= max_date]
    
    # Synthesize weather data (irradiance, ambient_temp_c, module_temp_c)
    # 1. Ambient Temp: simulate diurnal cycle (min at 4am, max at 2pm, range 20C-35C)
    hour = df['timestamp'].dt.hour
    df['ambient_temp_c'] = 25 + 10 * np.sin((hour - 8) * np.pi / 12) + np.random.normal(0, 1, len(df))
    
    # 2. Irradiance Proxy: Based on AC_POWER relative to max power for that asset
    max_power_per_asset = df.groupby('asset_id')['actual_power'].transform('max')
    # If max_power is 0 (shouldn't happen), avoid div by 0
    max_power_per_asset = max_power_per_asset.replace(0, 1)
    
    # Irradiance proxy (0 to ~1000)
    df['irradiance_wm2'] = (df['actual_power'] / max_power_per_asset) * 1000.0
    # Add some noise to irradiance where actual power is 0 during daytime
    daytime_mask = (hour > 6) & (hour < 18)
    df.loc[daytime_mask & (df['actual_power'] == 0), 'irradiance_wm2'] = np.random.uniform(10, 50, sum(daytime_mask & (df['actual_power'] == 0)))
    
    # 3. Module Temp: Ambient + heating from irradiance
    df['module_temp_c'] = df['ambient_temp_c'] + (df['irradiance_wm2'] / 1000.0) * 25 + np.random.normal(0, 0.5, len(df))
    
    # Select columns
    cols = ['timestamp', 'asset_id', 'actual_power', 'ambient_temp_c', 'module_temp_c', 'irradiance_wm2', 'DC_POWER']
    df = df[cols].sort_values(['asset_id', 'timestamp'])
    
    df.to_csv(OUTPUT_SOLAR, index=False)
    print(f"Saved {len(df)} rows for {len(assets)} solar assets to {OUTPUT_SOLAR}")

def preprocess_wind(max_assets=30, max_days=30):
    print("Processing Wind Dataset...")
    # Read chunk by chunk or full if enough memory. 334MB is fine to read into memory.
    df = pd.read_csv(INPUT_WIND)
    
    # TurbID,Day,Tmstamp,Wspd,Wdir,Etmp,Itmp,Ndir,Pab1,Pab2,Pab3,Prtv,Patv
    
    # Filter to max_assets and max_days first to save processing time
    df = df[df['TurbID'] <= max_assets]
    df = df[df['Day'] <= max_days]
    
    assets = df['TurbID'].unique()
    
    # Create timestamp
    # We assume a start date of 2026-01-01
    start_date = datetime(2026, 1, 1)
    
    # Tmstamp is 'HH:MM'. 
    # Let's combine Day and Tmstamp
    def make_timestamp(row):
        try:
            # Day 1 means 0 days from start_date
            date = start_date + timedelta(days=int(row['Day']) - 1)
            time_parts = str(row['Tmstamp']).split(':')
            if len(time_parts) == 2:
                return date.replace(hour=int(time_parts[0]), minute=int(time_parts[1]))
            return date
        except:
            return pd.NaT
            
    df['timestamp'] = df.apply(make_timestamp, axis=1)
    df = df.dropna(subset=['timestamp'])
    
    df['asset_id'] = 'WTG-' + df['TurbID'].astype(str).str.zfill(3)
    
    # Power
    df['actual_power'] = df['Patv'].clip(lower=0) # clip negative values
    
    # Other features
    df['wind_speed_ms'] = df['Wspd'].fillna(0).clip(lower=0)
    # The dataset has missing values, we'll ffill them, then bfill
    df['ambient_temp_c'] = df['Etmp'].ffill().bfill()
    df['module_temp_c'] = df['Itmp'].ffill().bfill() # Internal temp
    
    # Synthesize vibration
    # Baseline + higher vibration at high wind speeds + some noise
    df['vibration_mm_s'] = 0.5 + (df['wind_speed_ms'] / 15.0) * 2.0 + np.random.normal(0, 0.2, len(df))
    df['vibration_mm_s'] = df['vibration_mm_s'].clip(lower=0.1)
    
    # Select columns
    cols = ['timestamp', 'asset_id', 'actual_power', 'wind_speed_ms', 'ambient_temp_c', 'vibration_mm_s']
    df = df[cols].sort_values(['asset_id', 'timestamp'])
    
    df.to_csv(OUTPUT_WIND, index=False)
    print(f"Saved {len(df)} rows for {len(assets)} wind assets to {OUTPUT_WIND}")

if __name__ == "__main__":
    preprocess_solar(max_assets=30, max_days=30)
    preprocess_wind(max_assets=30, max_days=30)
    print("Preprocessing complete!")
