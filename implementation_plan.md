# Predictive Maintenance for Solar & Wind Assets — Implementation Plan

## Overview

A full-stack, vendor-agnostic predictive maintenance analytics platform. The complete
analytical chain — raw sensor data → cleaning → ML expected-output model → deviation →
anomaly → fault classification → failure risk → energy/₹ at risk → priority score →
dashboard + alert — is implemented end-to-end in a monorepo with a FastAPI backend and a
React/TypeScript/Vite frontend.

**Environment confirmed:** Python 3.14.4 · Node 24.12.0 · npm 11.6.2 · Empty workspace

---

## Proposed Additions & Corrections to the Original Brief

> The brief is solid. The suggestions below **strengthen reliability, demo quality, and
> hackathon judging** without scope-creeping into complexity.

### ✅ Additions Proposed

| # | Addition | Rationale |
|---|----------|-----------|
| A1 | **In-memory analytics cache** (dict keyed by asset_id) recomputed on inject/reset | Avoids race conditions writing CSVs; keeps inject/reset under 2 s |
| A2 | **WebSocket or SSE push** on inject/reset so frontend auto-refreshes without polling | Judges see instant update; polling fallback kept if WS fails |
| A3 | **Demo tour overlay** — numbered step callouts in the UI (Step 1 → Step 6) matching DEMO_SCRIPT | Judges follow along without reading docs |
| A4 | **Health timeline sparklines** in priority table (last 24 readings) | Visually shows degradation trend in one glance |
| A5 | **Tariff & horizon live-edit panel** in sidebar — changing ₹/kWh recalculates revenue at risk instantly | Interactive for judges |
| A6 | **Preset fault buttons** on asset detail ("Inject Inverter Overheat", "Inject Soiling", "Inject Sensor Fault") | Faster demo, reduces mis-clicks |
| A7 | **`/api/pipeline-status/{asset_id}`** endpoint returning stage-by-stage pipeline state | Feeds a "Pipeline Trace" mini-panel in UI (judges see the chain visually) |

### ❌ Removals / Simplifications Proposed

| # | Removal | Rationale |
|---|---------|-----------|
| R1 | **XGBoost** — drop entirely | Adds install complexity; RandomForest is sufficient and simpler |
| R2 | **IsolationForest fallback** — keep as last resort but don't surface its output directly; show combined rule score only | Rules are more explainable; IF confuses judges |
| R3 | **`/data/processed/` CSV writes for fault injection** — use in-memory overlay dict instead | Disk writes add latency; overlay is deterministic and reversible in ms |
| R4 | **Multiple priority weight ENV vars** — keep only `priority_weights.yaml`; ENV vars can override the file | Simpler config surface, single source of truth |
| R5 | **Separate `db_init` script** — fold into FastAPI startup event with `--reset` CLI flag | One less command to run; judges just start the server |

---

## Architecture Diagram (text)

```
┌─────────────────────────────────────────────────────────────────┐
│                        MONOREPO ROOT                            │
│  /backend/   /frontend/   /data/   /models/   /scripts/         │
└─────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │   Vite Dev Server │  :5173
                        │  React + TS + TW  │
                        │  Recharts/RQuery  │
                        └────────┬─────────┘
                                 │ REST + SSE
                        ┌────────▼─────────┐
                        │   FastAPI + Uvicorn│  :8000
                        │                   │
                        │  ┌─────────────┐  │
                        │  │  Analytics  │  │
                        │  │  Engine     │  │
                        │  │  (in-memory)│  │
                        │  └──────┬──────┘  │
                        │         │         │
                        │  ┌──────▼──────┐  │
                        │  │ ML Pipeline │  │
                        │  │ RF Models   │  │
                        │  │ /models/pkl │  │
                        │  └──────┬──────┘  │
                        │         │         │
                        │  ┌──────▼──────┐  │
                        │  │  SQLAlchemy │  │
                        │  │  SQLite DB  │  │
                        │  │  app.db     │  │
                        │  └─────────────┘  │
                        └───────────────────┘
                                 │
                     ┌───────────▼────────────┐
                     │   /data/raw/            │
                     │   demo_solar.csv        │
                     │   demo_wind.csv         │
                     │   /data/processed/      │
                     └─────────────────────────┘
```

---

## File Structure (complete target layout)

```
PS-02/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env                       # local env (gitignored)
│   ├── config/
│   │   └── priority_weights.yaml
│   ├── db/
│   │   ├── models.py              # SQLAlchemy ORM models
│   │   ├── session.py             # DB session factory
│   │   └── seed.py                # fleet seeder
│   ├── pipeline/
│   │   ├── data_loader.py         # dynamic CSV header mapping
│   │   ├── cleaner.py             # cleaning & alignment
│   │   ├── expected_model.py      # RF regressor + rule fallback
│   │   ├── deviation_engine.py    # deviation_pct + rolling metrics
│   │   ├── anomaly_detector.py    # rule-based + IF fallback
│   │   ├── fault_classifier.py    # deterministic rule tree
│   │   ├── failure_risk.py        # heuristic + optional classifier
│   │   ├── economic_model.py      # energy/revenue at risk
│   │   ├── prioritizer.py         # priority_score formula
│   │   └── orchestrator.py        # runs full pipeline per asset
│   ├── routes/
│   │   ├── assets.py
│   │   ├── alerts.py
│   │   ├── demo.py
│   │   └── health.py
│   ├── schemas/                   # Pydantic response models
│   │   └── responses.py
│   ├── cache/
│   │   └── analytics_store.py     # in-memory asset state cache
│   └── tests/
│       ├── test_smoke.py          # endpoint smoke tests
│       └── test_demo_flow.py      # inject → assert → reset
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/
│       │   └── client.ts          # axios + react-query hooks
│       ├── components/
│       │   ├── FleetSummary.tsx
│       │   ├── FleetHealthGrid.tsx
│       │   ├── PriorityTable.tsx
│       │   ├── AlertsList.tsx
│       │   ├── FleetTrendChart.tsx
│       │   ├── AssetDetailPanel.tsx
│       │   ├── DemoControls.tsx
│       │   ├── PipelineTrace.tsx  # (A7) pipeline stage visualizer
│       │   └── TourOverlay.tsx    # (A3) numbered step callouts
│       └── types/
│           └── api.ts
├── data/
│   ├── raw/
│   │   ├── demo_solar.csv         # generated if missing
│   │   └── demo_wind.csv
│   └── processed/                 # pipeline outputs
├── models/                        # *.pkl trained models
├── scripts/
│   └── generate_demo_data.py      # standalone CSV generator
├── README.md
├── DEMO_SCRIPT.md
├── IMPLEMENTATION_SUMMARY.md
└── .env.example
```

---

## Proposed Changes (Phase by Phase)

---

### Phase 0 — Scaffold & Environment

#### [NEW] Project directory structure
- Create all directories above
- Create `requirements.txt`, `package.json`, `.env.example`
- Verify Python and Node versions

---

### Phase 1 — Data Layer

#### [NEW] [`generate_demo_data.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/scripts/generate_demo_data.py)
- Generate **20 assets** (15 solar inverters + 5 wind turbines) × 7 days × 15-min intervals = **13,440 rows each**
- Solar schema: `timestamp, asset_id, inverter_id, power_kw, irradiance_wm2, ambient_temp_c, module_temp_c, current_a, voltage_v, demo`
- Wind schema: `timestamp, asset_id, turbine_id, power_kw, wind_speed_ms, ambient_temp_c, vibration_mm_s, rotor_rpm, demo`
- Realistic sinusoidal power curves + Gaussian noise; mostly healthy baseline

#### [NEW] [`data_loader.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/pipeline/data_loader.py)
- Dynamic header inspection and canonical column mapping
- Loads raw CSV, identifies asset type (solar/wind) from headers
- Outputs standardized DataFrame with `asset_id`, `timestamp`, `actual_power`, environment features

#### [NEW] [`cleaner.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/pipeline/cleaner.py)
- Drop duplicates, interpolate gaps ≤ 3 steps, clamp physical outliers, forward-fill small gaps

---

### Phase 2 — ML Expected-Output Model + Deviation Engine

#### [NEW] [`expected_model.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/pipeline/expected_model.py)
- `train_model(asset_id, df)` → fits `RandomForestRegressor(n_estimators=100)` on environment features → power
- Saves to `/models/{asset_id}_rf.pkl`
- Fallback: `expected_power = capacity × clamp(env_factor, 0, 1)` if training fails or < 50 rows
- Exposes `model_status`: `"trained"` | `"fallback_rule_based"`

#### [NEW] [`deviation_engine.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/pipeline/deviation_engine.py)
- Computes `deviation_pct = (actual - expected) / max(|expected|, eps) × 100`
- Rolling window (configurable, default 12 × 15min = 3h): rolling_mean_dev, rolling_std_dev
- `consecutive_anomaly_count`: streak of readings where `|deviation_pct| > threshold`
- `degradation_trend`: linear slope of deviation over last N windows

---

### Phase 3 — Anomaly, Fault, Risk

#### [NEW] [`anomaly_detector.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/pipeline/anomaly_detector.py)
- Rule priority: Critical → Warning → Normal
- Rules:
  - **Critical**: `deviation_pct < -20` AND `consecutive_anomaly_count ≥ 3`
  - **Critical**: `module_temp > 75°C` AND `deviation_pct < -10`
  - **Warning**: `deviation_pct < -10` OR `consecutive_anomaly_count ≥ 2`
- Returns `{status, reasons: [str], rule_triggered}`
- IsolationForest only used if rules return Normal but rolling_std > 2σ — flagged as "Unusual pattern detected (statistical)"

#### [NEW] [`fault_classifier.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/pipeline/fault_classifier.py)
- **Solar faults**: Inverter Underperformance, Overheating, Soiling, String Issue, Sensor Failure
- **Wind faults**: Gearbox/Bearing Wear, Abnormal Power Curve, Sensor Issue
- Returns `{fault_type, confidence_pct, reasons: [str], label: "Likely issue"}`
- Never states "> 95% confidence"; caps at "High confidence (estimated)"

#### [NEW] [`failure_risk.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/pipeline/failure_risk.py)
- Heuristic formula (normalized 0–100):
  `risk = 0.35×|dev_pct_norm| + 0.25×trend_norm + 0.20×anomaly_count_norm + 0.20×temp_anomaly_norm`
- If enough history: optionally fits LogisticRegression on synthetic labels (deviation > 25% = risk event)
- Always labels output: `"Estimated failure risk (heuristic — simulated data)"`

---

### Phase 4 — Economic Model + Prioritization

#### [NEW] [`economic_model.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/pipeline/economic_model.py)
- `energy_at_risk_kwh = (expected_kw - projected_kw) × action_horizon_hours`
- `revenue_at_risk_inr = energy_at_risk_kwh × tariff_inr_per_kwh`
- `expected_risk_inr = revenue_at_risk_inr × failure_probability` (optional display)
- Rounds to nearest ₹10; labels all outputs `(simulated)`

#### [NEW] [`prioritizer.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/pipeline/prioritizer.py)
- Formula: `score = w1×risk_norm + w2×rev_risk_norm + w3×severity + w4×criticality + w5×persistence`
- Reads weights from `/backend/config/priority_weights.yaml`
- Returns score components for "Why #1?" breakdown in UI

#### [NEW] [`priority_weights.yaml`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/config/priority_weights.yaml)
```yaml
w1_failure_probability: 0.35
w2_revenue_risk: 0.30
w3_severity: 0.20
w4_asset_criticality: 0.10
w5_persistence: 0.05
```

---

### Phase 5 — FastAPI Backend

#### [NEW] [`main.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/main.py)
- FastAPI app with lifespan (startup: seed DB, load/train models, prime analytics cache)
- CORS enabled for `localhost:5173`
- Mounts all route files
- `--reset` flag in env to force re-seed

#### [NEW] DB Models ([`models.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/db/models.py))
```
Asset: id, name, type, location, capacity_kw, criticality, created_at
AssetHealth: asset_id, status, deviation_pct, failure_risk, fault_type, energy_at_risk, revenue_at_risk, priority_score, priority_rank, model_status, last_updated
Alert: id, asset_id, severity, message, recommended_action, created_at, acknowledged
DemoState: id, is_injected, injected_asset_id, fault_type, fault_magnitude, injected_at
ModelMetadata: asset_id, model_type, training_status, trained_at, feature_count
```

#### API Endpoints
| Endpoint | Response |
|----------|----------|
| `GET /api/health` | service OK, model statuses |
| `GET /api/assets` | array of AssetSummary |
| `GET /api/assets/{id}` | AssetDetail with pipeline stages |
| `GET /api/assets/{id}/history` | time series (last 96 points = 24h) |
| `GET /api/priority-list` | ranked array with score breakdown |
| `GET /api/alerts` | alert list |
| `GET /api/pipeline-status/{id}` | **(A7)** stage-by-stage pipeline state |
| `POST /api/demo/inject-fault` | body: `{asset_id, fault_type, fault_magnitude}` |
| `POST /api/demo/reset` | restores baseline |
| `GET /api/events` | SSE stream for real-time push **(A2)** |

---

### Phase 6 — React Frontend

#### Technology
- `Vite + React 18 + TypeScript + Tailwind CSS`
- `Recharts` for charts, `@tanstack/react-query` for data fetching
- Palette: slate/zinc neutral base, `emerald` (Normal), `amber` (Warning), `rose` (Critical)
- No flashy gradients — clean industrial look with clear typography

#### Key Components

**`FleetSummary`** — Total assets, healthy/warning/critical counts, total energy + ₹ at risk badges

**`FleetHealthGrid`** — Card grid (20 cards), color-coded by status, click → open detail panel

**`PriorityTable`** — Sortable table: Rank · Asset · Type · Location · Health · Risk% · Fault · Energy · ₹ · Score · Action. Row 1 expandable showing score breakdown

**`AssetDetailPanel`** — Slide-in panel:
- Actual vs Expected line chart (last 24h)
- Deviation % trend chart
- Sensor readings (temp, current/vibration)
- "Why is this asset flagged?" — 3 plain-language bullets
- Fault label + confidence badge
- Energy & ₹ at risk cards
- Action card: "Recommended: Inspect inverter within 24 hours"
- Health sparkline (A4)
- Preset fault inject buttons (A6)

**`DemoControls`** — Top bar: `[Inject Fault ▼]` `[Reset Demo]` `[Tariff: ₹7/kWh ✏️]` `[Toggle Demo Labels]`

**`PipelineTrace`** — 10-step flow diagram showing each pipeline stage with ✅/⚠️/❌ per asset (A7)

**`TourOverlay`** — Numbered callout bubbles matching DEMO_SCRIPT steps (A3), toggled by `[Start Demo Tour]` button

**`AlertsList`** — Chronological list: severity badge, timestamp, asset, message, action

---

### Phase 7 — Fault Injection & Alerting

#### Injection Mechanism
1. Frontend posts `{asset_id, fault_type, fault_magnitude}` to `/api/demo/inject-fault`
2. Backend retrieves asset's clean data from cache
3. **Applies deterministic overlay** to the last 12 rows:
   - `inverter_underperformance`: multiply `actual_power` by `(1 - magnitude)`, add `+magnitude×10°C` to `module_temp`
   - `soiling`: multiply `actual_power` by `(1 - magnitude×0.5)`, no temp change
   - `overheat`: add `+magnitude×15°C` to `module_temp`, reduce power by `magnitude×0.15`
   - `sensor_fault`: add random ±magnitude×50% noise to power readings
   - `wind_gearbox`: add vibration spike × magnitude, reduce power by `magnitude×0.2`
4. Re-runs full pipeline for that asset (deviation → anomaly → fault → risk → economic → priority)
5. Broadcasts SSE event `asset_updated:{asset_id}`
6. Creates alert in DB: severity=CRITICAL, recommended_action=<specific text>
7. Total time target: **< 2 seconds**

#### Reset Mechanism
- Clears overlay dict for all assets
- Re-runs pipeline on clean baseline data
- Clears injected alerts (keeps real alert history)
- Broadcasts `demo_reset` SSE event

---

### Phase 8 — Tests

#### [`test_smoke.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/tests/test_smoke.py)
- `GET /api/health` → 200
- `GET /api/assets` → 200, len ≥ 15
- `GET /api/priority-list` → 200, sorted
- `GET /api/alerts` → 200

#### [`test_demo_flow.py`](file:///c:/Users/AcerAspireLite/Desktop/PS-02/backend/tests/test_demo_flow.py)
- Reset → inject fault on INV-007 → GET asset → assert `status == "Critical"` and `failure_risk > 0.5` and `priority_rank == 1`
- Reset → GET asset → assert `status == "Normal"` and `priority_rank > 5`

---

### Phase 9 — Documentation

#### [NEW] `README.md`
- Problem, architecture diagram, prerequisites, install, run backend, run frontend, API reference, demo instructions, tariff/weight config, known limitations

#### [NEW] `DEMO_SCRIPT.md`
- Verbatim presenter script for 6-step demo with exact UI clicks, expected outcomes, talking points for judges

#### [NEW] `IMPLEMENTATION_SUMMARY.md`
- What was built, key decisions, fallback behavior, config locations

#### [NEW] `.env.example`
```
TARIFF_RUPEES_PER_KWH=7
ACTION_HORIZON_HOURS=24
EPS=0.001
BACKEND_PORT=8000
FRONTEND_PORT=5173
ROLLING_WINDOW=12
SEED_FORCE_RESET=false
```

---

## Open Questions / Design Decisions for Review

> [!IMPORTANT]
> **Q1 — Fault injection target**: The brief says INV-007. Should all 15 solar assets be named `INV-001` … `INV-015` and 5 wind turbines `WTG-001` … `WTG-005`? Or do you have a preferred naming convention?
> **Default assumed: INV-001..INV-015 + WTG-001..WTG-005**

> [!NOTE]
> **Q2 — Real-time update strategy**: I propose SSE (Server-Sent Events) for push updates — simpler than WebSockets, works through proxies, no library needed. Polling at 3s is the fallback. **No user action needed; proceeding with SSE + polling fallback.**

> [!NOTE]
> **Q3 — Model training time**: With 20 assets × 13,440 rows, training 20 RandomForest models at startup could take 30–60s the first time. I'll train them in a background thread and serve rule-based fallback until training completes. Models are cached to disk and reloaded on restart. **No user action needed.**

> [!WARNING]
> **Q4 — Python 3.14 compatibility**: Python 3.14 is very recent. If any dependency (scikit-learn, SQLAlchemy) fails to install, I'll pin to the last known-good versions. Fallback: create a venv with `python -m venv`. **Will handle automatically.**

---

## Verification Plan

### Automated Tests
```bash
cd backend
pytest tests/ -v
```
Expected: all 6 smoke + 4 demo-flow tests passing.

### Manual Demo Verification
1. Start backend: `cd backend && uvicorn main:app --reload --port 8000`
2. Start frontend: `cd frontend && npm run dev`
3. Open `http://localhost:5173`
4. Observe fleet summary: 20 assets, ≥ 15 green
5. Click `INV-007` → see Actual vs Expected chart (close tracking) → risk < 20%
6. Click **Inject Fault** → `inverter_underperformance`, magnitude `0.25`
7. Observe in < 3s: INV-007 turns red, rises to Rank #1, ₹ at risk shown
8. Check `/api/assets/INV-007` in browser — status = Critical
9. Click **Reset Demo** → INV-007 returns to Normal, rank drops
10. Verify alert list shows injection event

---

## Estimated Build Timeline

| Phase | Content | Est. Time |
|-------|---------|-----------|
| 0 | Scaffold + env | 15 min |
| 1 | Data generation + loader | 30 min |
| 2 | ML model + deviation | 30 min |
| 3 | Anomaly + fault + risk | 30 min |
| 4 | Economic + prioritizer | 20 min |
| 5 | FastAPI + DB + endpoints | 45 min |
| 6 | React frontend (all components) | 90 min |
| 7 | Fault injection + alerting | 30 min |
| 8 | Tests + debug + polish | 30 min |
| 9 | Docs | 20 min |
| **Total** | | **~6 hours** |
