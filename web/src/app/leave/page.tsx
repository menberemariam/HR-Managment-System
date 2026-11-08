"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/chrome";
import { apiGet } from "@/lib/api";

type Leave = { _id: string; employeeName?: string; fullName?: string; type?: string; leaveType?: string; startDate?: string; endDate?: string; status?: string; reason?: string };

export default function LeavePage() {
  const [rows, setRows] = useState<Leave[]>([]);
  const [live, setLive] = useState(false);
  useEffect(() => {
    apiGet<Leave[]>("/api/leaves").then(d => { if (d && d.length) { setRows(d); setLive(true); } });
  }, []);
  const demo = [
    { id: "1", name: "Aiko Tanaka", type: "Annual Leave", dates: "Nov 04 – Nov 12", status: "Pending" },
    { id: "2", name: "Priya Sundaram", type: "Maternity Leave", dates: "Oct 28 – Jan 28", status: "Approved" },
    { id: "3", name: "Liam O'Connor", type: "Medical Sabbatical", dates: "Oct 28 – Nov 08", status: "Pending" },
    { id: "4", name: "Sofia Mendoza", type: "Parental Leave", dates: "Nov 15 – Dec 15", status: "Approved" },
  ];
  return (
    <div className="flex flex-col w-full gap-6">
      <div>
        <h1 className="font-display text-4xl text-on-surface">Leave Requests</h1>
        <p className="text-sm text-on-surface-variant mt-1">Time-off submissions, approvals and balances{live ? " — live from /api/leaves" : ""}.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[["Pending Review", "14", "pending_actions", "text-tertiary"], ["Approved This Month", "86", "check_circle", "text-secondary"], ["Avg. Leave Balance", "18.4 days", "event_available", "text-primary"]].map(([l, v, i, c]) => (
          <div key={l} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">{l}</span><Icon name={i} className={c} /></div><p className="font-display text-4xl text-on-surface mt-2">{v}</p></div>
        ))}
      </div>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold h-11"><th className="px-4 py-1">Employee</th><th className="px-4 py-1">Leave Type</th><th className="px-4 py-1">Dates</th><th className="px-4 py-1">Status</th><th className="px-4 py-1 text-right">Decision</th></tr></thead>
          <tbody className="divide-y divide-surface-container-low">
            {(live ? rows.map(r => ({ id: r._id, name: r.employeeName || r.fullName || "—", type: r.type || r.leaveType || "Leave", dates: `${r.startDate || ""} → ${r.endDate || ""}`, status: r.status || "Pending" })) : demo).map(r => (
              <tr key={r.id} className="hover:bg-surface-container-low/40">
                <td className="px-4 py-2 text-sm font-semibold text-on-surface">{r.name}</td>
                <td className="px-4 py-2 text-xs text-on-surface">{r.type}</td>
                <td className="px-4 py-2 text-xs text-on-surface">{r.dates}</td>
                <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.status === "Approved" ? "bg-secondary-container text-on-secondary-container" : "bg-tertiary-fixed text-on-tertiary-fixed"}`}>{r.status}</span></td>
                <td className="px-4 py-2 text-right"><div className="flex items-center justify-end gap-1"><button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-secondary-container text-on-surface flex items-center justify-center"><Icon name="check" className="text-[18px]" /></button><button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-error-container text-on-surface flex items-center justify-center"><Icon name="close" className="text-[18px]" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
