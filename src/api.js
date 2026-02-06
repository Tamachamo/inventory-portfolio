const BASE = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

function mustEnv() {
  if (!BASE) throw new Error("VITE_API_BASE_URL が未設定です（.env を確認）");
  if (!API_KEY) throw new Error("VITE_API_KEY が未設定です（.env を確認）");
}

async function request(path, { method = "GET", body } = {}) {
  mustEnv();

  const url = `${BASE}?path=${encodeURIComponent(path)}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Apps Script は status を返せないことがあるので JSONのerrorを見る
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (data && data.error) throw new Error(data.error);
  return data;
}

export async function health() {
  // GETはブラウザ直叩き対応のため、api_keyクエリも使えるが、ここはヘッダで統一
  return request("/health");
}

export async function getItems(q = "") {
  const url = `${BASE}?path=/items${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  const res = await fetch(url, { headers: { "X-API-KEY": API_KEY } });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.items || [];
}

export async function getStocks({ q = "", location = "" } = {}) {
  const url = `${BASE}?path=/stocks${q ? `&q=${encodeURIComponent(q)}` : ""}${location ? `&location=${encodeURIComponent(location)}` : ""}`;
  const res = await fetch(url, { headers: { "X-API-KEY": API_KEY } });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.stocks || [];
}

export async function getMoves({ from = "", to = "", q = "", type = "" } = {}) {
  const params = [];
  params.push("path=/moves");
  if (from) params.push(`from=${encodeURIComponent(from)}`);
  if (to) params.push(`to=${encodeURIComponent(to)}`);
  if (q) params.push(`q=${encodeURIComponent(q)}`);
  if (type) params.push(`type=${encodeURIComponent(type)}`);
  const url = `${BASE}?${params.join("&")}`;
  const res = await fetch(url, { headers: { "X-API-KEY": API_KEY } });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.moves || [];
}

export async function postMove(move) {
  return request("/moves", { method: "POST", body: move });
}

export async function exportMovesCsv(from, to) {
  mustEnv();
  const url = `${BASE}?path=/export&format=csv${from ? `&from=${encodeURIComponent(from)}` : ""}${to ? `&to=${encodeURIComponent(to)}` : ""}`;
  const res = await fetch(url, { headers: { "X-API-KEY": API_KEY } });
  const text = await res.text();
  // エラーJSONの可能性
  try {
    const j = JSON.parse(text);
    if (j && j.error) throw new Error(j.error);
  } catch {
    // csvならJSON parse失敗するのでOK
  }
  return text;
}

export async function getLocations() {
  const url = `${BASE}?path=/locations`;
  const res = await fetch(url, { headers: { "X-API-KEY": API_KEY } });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.locations || [];
}