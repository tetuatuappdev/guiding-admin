"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onLogin() {
  setErr(null);
  setLoading(true);

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  setLoading(false);

  if (error) return setErr(error.message);

  router.replace("/tours");   // ou "/tours"
  router.refresh();
}


  return (
    <div style={{ maxWidth: 420, margin: "60px auto", fontFamily: "system-ui" }}>
      <h1>Admin</h1>

      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 10 }} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 10 }} />

      <button onClick={onLogin} disabled={loading}
        style={{ width: "100%", padding: 12, marginTop: 12 }}>
        {loading ? "Login..." : "Login"}
      </button>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </div>
  );
}
