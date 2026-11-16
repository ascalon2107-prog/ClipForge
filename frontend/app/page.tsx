"use client";

import { ChangeEvent, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Choose a video to begin.");
  const [busy, setBusy] = useState(false);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setMessage(selected ? `${selected.name} is ready.` : "Choose a video to begin.");
  }

  async function upload() {
    if (!file || busy) return;
    setBusy(true);
    setMessage("Uploading video…");
    const body = new FormData();
    body.append("video", file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Upload failed");
      setMessage(`Upload complete. Job ${data.job_id} is ready for processing.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "72px 24px" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 96 }}>
        <strong style={{ fontFamily: "'Space Grotesk'", fontSize: 24 }}>✦ ClipForge</strong>
        <span style={{ color: "var(--muted)", fontSize: 14 }}>AI clips, made simple</span>
      </nav>

      <section style={{ maxWidth: 760 }}>
        <p style={{ color: "var(--accent-2)", fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>Creator workflow</p>
        <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: "clamp(48px, 8vw, 92px)", lineHeight: .98, margin: "18px 0 24px" }}>
          Find the moment.<br /><span style={{ color: "var(--accent-2)" }}>Forge the clip.</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 19, lineHeight: 1.6, maxWidth: 620 }}>
          Upload a short video and ClipForge will prepare it for highlight detection, vertical framing, and subtitles.
        </p>
      </section>

      <section style={{ marginTop: 56, background: "var(--panel)", border: "1px solid var(--line)", borderRadius: 24, padding: 28, maxWidth: 720 }}>
        <label htmlFor="video" style={{ display: "block", border: "1px dashed #59617b", borderRadius: 18, padding: "52px 24px", textAlign: "center", background: "var(--panel-soft)" }}>
          <span style={{ display: "block", fontSize: 42, marginBottom: 10 }}>↑</span>
          <strong style={{ display: "block", fontSize: 18 }}>Drop a video here or browse</strong>
          <span style={{ display: "block", color: "var(--muted)", marginTop: 8 }}>MP4, WebM, MOV, or MKV · up to 500 MB</span>
          <input id="video" type="file" accept="video/*" onChange={selectFile} style={{ display: "none" }} />
        </label>
        <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 22, flexWrap: "wrap" }}>
          <button onClick={upload} disabled={!file || busy} style={{ border: 0, borderRadius: 12, padding: "13px 20px", color: "white", background: busy ? "#4b5563" : "var(--accent)", fontWeight: 700 }}>
            {busy ? "Uploading…" : "Start forging"}
          </button>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>{message}</span>
        </div>
      </section>
    </main>
  );
}
