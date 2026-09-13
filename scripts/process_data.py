import os
import pandas as pd
import numpy as np
from datetime import timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RAW_DIR = os.path.join("data", "raw")
PROCESSED_DIR = os.path.join("data", "processed")

def process_kaggle_solar():
    gen_file = os.path.join(RAW_DIR, "Plant_1_Generation_Data.csv")
    weather_file = os.path.join(RAW_DIR, "Plant_1_Weather_Sensor_Data.csv")
    
    if not os.path.exists(gen_file) or not os.path.exists(weather_file):
        logger.warning("Kaggle solar datasets not found in data/raw. Skipping.")
        return False
        
    logger.info("Processing Kaggle Solar Dataset...")
    df_gen = pd.read_csv(gen_file)
    df_weather = pd.read_csv(weather_file)
    
    df_gen['DATE_TIME'] = pd.to_datetime(df_gen['DATE_TIME'], format='%d-%m-%Y %H:%M')
    df_weather['DATE_TIME'] = pd.to_datetime(df_weather['DATE_TIME'], format='%Y-%m-%d %H:%M:%S')
    
    df_weather = df_weather[['DATE_TIME', 'PLANT_ID', 'AMBIENT_TEMPERATURE', 'MODULE_TEMPERATURE', 'IRRADIATION']]
    
    df = pd.merge(df_gen, df_weather, on=['DATE_TIME', 'PLANT_ID'], how='inner')
    
    df = df.rename(columns={
        'DATE_TIME': 'timestamp',
        'SOURCE_KEY': 'asset_id', # Each inverter is an asset
        'AC_POWER': 'actual_power', # We predict AC power
        'AMBIENT_TEMPERATURE': 'ambient_temp_c',
        'MODULE_TEMPERATURE': 'module_temp_c',
        'IRRADIATION': 'irradiance_wm2'
    })
    
    cols_to_keep = ['timestamp', 'asset_id', 'actual_power', 'ambient_temp_c', 'module_temp_c', 'irradiance_wm2', 'DC_POWER']
    df = df[cols_to_keep]
    
    df = df.sort_values(['asset_id', 'timestamp'])
    
    
    out_path = os.path.join(PROCESSED_DIR, "solar_clean.csv")
    df.to_csv(out_path, index=False)
    logger.info(f"Saved cleaned solar data to {out_path} ({len(df)} rows)")
    return True

def generate_demo_wind(num_assets=5, days=7):
    logger.info(f"Generating synthetic Wind data for {num_assets} turbines...")
    end_time = pd.Timestamp.now().floor('h')
    start_time = end_time - pd.Timedelta(days=days)
    
    timestamps = pd.date_range(start_time, end_time, freq='15min')
    
    all_data = []
    for i in range(1, num_assets + 1):
        asset_id = f"WTG-{i:03d}"
        
        hours = timestamps.hour + timestamps.minute / 60.0
        base_wind = 6.0 + 3.0 * np.sin(np.pi * hours / 12.0) + np.random.normal(0, 1.5, len(timestamps))
        base_wind = np.clip(base_wind, 0, 25) # Cut-in ~3, Cut-out ~25
        
        rated_speed = 12.0
        actual_power = np.where(base_wind < 3.0, 0,
                        np.where(base_wind > 25.0, 0,
                          np.where(base_wind < rated_speed, 2000 * (base_wind/rated_speed)**3, 2000)))
        
        actual_power = actual_power + np.random.normal(0, 50, len(actual_power))
        actual_power = np.clip(actual_power, 0, 2000)
        
        ambient_temp = 20 + 5 * np.sin(np.pi * (hours - 6) / 12.0) + np.random.normal(0, 1, len(timestamps))
        vibration = base_wind * 0.1 + np.random.normal(0, 0.05, len(timestamps))
        
        df = pd.DataFrame({
            'timestamp': timestamps,
            'asset_id': asset_id,
            'actual_power': actual_power,
            'wind_speed_ms': base_wind,
            'ambient_temp_c': ambient_temp,
            'vibration_mm_s': vibration
        })
        all_data.append(df)
        
    final_df = pd.concat(all_data)
    out_path = os.path.join(PROCESSED_DIR, "wind_clean.csv")
    final_df.to_csv(out_path, index=False)
    logger.info(f"Saved synthetic wind data to {out_path} ({len(final_df)} rows)")

if __name__ == "__main__":
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    process_kaggle_solar()
    generate_demo_wind()
