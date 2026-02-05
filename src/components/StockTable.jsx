import React from "react";
import { safeNum } from "../utils.js";

export default function StockTable({ rows }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>品番</th>
            <th>品名</th>
            <th>在庫</th>
            <th>単位</th>
            <th>安全在庫</th>
            <th>状態</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const qty = safeNum(r.qty_on_hand);
            const rp = safeNum(r.reorder_point);
            const low = !!r.is_low;
            return (
              <tr key={r.item_id}>
                <td>{r.sku}</td>
                <td>{r.name}</td>
                <td style={{ fontWeight: 800 }}>{qty}</td>
                <td>{r.unit}</td>
                <td>{rp}</td>
                <td>
                  {low ? <span className="pillWarn">⚠️ 要補充</span> : <span className="pillOk">OK</span>}
                </td>
              </tr>
            );
          })}
          {!rows.length ? (
            <tr>
              <td colSpan={6} style={{ color: "var(--muted)" }}>
                データがありません
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
