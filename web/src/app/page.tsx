"use client";
import { useState } from "react";
import { Icon, Toast } from "@/components/chrome";
import { approvals } from "@/lib/data";

const depts = [
  { name: "Engineering", pct: 30.4, headcount: "380 headcount", budget: "45.4% budget share", monthly: "$382.4k / mo", bar: 78, color: "bg-primary" },
  { name: "Sales & Growth", pct: 23.2, headcount: "290 headcount", budget: "25.0% budget share", monthly: "$210.8k / mo", bar: 61, color: "bg-primary-container" },
  { name: "Global Operations", pct: 16.8, headcount: "210 headcount", budget: "12.8% budget share", monthly: "$108.5k / mo", bar: 44, color: "bg-secondary" },
  { name: "Marketing", pct: 11.2, headcount: "140 headcount", budget: "8.1% budget share", monthly: "$68.2k / mo", bar: 29, color: "bg-tertiary-container" },
  { name: "Product & Design", pct: 10.3, headcount: "128 headcount", budget: "7.4% budget share", monthly: "$62.6k / mo", bar: 26, color: "bg-surface-tint" },
  { name: "HR & Legal", pct: 8.1, headcount: "100 headcount", budget: "5.7% budget share", monthly: "$48.0k / mo", bar: 21, color: "bg-outline" },
];

const feed = [
  { name: "Marcus Vance", role: "Staff SRE · London Hub", tag: "On Time", tagClass: "bg-secondary-container text-on-secondary-container", dot: "bg-secondary", time: "08:58 AM", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80" },
  { name: "Elena Rostova", role: "VP Sales EMEA · Remote", tag: "Remote", tagClass: "bg-surface-container-high text-primary", dot: "bg-primary", time: "09:02 AM", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80" },
  { name: "Devon Washington", role: "Principal PM · NYC Office", tag: "On Time", tagClass: "bg-secondary-container text-on-secondary-container", dot: "bg-secondary", time: "09:04 AM", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80" },
  { name: "Chloe Zimmermann", role: "Operations Lead · Berlin Hub", tag: "Shift Started", tagClass: "bg-surface-container-highest text-on-surface", dot: "bg-outline", time: "09:12 AM", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80" },
];

export default function DashboardPage() {
  const [mode, setMode] = useState<"headcount" | "budget">("headcount");
  const [rows, setRows] = useState(approvals);
  const [modal, setModal] = useState<{ title: string; desc: string; id: string; action: string } | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3200); };
  const decide = (row: (typeof approvals)[0], action: string) => {
    setModal({
      title: action === "approve" ? `Authorize Request for ${row.name}` : `Reject Request for ${row.name}`,
      desc: action === "approve"
        ? `Confirm executive approval for ${row.name}. Digital signature and policy compliance stamp will be appended automatically.`
        : `Are you sure you wish to return this submission to ${row.name} with revision notes?`,
      id: row.id, action,
    });
  };
  const confirm = () => {
    if (!modal) return;
    setRows(rows.filter(r => r.id !== modal.id));
    showToast(modal.action === "approve" ? "Request successfully approved and dispatched." : "Request declined and returned to manager.");
    setModal(null);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low p-6 mb-6 shadow-sm">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] bg-primary text-on-primary uppercase tracking-wider font-semibold">Executive Overview</span>
              <span className="text-[11px] text-on-surface-variant flex items-center gap-1"><Icon name="calendar_today" className="text-[14px]" />Thursday, October 24, 2024</span>
              <span className="w-1 h-1 rounded-full bg-outline" />
              <span className="text-[11px] text-secondary flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />Telemetry Live</span>
            </div>
            <h1 className="font-display text-4xl text-on-surface tracking-tight">Good morning, Sarah</h1>
            <p className="text-sm text-on-surface-variant flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-on-surface">94.2%</span> attendance recorded today <span className="text-outline">/</span>
              <span className="font-semibold text-tertiary">14</span> requests pending review <span className="text-outline">/</span>
              <span className="font-semibold text-primary">8</span> open technical requisitions
            </p>
          </div>
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button onClick={() => showToast("Generating executive PDF dossier...")} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-surface-container-highest text-on-surface text-sm font-semibold hover:bg-surface-dim shadow-sm"><Icon name="download" className="text-[18px]" />Download Dossier</button>
            <button onClick={() => showToast("Payroll sync completed: 1,248 accounts validated with zero delta.")} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold shadow-sm hover:bg-primary-container"><Icon name="sync" className="text-[18px]" />Sync Payroll Data</button>
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {[
          { label: "Total Workforce", icon: "groups", color: "text-primary", value: "1,248", foot: "+4.2% MoM · 18 new hires this month", footIcon: "trending_up", footClass: "text-secondary" },
          { label: "Today's Attendance", icon: "how_to_reg", color: "text-secondary", value: "1,176", suffix: " / 1,248", foot: "42 Remote · 30 Approved Leave", footIcon: "", footClass: "" },
          { label: "Pending Approvals", icon: "pending_actions", color: "text-tertiary", value: "14", badge: "4 Urgent", foot: "Requires executive sign-off", footIcon: "priority_high", footClass: "text-tertiary" },
          { label: "Monthly Payroll Run", icon: "payments", color: "text-primary-container", value: "$842.5k", badge: "Cycle: Oct 31", foot: "On track · Zero exceptions logged", footIcon: "check_circle", footClass: "text-secondary" },
        ].map(k => (
          <div key={k.label} className="relative bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">{k.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center ${k.color} group-hover:scale-105 transition-transform`}><Icon name={k.icon} className="text-[18px]" /></div>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="font-display text-3xl font-bold text-on-surface tracking-tight">{k.value}{k.suffix && <span className="text-sm text-outline font-normal">{k.suffix}</span>}</span>
              {k.badge && <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-semibold">{k.badge}</span>}
              {k.badge && k.label === "Monthly Payroll Run" && <span className="text-[11px] text-secondary bg-surface-container-high px-2 py-0.5 rounded">{k.badge}</span>}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {k.footIcon && <span className={`flex items-center font-semibold ${k.footClass}`}><Icon name={k.footIcon} className="text-[16px]" />{k.foot.startsWith("+") ? k.foot.split(" ")[0] + " " : ""}</span>}
              <span className="text-on-surface-variant truncate">{k.foot}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Demographics + telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-1">
            <div>
              <h2 className="font-display text-xl text-on-surface">Workforce Demographics & Allocation</h2>
              <p className="text-xs text-on-surface-variant">Headcount breakdown and mapped quarterly budget utilization</p>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg self-start">
              {(["headcount", "budget"] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); showToast(`Toggled demographic metric to ${m === "budget" ? "Budget Share" : "Headcount"}`); }}
                  className={`px-2 py-1 rounded text-[11px] font-semibold ${mode === m ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface"}`}>
                  {m === "headcount" ? "Headcount" : "Budget Share"}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-surface-container my-4">
            {depts.map(d => <div key={d.name} className={`${d.color} h-full transition-all duration-500`} style={{ width: `${d.pct}%` }} title={`${d.name}: ${d.pct}%`} />)}
          </div>
          <div className="space-y-4 pt-1">
            {depts.map(d => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
                    <span className="font-semibold text-on-surface text-sm">{d.name}</span>
                    <span className="text-outline text-[11px]">({d.pct}%)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-on-surface text-sm">{mode === "budget" ? d.budget : d.headcount}</span>
                    <span className="text-[11px] text-on-surface-variant">{d.monthly}</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-low overflow-hidden"><div className={`${d.color} h-full rounded-full`} style={{ width: `${d.bar}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-2 flex items-center justify-between bg-surface-container-low p-2 rounded-lg">
            <div className="flex items-center gap-2"><Icon name="equalizer" className="text-primary" /><span className="text-xs text-on-surface">Average compensation ratio across tiers: <strong>1.04 compa-ratio</strong></span></div>
            <a className="text-sm text-primary hover:underline flex items-center gap-0.5 font-semibold" href="#">Explore Bands <Icon name="arrow_forward" className="text-[16px]" /></a>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary animate-ping" /><h2 className="font-display text-xl text-on-surface">Live Check-in Telemetry</h2></div>
            <span className="text-[11px] text-outline uppercase tracking-wider font-semibold">Real-Time</span>
          </div>
          <p className="text-xs text-on-surface-variant mb-4">Geofenced and remote clock-in feeds streamed over WebSocket</p>
          <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-lg mb-4 text-center">
            {[["98.1%", "Engineering", "text-secondary"], ["92.4%", "Commercial", "text-primary"], ["89.6%", "Ops & Field", "text-tertiary"]].map(([v, l, c]) => (
              <div key={l} className="p-1"><span className={`font-display text-xl font-bold block ${c}`}>{v}</span><span className="text-[11px] text-on-surface-variant">{l}</span></div>
            ))}
          </div>
          <div className="space-y-2">
            {feed.map(f => (
              <div key={f.name} className="flex items-center justify-between p-1 rounded-lg hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <img className="w-9 h-9 rounded-full object-cover" src={f.avatar} alt={f.name} />
                  <div className="truncate"><p className="text-sm font-semibold text-on-surface truncate">{f.name}</p><p className="text-[11px] text-on-surface-variant truncate">{f.role}</p></div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${f.tagClass}`}><span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />{f.tag}</span>
                  <span className="text-[11px] text-outline mt-0.5">{f.time}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high text-sm font-semibold flex items-center justify-center gap-1">View Full Attendance Log <Icon name="keyboard_arrow_right" className="text-[18px]" /></button>
        </div>
      </div>

      {/* Approvals + milestones */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-1">
            <div>
              <div className="flex items-center gap-1"><h2 className="font-display text-xl text-on-surface">Executive Approvals Queue</h2><span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold">{rows.length} Pending</span></div>
              <p className="text-xs text-on-surface-variant">Time-off requests, compensation revisions, and high-budget reimbursements</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-surface-container-low/70">
                <th className="py-2 px-4 text-[11px] uppercase tracking-wider text-outline rounded-l-lg">Personnel</th>
                <th className="py-2 px-4 text-[11px] uppercase tracking-wider text-outline">Category</th>
                <th className="py-2 px-4 text-[11px] uppercase tracking-wider text-outline">Interval / Scope</th>
                <th className="py-2 px-4 text-[11px] uppercase tracking-wider text-outline">Status</th>
                <th className="py-2 px-4 text-[11px] uppercase tracking-wider text-outline text-right rounded-r-lg">Decision</th>
              </tr></thead>
              <tbody className="divide-y divide-surface-container-low">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-2 px-4"><div className="flex items-center gap-2"><img className="w-8 h-8 rounded-full object-cover" src={r.avatar} alt={r.name} /><div><p className="text-sm font-semibold text-on-surface">{r.name}</p><p className="text-[11px] text-on-surface-variant">{r.team}</p></div></div></td>
                    <td className="py-2 px-4"><span className="inline-flex items-center gap-1 text-xs text-on-surface"><Icon name={r.icon} className="text-primary text-[16px]" />{r.category}</span></td>
                    <td className="py-2 px-4"><p className="text-xs text-on-surface">{r.scope}</p><p className="text-[11px] text-outline">{r.sub}</p></td>
                    <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.statusClass}`}>{r.status}</span></td>
                    <td className="py-2 px-4 text-right"><div className="flex items-center justify-end gap-1">
                      <button onClick={() => decide(r, "approve")} className="w-8 h-8 rounded-lg bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface flex items-center justify-center" title="Approve"><Icon name="check" className="text-[18px]" /></button>
                      <button onClick={() => decide(r, "reject")} className="w-8 h-8 rounded-lg bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface flex items-center justify-center" title="Decline"><Icon name="close" className="text-[18px]" /></button>
                    </div></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-sm text-on-surface-variant">Queue cleared — all requests decided.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2"><h2 className="font-display text-xl text-on-surface">This Week&apos;s Milestones</h2><Icon name="celebration" className="text-tertiary" /></div>
          <p className="text-xs text-on-surface-variant mb-4">Anniversaries, life events, and end-of-probation milestones</p>
          <div className="space-y-4">
            {[
              { icon: "workspace_premium", bg: "bg-primary-fixed text-primary", name: "Ethan Brooks", when: "Tomorrow", desc: "5th Work Anniversary · VP Systems", action: "Send Kudos Card" },
              { icon: "cake", bg: "bg-tertiary-fixed text-tertiary", name: "Sofia Mendoza", when: "Oct 26", desc: "Birthday · Brand Marketing Lead", action: "Gift perk scheduled" },
              { icon: "verified", bg: "bg-secondary-fixed text-secondary", name: "Tobias Weber", when: "Oct 27", desc: "90-Day Probation Review · DevSecOps", action: "Complete Review Form" },
            ].map(m => (
              <div key={m.name} className="flex items-start gap-2 p-2 rounded-lg bg-surface-container-low">
                <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center shrink-0`}><Icon name={m.icon} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><p className="text-sm font-semibold text-on-surface truncate">{m.name}</p><span className="text-[11px] text-outline">{m.when}</span></div>
                  <p className="text-xs text-on-surface-variant">{m.desc}</p>
                  <div className="mt-1"><button onClick={() => showToast("Kudos celebration card sent via Slack & HR feed!")} className="text-primary text-[11px] font-semibold hover:underline flex items-center gap-0.5"><Icon name="send" className="text-[14px]" />{m.action}</button></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-2 border-t border-surface-container flex items-center justify-between">
            <span className="text-[11px] text-on-surface-variant flex items-center gap-1"><Icon name="notifications_active" className="text-[14px]" />Auto-synced with HR calendar</span>
            <button className="text-sm text-primary hover:underline font-semibold">Full Month</button>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="relative bg-surface-container-lowest rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2"><h3 className="font-display text-xl text-on-surface">{modal.title}</h3><button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container"><Icon name="close" /></button></div>
            <p className="text-sm text-on-surface-variant my-4">{modal.desc}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold hover:bg-surface-dim">Cancel</button>
              <button onClick={confirm} className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container shadow-sm">Confirm & Execute</button>
            </div>
          </div>
        </div>
      )}
      <Toast msg={toast} />
    </div>
  );
}
