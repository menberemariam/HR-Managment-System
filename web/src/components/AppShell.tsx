"use client";
import { Sidebar, Header } from "./chrome";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="pt-16 px-6 pb-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
