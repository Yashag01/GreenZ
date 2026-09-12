import urllib.request, json

def req(url, data=None, method='GET'):
    body = json.dumps(data).encode() if data else None
    r = urllib.request.Request(url, data=body, headers={'Content-Type':'application/json'}, method=method if data else 'GET')
    resp = urllib.request.urlopen(r)
    return json.loads(resp.read())

assets = req('http://localhost:8000/api/assets')
wind = [a for a in assets if a['type']=='wind']
if not wind:
    print('No wind assets')
    exit()

aid = wind[0]['id']
pre = req('http://localhost:8000/api/assets/' + aid)
print('PRE  decision={}, risk={:.1f}, dev={}'.format(pre['decision_status'], pre['failure_risk'], pre.get('deviation_pct')))

res = req('http://localhost:8000/api/demo/inject-fault', {
    'asset_id': aid, 'fault_type': 'gearbox_wear', 'fault_magnitude': 0.8
}, 'POST')
print('Inject result:', res.get('status'))

post = req('http://localhost:8000/api/assets/' + aid)
print('POST decision={}, risk={:.1f}, dev={}'.format(post['decision_status'], post['failure_risk'], post.get('deviation_pct')))
conds = post.get('ranked_conditions', [])
if conds:
    print('Top condition:', conds[0]['condition_name'])
    print('Evidence strength:', conds[0].get('confidence'))
    print('Evidence:', conds[0].get('evidence', []))
print('Energy at risk:', post.get('energy_at_risk'), 'kWh')
print('Action:', post.get('recommended_action'))

req('http://localhost:8000/api/demo/reset', {}, 'POST')
restored = req('http://localhost:8000/api/assets/' + aid)
print('RESET decision={}, risk={:.1f}'.format(restored['decision_status'], restored['failure_risk']))
