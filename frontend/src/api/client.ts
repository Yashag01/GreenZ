const API_BASE = 'http://localhost:8000/api';

export const fetchAssets = async () => {
  const res = await fetch(`${API_BASE}/assets`);
  if (!res.ok) throw new Error('Failed to fetch assets');
  return res.json();
};

export const fetchAssetDetail = async (id: string) => {
  const res = await fetch(`${API_BASE}/assets/${id}`);
  if (!res.ok) throw new Error('Failed to fetch asset detail');
  return res.json();
};

export const fetchAssetHistory = async (id: string) => {
  const res = await fetch(`${API_BASE}/assets/${id}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
};

export const fetchAlerts = async () => {
  const res = await fetch(`${API_BASE}/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
};

export const injectFault = async (asset_id: string, fault_type: string, fault_magnitude: number) => {
  const res = await fetch(`${API_BASE}/demo/inject-fault`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ asset_id, fault_type, fault_magnitude })
  });
  if (!res.ok) throw new Error('Failed to inject fault');
  return res.json();
};

export const resetDemo = async () => {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
};

export const resolveIssue = async (asset_id: string) => {
  const res = await fetch(`${API_BASE}/demo/resolve/${asset_id}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to resolve issue');
  return res.json();
};

export const uploadCsv = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload/csv`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload CSV');
  return res.json();
};
