import os

ILLUSTRATIVE_TARIFF_LABEL = "Illustrative (₹7/kWh assumed)"

def compute_economics(row, tariff=None, is_solar=None):
    """
    Computes energy at risk (kWh) and illustrative revenue at risk.

    For solar: energy gap is scaled to expected daytime generation hours rather than
    blindly multiplying by 24h. We estimate remaining daylight from the current
    irradiance context.

    Revenue at risk is ILLUSTRATIVE — based on a configurable tariff assumption.
    It is NOT a factual commercial projection.
    """
    tariff = float(os.environ.get("TARIFF", tariff if tariff else 7.0))

    expected = float(row.get("expected_power", 0) or 0)
    actual = float(row.get("actual_power", 0) or 0)

    gap_kw = max(0.0, expected - actual)

    if gap_kw == 0:
        return 0.0, 0.0

    irr = row.get("irradiance_wm2")
    is_solar_asset = irr is not None

    if is_solar_asset:
        irr_val = float(irr) if irr is not None else 0.0
        if irr_val < 0.05:
            horizon_hours = 0.5
        elif irr_val < 0.3:
            horizon_hours = 2.0
        else:
            horizon_hours = float(os.environ.get("SOLAR_HORIZON_HRS", 6.0))
    else:
        horizon_hours = float(os.environ.get("WIND_HORIZON_HRS", 24.0))

    energy_at_risk = gap_kw * horizon_hours  # kWh
    revenue_at_risk = energy_at_risk * tariff  # illustrative ₹

    return round(energy_at_risk, 1), round(revenue_at_risk, 0)
