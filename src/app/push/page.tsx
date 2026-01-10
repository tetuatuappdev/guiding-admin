"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";

export default function PushPage() {
  const [msg, setMsg] = useState<string>("");

  async function testPush() {
    setMsg("Sending…");
    try {
      const out = await apiPost("/api/push/test");
      setMsg(JSON.stringify(out, null, 2));
    } catch (e: any) {
      setMsg(String(e?.message || e));
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Push</h1>
      <button onClick={testPush} style={{ padding: 12 }}>
        Send test push to me
      </button>
      <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{msg}</pre>
    </div>
  );
}
