import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

type TicketScan = {
  id: string;
  kind: "qr" | "paper" | string;
  persons: number | null;
  ticket_code: string | null;
  tourist_name: string | null;
  scanned_at: string | null;
};

export default async function TourDetailPage({
  params,
}: {
  params: { slotId: string };
}) {
  const supabase = await supabaseServer();
  const slotId = params.slotId;

  const { data: slot } = await supabase
    .from("schedule_slots")
    .select("slot_date, slot_time, status, guide_id")
    .eq("id", slotId)
    .maybeSingle();

  const { data: payment } = await supabase
    .from("tour_payments")
    .select("id, status, amount_pence")
    .eq("slot_id", slotId)
    .maybeSingle();

  const { data: scans } = await supabase
    .from("ticket_scans")
    .select(
      "id, kind, persons, ticket_code, tourist_name, scanned_at"
    )
    .eq("slot_id", slotId)
    .order("scanned_at", { ascending: false });

  const totalPersons =
    scans?.reduce((sum, s) => sum + (s.persons ?? 0), 0) ?? 0;

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", color: "#f2f2f2" }}>
      <Link href="/tours">← Back</Link>

      <h1>Tour detail</h1>
      <p>
        <b>Date:</b> {slot?.slot_date}{" "}
        <b>Time:</b> {slot?.slot_time}{" "}
        <b>Status:</b> {slot?.status}
      </p>

      <p>
        <b>Payment:</b> {payment?.status ?? "-"}{" "}
        <b>Amount:</b>{" "}
        {payment
          ? `${((payment.amount_pence ?? 0) / 100).toFixed(2)} €`
          : "-"}
      </p>

      <h2>Tickets ({totalPersons} persons)</h2>

      {(!scans || scans.length === 0) ? (
        <p>No tickets scanned.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Persons</th>
              <th>Tourist</th>
              <th>Code</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s) => (
              <tr key={s.id}>
                <td>{s.scanned_at?.slice(11, 16) ?? "-"}</td>
                <td>{s.kind}</td>
                <td>{s.persons ?? 0}</td>
                <td>{s.tourist_name ?? "-"}</td>
                <td>
                  <code>{s.ticket_code ?? "-"}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}