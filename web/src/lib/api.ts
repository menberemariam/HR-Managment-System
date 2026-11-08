// Talks to the existing Express + Mongo backend (port 8000) via the
// Next.js rewrite proxy (/api -> localhost:8000). Falls back to demo
// data in the UI when the backend is offline.
export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(path, { credentials: "include" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export type ApiEmployee = {
  _id: string; employeeId: string; fullName: string; email: string;
  department: string; position: string; phone: string;
  hireDate?: string; status?: string;
};
