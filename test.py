import urllib.request, json
try:
    data = json.loads(urllib.request.urlopen('http://127.0.0.1:8000/api/assets').read())
    print("Top 5:")
    for a in data[:5]:
        print(f"{a['id']}: {a['revenue_at_risk']} (Rank {a['priority_rank']})")
    print('Total Rev:', sum(a['revenue_at_risk'] for a in data))
except Exception as e:
    print(e)
