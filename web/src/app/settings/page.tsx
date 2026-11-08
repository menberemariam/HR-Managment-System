"use client";
import { useState } from "react";
import { Icon } from "@/components/chrome";

export default function SettingsPage() {
  const [toggles, setToggles] = useState({ biometric: true, geofence: true, sso: true, audit: true, kudos: false });
  const [toast, setToast] = useState("");
  const flip = (k: keyof typeof toggles) => setToggles(t => ({ ...t, [k]: !t[k] }));
  const rows: [keyof typeof toggles, string, string][] = [
    ["biometric", "Biometric turnstiles", "Fingerprint / face verification at building gates"],
    ["geofence", "Mobile geofence check-in", "GPS-verified clock-ins within HQ radius"],
    ["sso", "Azure AD SSO web ping", "Single sign-on attendance verification"],
    ["audit", "Audit log retention", "SOC-2 immutable ledger, 7-year retention"],
    ["kudos", "Automated kudos cards", "Anniversary and milestone celebrations via Slack"],
  ];
  return (
    <div className="flex flex-col w-full gap-6 max-w-3xl">
      <div><h1 className="font-display text-4xl text-on-surface">Settings & Compliance</h1><p className="text-sm text-on-surface-variant mt-1">Workspace controls, verification gateways and audit policies. SOC-2 Type II · v2.4.0</p></div>
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-4">
        {rows.map(([k, l, d]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-2 border-b border-surface-container-low last:border-0">
            <div><p className="text-sm font-semibold text-on-surface">{l}</p><p className="text-xs text-on-surface-variant">{d}</p></div>
            <button onClick={() => { flip(k); setToast(`${l} ${!toggles[k] ? "enabled" : "disabled"}`); setTimeout(() => setToast(""), 2500); }} className={`w-12 h-7 rounded-full p-1 transition-colors shrink-0 ${toggles[k] ? "bg-primary" : "bg-surface-container-high"}`}>
              <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${toggles[k] ? "translate-x-5" : ""}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
        <h2 className="font-display text-xl text-on-surface mb-2">Compliance Posture</h2>
        <div className="flex flex-wrap gap-2">{["SOC-2 Type II", "GDPR Ready", "ISO 27001 Aligned", "7-Year Audit Retention", "Encryption at Rest"].map(b => <span key={b} className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-semibold flex items-center gap-1"><Icon name="verified" className="text-[14px]" />{b}</span>)}</div>
      </div>
      {toast && <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-inverse-surface text-inverse-on-surface shadow-xl"><Icon name="check_circle" className="text-secondary-fixed text-[20px]" /><span className="text-sm font-semibold">{toast}</span></div>}
    </div>
  );
}
