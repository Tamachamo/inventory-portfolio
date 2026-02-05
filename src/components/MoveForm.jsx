import React, { useEffect, useMemo, useState } from "react";
import BarcodeScanner from "./BarcodeScanner.jsx";

export default function MoveForm({
  items,
  locations,
  onSubmit,
  submitting,
}) {
  const [moveType, setMoveType] = useState("IN");
  const [q, setQ] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [qty, setQty] = useState(1);
  const [location, setLocation] = useState("");
  const [lotNo, setLotNo] = useState("");
  const [operator, setOperator] = useState("user01");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!location && locations.length) setLocation(locations[0]);
  }, [locations, location]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((it) =>
      String(it.sku || "").toLowerCase().includes(qq) ||
      String(it.name || "").toLowerCase().includes(qq) ||
      String(it.item_id || "").toLowerCase().includes(qq)
    );
  }, [items, q]);

  function applyDetected(text) {
    // 基本：sku を含むならそれで検索、なければそのまま検索欄に入れる
    const t = String(text || "").trim();
    setQ(t);

    const hit = items.find((it) => String(it.sku) === t) ||
                items.find((it) => String(it.barcode) === t);
    if (hit) setSelectedItemId(hit.item_id);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedItemId) {
      alert("品目を選択してね");
      return;
    }
    const payload = {
      move_type: moveType,
      item_id: selectedItemId,
      qty: Number(qty),
      location,
      lot_no: lotNo,
      operator,
      note,
    };
    await onSubmit(payload);
    // 連続登録しやすいように一部だけ残す
    setQty(1);
    setLotNo("");
    setNote("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div>
          <label style={{ fontSize: 12, color: "var(--muted)" }}>種別</label>
          <select value={moveType} onChange={(e) => setMoveType(e.target.value)}>
            <option value="IN">入庫 (IN)</option>
            <option value="OUT">出庫 (OUT)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, color: "var(--muted)" }}>担当者（自由入力）</label>
          <input value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="user01" />
        </div>

        <div>
          <label style={{ fontSize: 12, color: "var(--muted)" }}>保管場所</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ height: 10 }} />

      <div className="row">
        <div style={{ flex: 2, minWidth: 260 }}>
          <label style={{ fontSize: 12, color: "var(--muted)" }}>品目検索（品番/品名/ID）</label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="例: MD-COIL-001" />
          <div style={{ height: 8 }} />
          <BarcodeScanner onDetected={applyDetected} />
        </div>

        <div>
          <label style={{ fontSize: 12, color: "var(--muted)" }}>数量</label>
          <input
            type="number"
            min="0"
            step="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: "var(--muted)" }}>ロット番号（任意）</label>
          <input value={lotNo} onChange={(e) => setLotNo(e.target.value)} placeholder="LOT-XXXX" />
        </div>
      </div>

      <div style={{ height: 10 }} />

      <div>
        <label style={{ fontSize: 12, color: "var(--muted)" }}>品目選択</label>
        <select value={selectedItemId} onChange={(e) => setSelectedItemId(e.target.value)}>
          <option value="">-- 選択 --</option>
          {filtered.map((it) => (
            <option key={it.item_id} value={it.item_id}>
              {it.sku} / {it.name}（{it.item_id}）
            </option>
          ))}
        </select>
      </div>

      <div style={{ height: 10 }} />

      <div>
        <label style={{ fontSize: 12, color: "var(--muted)" }}>備考</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="例: 生産投入、棚卸調整 など" />
      </div>

      <div style={{ height: 10 }} />

      <button type="submit" disabled={submitting}>
        {submitting ? "送信中..." : "登録する"}
      </button>
    </form>
  );
}
