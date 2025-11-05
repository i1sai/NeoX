"use client";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession, updateSession, type Session } from "@/lib/supabase-rest";
import { useAuth } from "@/lib/auth-context";
import { findPreset, matchPresetForSession, sessionPresets } from "@/lib/session-presets";

export default function EditSessionPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const router = useRouter();
  const { user } = useAuth();
  const durationQuickPicks = [30, 45, 60, 75, 90];
  const calorieQuickPicks = [250, 350, 450, 550, 650];
  const sourceOptions = [
    "Manual entry",
    "Apple Health",
    "Fitbit",
    "Garmin",
    "Trainer plan",
    "Coach program",
    "Gym template",
    "Conditioning board",
    "Other",
  ];

  const [item, setItem] = useState<Session | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState<string>("");
  const [intensity, setIntensity] = useState("Moderate");
  const [source, setSource] = useState("Manual entry");
  const [otherSource, setOtherSource] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user || !id) return;
      try {
        const data = await getSession(user.uid, id);
        if (data) {
          setItem(data);
          setTitle(data.title);
          setDate(data.date);
          setDuration(data.duration);
          setDescription(data.description ?? "");
          setCalories(data.calories_burned != null ? String(data.calories_burned) : "");
          setIntensity(data.intensity ?? "Moderate");
          const incomingSource = data.source ?? "Manual entry";
          if (sourceOptions.includes(incomingSource)) {
            setSource(incomingSource);
            setOtherSource("");
          } else if (incomingSource) {
            setSource("Other");
            setOtherSource(incomingSource);
          } else {
            setSource("Manual entry");
            setOtherSource("");
          }

          const matched = matchPresetForSession(data.title, data.duration, data.intensity ?? undefined);
          if (matched) setSelectedPreset(matched.id);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user, id]);

  const applyPreset = (idValue: string) => {
    setSelectedPreset(idValue);
    const preset = findPreset(idValue);
    if (!preset) return;
    setTitle(preset.title);
    setDuration(preset.duration);
    setCalories(String(preset.calories));
    setIntensity(preset.intensity);
    setDescription(preset.description);
    if (sourceOptions.includes(preset.source ?? "")) {
      setSource(preset.source ?? "Manual entry");
      setOtherSource("");
    } else if (preset.source) {
      setSource("Other");
      setOtherSource(preset.source);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !item) return;
    setSaving(true);
    setError(null);
    try {
      const trimmed = calories.trim();
      const caloriesValue = trimmed === "" ? null : Number(trimmed);
      const row = await updateSession(user.uid, id, {
        title,
        date,
        duration,
        description,
        calories_burned:
          caloriesValue !== null && !Number.isNaN(caloriesValue) ? Math.max(0, caloriesValue) : null,
        intensity,
        source: (source === "Other" ? otherSource : source) || null,
      });
      router.replace(`/sessions/${row.id}`);
    } catch (err: any) {
      setError(err.message || "Update failed");
      setSaving(false);
    }
  };

  if (loading) return <main><p className="muted">Loading…</p></main>;
  if (error) return <main><p className="error">{error}</p></main>;
  if (!item) return <main><p className="muted">Session not found.</p></main>;

  return (
    <main>
      <h1>Edit session</h1>
      <form onSubmit={submit}>
        <label>Session type</label>
        <select
          value={selectedPreset}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "custom") {
              setSelectedPreset(value);
              setTitle("");
              setDuration(60);
              setCalories("");
              setIntensity("Moderate");
              setDescription("");
              setSource("Manual entry");
              setOtherSource("");
              return;
            }
            applyPreset(value);
          }}
        >
          <option value="">Choose a preset (optional)</option>
          {sessionPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>{preset.label}</option>
          ))}
          <option value="custom">Custom entry</option>
        </select>

        <label>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <label>Duration (minutes)</label>
        <div className="option-buttons">
          {durationQuickPicks.map((value) => (
            <button
              key={value}
              type="button"
              className={`option-buttons__btn${value === duration ? " option-buttons__btn--active" : ""}`}
              onClick={() => setDuration(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={1}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
        />

        <label>Calories burned</label>
        <div className="option-buttons">
          {calorieQuickPicks.map((value) => (
            <button
              key={value}
              type="button"
              className={`option-buttons__btn${Number(calories) === value ? " option-buttons__btn--active" : ""}`}
              onClick={() => setCalories(String(value))}
            >
              {value}
            </button>
          ))}
        </div>
        <input
          type="number"
          min={0}
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="Optional"
        />

        <label>Intensity</label>
        <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
          <option value="Light">Light</option>
          <option value="Moderate">Moderate</option>
          <option value="Intense">Intense</option>
        </select>

        <label>Program / Source</label>
        <select value={source} onChange={(e) => setSource(e.target.value)}>
          {sourceOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {source === "Other" && (
          <input
            value={otherSource}
            onChange={(e) => setOtherSource(e.target.value)}
            placeholder="Custom source"
            required
          />
        )}

        <label>Description</label>
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />

        {error && <p className="error">{error}</p>}
        <button disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
      </form>
    </main>
  );
}
