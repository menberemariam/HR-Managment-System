"use client";
import { useState } from "react";
import { Icon } from "@/components/chrome";
import { departments } from "@/lib/data";

export default function DepartmentsPage() {
  const [view, setView] = useState<"grid" | "tree">("grid");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3200); };
  const filtered = departments.filter(d => (d.name + d.lead + d.units.join(" ")).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1 text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold mb-1"><Icon name="corporate_fare" className="text-[16px] text-primary" />Enterprise Architecture<span className="text-outline-variant">/</span><span className="text-primary">Hierarchy Engine</span></div>
          <h1 className="font-display text-4xl text-on-surface tracking-tight">Departments & Organizational Units</h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">Manage organizational structure, team leads, headcount limits, and departmental operating budgets.</p>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-end">
          <div className="flex items-center p-1 bg-surface-container rounded-lg shadow-sm">
            <button onClick={() => setView("grid")} className={`flex items-center gap-1 px-4 py-1.5 rounded-md text-sm font-semibold ${view === "grid" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}><Icon name="grid_view" className="text-[18px]" />Grid View</button>
            <button onClick={() => setView("tree")} className={`flex items-center gap-1 px-4 py-1.5 rounded-md text-sm font-semibold ${view === "tree" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}><Icon name="account_tree" className="text-[18px]" />Org Chart Tree</button>
          </div>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold shadow-sm hover:bg-primary-container"><Icon name="add_circle" className="text-[18px]" />Create Department</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Departments", icon: "domain", value: "8", sub: "active units", foot: "100% Operational · 0 restructured" },
          { label: "Assigned Headcount", icon: "group", value: "1,210", sub: "/ 1,248", foot: "38 unassigned / flex · 96.9% placed" },
          { label: "Total Annual Budget", icon: "payments", value: "$14.2M", sub: "Cap", foot: "$11.8M spent (83.1%)" },
          { label: "Avg Team Density", icon: "pie_chart", value: "156", sub: "members / dept", foot: "+8.4% YoY expansion index" },
        ].map(k => (
          <div key={k.label} className="relative overflow-hidden bg-surface-container-lowest rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">{k.label}</span><div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary"><Icon name={k.icon} className="text-[18px]" /></div></div>
            <div className="mt-2 flex items-baseline gap-1"><span className="font-display text-4xl text-on-surface">{k.value}</span><span className="text-sm text-on-surface-variant">{k.sub}</span></div>
            <p className="mt-2 text-xs text-on-surface-variant">{k.foot}</p>
          </div>
        ))}
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-surface-container-low p-2 rounded-xl mb-6 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" className="absolute left-3 top-2.5 text-outline text-[18px]" />
          <input value={query} onChange={e => setQuery(e.target.value)} className="w-full pl-9 pr-4 py-1.5 bg-surface-container-lowest rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary shadow-sm" placeholder="Filter by department, lead, or sub-teams..." />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-semibold px-2"><Icon name="filter_alt" className="text-[16px]" />Division:</span>
          {["All (6)", "Product & Tech", "Commercial", "G&A"].map((f, i) => <button key={f} className={`px-2 py-1 rounded-md text-[11px] font-semibold ${i === 0 ? "bg-surface-container-lowest text-primary shadow-sm" : "hover:bg-surface-container-high text-on-surface-variant"}`}>{f}</button>)}
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(d => (
            <div key={d.name} className="flex flex-col justify-between bg-surface-container-lowest rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon name={d.icon} className="text-[24px]" /></div>
                    <div>
                      <div className="flex items-center gap-1.5"><h2 className="font-display text-xl text-on-surface tracking-tight">{d.name}</h2><span className="w-2 h-2 rounded-full bg-secondary shrink-0" /></div>
                      <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Division: {d.division}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-semibold">{d.openRoles} Open Roles</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low mb-4">
                  <img className="w-9 h-9 rounded-full object-cover shrink-0" src={d.avatar} alt={d.lead} />
                  <div className="truncate flex-1"><p className="text-sm font-semibold text-on-surface truncate">{d.lead}</p><p className="text-xs text-on-surface-variant truncate">{d.leadRole}</p></div>
                  <span className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container"><Icon name="mail" className="text-[18px]" /></span>
                </div>
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1"><span className="text-on-surface-variant flex items-center gap-1"><Icon name="group" className="text-[16px] text-outline" />Headcount</span><span className="font-semibold text-on-surface">{d.headcount} <span className="text-outline font-normal">/ {d.cap} cap</span></span></div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden"><div className={`h-full ${d.color} rounded-full`} style={{ width: `${Math.round(d.headcount / d.cap * 100)}%` }} /></div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1"><span className="text-on-surface-variant flex items-center gap-1"><Icon name="account_balance_wallet" className="text-[16px] text-outline" />Budget Utilization</span><span className="font-semibold text-on-surface">{d.budget} <span className={`font-semibold ${d.budgetPct > 85 ? "text-error" : "text-secondary"}`}>({d.budgetPct}%)</span></span></div>
                    <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden"><div className={`h-full rounded-full ${d.budgetPct > 85 ? "bg-error" : d.color}`} style={{ width: `${d.budgetPct}%` }} /></div>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-[11px] uppercase tracking-wider text-outline font-semibold mb-1.5">Key Sub-Units ({d.units.length})</p>
                  <div className="flex flex-wrap gap-1">{d.units.map(u => <span key={u} className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[11px] font-semibold">{u}</span>)}</div>
                </div>
              </div>
              <div className="pt-2 mt-2 bg-surface-container-low/40 -mx-6 -mb-6 px-6 pb-4 rounded-b-xl flex items-center justify-between">
                <a className="text-sm text-primary hover:underline flex items-center gap-1 font-semibold" href="#">View Roster <Icon name="arrow_forward" className="text-[16px]" /></a>
                <div className="flex items-center gap-1"><button className="px-2.5 py-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md text-[11px] font-semibold">Manage Roles</button><button className="p-1 text-outline hover:text-on-surface hover:bg-surface-container rounded-md"><Icon name="more_vert" className="text-[18px]" /></button></div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-on-surface-variant col-span-full text-center py-10">No departments match your filter.</p>}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant/30">
            <div className="flex items-center gap-2"><span className="font-display text-xl text-on-surface">Corporate Executive Hierarchy</span><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">Tier 1 - Tier 3</span></div>
            <div className="flex items-center gap-1 text-on-surface-variant">
              <button onClick={() => setZoom(Math.max(0.6, zoom - 0.1))} className="p-1 rounded hover:bg-surface-container"><Icon name="zoom_out" /></button>
              <span className="text-[11px] px-1 font-semibold">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(Math.min(1.4, zoom + 0.1))} className="p-1 rounded hover:bg-surface-container"><Icon name="zoom_in" /></button>
              <button onClick={() => setZoom(1)} className="p-1 rounded hover:bg-surface-container ml-2"><Icon name="fit_screen" /></button>
            </div>
          </div>
          <div className="flex flex-col items-center min-w-[900px] transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
            <div className="w-80 p-4 bg-surface-container-high rounded-xl shadow-md flex items-center gap-4">
              <span className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">MV</span>
              <div className="flex-1 truncate"><span className="text-[11px] uppercase tracking-wider text-primary font-semibold">Executive Leadership</span><p className="font-display text-xl text-on-surface truncate">Marcus Vance</p><p className="text-xs text-on-surface-variant truncate">Chief Executive Officer</p></div>
            </div>
            <div className="w-0.5 h-10 bg-outline-variant/60" />
            <div className="relative w-[820px] flex justify-between">
              {[["Core Tech & AI", "Lead: Dr. Aris Thorne", "380 Staff", "$5.8M", "Platform, Mobile, DevOps, AI", "terminal", "text-primary"],
                ["Revenue Operations", "Lead: Elena Rostova", "290 Staff", "$3.2M", "Enterprise, SMB, Success", "trending_up", "text-secondary"],
                ["People & Operations", "Lead: Sarah Jenkins / D. Chen", "272 Staff", "$2.45M", "Facilities, Talent, Legal", "corporate_fare", "text-tertiary"]].map(([t, lead, staff, money, subs, icon, c]) => (
                <div key={t} className="flex flex-col items-center w-64 pt-6">
                  <div className="w-full p-2 bg-surface-container rounded-lg shadow-sm">
                    <div className="flex items-center gap-2 mb-1"><Icon name={icon} className={`text-[18px] ${c}`} /><span className="text-sm font-semibold text-on-surface">{t}</span></div>
                    <p className="text-[11px] text-on-surface-variant">{lead}</p>
                    <div className="mt-2 pt-2 border-t border-outline-variant/20 flex justify-between text-[11px]"><span className="text-on-surface-variant">{staff}</span><span className="text-secondary font-semibold">{money}</span></div>
                  </div>
                  <div className="w-0.5 h-6 bg-outline-variant/60" />
                  <div className="w-56 p-2 rounded-lg bg-surface-container-low text-on-surface-variant text-xs text-center">{subs}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-surface-container-low border-b border-outline-variant/30">
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon name="domain_add" /></div><div><h3 className="font-display text-xl text-on-surface">Create Organizational Unit</h3><p className="text-[11px] text-on-surface-variant">Define division scope, lead officer, and allocations</p></div></div>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"><Icon name="close" /></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); setCreateOpen(false); showToast("Department provisioned successfully into corporate directory."); }}>
              <div><label className="block text-sm font-semibold text-on-surface mb-1">Department Name *</label><input required className="w-full px-4 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-xs placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Legal & Regulatory Compliance" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-on-surface mb-1">Parent Division</label><select className="w-full px-4 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary"><option>Core R&D</option><option>Commercial</option><option>Operations</option><option>General & Administrative (G&A)</option><option>Growth & Expansion</option></select></div>
                <div><label className="block text-sm font-semibold text-on-surface mb-1">Department Head *</label><input required className="w-full px-4 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-xs placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Search personnel..." /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-on-surface mb-1">Headcount Limit (Cap)</label><input type="number" min={1} max={1000} className="w-full px-4 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-xs placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. 50" /></div>
                <div><label className="block text-sm font-semibold text-on-surface mb-1">Fiscal Budget (Annual)</label><input className="w-full px-4 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-xs placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. $1,250,000" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-on-surface mb-1">Core Sub-Teams (Comma separated)</label><input className="w-full px-4 py-2 bg-surface rounded-lg border border-outline-variant text-on-surface text-xs placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. Contract Review, Corporate IP, Ethics" /></div>
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold shadow hover:bg-primary-container">Provision Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-inverse-surface text-inverse-on-surface shadow-xl"><Icon name="check_circle" className="text-secondary-fixed text-[20px]" /><span className="text-sm font-semibold">{toast}</span></div>}
    </div>
  );
}
