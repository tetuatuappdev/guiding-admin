import { supabaseServer } from "@/lib/supabase/server";
import AllowlistForm from "./ui/AllowlistForm";

type AllowlistRow = {
  email: string | null;
  created_at: string | null;
};

export default async function AllowlistPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("invite_allowlist")
    .select("email, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

    const rows = (data ?? []) as AllowlistRow[];

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h1>Allowlist</h1>
      <AllowlistForm />
      <ul>
        {rows.map((r) => (
          <li key={r.email}>{r.email}</li>
        ))}
      </ul>
    </div>
  );
}
