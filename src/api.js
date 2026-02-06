const BASE = import.meta.env.VITE_API_BASE_URL;

function mustEnv() {
  if (!BASE) throw new Error("VITE_API_BASE_URL が未設定");
}

function buildUrl(path, params = {}) {
  mustEnv();
  const qs = new URLSearchParams({ path, ...params });
  return `${BASE}?${qs.toString()}`;
}

async function getJson(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function health() {
  return getJson(buildUrl("/health"));
}

export async function getItems(q = "") {
  const data = await getJson(buildUrl("/items", q ? { q } : {}));
  return data.items || [];
}

export async function getLocations() {
  const data = await getJson(buildUrl("/locations"));
  return data.locations || [];
}

export async function getStocks({ q = "", location = "" } = {}) {
  const params = {};
  if (q) params.q = q;
  if (location) params.location = location;
  const data = await getJson(buildUrl("/stocks", params));
  return data.stocks || [];
}

export async function getMoves({ from = "", to = "", q = "", type = "" } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  if (q) params.q = q;
  if (type) params.type = type;
  const data = await getJson(buildUrl("/moves", params));
  return data.moves || [];
}

export async function postMove(move) {
  mustEnv();
  const url = buildUrl("/moves");
  const body = new URLSearchParams({
    payload: JSON.stringify(move),
  });

  const res = await fetch(url, {
    method: "POST",
    body,
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export async function exportMovesCsv(from, to) {
  mustEnv();
  const params = { format: "csv" };
  if (from) params.from = from;
  if (to) params.to = to;
  const url = buildUrl("/export", params);
  const res = await fetch(url);
  return await res.text();
}