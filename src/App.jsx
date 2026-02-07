import React, { useEffect, useMemo, useState } from "react";
import Layout from "./components/Layout.jsx";
import Tabs from "./components/Tabs.jsx";
import StockTable from "./components/StockTable.jsx";
import MoveForm from "./components/MoveForm.jsx";
import MovesTable from "./components/MovesTable.jsx";
import { downloadText, safeNum } from "./utils.js";
import {
  getItems,
  getStocks,
  getMoves,
  postMove,
  exportMovesCsv,
  health,
  getLocations,
} from "./api.js";

export default function App() {
  const [tab, setTab] = useState("stocks");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ type: "", msg: "" });

  const [items, setItems] = useState([]);
  const [stocks, setStocks] = useState([]);

  const [locations, setLocations] = useState([]);
  const [location, setLocation] = useState(""); // stocks filter

  const [qStocks, setQStocks] = useState("");

  // ✅ 今月の1日〜末日（初期値）
  const [from, setFrom] = useState(firstDayOfThisMonth_());
  const [to, setTo] = useState(lastDayOfThisMonth_());

  const [moves, setMoves] = useState([]);
  const [qMoves, setQMoves] = useState("");
  const [type, setType] = useState("");

  const kpi = useMemo(() => {
    const low = stocks.filter((s) => s.is_low).length;
    const total = stocks.length;
    const sum = stocks.reduce((acc, s) => acc + safeNum(s.qty_on_hand), 0);
    return { low, total, sum };
  }, [stocks]);

  useEffect(() => {
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function boot() {
    setLoading(true);
    setToast({ type: "", msg: "" });
    try {
      await health();

      const locs = await getLocations();
      setLocations(locs);

      const its = await getItems("");
      setItems(its);

      const st = await getStocks({ q: "", location: "" });
      setStocks(st);

      const mv = await getMoves({ from, to, q: "", type: "" });
      setMoves(mv);

      setToast({ type: "ok", msg: "接続OK" });
    } catch (e) {
      setToast({ type: "ng", msg: `起動エラー: ${String(e.message || e)}` });
    } finally {
      setLoading(false);
    }
  }

  async function refreshStocks() {
    const st = await getStocks({ q: qStocks, location });
    setStocks(st);
  }

  async function refreshMoves() {
    const mv = await getMoves({ from, to, q: qMoves, type });
    setMoves(mv);
  }

  async function handleSubmitMove(payload) {
    setSubmitting(true);
    setToast({ type: "", msg: "" });
    try {
      await postMove(payload);
      setToast({ type: "ok", msg: "登録完了" });
      await refreshStocks();
      await refreshMoves();
      setTab("stocks");
    } catch (e) {
      setToast({ type: "ng", msg: `登録エラー: ${String(e.message || e)}` });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExportCsv() {
    try {
      const csv = await exportMovesCsv(from, to);
      downloadText(`stock_moves_${from}_${to}.csv`, csv, "text/csv;charset=utf-8");
      setToast({ type: "ok", msg: "CSV出力した。Excelで開ける。" });
    } catch (e) {
      setToast({ type: "ng", msg: `CSV出力エラー: ${String(e.message || e)}` });
    }
  }

  const right = (
    <div>
      <div className="badge">API: {import.meta.env.VITE_API_BASE_URL ? "SET" : "MISSING"}</div>
      <div style={{ height: 8 }} />
      <button type="button" onClick={boot} disabled={loading}>
        {loading ? "再読込中..." : "再読込"}
      </button>
    </div>
  );

  return (
    <Layout
      title="在庫・受払管理（Sheets DB / Apps Script API）"
      subtitle="毎日自動リセットするので、自由に触って大丈夫です。"
      right={right}
    >
      <div className="kpi">
        <div className="kpiItem">
          <div className="kpiLabel">品目数</div>
          <div className="kpiValue">{kpi.total}</div>
        </div>
        <div className="kpiItem">
          <div className="kpiLabel">要補充</div>
          <div className="kpiValue">{kpi.low}</div>
        </div>
        <div className="kpiItem">
          <div className="kpiLabel">在庫合計（全品目の合算）</div>
          <div className="kpiValue">{kpi.sum}</div>
        </div>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "stocks", label: "在庫一覧" },
          { value: "move", label: "入庫/出庫登録" },
          { value: "moves", label: "履歴" },
        ]}
      />

      {loading ? <div className="toast">読み込み中…</div> : null}

      {tab === "stocks" ? (
        <>
          <div className="row">
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: 12, color: "var(--muted)" }}>検索（品番/品名）</label>
              <input
                value={qStocks}
                onChange={(e) => setQStocks(e.target.value)}
                placeholder="例: コイル / MD-COIL-001"
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: "var(--muted)" }}>場所（任意）</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">(ALL)</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ alignSelf: "end" }}>
              <button type="button" onClick={refreshStocks}>
                検索
              </button>
            </div>
          </div>

          <div className="hr" />
          <StockTable rows={stocks} />
        </>
      ) : null}

      {tab === "move" ? (
        <MoveForm items={items} locations={locations} submitting={submitting} onSubmit={handleSubmitMove} />
      ) : null}

      {tab === "moves" ? (
        <>
          <div className="row">
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)" }}>From</label>
              {/* ✅ カレンダー式 */}
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)" }}>To</label>
              {/* ✅ カレンダー式 */}
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--muted)" }}>種別</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">(ALL)</option>
                <option value="IN">IN</option>
                <option value="OUT">OUT</option>
              </select>
            </div>
          </div>

          <div style={{ height: 10 }} />

          <div className="row">
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: 12, color: "var(--muted)" }}>
                検索（item_id/場所/担当/備考/ロット）
              </label>
              <input
                value={qMoves}
                onChange={(e) => setQMoves(e.target.value)}
                placeholder="例: user01 / 材料倉庫 / LOT"
              />
            </div>

            <div style={{ alignSelf: "end" }}>
              <button type="button" onClick={refreshMoves}>
                検索
              </button>
            </div>

            <div style={{ alignSelf: "end" }}>
              <button type="button" onClick={handleExportCsv}>
                CSV出力
              </button>
            </div>
          </div>

          <div className="hr" />
          <MovesTable rows={moves} />
        </>
      ) : null}

      {toast.msg ? <div className={`toast ${toast.type}`}>{toast.msg}</div> : null}
    </Layout>
  );
}

/* =========================
 * Date helpers (YYYY-MM-DD)
 * ========================= */

function toYmd_(d) {
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function firstDayOfThisMonth_() {
  const d = new Date();
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return toYmd_(first);
}

function lastDayOfThisMonth_() {
  const d = new Date();
  // 次月1日の前日 = 今月末日
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return toYmd_(last);
}