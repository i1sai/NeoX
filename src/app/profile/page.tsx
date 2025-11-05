"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getProfile, upsertProfile } from "@/lib/supabase-rest";

export default function ProfilePage() {
  const { user } = useAuth();
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const goalOptions = [
    "Lose weight",
    "Build muscle",
    "Improve endurance",
    "Increase flexibility",
    "Maintain fitness",
    "Rehab / recovery",
    "Custom",
  ];
  const [goalChoice, setGoalChoice] = useState("Maintain fitness");
  const [customGoal, setCustomGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!user) return;
      try {
        const profile = await getProfile(user.uid);
        if (profile) {
          setHeight(profile.height_cm != null ? String(profile.height_cm) : "");
          setWeight(profile.weight_kg != null ? String(profile.weight_kg) : "");
          const existingGoal = profile.goal ?? "";
          if (goalOptions.includes(existingGoal)) {
            setGoalChoice(existingGoal);
            setCustomGoal("");
          } else if (existingGoal) {
            setGoalChoice("Custom");
            setCustomGoal(existingGoal);
          } else {
            setGoalChoice("Maintain fitness");
            setCustomGoal("");
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  const bmiInfo = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (!height || !weight || Number.isNaN(h) || Number.isNaN(w) || h <= 0) return null;
    const heightMeters = h / 100;
    const bmi = w / (heightMeters * heightMeters);
    let category = "";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi < 25) category = "Normal";
    else if (bmi < 30) category = "Overweight";
    else category = "Obese";
    return { bmi: bmi.toFixed(1), category };
  }, [height, weight]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const heightValue = height.trim() === "" ? null : Number(height);
      const weightValue = weight.trim() === "" ? null : Number(weight);
      const finalGoal = goalChoice === "Custom" ? customGoal : goalChoice;
      await upsertProfile(user.uid, {
        height_cm: heightValue !== null && !Number.isNaN(heightValue) ? Math.max(0, heightValue) : null,
        weight_kg: weightValue !== null && !Number.isNaN(weightValue) ? Math.max(0, weightValue) : null,
        goal: finalGoal ? finalGoal : null,
      });
      setMessage("Profile saved");
    } catch (err: any) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return <main><p className="muted">Sign in to manage your profile.</p></main>;
  }

  if (loading) {
    return <main><p className="muted">Loading profile…</p></main>;
  }

  return (
    <main>
      <h1>Your profile</h1>
      <p className="muted">Track basic stats to keep sessions personalised.</p>
      <form onSubmit={submit}>
        <label>Height (cm)</label>
        <input
          type="number"
          min={0}
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="e.g. 175"
        />

        <label>Weight (kg)</label>
        <input
          type="number"
          min={0}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="e.g. 70"
        />

        <label>Training goal</label>
        <select value={goalChoice} onChange={(e) => setGoalChoice(e.target.value)}>
          {goalOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {goalChoice === "Custom" && (
          <textarea
            rows={3}
            value={customGoal}
            onChange={(e) => setCustomGoal(e.target.value)}
            placeholder="Describe your goal"
            required
          />
        )}

        {error && <p className="error">{error}</p>}
        {message && <p className="muted">{message}</p>}
        <button disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
      </form>

      {bmiInfo && (
        <div style={{ marginTop: 24 }}>
          <p className="muted">BMI estimate: <strong>{bmiInfo.bmi}</strong> ({bmiInfo.category})</p>
        </div>
      )}
    </main>
  );
}
