export function fmtDateTime(s) {
  if (!s) return "";
  // Apps Script: "YYYY-MM-DD HH:mm"
  return String(s);
}

export function safeNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export function downloadText(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
