"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [status, setStatus] = useState<"loading" | "admin" | "nope">("loading");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      if (!user) return setStatus("nope");

      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      setStatus(!error && data ? "admin" : "nope");
    })();
  }, []);

  if (status === "loading") return <p>Loading…</p>;

  console.log("userId?", userId);

  if (status === "nope") return <p>Not admin. Bye.</p>;
  return <p>Welcome, admin.</p>;
}
