# Presenter Demo Script

**Total Demo Time**: ~2-3 Minutes

### Step 1: Fleet Overview
* **Action**: Open the dashboard at `http://localhost:5173`.
* **Talk Track**: "Welcome to our Predictive Maintenance platform. This dashboard gives operators a real-time, vendor-agnostic view of their entire fleet. We are currently monitoring 20 assets—15 solar inverters and 5 wind turbines. As you can see at the top, the fleet is mostly healthy, but the platform continuously computes the Energy and Revenue at Risk across all sites."

### Step 2: The Priority Ranking
* **Action**: Gesture towards the Priority Table.
* **Talk Track**: "Below is our Priority Maintenance table. We don't just sort by alarms; our engine uses a multi-factor formula combining Failure Risk, Revenue at Risk, and Asset Criticality. This tells the maintenance team exactly who to dispatch and where."

### Step 3: Baseline Asset View
* **Action**: Click on **INV-007** (which should be healthy and lower down the list).
* **Talk Track**: "Let's look at INV-007. The chart here shows our Machine Learning model's expected power generation in blue, based on current weather conditions, against the actual power output in green. Right now, they track perfectly. The asset is healthy."

### Step 4: Injecting a Fault
* **Action**: Close the panel. Go to the top right. Click **[Inject Fault] -> [Inverter Drop (INV-007)]**.
* **Talk Track**: "Let's see what happens when things go wrong. I'm going to simulate a sudden inverter underperformance issue on INV-007. This injects a 25% drop in power and a 10-degree spike in module temperature directly into our data pipeline."

### Step 5: The Response (The "Wow" Moment)
* **Action**: Wait 1-2 seconds. The UI will automatically update via Server-Sent Events (SSE). 
* **Talk Track**: "Without even refreshing the page, the platform detects the deviation. INV-007 immediately jumps to Rank #1 on our priority list. We have a new Critical alert."

### Step 6: Explainability & Economics
* **Action**: Click on **INV-007** again to open the slide-in panel.
* **Talk Track**: "If we open the details, the graph clearly shows the actual output dropping significantly below our ML model's expected baseline. But we don't just give you a red light. The engine explains *why*: 'Output 25% below expected for consecutive readings'. It classifies this as an 'Inverter Overheating' issue with 85% confidence, calculates that this fault is risking ₹X in revenue, and tells the technician exactly what to inspect."

### Step 7: Reset
* **Action**: Click **[Reset Demo]**.
* **Talk Track**: "And with a click, we can reset the simulation back to our baseline."
