import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

def generate_wind_data(plant_id, num_turbines=5, days=34):
    start_date = datetime(2020, 5, 15)
    dates = [start_date + timedelta(minutes=15 * i) for i in range(days * 24 * 4)]
    
    # Generate common weather (wind speed, temp) for the plant
    np.random.seed(42 + plant_id)
    # Wind speed follows a Weibull-like distribution but we'll use a noisy sine wave + random walk for daily/weekly trends
    time_arr = np.linspace(0, days * 2 * np.pi, len(dates))
    base_wind = 6.0 + 3.0 * np.sin(time_arr) + np.random.normal(0, 1.5, len(dates))
    base_wind = np.clip(base_wind, 0, 25) # Cut out above 25m/s
    
    base_temp = 20.0 + 5.0 * np.sin(time_arr / 2) + np.random.normal(0, 2.0, len(dates))

    all_data = []

    for t in range(num_turbines):
        source_key = f"WIND_{plant_id}_T{t+1:02d}"
        
        # Local turbulence per turbine
        local_wind = base_wind + np.random.normal(0, 0.5, len(dates))
        local_wind = np.clip(local_wind, 0, 25)
        
        # Realistic Power Curve (simplified)
        # cut-in: 3 m/s, rated: 12 m/s, cut-out: 25 m/s
        ac_power = np.zeros_like(local_wind)
        for i, w in enumerate(local_wind):
            if w < 3.0 or w > 25.0:
                ac_power[i] = 0
            elif w < 12.0:
                # Cubic relationship in partial load region
                ac_power[i] = 2000.0 * ((w - 3.0) / (12.0 - 3.0))**3
            else:
                ac_power[i] = 2000.0 # Rated power 2000 kW

        # Add realistic "friction" / "loss" / "noise"
        # Efficiency loss random walk
        efficiency = np.clip(np.random.normal(0.95, 0.02, len(dates)), 0.85, 1.0)
        ac_power = ac_power * efficiency
        
        # Vibration (base 0.5 - 1.5, scales with wind speed)
        vibration = 0.5 + 0.05 * local_wind + np.random.normal(0, 0.2, len(dates))
        vibration = np.clip(vibration, 0.1, 5.0)

        # Yield calculations
        dc_power = ac_power * 1.05 # Fake DC just to have the column if needed
        daily_yield = np.zeros_like(ac_power)
        total_yield = np.zeros_like(ac_power)
        
        curr_total = np.random.uniform(100000, 500000)
        curr_daily = 0
        current_day = dates[0].date()
        
        for i, date in enumerate(dates):
            if date.date() != current_day:
                current_day = date.date()
                curr_daily = 0
            
            # Power in kW over 15 min = kWh = kW * 0.25
            energy = ac_power[i] * 0.25
            curr_daily += energy
            curr_total += energy
            
            daily_yield[i] = curr_daily
            total_yield[i] = curr_total

        df = pd.DataFrame({
            'DATE_TIME': [d.strftime('%Y-%m-%d %H:%M:%S') for d in dates],
            'PLANT_ID': [plant_id] * len(dates),
            'SOURCE_KEY': [source_key] * len(dates),
            'DC_POWER': dc_power,
            'AC_POWER': ac_power,
            'DAILY_YIELD': daily_yield,
            'TOTAL_YIELD': total_yield,
            'wind_speed_ms': local_wind,
            'ambient_temp_c': base_temp,
            'vibration_mm_s': vibration
        })
        all_data.append(df)

    final_df = pd.concat(all_data, ignore_index=True)
    return final_df

if __name__ == "__main__":
    out_dir = r"c:\Users\AcerAspireLite\Desktop\PS-02\YashMade\data\raw"
    os.makedirs(out_dir, exist_ok=True)
    
    # Generate 2 wind plants, each with 5 turbines (Total 10 wind datasets conceptually)
    print("Generating Wind Plant 1...")
    df1 = generate_wind_data(4135001, num_turbines=5)
    df1.to_csv(os.path.join(out_dir, "Wind_Plant_1_Data.csv"), index=False)
    
    print("Generating Wind Plant 2...")
    df2 = generate_wind_data(4136001, num_turbines=5)
    df2.to_csv(os.path.join(out_dir, "Wind_Plant_2_Data.csv"), index=False)
    
    print("Generation complete! Saved to:", out_dir)
