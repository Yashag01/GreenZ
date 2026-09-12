def classify_fault(row, status):
    """
    Maps operational and sensor signatures to ranked likely maintenance conditions.
    
    IMPORTANT: These are rule-based likelihood rankings derived from available sensor evidence.
    They are NOT calibrated failure probabilities and should be read as:
    'Given the observed deviation pattern, this condition is most consistent with the evidence.'
    
    Returns:
      (primary_condition, evidence_strength_pct, ranked_conditions_list, recommended_action)
    """
    if status in ["Normal", "Monitor"]:
        ranked = [{
            "condition_name": "Normal Operation",
            "confidence": None,  # No anomaly — not a ranked condition
            "evidence": [
                "Power generation within expected range for current conditions",
                "No persistent deviation detected"
            ]
        }]
        return "None", None, ranked, {
            "immediate": ["No immediate action required."],
            "inspect": [],
            "long_term": ["Continue routine monitoring."]
        }

    is_solar = "module_temp_c" in row or "irradiance_wm2" in row
    dev_pct = float(row.get("deviation_pct", 0.0) or 0.0)
    streak = int(row.get("consecutive_anomaly_count", 1) or 1)
    rolling_dev = float(row.get("rolling_mean_dev", dev_pct) or dev_pct)
    
    root_cause = row.get("root_cause_feature", "Unknown")
    ae_score = row.get("ae_anomaly_score", 0.0)

    ranked_conditions = []

    if is_solar:
        mod_temp = row.get("module_temp_c")
        irradiance = row.get("irradiance_wm2")
        dc_power = row.get("DC_POWER")

        mod_temp = float(mod_temp) if mod_temp is not None else None
        irr = float(irradiance) if irradiance is not None else None
        dc = float(dc_power) if dc_power is not None else None

        # Assess evidence strength
        has_temp_evidence = mod_temp is not None and mod_temp > 65
        has_dc_evidence = dc is not None
        high_dc_relative = dc is not None and dc > 0  # DC input present but AC output low
        severe_dev = dev_pct < -25
        moderate_dev = dev_pct < -12
        persistent = streak >= 3

        irr_str = f"{irr:.2f}" if irr is not None else "N/A"
        temp_str = f"{mod_temp:.1f}°C" if mod_temp is not None else "N/A"

        # Build evidence-based conditions
        if has_temp_evidence and moderate_dev:
            # Strong evidence: temperature + power gap
            evidence_notes = [
                f"Power output below expected ({dev_pct:.1f}%)",
                f"Module/inverter temperature elevated ({temp_str})",
                f"Irradiance adequate ({irr_str} p.u.)" if irr else "",
                f"Deviation persisted for {streak} interval(s)" if persistent else "",
            ]
            if root_cause == "module_temp_c":
                evidence_notes.append("Autoencoder identified temperature as the primary statistical root cause.")
            evidence_notes = [e for e in evidence_notes if e]

            confidence = "High" if (persistent and severe_dev) or root_cause == "module_temp_c" else "Moderate"
            ranked_conditions.append({
                "condition_name": "Inverter Thermal Derating",
                "confidence": confidence,
                "evidence": evidence_notes
            })
            ranked_conditions.append({
                "condition_name": "Inverter Underperformance",
                "confidence": "Low",
                "evidence": ["AC output reduced; thermal stress may reduce conversion efficiency"]
            })
            if streak < 2:
                ranked_conditions.append({
                    "condition_name": "Sensor / Measurement Anomaly",
                    "confidence": "Low",
                    "evidence": ["Single-interval deviation — may be transient or sensor noise"]
                })
            action_plan = {
                "immediate": ["Check SCADA for thermal derating active flags.", "Verify ambient vs module delta."],
                "inspect": ["Inspect inverter cooling system", "Clean heat sinks", "Verify enclosure fans and temperature sensors."],
                "long_term": ["Review thermal imaging of array if module temperatures remain elevated."]
            }

        elif severe_dev:
            # Large step-down without clear temperature cause
            evidence_notes = [
                f"Severe power deficit ({dev_pct:.1f}%) relative to expected",
                f"Irradiance adequate ({irr_str} p.u.)" if irr else "",
                f"Persistent across {streak} reading(s)" if persistent else "Single-interval event",
            ]
            evidence_notes = [e for e in evidence_notes if e]

            ranked_conditions.append({
                "condition_name": "String / Electrical Fault",
                "confidence": "High" if persistent else "Moderate",
                "evidence": evidence_notes
            })
            ranked_conditions.append({
                "condition_name": "Module Degradation / Soiling",
                "confidence": "Low",
                "evidence": ["Gradual degradation can produce similar magnitude deficits"]
            })
            ranked_conditions.append({
                "condition_name": "Inverter Underperformance",
                "confidence": "Low",
                "evidence": ["MPPT tracking issue possible"]
                })
            action_plan = {
                "immediate": ["Isolate affected string if safety risk is present.", "Check string open-circuit voltage (Voc)."],
                "inspect": ["Inspect combiner box fuses", "Measure individual string currents."],
                "long_term": ["Perform I-V curve tracing to identify degraded modules."]
            }

        else:
            # Moderate deviation — most likely soiling or general underperformance
            evidence_notes = [
                f"Moderate power deficit ({dev_pct:.1f}%) relative to expected",
                f"Irradiance: {irr_str} p.u." if irr else "",
                f"Trend: persistent over {streak} interval(s)" if persistent else "Recent onset",
            ]
            evidence_notes = [e for e in evidence_notes if e]

            ranked_conditions.append({
                "condition_name": "Soiling / Module Underperformance",
                "confidence": "Moderate" if persistent else "Low",
                "evidence": evidence_notes
            })
            ranked_conditions.append({
                "condition_name": "Shading / Obstruction",
                "confidence": "Low",
                "evidence": ["Possible localized shading — check for vegetation growth or new obstructions"]
            })
            ranked_conditions.append({
                "condition_name": "Sensor Calibration Drift",
                "confidence": "Low",
                "evidence": ["Irradiance sensor misalignment could shift apparent deviation"]
                })
            action_plan = {
                "immediate": ["Compare with neighboring inverter performance.", "Check localized weather satellite data."],
                "inspect": ["Schedule visual inspection and panel surface cleaning.", "Check for vegetation growth or new obstructions."],
                "long_term": ["Optimize cleaning schedule based on soiling accumulation rate."]
            }

    else:
        # Wind Asset
        vib = row.get("vibration_mm_s")
        speed = row.get("wind_speed_ms")
        temp = row.get("ambient_temp_c")

        vib = float(vib) if vib is not None else None
        speed = float(speed) if speed is not None else None
        temp = float(temp) if temp is not None else None

        vib_elevated = vib is not None and vib > 2.0
        vib_str = f"{vib:.2f} mm/s" if vib is not None else "sensor N/A"
        speed_str = f"{speed:.1f} m/s" if speed is not None else "N/A"
        severe_dev = dev_pct < -20
        persistent = streak >= 3

        if vib_elevated:
            evidence_notes = [
                f"Vibration elevated ({vib_str})",
                f"Power output below wind-speed curve ({dev_pct:.1f}%)" if severe_dev else f"Power deviation: {dev_pct:.1f}%",
                f"Wind speed: {speed_str}",
                f"Persistent across {streak} reading(s)" if persistent else "",
            ]
            if root_cause == "vibration_mm_s":
                evidence_notes.append("Autoencoder identified vibration as the primary statistical root cause.")
            evidence_notes = [e for e in evidence_notes if e]

            confidence = "High" if (persistent and severe_dev) or root_cause == "vibration_mm_s" else "Moderate"
            ranked_conditions.append({
                "condition_name": "Gearbox Deterioration",
                "confidence": confidence,
                "evidence": evidence_notes
            })
            ranked_conditions.append({
                "condition_name": "Main Bearing Issue",
                "confidence": "Low",
                "evidence": ["Elevated vibration can also indicate main shaft bearing wear"]
            })
            ranked_conditions.append({
                "condition_name": "Lubrication Issue",
                "confidence": "Low",
                "evidence": ["Dry lubrication increases mechanical friction and vibration"]
                })
            action_plan = {
                "immediate": ["Reduce turbine power setpoint to limit mechanical stress.", "Check vibration spectrum in SCADA."],
                "inspect": ["Inspect gearbox.", "Sample lubrication oil for particle count.", "Check main bearing temperature."],
                "long_term": ["Schedule preventative maintenance for drivetrain components."]
            }

        elif severe_dev:
            evidence_notes = [
                f"Significant aerodynamic power deficit ({dev_pct:.1f}%)",
                f"Wind resource: {speed_str}",
                f"Persistent across {streak} reading(s)" if persistent else "Recent onset",
            ]
            evidence_notes = [e for e in evidence_notes if e]

            ranked_conditions.append({
                "condition_name": "Blade / Pitch Performance Issue",
                "confidence": "Moderate",
                "evidence": evidence_notes
            })
            ranked_conditions.append({
                "condition_name": "Yaw Misalignment",
                "confidence": "Low",
                "evidence": ["Turbine not optimally aligned to wind direction reduces capture"]
            })
            ranked_conditions.append({
                "condition_name": "Power Converter Issue",
                "confidence": "Low",
                "evidence": ["Electrical torque mismatch can reduce captured power"]
                })
            action_plan = {
                "immediate": ["Verify yaw position sensor reading.", "Check blade pitch drive calibration parameters."],
                "inspect": ["Inspect blade surface for erosion, icing, or structural damage.", "Verify pitch actuator mechanism."],
                "long_term": ["Perform aerodynamic imbalance analysis using drone imaging."]
            }

        else:
            evidence_notes = [
                f"Inconsistent power output ({dev_pct:.1f}%) relative to wind speed",
                f"Wind speed: {speed_str}",
                f"Pattern: {streak} interval(s) observed",
            ]
            evidence_notes = [e for e in evidence_notes if e]

            ranked_conditions.append({
                "condition_name": "Sensor / Control Anomaly",
                "confidence": "Low",
                "evidence": evidence_notes
            })
            ranked_conditions.append({
                "condition_name": "Power-Electronics / Converter Issue",
                "confidence": "Low",
                "evidence": ["Electrical torque mismatch may cause intermittent power dips"]
            })
            ranked_conditions.append({
                "condition_name": "Yaw Misalignment",
                "confidence": "Low",
                "evidence": ["Moderate heading error consistent with moderate deviation"]
                })
            action_plan = {
                "immediate": ["Verify anemometer calibration.", "Check control system event logs for fault codes."],
                "inspect": ["Inspect power converter cabinet.", "Check IGBT temperature sensors."],
                "long_term": ["Update control logic firmware if sensor noise is persistent."]
            }

    if not ranked_conditions:
        ranked_conditions = [{
            "condition_name": "Undetermined — Insufficient Evidence",
            "confidence": None,
            "evidence": [f"Deviation: {dev_pct:.1f}%. More data required for reliable diagnosis."]
        }]
        action_plan = {
            "immediate": ["Monitor closely."],
            "inspect": ["Collect additional readings"],
            "long_term": ["Review trend data over next 24 hours"]
        }

    primary = ranked_conditions[0]
    return primary["condition_name"], primary["confidence"], ranked_conditions, action_plan
