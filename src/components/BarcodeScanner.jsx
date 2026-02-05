import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function BarcodeScanner({ onDetected }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const regionId = useRef(`qr-region-${Math.random().toString(16).slice(2)}`);
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startScanner() {
    setError("");
    const id = regionId.current;

    try {
      const scanner = new Html5Qrcode(id);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => {
          // 1回読んだら閉じる
          onDetected(decodedText);
          setOpen(false);
          stopScanner();
        },
        () => {}
      );
    } catch (e) {
      setError(String(e?.message || e));
      setOpen(false);
      stopScanner();
    }
  }

  async function stopScanner() {
    try {
      const scanner = scannerRef.current;
      if (scanner) {
        const state = scanner.getState?.();
        // RUNNING: 2 in older versions; safe to just try stop
        await scanner.stop();
        await scanner.clear();
      }
    } catch {
      // ignore
    } finally {
      scannerRef.current = null;
    }
  }

  async function toggle() {
    if (open) {
      setOpen(false);
      await stopScanner();
      return;
    }
    setOpen(true);
    // DOM描画後にstart
    setTimeout(() => startScanner(), 50);
  }

  return (
    <div>
      <button type="button" onClick={toggle}>
        {open ? "スキャナーを閉じる" : "バーコード/QRを読む"}
      </button>
      {open ? (
        <div style={{ marginTop: 10 }}>
          <div className="badge">スマホはカメラ許可が必要</div>
          <div style={{ height: 12 }} />
          <div id={regionId.current} style={{ width: "100%", maxWidth: 520 }} />
        </div>
      ) : null}
      {error ? <div className="toast ng">スキャナーエラー: {error}</div> : null}
    </div>
  );
}
