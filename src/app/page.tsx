"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading"|"ok"|"nope">("loading");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return router.replace("/login");

      const ok = await isAdmin(user.id);
      if (!ok) {
        setStatus("nope");
        return;
      }
      setStatus("ok");
    })();
  }, [router]);

  if (status === "loading") return <p style={{ padding: 20 }}>Loading…</p>;
  if (status === "nope") return <p style={{ padding: 20 }}>Not admin. Bye.</p>;

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Admin dashboard</h1>
      <ul>
        <li><a href="/push">Push</a></li>
        <li><a href="/tours">Tours</a></li>
        <li><a href="/guides">Guides</a></li>
      </ul>
    </div>
  );
}
