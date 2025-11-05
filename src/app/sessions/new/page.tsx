"use client";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/lib/supabase-rest";
import { useAuth } from "@/lib/auth-context";
import { findPreset, sessionPresets } from "@/lib/session-presets";

export default function NewSessionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
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

  const [selectedPreset, setSelectedPreset] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState<string>("");
  const [intensity, setIntensity] = useState("Moderate");
  const [source, setSource] = useState("Manual entry");
  const [otherSource, setOtherSource] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (id: string) => {
    setSelectedPreset(id);
    const preset = findPreset(id);
    if (!preset) return;
    setTitle(preset.title);
    setDuration(preset.duration);
    setCalories(String(preset.calories));
    setIntensity(preset.intensity);
    setDescription(preset.description);
    setSource(preset.source ?? "Manual entry");
    setOtherSource("");
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const trimmed = calories.trim();
      const caloriesValue = trimmed === "" ? null : Number(trimmed);
      const row = await createSession(user.uid, {
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
      setError(err.message || "Could not save session");
      setSaving(false);
    }
  };

  return (
    <main>
      <h1>New session</h1>
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
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && <p className="error">{error}</p>}
        <button disabled={saving}>{saving ? "Saving..." : "Save session"}</button>
      </form>
    </main>
  );
}
