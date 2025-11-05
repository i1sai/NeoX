export type Session = {
  id: string;
  user_id: string;
  title: string;
  date: string; // ISO date
  duration: number;
  description?: string | null;
  calories_burned?: number | null;
  intensity?: string | null;
  source?: string | null;
  created_at?: string;
};

export type SessionInput = {
  title: string;
  date: string;
  duration: number;
  description?: string;
  calories_burned?: number | null;
  intensity?: string | null;
  source?: string | null;
};

export type Profile = {
  user_id: string;
  height_cm?: number | null;
  weight_kg?: number | null;
  goal?: string | null;
  updated_at?: string;
};

export type ProfileInput = {
  height_cm?: number | null;
  weight_kg?: number | null;
  goal?: string | null;
};

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

function headers(extra?: Record<string, string>) {
  return {
    "Content-Type": "application/json",
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    ...extra,
  } as const;
}

export async function listSessions(uid: string): Promise<Session[]> {
  const res = await fetch(`${BASE}/rest/v1/sessions?user_id=eq.${encodeURIComponent(uid)}&select=*`, {
    headers: headers({ "X-User-Id": uid }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`List failed (${res.status})`);
  return res.json();
}

export async function getSession(uid: string, id: string): Promise<Session | null> {
  const res = await fetch(`${BASE}/rest/v1/sessions?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(uid)}&select=*`, {
    headers: headers({ "X-User-Id": uid }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Get failed (${res.status})`);
  const rows: Session[] = await res.json();
  return rows[0] ?? null;
}

export async function createSession(uid: string, input: SessionInput) {
  const res = await fetch(`${BASE}/rest/v1/sessions`, {
    method: "POST",
    headers: { ...headers({ "X-User-Id": uid }), Prefer: "return=representation" },
    body: JSON.stringify({ ...input, user_id: uid }),
  });
  if (!res.ok) throw new Error(`Create failed (${res.status})`);
  const rows: Session[] = await res.json();
  return rows[0];
}

export async function updateSession(uid: string, id: string, input: SessionInput) {
  const res = await fetch(`${BASE}/rest/v1/sessions?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(uid)}`, {
    method: "PATCH",
    headers: { ...headers({ "X-User-Id": uid }), Prefer: "return=representation" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Update failed (${res.status})`);
  const rows: Session[] = await res.json();
  return rows[0];
}

export async function deleteSession(uid: string, id: string) {
  const res = await fetch(`${BASE}/rest/v1/sessions?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(uid)}`, {
    method: "DELETE",
    headers: headers({ "X-User-Id": uid }),
  });
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
}

export async function getProfile(uid: string): Promise<Profile | null> {
  const res = await fetch(`${BASE}/rest/v1/profiles?user_id=eq.${encodeURIComponent(uid)}&select=*`, {
    headers: headers({ "X-User-Id": uid }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Profile load failed (${res.status})`);
  const rows: Profile[] = await res.json();
  return rows[0] ?? null;
}

export async function upsertProfile(uid: string, input: ProfileInput): Promise<Profile> {
  const res = await fetch(`${BASE}/rest/v1/profiles`, {
    method: "POST",
    headers: { ...headers({ "X-User-Id": uid }), Prefer: "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify({ ...input, user_id: uid }),
  });
  if (!res.ok) throw new Error(`Profile save failed (${res.status})`);
  const rows: Profile[] = await res.json();
  return rows[0];
}
