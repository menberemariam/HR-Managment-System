"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/chrome";
import { employees as demo, type Employee } from "@/lib/data";
import { apiGet, type ApiEmployee } from "@/lib/api";

const statusClass = (s: string) =>
  s === "Active" ? "bg-secondary-container/40 text-on-secondary-container"
  : s === "On Leave" ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
  : "bg-surface-container-high text-on-surface-variant";
const statusDot = (s: string) => s === "Active" ? "bg-secondary" : s === "On Leave" ? "bg-tertiary" : "bg-outline";

export default function EmployeesPage() {
  const [rows, setRows] = useState<Employee[]>(demo);
  const [live, setLive] = useState(false);
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<Employee | null>(demo[0]);
  const [drawer, setDrawer] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    apiGet<ApiEmployee[]>("/api/employees").then(data => {
      if (data && data.length) {
        setRows(data.map(e => ({
          id: e._id, name: e.fullName, empId: e.employeeId, role: e.position,
          dept: e.department, status: e.status === "active" ? "Active" : e.status === "on-leave" ? "On Leave" : "Active",
          office: "—", joinDate: e.hireDate ? new Date(e.hireDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—",
          manager: "—", type: "Full-time",
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(e.fullName)}&background=4f46e5&color=fff`,
        })));
        setLive(true);
      }
    });
  }, []);

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3200); };
  const filtered = rows.filter(e =>
    (e.name + e.role + e.empId).toLowerCase().includes(query.toLowerCase()) &&
    (dept === "all" || e.dept === dept) &&
    (status === "all" || e.status === status)
  );

  return (
    <div className="flex flex-col w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: "Total Headcount", icon: "groups", value: "1,248", foot: "42 onboarding this quarter", trend: "+3.4%" },
          { label: "Active Today", icon: "verified_user", value: "1,186", foot: "95.0% presence" },
          { label: "On Approved Leave", icon: "beach_access", value: "44", foot: "28 PTO · 12 Medical · 4 Parental", pct: "3.5%" },
          { label: "Global Locations", icon: "public", value: "18", foot: "HQ New York, London, Berlin, Remote" },
        ].map(s => (
          <div key={s.label} className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between"><span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">{s.label}</span><Icon name={s.icon} className="text-primary text-[20px]" /></div>
            <div className="mt-2 flex items-baseline gap-2"><span className="font-display text-4xl text-on-surface">{s.value}</span>{s.trend && <span className="inline-flex items-center text-[11px] font-semibold text-secondary bg-secondary-container/40 px-2 py-0.5 rounded-full"><Icon name="trending_up" className="text-[14px]" />{s.trend}</span>}{s.pct && <span className="text-[11px] text-tertiary font-semibold">{s.pct}</span>}</div>
            <p className="text-xs text-outline mt-1">{s.foot}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2"><h1 className="font-display text-4xl text-on-surface">Employee Directory</h1><span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container-high text-on-surface-variant">{rows.length} Active Personnel{live ? " · Live API" : ""}</span></div>
          <p className="text-sm text-on-surface-variant mt-1">Monitor workforce allocations, verify employment compliance records, and manage personnel dossiers.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => showToast("Exporting employee directory to CSV...")} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface text-sm font-semibold shadow-sm hover:bg-surface-container"><Icon name="file_download" className="text-[18px] text-outline" />Export CSV</button>
          <button onClick={() => showToast("Import wizard opened — drop a CSV file to begin.")} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-surface-container-lowest text-on-surface text-sm font-semibold shadow-sm hover:bg-surface-container"><Icon name="file_upload" className="text-[18px] text-outline" />Import Records</button>
          <button onClick={() => showToast("New employee onboarding flow started.")} className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-sm font-semibold shadow-sm hover:bg-primary"><Icon name="person_add" />+ Add New Employee</button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[280px]">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]" />
            <input value={query} onChange={e => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline text-xs focus:outline-none focus:bg-surface-container-lowest" placeholder="Search by name, role, email, or employee ID (EMP-XXXX)..." />
            {query && <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"><Icon name="close" className="text-[18px]" /></button>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={dept} onChange={e => setDept(e.target.value)} className="appearance-none bg-surface-container-low text-on-surface text-sm font-semibold pl-4 pr-8 py-2 rounded-lg focus:outline-none cursor-pointer">
              <option value="all">All Departments</option><option>Engineering</option><option>Sales</option><option>Product</option><option>HR</option><option>Finance</option>
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="appearance-none bg-surface-container-low text-on-surface text-sm font-semibold pl-4 pr-8 py-2 rounded-lg focus:outline-none cursor-pointer">
              <option value="all">Status: All</option><option>Active</option><option>On Leave</option><option>Probation</option>
            </select>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead><tr className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold h-11">
                <th className="w-12 px-4 text-center"><input type="checkbox" className="w-4 h-4 rounded accent-primary-container cursor-pointer" /></th>
                <th className="px-4 py-1">Employee</th><th className="px-4 py-1">Role & Department</th><th className="px-4 py-1">Status</th><th className="px-4 py-1">Office / Hub</th><th className="px-4 py-1">Join Date</th><th className="px-4 py-1">Direct Manager</th><th className="px-4 py-1 text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-surface-container-low">
                {filtered.map(e => (
                  <tr key={e.id} onClick={() => { setSelected(e); setDrawer(true); }} className={`hover:bg-surface-container-low/80 cursor-pointer transition-colors ${selected?.id === e.id ? "bg-primary-fixed/30" : ""}`}>
                    <td className="px-4 text-center" onClick={ev => ev.stopPropagation()}><input type="checkbox" className="w-4 h-4 rounded accent-primary-container cursor-pointer" /></td>
                    <td className="px-4 py-2"><div className="flex items-center gap-2"><img className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 shadow-xs" src={e.avatar} alt={e.name} /><div className="flex flex-col min-w-0"><span className="text-sm font-semibold text-on-surface truncate">{e.name}</span><span className="text-[11px] text-outline">{e.empId} · {e.type}</span></div></div></td>
                    <td className="px-4 py-2"><div className="flex flex-col"><span className="text-sm font-semibold text-on-surface">{e.role}</span><span className="text-xs text-primary font-medium">{e.dept}</span></div></td>
                    <td className="px-4 py-2"><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusClass(e.status)}`}><span className={`w-1.5 h-1.5 rounded-full ${statusDot(e.status)}`} />{e.status}</span></td>
                    <td className="px-4 py-2"><div className="flex items-center gap-1 text-on-surface text-xs"><Icon name="apartment" className="text-[16px] text-outline" />{e.office}</div></td>
                    <td className="px-4 py-2 text-xs text-on-surface">{e.joinDate}</td>
                    <td className="px-4 py-2"><span className="text-xs text-on-surface truncate">{e.manager}</span></td>
                    <td className="px-4 py-2 text-right" onClick={ev => ev.stopPropagation()}><div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelected(e); setDrawer(true); }} className="p-1.5 rounded hover:bg-surface-container text-primary" title="View Dossier"><Icon name="visibility" className="text-[18px]" /></button>
                      <button className="p-1.5 rounded hover:bg-surface-container text-outline hover:text-on-surface" title="Edit"><Icon name="edit" className="text-[18px]" /></button>
                      <button className="p-1.5 rounded hover:bg-surface-container text-outline hover:text-on-surface" title="More"><Icon name="more_vert" className="text-[18px]" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 bg-surface-container-low gap-2">
            <span className="text-xs text-on-surface-variant">Showing <strong className="text-on-surface">1-{filtered.length}</strong> of <strong className="text-on-surface">1,248</strong> personnel</span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded bg-primary text-on-primary text-sm font-semibold flex items-center justify-center shadow-xs">1</button>
              <button className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs flex items-center justify-center">2</button>
              <button className="w-8 h-8 rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container text-xs flex items-center justify-center">3</button>
              <span className="px-1 text-outline text-xs">...</span>
              <button className="flex items-center justify-center w-8 h-8 rounded bg-surface-container-lowest text-outline hover:text-on-surface"><Icon name="chevron_right" className="text-[18px]" /></button>
            </div>
          </div>
        </div>

        {/* Profile drawer */}
        {selected && (
          <div className={`fixed right-0 top-16 bottom-0 w-full sm:w-[480px] bg-surface-container-lowest shadow-2xl z-50 flex flex-col transition-transform duration-300 ${drawer ? "translate-x-0" : "translate-x-full"}`}>
            <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2"><Icon name="badge" className="text-primary" /><div><h2 className="text-base font-semibold text-on-surface">Personnel Dossier</h2><span className="text-[11px] text-outline">Verified HR Record · SOC-2</span></div></div>
              <button onClick={() => setDrawer(false)} className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-on-surface"><Icon name="close" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="relative bg-gradient-to-br from-primary/10 via-surface-container-high to-surface-container p-4 rounded-xl">
                <div className="flex items-start gap-4">
                  <img className="w-16 h-16 rounded-full object-cover shadow-md ring-4 ring-surface-container-lowest" src={selected.avatar} alt={selected.name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1"><h3 className="font-display text-xl text-on-surface font-bold truncate">{selected.name}</h3><Icon name="verified" className="text-primary text-[18px]" /></div>
                    <p className="text-sm text-on-surface-variant truncate">{selected.role}</p>
                    <div className="flex items-center gap-1 mt-1"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusClass(selected.status)}`}><span className={`w-1.5 h-1.5 rounded-full ${statusDot(selected.status)}`} />{selected.status} Staff</span><span className="text-[11px] text-outline">{selected.empId}</span></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[["Tenure", "3.8 Yrs"], ["Performance", "4.8 / 5.0"], ["Reports", "4 Direct"]].map(([l, v]) => (
                  <div key={l} className="bg-surface-container-low p-2 rounded-lg"><span className="text-[11px] text-outline uppercase block font-semibold">{l}</span><span className={`text-base font-bold ${l === "Performance" ? "text-primary" : "text-on-surface"}`}>{v}</span></div>
                ))}
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
                <h4 className="text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">Direct Contact & Desk</h4>
                {[["mail", "Work Email:", selected.name.toLowerCase().replace(" ", ".") + "@talentpulse.corp"], ["phone", "Mobile Phone:", "+1 (212) 849-0193"], ["pin_drop", "Office Desk:", selected.office], ["contact_emergency", "Emergency:", "Clara Vance (Spouse)"]].map(([icon, l, v]) => (
                  <div key={l} className="flex items-center justify-between text-xs"><span className="flex items-center gap-1 text-on-surface-variant"><Icon name={icon} className="text-[16px] text-outline" />{l}</span><span className="text-on-surface font-medium truncate max-w-[220px]">{v}</span></div>
                ))}
              </div>
              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-outline font-semibold mb-1">Core Competencies & Stack</h4>
                <div className="flex flex-wrap gap-1.5">{["Kubernetes / EKS", "Terraform Enterprise", "Multi-Region AWS", "Rust & Go", "SOC-2 Type II", "Zero-Trust Net"].map(s => <span key={s} className="px-2.5 py-1 rounded-md bg-surface-container-low text-xs text-on-surface">{s}</span>)}</div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between"><h4 className="text-[11px] uppercase tracking-wider text-outline font-semibold">Assigned Hardware & IT</h4><span className="text-[11px] text-secondary font-semibold">MDM Compliant</span></div>
                <div className="flex items-center gap-2 text-xs"><Icon name="laptop_mac" className="text-[18px] text-outline" /><div className="flex-1"><p className="text-on-surface font-semibold text-sm">MacBook Pro 16&quot; (M3 Max / 64GB)</p><p className="text-outline text-[11px]">Asset ID: APPL-NY-99214 · Jamf Enrolled</p></div></div>
                <div className="flex items-center gap-2 text-xs"><Icon name="key" className="text-[18px] text-outline" /><div className="flex-1"><p className="text-on-surface font-semibold text-sm">YubiKey 5C NFC (Primary + Backup)</p><p className="text-outline text-[11px]">Token ID: YUBI-SEC-4120</p></div></div>
              </div>
              <div className="p-4 rounded-xl bg-surface-container space-y-1">
                {[["Compensation Band", "L6 - Staff Principal"], ["Stock Vesting", "Tranche 3 of 4 (Nov 2025)"], ["Clearance Level", "Secret / Prod Infrastructure"]].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-between"><span className="text-[11px] text-outline uppercase font-semibold">{l}</span><span className="text-sm text-on-surface font-semibold">{v}</span></div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-surface-container-low flex items-center justify-between gap-2">
              <button onClick={() => showToast("Full dossier PDF downloading...")} className="flex-1 flex items-center justify-center gap-1 py-2 px-4 rounded-lg bg-surface-container-lowest text-on-surface text-sm font-semibold shadow-xs hover:bg-surface-container"><Icon name="download" className="text-[18px]" />Full Dossier PDF</button>
              <button className="flex items-center justify-center p-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container shadow-xs"><Icon name="chat" /></button>
            </div>
          </div>
        )}
      </div>
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-inverse-surface text-inverse-on-surface shadow-xl"><Icon name="check_circle" className="text-secondary-fixed text-[20px]" /><span className="text-sm font-semibold">{toast}</span></div>}
    </div>
  );
}
