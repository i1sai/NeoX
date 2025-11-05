"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deleteSession, getSession, type Session } from "@/lib/supabase-rest";
import { useAuth } from "@/lib/auth-context";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function intensityClass(intensity?: string | null) {
  switch ((intensity || "").toLowerCase()) {
    case "intense":
      return "chip chip--intense";
    case "light":
      return "chip chip--light";
    case "moderate":
    default:
      return "chip chip--moderate";
  }
}

export default function SessionDetailPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const { user } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user || !id) return;
      try {
        const data = await getSession(user.uid, id);
        setItem(data || null);
      } catch (e: any) {
        setError(e.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user, id]);

  if (loading) return <main><p className="muted">Loading…</p></main>;
  if (error) return <main><p className="error">{error}</p></main>;
  if (!item) return <main><p className="muted">Session not found.</p></main>;

  const remove = async () => {
    if (!user) return;
    if (!confirm("Delete this session?")) return;
    await deleteSession(user.uid, item.id);
    router.replace("/sessions");
  };

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>{item.title}</h1>
          <p className="muted">{formatDate(item.date)} • {item.duration} minutes</p>
        </div>
        {item.intensity && <span className={intensityClass(item.intensity)}>{item.intensity}</span>}
      </div>

      <article className="session-detail">
        <div className="session-detail__grid">
          {item.calories_burned != null && (
            <div>
              <span className="label">Calories</span>
              <strong>{item.calories_burned}</strong>
            </div>
          )}
          <div>
            <span className="label">Source</span>
            <strong>{item.source || "Manual entry"}</strong>
          </div>
        </div>

        <section className="session-detail__notes">
          <h2>Notes</h2>
          <p>{item.description || "No additional notes recorded."}</p>
        </section>

        <footer className="session-detail__actions">
          <Link href="/sessions" className="btn btn--ghost">Back to sessions</Link>
          <div className="session-detail__actions-right">
            <Link href={`/sessions/${item.id}/edit`} className="btn btn--primary">Edit session</Link>
            <button type="button" className="btn btn--danger" onClick={remove}>Delete</button>
          </div>
        </footer>
      </article>
    </main>
  );
}

