"use client";
import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Icon({ name, className = "text-[20px]" }: { name: string; className?: string }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

const NAV = [
  { href: "/", icon: "grid_view", label: "Dashboard", section: "Workforce Management" },
  { href: "/employees", icon: "badge", label: "Employees" },
  { href: "/departments", icon: "hub", label: "Departments" },
  { href: "/attendance", icon: "schedule", label: "Attendance & Time" },
  { href: "/leave", icon: "event_available", label: "Leave Requests" },
  { href: "/payroll", icon: "payments", label: "Payroll & Compensation" },
  { href: "/settings", icon: "settings", label: "Settings & Compliance", section: "System" },
];

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const showText = mobileOpen || !collapsed;

  useEffect(() => {
    onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside className={`fixed left-0 top-0 bottom-0 z-50 flex flex-col w-64 bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ${collapsed ? "lg:w-20" : "lg:w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
      <div className="h-16 px-4 lg:px-6 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 overflow-hidden" onClick={onCloseMobile}>
          <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-display font-bold shrink-0">T</span>
          {showText && <span className="font-display text-xl text-primary font-bold tracking-tight whitespace-nowrap">TalentPulse</span>}
        </Link>
        <div className="flex items-center shrink-0">
          <button onClick={onToggleCollapsed} className="hidden lg:inline-flex text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container" aria-label="Collapse sidebar">
            <Icon name="menu_open" />
          </button>
          <button onClick={onCloseMobile} className="lg:hidden text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container" aria-label="Close menu">
            <Icon name="close" />
          </button>
        </div>
      </div>
      {showText && (
        <div className="px-4 py-2">
          <div className="flex items-center justify-between px-4 py-2 bg-surface-container rounded-lg">
            <div className="flex items-center gap-2 overflow-hidden">
              <Icon name="apartment" className="text-primary text-[18px]" />
              <div className="truncate">
                <p className="text-[11px] uppercase tracking-wider text-outline font-semibold">Workspace</p>
                <p className="text-sm font-semibold text-on-surface truncate">Global Corp HQ</p>
              </div>
            </div>
            <Icon name="unfold_more" className="text-on-surface-variant text-[18px]" />
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {NAV.map((item, i) => {
          const active = pathname === item.href;
          return (
            <div key={item.href}>
              {item.section && showText && <p className="px-4 mb-1 mt-3 text-[11px] uppercase tracking-wider text-outline font-semibold">{item.section}</p>}
              <Link
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-4 px-4 py-2 rounded-lg text-sm transition-all ${active ? "bg-primary-container text-on-primary font-semibold shadow-sm" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"}`}
              >
                <Icon name={item.icon} />
                {showText && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
              {i === 6 && <div className="my-4 border-t border-outline-variant/30" />}
            </div>
          );
        })}
      </div>
      {showText && (
        <div className="p-4 bg-surface-container-low">
          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-high/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-[11px] text-on-surface-variant font-semibold">v2.4.0 • SOC-2 Type II</span>
            </div>
            <Icon name="verified_user" className="text-[16px] text-outline" />
          </div>
        </div>
      )}
    </aside>
  );
}

type HeaderProps = {
  collapsed: boolean;
  onOpenMobile: () => void;
};

function subscribeTheme(callback: () => void) {
  window.addEventListener("tp-theme", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("tp-theme", callback);
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot() {
  return false;
}

export function Header({ collapsed, onOpenMobile }: HeaderProps) {
  const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("tp_theme", next ? "dark" : "light");
    window.dispatchEvent(new Event("tp-theme"));
  };
  return (
    <header className={`fixed top-0 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between gap-2 px-3 md:px-6 transition-[left] duration-300 ${collapsed ? "left-0 lg:left-20" : "left-0 lg:left-64"}`}>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button onClick={onOpenMobile} aria-label="Open menu" className="lg:hidden w-9 h-9 shrink-0 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center">
          <Icon name="menu" />
        </button>
        <span className="lg:hidden font-display text-lg text-primary font-bold tracking-tight truncate">TalentPulse</span>
        <div className="hidden md:flex items-center w-full max-w-sm px-4 py-1 bg-surface-container-low rounded-lg text-on-surface-variant">
          <Icon name="search" className="mr-2 text-outline" />
          <span className="text-xs text-outline flex-1 truncate">Search personnel, records...</span>
          <kbd className="px-1 py-0.5 rounded text-[11px] bg-surface-container-high text-on-surface-variant font-semibold">Ctrl K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button className="hidden sm:flex items-center gap-1 px-3 md:px-4 py-1 bg-primary text-on-primary rounded-lg text-sm font-semibold shadow-sm hover:bg-primary-container">
          <Icon name="add" className="text-[18px]" /><span className="hidden md:inline">Quick Add</span><Icon name="arrow_drop_down" className="text-[18px]" />
        </button>
        <button onClick={toggle} aria-label="Toggle Theme" className="w-9 h-9 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center">
          <Icon name={dark ? "light_mode" : "dark_mode"} />
        </button>
        <button aria-label="Notifications" className="relative w-9 h-9 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container flex items-center justify-center">
          <Icon name="notifications" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
        </button>
        <div className="hidden md:block h-6 w-px bg-outline-variant/50" />
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">SJ</span>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-sm font-semibold text-on-surface leading-tight">Sarah Jenkins</span>
            <span className="text-[11px] text-on-surface-variant leading-tight">Chief People Officer</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-inverse-surface text-inverse-on-surface shadow-xl">
      <Icon name="check_circle" className="text-secondary-fixed text-[20px]" />
      <span className="text-sm font-semibold">{msg}</span>
    </div>
  );
}
