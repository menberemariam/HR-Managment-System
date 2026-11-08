"use client";
import { useState } from "react";
import { Icon } from "@/components/chrome";

export default function PayrollPage() {
  const [toast, setToast] = useState("");
  const show = (m: string) => { setToast(m); setTimeout(() => setToast(""), 3200); };
  const bands = [
    { tier: "L7 - Principal", range: "$185k – $240k", headcount: 42, ratio: "0.98", color: "bg-primary" },
    { tier: "L6 - Staff", range: "$145k – $184k", headcount: 128, ratio: "1.04", color: "bg-primary-container" },
    { tier: "L5 - Senior", range: "$110k – $144k", headcount: 264, ratio: "1.02", color: "bg-secondary" },
    { tier: "L4 - Mid", range: "$82k – $109k", headcount: 412, ratio: "1.00", color: "bg-tertiary-container" },
    { tier: "L3 - Associate", range: "$58k – $81k", headcount: 402, ratio: "0.97", color: "bg-outline" },
  ];
  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div><h1 className="font-display text-4xl text-on-surface">Payroll & Compensation</h1><p className="text-sm text-on-surface-variant mt-1">Monthly payroll run, compensation bands and compa-ratio analysis.</p></div>
        <button onClick={() => show("Payroll sync completed: 1,248 accounts validated with zero delta.")} className="flex items-center gap-1 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold shadow-sm hover:bg-primary-container self-start"><Icon name="sync" className="text-[18px]" />Sync Payroll Data</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[["Monthly Payroll Run", "$842.5k", "Cycle: Oct 31 · On track"], ["Total Annual Budget", "$14.2M", "$11.8M spent (83.1%)"], ["Avg Compa-Ratio", "1.04", "Across all tiers"]].map(([l, v, f]) => (
          <div key={l} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm"><span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">{l}</span><p className="font-display text-4xl text-on-surface mt-2">{v}</p><p className="text-xs text-outline mt-1">{f}</p></div>
        ))}
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
        <h2 className="font-display text-xl text-on-surface mb-4">Compensation Bands</h2>
        <div className="space-y-4">
          {bands.map(b => (
            <div key={b.tier}>
              <div className="flex items-center justify-between text-xs mb-1"><span className="font-semibold text-on-surface text-sm">{b.tier} <span className="text-outline font-normal">{b.range}</span></span><span className="text-on-surface-variant">{b.headcount} staff · compa-ratio <strong className="text-on-surface">{b.ratio}</strong></span></div>
              <div className="w-full h-2 rounded-full bg-surface-container-low overflow-hidden"><div className={`${b.color} h-full rounded-full`} style={{ width: `${Math.round(b.headcount / 4.2)}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-inverse-surface text-inverse-on-surface shadow-xl"><Icon name="check_circle" className="text-secondary-fixed text-[20px]" /><span className="text-sm font-semibold">{toast}</span></div>}
    </div>
  );
}
