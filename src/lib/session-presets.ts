export type SessionPreset = {
  id: string;
  label: string;
  title: string;
  duration: number;
  calories: number;
  intensity: "Light" | "Moderate" | "Intense";
  description: string;
  source: string;
};

export const sessionPresets: SessionPreset[] = [
  {
    id: "hiit30",
    label: "HIIT 30 — intense intervals",
    title: "HIIT Group Blast",
    duration: 30,
    calories: 350,
    intensity: "Intense",
    description: "Explosive intervals with minimal rest. Ideal for small group classes focused on speed and power.",
    source: "Coach program",
  },
  {
    id: "strength45",
    label: "Strength 45 — barbell circuit",
    title: "Strength Circuit",
    duration: 45,
    calories: 420,
    intensity: "Moderate",
    description: "Partner-based lifts covering push, pull, and core. Includes timed stations and finisher.",
    source: "Gym template",
  },
  {
    id: "conditioning60",
    label: "Conditioning 60 — endurance team",
    title: "Conditioning Crew",
    duration: 60,
    calories: 500,
    intensity: "Moderate",
    description: "Mixed cardio blocks with sled pushes, rowers, and agility ladders for the whole squad.",
    source: "Conditioning board",
  },
];

export function findPreset(id: string) {
  return sessionPresets.find((preset) => preset.id === id) ?? null;
}

export function matchPresetForSession(
  title: string,
  duration: number,
  intensity?: string | null,
) {
  return (
    sessionPresets.find(
      (preset) =>
        preset.title.toLowerCase() === title.toLowerCase() &&
        preset.duration === duration &&
        (!intensity || preset.intensity.toLowerCase() === intensity.toLowerCase()),
    ) || null
  );
}
