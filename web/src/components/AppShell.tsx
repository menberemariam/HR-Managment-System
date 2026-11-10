"use client";
import { useEffect, useState } from "react";
import { Sidebar, Header } from "./chrome";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <Header collapsed={collapsed} onOpenMobile={() => setMobileOpen(true)} />
        <main className="pt-16 px-4 md:px-6 pb-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
