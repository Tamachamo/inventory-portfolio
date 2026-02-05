import React from "react";
import { fmtDateTime, safeNum } from "../utils.js";

export default function MovesTable({ rows }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            <th>日時</th>
            <th>種別</th>
            <th>item_id</th>
            <th>数量</th>
            <th>保管場所</th>
            <th>ロット</th>
            <th>担当</th>
            <th>備考</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.move_id}>
              <td>{fmtDateTime(r.moved_at)}</td>
              <td>{String(r.move_type).toUpperCase() === "IN" ? <span className="pillOk">IN</span> : <span className="pillNg">OUT</span>}</td>
              <td>{r.item_id}</td>
              <td style={{ fontWeight: 800 }}>{safeNum(r.qty)}</td>
              <td>{r.location}</td>
              <td>{r.lot_no || ""}</td>
              <td>{r.operator || ""}</td>
              <td>{r.note || ""}</td>
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td colSpan={8} style={{ color: "var(--muted)" }}>
                データがありません
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
