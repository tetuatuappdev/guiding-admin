import { supabase } from "./supabase";

export async function apiPost(path: string, body?: any) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not logged in");

  const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : "{}",
  });

  const text = await r.text();
  if (!r.ok) throw new Error(text);
  return text ? JSON.parse(text) : null;
}
