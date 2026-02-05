import React from "react";

export default function Layout({ title, subtitle, right, children }) {
  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div>
            <div className="title">{title}</div>
            {subtitle ? <div className="sub">{subtitle}</div> : null}
          </div>
          <div style={{ minWidth: 240 }}>{right}</div>
        </div>
        {children}
      </div>
    </div>
  );
}
