"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { listSessions, type Session } from "@/lib/supabase-rest";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
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

export default function SessionsIndex() {
  const { user, signOut } = useAuth();
  const [items, setItems] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const data = await listSessions(user.uid);
        setItems(data);
      } catch (e: any) {
        setError(e.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  const stats = useMemo(() => {
    if (!items.length) {
      return { totalSessions: 0, totalMinutes: 0, weeklyCalories: 0 };
    }

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);

    const totalMinutes = items.reduce((sum, session) => sum + session.duration, 0);
    const weeklyCalories = items.reduce((sum, session) => {
      if (session.calories_burned == null) return sum;
      const sessionDate = new Date(session.date);
      if (Number.isNaN(sessionDate.valueOf())) return sum;
      if (sessionDate >= weekStart && sessionDate <= now) {
        return sum + session.calories_burned;
      }
      return sum;
    }, 0);

    return {
      totalSessions: items.length,
      totalMinutes,
      weeklyCalories,
    };
  }, [items]);

  const body = () => {
    if (loading) return <p className="muted">Loading sessions…</p>;
    if (error) return <p className="error">{error}</p>;
    if (!items.length)
      return (
        <div className="empty-state">
          <p>No sessions logged yet. Start by importing a preset or create one manually.</p>
          <Link className="btn btn--primary" href="/sessions/new">Add your first session</Link>
        </div>
      );

    return (
      <div className="session-grid">
        {items.map((session) => (
          <article key={session.id} className="session-card">
            <header className="session-card__header">
              <div>
                <h3>{session.title}</h3>
                <p className="muted">{formatDate(session.date)} • {session.duration} min</p>
              </div>
              {session.intensity && (
                <span className={intensityClass(session.intensity)}>{session.intensity}</span>
              )}
            </header>
            <div className="session-card__body">
              {session.calories_burned != null && (
                <p><span className="label">Calories</span> {session.calories_burned}</p>
              )}
              {session.source && session.source !== "Manual entry" && (
                <p><span className="label">Source</span> {session.source}</p>
              )}
              {session.description && (
                <p className="muted">
                  {session.description.length > 160
                    ? `${session.description.slice(0, 157)}…`
                    : session.description}
                </p>
              )}
            </div>
            <footer className="session-card__footer">
              <Link href={`/sessions/${session.id}`} className="btn btn--ghost">Open session</Link>
            </footer>
          </article>
        ))}
      </div>
    );
  };

  return (
    <main>
      <div className="page-head">
        <div>
          <h1>Training sessions</h1>
          <p className="muted">Keep a record of your group workouts with preset templates and detailed metrics.</p>
        </div>
        <div className="page-head__actions">
          <Link className="btn btn--primary" href="/sessions/new">Add session</Link>
          <button type="button" className="btn btn--ghost" onClick={signOut}>Log out</button>
        </div>
      </div>

      <section className="stats">
        <div className="stat-card">
          <span className="stat-card__label">Sessions</span>
          <strong className="stat-card__value">{stats.totalSessions}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Total minutes</span>
          <strong className="stat-card__value">{stats.totalMinutes}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Calories (last 7 days)</span>
          <strong className="stat-card__value">{stats.weeklyCalories}</strong>
        </div>
      </section>

      {body()}
    </main>
  );
}
