"use client";
import { useState } from "react";
import { Icon } from "@/components/chrome";
import { attendanceRows } from "@/lib/data";

const statusPill: Record<string, string> = {
  "Present": "bg-secondary-container text-on-secondary-container",
  "Late Arrival": "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  "Remote Work": "bg-surface-container-high text-primary",
  "Unexcused": "bg-error-container text-on-error-container",
  "Completed": "bg-secondary-container text-on-secondary-container",
};

export default function AttendancePage() {
  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [deptPill, setDeptPill] = useState("all");
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = (t: string, m: string) => { setToast(`${t} — ${m}`); setTimeout(() => setToast(""), 3500); };

  const filtered = attendanceRows.filter(r =>
    r.name.toLowerCase().includes(query.toLowerCase()) &&
    (statusTab === "all" || r.status.toLowerCase().includes(statusTab)) &&
    (deptPill === "all" || r.dept === deptPill)
  );

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold mb-1"><span>Workforce Operations</span><span>•</span><span className="text-primary">Real-time Telemetry</span></div>
          <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight">Attendance & Time Tracking</h1>
          <p className="text-sm text-on-surface-variant">Live biometrics, GPS mobile check-ins, and enterprise ledger records.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-surface-container rounded-lg p-1 shadow-sm">
            {["Today: Oct 24, 2025", "Week", "Month", "Custom"].map((t, i) => <button key={t} className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${i === 0 ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}>{t}</button>)}
          </div>
          <button onClick={() => showToast("Attendance Export Ready", "Oct 24 records exported to CSV & formatted PDF.")} className="flex items-center gap-1 px-4 py-2 bg-surface-container-lowest text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container shadow-sm"><Icon name="download" className="text-[18px] text-primary" />Export (PDF/XLS)</button>
          <button onClick={() => setModal(true)} className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold shadow-md hover:bg-primary-container"><Icon name="add_circle" className="text-[18px]" />Log Manual Entry</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { label: "Present Personnel", value: "1,176", pct: "94.2%", sub: "1,248 total scheduled", bar: 94, color: "bg-secondary", dot: "bg-secondary" },
          { label: "Late Arrivals", value: "24", pct: "1.9%", sub: "Grace period: 15 mins", bar: 14, color: "bg-tertiary-container", dot: "bg-tertiary-container" },
          { label: "Early Departure", value: "6", pct: "0.5%", sub: "Approved early sign-offs", bar: 5, color: "bg-primary-container", dot: "bg-primary-container" },
          { label: "Absent / Unexcused", value: "12", pct: "1.0%", sub: "Escalated to Line Leads", bar: 8, color: "bg-error", dot: "bg-error" },
          { label: "Approved Leaves", value: "30", pct: "2.4%", sub: "PTO, Parental, Sick", bar: 18, color: "bg-outline", dot: "bg-outline" },
        ].map(k => (
          <div key={k.label} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1"><span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">{k.label}</span><span className={`w-2.5 h-2.5 rounded-full ${k.dot}`} /></div>
            <div className="flex items-baseline gap-1"><span className={`font-display text-3xl font-bold ${k.label.startsWith("Absent") ? "text-error" : "text-on-surface"}`}>{k.value}</span><span className="text-[11px] font-semibold bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">{k.pct}</span></div>
            <p className="text-xs text-on-surface-variant mt-1">{k.sub}</p>
            <div className="w-full bg-surface-container h-1 rounded-full mt-3 overflow-hidden"><div className={`${k.color} h-full rounded-full`} style={{ width: `${k.bar}%` }} /></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-9 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="relative flex-1 max-w-md">
                <Icon name="search" className="absolute left-3 top-2.5 text-[20px] text-outline" />
                <input value={query} onChange={e => setQuery(e.target.value)} className="w-full h-10 pl-10 pr-4 bg-surface-container-low rounded-lg text-on-surface text-xs placeholder:text-outline focus:outline-none focus:bg-surface-container" placeholder="Search by name, payroll ID (e.g. EMP-1049)..." />
              </div>
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="text-[11px] uppercase text-outline font-semibold mr-1">Status:</span>
                {[["all", "All (1,248)"], ["present", "Present"], ["late", "Late"], ["remote", "Remote"], ["absent", "Absent"]].map(([v, l]) => (
                  <button key={v} onClick={() => setStatusTab(v)} className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${statusTab === v ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:text-on-surface"}`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] uppercase tracking-wider text-outline whitespace-nowrap font-semibold">Departments:</span>
              {[["all", "All Units"], ["engineering", "Engineering (482)"], ["product", "Product & UX (114)"], ["sales", "Global Sales (298)"], ["marketing", "Marketing (120)"], ["finance", "Finance & Legal (84)"], ["hr", "People Ops (50)"]].map(([v, l]) => (
                <button key={v} onClick={() => setDeptPill(v)} className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${deptPill === v ? "bg-surface-container-high text-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}>{l}</button>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[960px]">
                <thead><tr className="bg-surface-container-low text-outline text-[11px] uppercase tracking-wider font-semibold h-11">
                  <th className="px-4">Employee</th><th className="px-2">Department</th><th className="px-2">Date & Shift</th><th className="px-2">Check-In</th><th className="px-2">Check-Out</th><th className="px-2">Logged Hours</th><th className="px-2">Verification Method</th><th className="px-2">Status</th><th className="px-4 text-right">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-surface-container">
                  {filtered.map(r => (
                    <tr key={r.empId} className="hover:bg-surface-container-low/60 transition-colors h-16">
                      <td className="px-4"><div className="flex items-center gap-2">{r.avatar ? <img className="w-9 h-9 rounded-full object-cover shadow-xs" src={r.avatar} alt={r.name} /> : <span className="w-9 h-9 rounded-full bg-surface-container-high text-primary font-bold flex items-center justify-center text-sm">KL</span>}<div className="flex flex-col"><span className="text-sm font-semibold text-on-surface">{r.name}</span><span className="text-[11px] text-outline">{r.empId}</span></div></div></td>
                      <td className="px-2"><span className="text-xs text-on-surface">{r.deptLabel}</span></td>
                      <td className="px-2"><div className="flex flex-col"><span className="text-xs text-on-surface">Today, Oct 24</span><span className="text-[11px] text-outline">{r.shift}</span></div></td>
                      <td className="px-2"><div className="flex items-center gap-1.5"><span className={`text-sm font-semibold ${r.checkIn === "--:--" ? "text-error" : "text-on-surface"}`}>{r.checkIn}</span>{r.checkInTag && <span className="px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">{r.checkInTag}</span>}</div></td>
                      <td className="px-2"><span className="text-xs text-on-surface">{r.checkOut}</span></td>
                      <td className="px-2"><div className="flex flex-col"><span className="text-sm font-semibold text-on-surface">{r.hours}</span>{r.hoursSub && <span className="text-[11px] text-secondary font-medium">{r.hoursSub}</span>}</div></td>
                      <td className="px-2"><div className="flex items-center gap-1 text-on-surface-variant text-xs"><Icon name={r.method} className="text-[16px] text-primary" />{r.methodLabel}</div></td>
                      <td className="px-2"><span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 ${statusPill[r.status] || statusPill["Present"]}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{r.status}</span></td>
                      <td className="px-4 text-right"><button className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container"><Icon name="edit_note" className="text-[18px]" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 bg-surface-container-low text-on-surface-variant gap-2">
              <span className="text-xs">Showing <span className="font-semibold text-on-surface">1-{filtered.length}</span> of <span className="font-semibold text-on-surface">1,248</span> personnel records</span>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1 rounded bg-primary text-on-primary text-sm font-bold">1</button>
                <button className="px-3 py-1 rounded hover:bg-surface-container text-on-surface-variant text-sm">2</button>
                <button className="px-3 py-1 rounded hover:bg-surface-container text-on-surface-variant text-sm">3</button>
                <span className="px-1 text-outline">...</span>
                <button className="px-3 py-1 rounded hover:bg-surface-container text-on-surface-variant text-sm">250</button>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 flex flex-col gap-4">
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Icon name="bar_chart" className="text-primary" /><h3 className="text-base font-bold text-on-surface">Weekly Trend</h3></div><span className="text-[11px] text-secondary font-semibold bg-secondary-container px-2 py-0.5 rounded-full">+1.2% vs LW</span></div>
            <div className="flex items-end justify-between h-40 pt-6 pb-2 px-2 bg-surface-container-low rounded-lg">
              {[["Mon", 96, 82], ["Tue", 94, 78], ["Wed", 95, 80], ["Thu", 93, 74], ["Today", 94.2, 79]].map(([d, v, h]) => (
                <div key={d as string} className="flex flex-col items-center gap-1.5 h-full justify-end flex-1">
                  <span className={`text-[11px] ${d === "Today" ? "text-secondary font-bold" : "text-outline"}`}>{v}%</span>
                  <div className={`w-7 rounded-t-sm ${d === "Today" ? "bg-secondary" : "bg-primary"}`} style={{ height: `${h}%` }} />
                  <span className={`text-[11px] font-medium ${d === "Today" ? "text-primary font-bold" : "text-on-surface-variant"}`}>{d}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-2">
              <div className="bg-surface-container-low p-2 rounded-lg"><span className="text-[11px] text-outline uppercase block font-semibold">Average Check-in</span><span className="text-sm text-on-surface font-bold">08:51 AM</span></div>
              <div className="bg-surface-container-low p-2 rounded-lg"><span className="text-[11px] text-outline uppercase block font-semibold">Avg Working Span</span><span className="text-sm text-on-surface font-bold">8h 24m</span></div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Icon name="notification_important" className="text-tertiary-container" /><h3 className="text-base font-bold text-on-surface">Irregularity Alerts</h3></div><span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-[11px] font-bold">3 Pending</span></div>
            <div className="flex flex-col gap-2">
              {[
                { tag: "3x Consecutive Late", tagClass: "text-tertiary", id: "EMP-1194", name: "Elena Rostova", desc: "Exceeded 30m grace mark 3 times this payroll cycle.", btn: "Send Reminder" },
                { tag: "Unexcused Missed Shift", tagClass: "text-error", id: "EMP-2104", name: "Keira Lawson", desc: "Zero biometrics ping detected by 12:00 PM without leave record.", btn: "Escalate to Lead" },
                { tag: "Overtime Cap Warning", tagClass: "text-primary", id: "EMP-1388", name: "Aria Chen", desc: "Weekly OT reached 9h 45m (Regulatory threshold: 10h).", btn: "Acknowledge" },
              ].map(a => (
                <div key={a.id} className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all">
                  <div className="flex items-center justify-between"><span className={`text-[11px] font-bold ${a.tagClass}`}>{a.tag}</span><span className="text-[11px] text-outline">{a.id}</span></div>
                  <p className="text-sm text-on-surface font-semibold">{a.name}</p>
                  <p className="text-xs text-on-surface-variant">{a.desc}</p>
                  <button onClick={() => showToast("Alert action dispatched", `${a.name} — ${a.btn}`)} className="mt-1 px-2 py-1 rounded bg-surface-container-high text-primary hover:bg-primary hover:text-on-primary text-[11px] font-semibold transition-colors">{a.btn}</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <h4 className="text-sm text-on-surface font-bold mb-2">Verification Gateways</h4>
            {[["fingerprint", "Building Turnstiles", "Operational", "text-on-secondary-container bg-secondary-container"], ["my_location", "Mobile Geofence (HQ)", "Operational", "text-on-secondary-container bg-secondary-container"], ["cloud_sync", "Azure AD SSO Web Ping", "Syncing (4s)", "text-primary bg-surface-container-high"]].map(([icon, l, s, c]) => (
              <div key={l} className="flex items-center justify-between py-1 text-on-surface-variant"><span className="text-xs flex items-center gap-1.5"><Icon name={icon} className="text-[16px] text-secondary" />{l}</span><span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c}`}>{s}</span></div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4" onClick={() => setModal(false)}>
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl w-full max-w-lg flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between"><div><h3 className="font-display text-xl text-on-surface font-bold">Log Manual Attendance</h3><p className="text-xs text-on-surface-variant">Submit manual time adjustment with audit notes.</p></div><button onClick={() => setModal(false)} className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"><Icon name="close" /></button></div>
            <div className="flex flex-col gap-2">
              <div><label className="block text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">Employee Identification</label><input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary" placeholder="e.g. EMP-1082 or Marcus Vance" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">Check-in Time</label><input type="time" defaultValue="09:00" className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary" /></div>
                <div><label className="block text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">Check-out Time</label><input type="time" defaultValue="18:00" className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary" /></div>
              </div>
              <div><label className="block text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">Reason / Justification</label><select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary"><option>Badge forgot at home</option><option>Offsite client engagement</option><option>Biometric scanner sensor glitch</option><option>Approved remote travel day</option></select></div>
              <div><label className="block text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">Manager Note</label><textarea rows={3} className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary resize-none" placeholder="Enter auditor remarks..." /></div>
            </div>
            <div className="flex items-center justify-end gap-1 pt-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface text-sm font-semibold">Cancel</button>
              <button onClick={() => { setModal(false); showToast("Manual Log Saved", "New manual time-stamp attached to audit logs."); }} className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container text-sm font-semibold shadow-sm">Submit & Log Audit</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 right-6 bg-surface-container-lowest text-on-surface border border-outline-variant/40 shadow-xl rounded-xl px-4 py-2 flex items-center gap-3 z-50"><Icon name="check_circle" className="text-secondary text-[22px]" /><div><p className="text-sm font-bold">{toast}</p></div></div>}
    </div>
  );
}
