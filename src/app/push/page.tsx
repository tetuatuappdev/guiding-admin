"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

export default function PushPage() {
  const [msg, setMsg] = useState<string>("");
  const [email, setEmail] = useState("sylvain.chester@gmail.com");

  async function testPush() {
    setMsg("Sending…");
    try {
      const out = await apiPost("/api/push/test");
      setMsg(JSON.stringify(out, null, 2));
    } catch (e: any) {
      setMsg(String(e?.message || e));
    }
  }

  async function sendTomorrowReminders() {
    setMsg("Sending reminders…");
    try {
      const out = await apiPost("/api/admin/reminders/tomorrow");
      setMsg(JSON.stringify(out, null, 2));
    } catch (e: any) {
      setMsg(String(e?.message || e));
    }
  }

  async function sendToUser() {
    setMsg("Sending to guide…");
    try {
      const out = await apiPost("/api/admin/push/user", { email });
      setMsg(JSON.stringify(out, null, 2));
    } catch (e: any) {
      setMsg(String(e?.message || e));
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Push</h1>
          <p className="page-subtitle">
            Verify notification delivery on your device.
          </p>
        </div>
      </div>
      <section className="card">
        <div className="inline-actions">
          <button className="button" onClick={testPush}>
            Send test push
          </button>
          <button className="button ghost" onClick={sendTomorrowReminders}>
            Send tomorrow reminders
          </button>
          <span className="muted">Live feedback in the console.</span>
        </div>
        <pre className="pre">{msg}</pre>
      </section>
      <section className="card">
        <div className="inline-actions" style={{ flexWrap: "wrap" }}>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Guide email"
            style={{ minWidth: 240 }}
          />
          <button className="button" onClick={sendToUser}>
            Send to guide
          </button>
        </div>
      </section>
    </div>
  );
}
