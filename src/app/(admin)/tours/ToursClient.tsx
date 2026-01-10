"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import { apiPost } from "@/lib/api";



async function markPaid(slotId: string) {
  await apiPost(`/api/admin/tours/${slotId}/mark-paid`);
  console.log("POST to", process.env.NEXT_PUBLIC_API_URL, `/api/admin/tours/${slotId}/mark-paid`);

  window.location.reload();
}

export default function ToursClient() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);

     const { data, error } = await supabase.auth.getUser();
if (error || !data.user) {
  window.location.href = "/login";
  return;
}

      const { data: u } = await supabase.auth.getUser();
console.log("CLIENT uid =", u?.user?.id ?? null);

const uid = u?.user?.id ?? null;

const { data: adminRow, error: adminErr } = await supabase
  .from("admins")
  .select("user_id")
  .eq("user_id", uid ?? "")
  .maybeSingle();

console.log("CLIENT adminRow =", adminRow, "adminErr=", adminErr);

      const { data: pays, error: payErr } = await supabase
        .from("tour_payments")
        .select("id, slot_id, guide_id, status, amount_pence")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (payErr) return setErr(payErr.message);

      const slotIds = (pays ?? []).map(p => p.slot_id).filter(Boolean);
      if (slotIds.length === 0) return setRows([]);

      const { data: slots, error: slotErr } = await supabase
        .from("schedule_slots")
        .select("id, slot_date, slot_time, status")
        .in("id", slotIds)
        .eq("status", "completed");

      if (slotErr) return setErr(slotErr.message);

      const guideIds = Array.from(new Set((pays ?? []).map(p => p.guide_id).filter(Boolean))) as string[];
      const { data: guides, error: gErr } = await supabase
        .from("guides")
        .select("id, first_name, last_name")
        .in("id", guideIds);

        console.log("guideIds =", guideIds);
console.log("guidesRaw =", guides, "gErr=", gErr);


      if (gErr) return setErr(gErr.message);

      const guideById = new Map((guides ?? []).map(g => [g.id, g]));
      const payBySlot = new Map((pays ?? []).map(p => [p.slot_id, p]));

      const merged = (slots ?? []).map(s => {
        const pay = payBySlot.get(s.id);
        const g = pay?.guide_id ? guideById.get(pay.guide_id) : null;
        const guideLabel = g ? `${g.first_name} ${g.last_name}` : (pay?.guide_id ?? "-");
        return { slot: s, payment: pay, guideLabel };
      });

      setRows(merged);
    })();
  }, []);

  if (err) return <p style={{ color: "crimson" }}>{err}</p>;

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", color: "#f2f2f2" }}>
      <h1>Historique des tours</h1>
      {rows.length === 0 ? (
        <p>No pending payments.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th><th>Heure</th><th>Slot</th><th>Guide</th><th>Payment</th><th>Montant</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ slot, payment, guideLabel }) => (
              <tr key={slot.id}>
                <td><Link href={`/tours/${slot.id}`}>{slot.slot_date ?? "-"}</Link></td>
                <td>{slot.slot_time ?? "-"}</td>
                <td>{slot.status ?? "-"}</td>
                <td>{guideLabel}</td>
                <td>{payment?.status ?? "-"}</td>
                <td>{payment ? `${((payment.amount_pence ?? 0)/100).toFixed(2)} €` : "-"}</td>
                <td>{payment?.id ? (
   <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    markPaid(slot.id);
  }}
  style={{
    background: "red",
    color: "white",
    padding: "6px 10px",
    border: "2px solid yellow",
    cursor: "pointer",
  }}
>
  Mark paid
</button>
  ) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
