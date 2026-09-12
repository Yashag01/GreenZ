import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

def generate_solar_data(asset_id, start_date, num_rows):
    timestamps = [start_date + timedelta(minutes=15 * i) for i in range(num_rows)]
    
    # Base diurnal cycle (sun is up from 6 AM to 6 PM roughly)
    hours = np.array([t.hour + t.minute / 60.0 for t in timestamps])
    
    # Irradiance model (bell curve around noon)
    irradiance = np.where(
        (hours >= 6) & (hours <= 18),
        800 * np.sin(np.pi * (hours - 6) / 12) + np.random.normal(0, 50, num_rows),
        0
    )
    irradiance = np.clip(irradiance, 0, 1200)
    
    # Temperature (lags irradiance slightly)
    ambient_temp = 20 + 10 * np.sin(np.pi * (hours - 8) / 12) + np.random.normal(0, 2, num_rows)
    ambient_temp = np.clip(ambient_temp, 10, 45)
    
    # Module temp is ambient + heating from irradiance
    module_temp = ambient_temp + (irradiance / 800) * 20 + np.random.normal(0, 1, num_rows)
    
    # Power generation (approx linear to irradiance with temperature derating)
    # P = A * r * H * PR
    # Simplified: nominal 2000 kW capacity
    capacity_kw = 2000
    temp_derating = 1 - 0.004 * (module_temp - 25) # 0.4% loss per degree above 25C
    actual_power = capacity_kw * (irradiance / 1000) * temp_derating + np.random.normal(0, 10, num_rows)
    actual_power = np.where(irradiance > 50, actual_power, 0)
    actual_power = np.clip(actual_power, 0, capacity_kw)
    
    df = pd.DataFrame({
        "timestamp": timestamps,
        "asset_id": asset_id,
        "actual_power": actual_power,
        "ambient_temp_c": ambient_temp,
        "module_temp_c": module_temp,
        "irradiance_wm2": irradiance,
        "DC_POWER": actual_power * 1.05 # slightly higher DC before inverter loss
    })
    return df

def generate_wind_data(asset_id, start_date, num_rows):
    timestamps = [start_date + timedelta(minutes=15 * i) for i in range(num_rows)]
    
    # Wind speed (Weibull distribution approximation + some autocorrelation)
    wind_speed = np.zeros(num_rows)
    wind_speed[0] = np.random.weibull(2) * 8
    for i in range(1, num_rows):
        # random walk with mean reversion to 8 m/s
        wind_speed[i] = wind_speed[i-1] * 0.9 + np.random.normal(0.8, 1.5)
    wind_speed = np.clip(wind_speed, 0, 25)
    
    # Power curve (simplified)
    # Cut in: 3 m/s, Rated: 12 m/s, Cut out: 25 m/s
    capacity_kw = 3000
    actual_power = np.zeros(num_rows)
    for i, ws in enumerate(wind_speed):
        if ws < 3 or ws > 25:
            actual_power[i] = 0
        elif ws >= 12:
            actual_power[i] = capacity_kw
        else:
            # cubic relationship below rated speed
            actual_power[i] = capacity_kw * ((ws - 3) / (12 - 3))**3
            
    # add some noise
    actual_power += np.random.normal(0, capacity_kw * 0.02, num_rows)
    actual_power = np.clip(actual_power, 0, capacity_kw)
    
    # Temperature and vibration
    hours = np.array([t.hour + t.minute / 60.0 for t in timestamps])
    ambient_temp = 15 + 8 * np.sin(np.pi * (hours - 8) / 12) + np.random.normal(0, 2, num_rows)
    
    # Vibration (correlates with wind speed and power)
    vibration = 0.5 + 0.1 * wind_speed + 0.0001 * actual_power + np.random.normal(0, 0.1, num_rows)
    vibration = np.clip(vibration, 0.1, 5.0)
    
    df = pd.DataFrame({
        "timestamp": timestamps,
        "asset_id": asset_id,
        "actual_power": actual_power,
        "wind_speed_ms": wind_speed,
        "ambient_temp_c": ambient_temp,
        "vibration_mm_s": vibration
    })
    return df

if __name__ == "__main__":
    os.makedirs("sample csvs", exist_ok=True)
    
    start = datetime(2023, 10, 1, 0, 0, 0)
    num_rows = 1500 # ~15.6 days at 15m intervals
    
    print("Generating Solar Plant Alpha...")
    df_solar_a = generate_solar_data("SOLAR-ALPHA-01", start, num_rows)
    df_solar_a.to_csv("sample csvs/solar_plant_alpha.csv", index=False)
    
    print("Generating Solar Plant Beta...")
    df_solar_b = generate_solar_data("SOLAR-BETA-02", start, num_rows)
    df_solar_b.to_csv("sample csvs/solar_plant_beta.csv", index=False)
    
    print("Generating Wind Farm Omega...")
    df_wind = generate_wind_data("WIND-OMEGA-01", start, num_rows)
    df_wind.to_csv("sample csvs/wind_farm_omega.csv", index=False)
    
    print("Successfully generated 3 realistic SCADA dataset files in 'sample csvs/' directory.")
