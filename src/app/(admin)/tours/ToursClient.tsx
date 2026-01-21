"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import { apiPost } from "@/lib/api";

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );


async function markPaid(slotId: string) {
  await apiPost(`/api/admin/tours/${slotId}/mark-paid`);
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
      const uid = u?.user?.id ?? null;

      await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", uid ?? "")
        .maybeSingle();

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

  const totalAmount =
    rows.reduce((sum, r) => sum + (r.payment?.amount_pence ?? 0), 0) / 100;

  if (err) return <p className="error">{err}</p>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending payments</h1>
          <p className="page-subtitle">
            List of completed tours awaiting payment approval.
          </p>
        </div>
        <span className="pill">{rows.length} items</span>
      </div>

      <section className="stat-grid">
        <div className="stat">
          <div className="stat-value">{rows.length}</div>
          <div className="stat-label">Tours to settle</div>
        </div>
        <div className="stat">
          <div className="stat-value">£{totalAmount.toFixed(2)}</div>
          <div className="stat-label">Estimated total</div>
        </div>
        <div className="stat">
          <div className="stat-value">24h</div>
          <div className="stat-label">Target review window</div>
        </div>
      </section>

      {rows.length === 0 ? (
        <div className="callout">
          <strong>Nothing to approve right now.</strong>
          <span className="muted">
            Next payments will appear here once a tour is completed.
          </span>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Slot</th>
                <th>Guide</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ slot, payment, guideLabel }) => {
                const slotIdRaw = slot?.id ?? payment?.slot_id ?? "";
                const slotId = isUuid(String(slotIdRaw)) ? String(slotIdRaw) : "";
                return (
                <tr key={slotId || slot.id}>
                  <td>
                    {slotId ? (
                      <Link href={`/tours/${slotId}`}>{slot.slot_date ?? "-"}</Link>
                    ) : (
                      slot.slot_date ?? "-"
                    )}
                  </td>
                  <td>{slot.slot_time ?? "-"}</td>
                  <td>{slot.status ?? "-"}</td>
                  <td>{guideLabel}</td>
                  <td>{payment?.status ?? "-"}</td>
                  <td>
                    {payment
                      ? `£${((payment.amount_pence ?? 0) / 100).toFixed(2)}`
                      : "-"}
                  </td>
                  <td>
                    {payment?.id ? (
                      <div className="inline-actions">
                        {slotId ? (
                          <Link className="button ghost" href={`/tours/${slotId}`}>
                            View
                          </Link>
                        ) : (
                          <span className="muted">Invalid ID</span>
                        )}
                        <button
                          type="button"
                          className="button danger"
                          disabled={!slotId}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (slotId) markPaid(slotId);
                          }}
                        >
                          Mark paid
                        </button>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
