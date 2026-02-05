import React from "react";

export default function Tabs({ value, onChange, tabs }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <div
          key={t.value}
          className={`tab ${value === t.value ? "active" : ""}`}
          onClick={() => onChange(t.value)}
          role="button"
          tabIndex={0}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
