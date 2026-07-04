"use client";

import { useMemo, useState } from "react";

const SYNODIC_MONTH = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);
const DAY_MS = 86_400_000;

type Phase = {
  name: string;
  icon: string;
  vibe: string;
  range: [number, number];
};

const phases: Phase[] = [
  {
    name: "New Moon",
    icon: "●",
    vibe: "Reset, seed intentions, sketch the impossible.",
    range: [0, 0.03],
  },
  {
    name: "Waxing Crescent",
    icon: "☽",
    vibe: "First sparks. Protect small beginnings.",
    range: [0.03, 0.22],
  },
  {
    name: "First Quarter",
    icon: "◐",
    vibe: "Decide fast. Momentum rewards clean cuts.",
    range: [0.22, 0.28],
  },
  {
    name: "Waxing Gibbous",
    icon: "◑",
    vibe: "Refine, tune, and polish the nearly-there.",
    range: [0.28, 0.47],
  },
  {
    name: "Full Moon",
    icon: "○",
    vibe: "Reveal, celebrate, ship it under floodlight.",
    range: [0.47, 0.53],
  },
  {
    name: "Waning Gibbous",
    icon: "◑",
    vibe: "Share the harvest. Teach what worked.",
    range: [0.53, 0.72],
  },
  {
    name: "Last Quarter",
    icon: "◐",
    vibe: "Release drag. Keep only what still moves.",
    range: [0.72, 0.78],
  },
  {
    name: "Waning Crescent",
    icon: "☾",
    vibe: "Rest, dream, archive, and make space.",
    range: [0.78, 1],
  },
];

const rituals = [
  "Write one sentence about what the sky is asking you to notice.",
  "Step outside for sixty seconds and let your eyes adjust to the dark.",
  "Pick one tiny task and finish it before the next moonrise.",
  "Send a message you have been postponing.",
  "Name something you are ready to stop carrying.",
  "Make a small plan that future-you can actually follow.",
];

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getMoonData(dateString: string) {
  const date = new Date(`${dateString}T12:00:00Z`);
  const daysSince = (date.getTime() - KNOWN_NEW_MOON) / DAY_MS;
  const cycle = ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
  const fraction = cycle / SYNODIC_MONTH;
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const age = cycle;
  const daysToFull = (SYNODIC_MONTH / 2 - cycle + SYNODIC_MONTH) % SYNODIC_MONTH;
  const daysToNew = (SYNODIC_MONTH - cycle) % SYNODIC_MONTH;
  const phase =
    phases.find((item) => fraction >= item.range[0] && fraction < item.range[1]) ??
    phases[0];

  const nextMajor = daysToFull < daysToNew
    ? { label: "Full Moon", days: daysToFull }
    : { label: "New Moon", days: daysToNew };

  const moonMask = Math.round(illumination * 100);
  const direction = fraction <= 0.5 ? "waxing" : "waning";
  const emoji = fraction <= 0.03 || fraction >= 0.97
    ? "🌑"
    : fraction < 0.22
      ? "🌒"
      : fraction < 0.28
        ? "🌓"
        : fraction < 0.47
          ? "🌔"
          : fraction < 0.53
            ? "🌕"
            : fraction < 0.72
              ? "🌖"
              : fraction < 0.78
                ? "🌗"
                : "🌘";

  return {
    date,
    phase,
    fraction,
    illumination,
    age,
    daysToFull,
    daysToNew,
    nextMajor,
    moonMask,
    direction,
    emoji,
    ritual: rituals[Math.floor(age) % rituals.length],
  };
}

function formatDays(days: number) {
  if (days < 0.05) return "tonight";
  if (days < 1) return `${Math.round(days * 24)} hours`;
  return `${days.toFixed(1)} days`;
}

export default function Home() {
  const today = useMemo(() => toDateInputValue(new Date()), []);
  const [dateString, setDateString] = useState(today);
  const data = useMemo(() => getMoonData(dateString), [dateString]);

  const stars = useMemo(
    () =>
      Array.from({ length: 64 }, (_, index) => ({
        id: index,
        left: `${(index * 37) % 100}%`,
        top: `${(index * 61) % 100}%`,
        delay: `${(index % 11) * 0.33}s`,
        size: `${1 + (index % 4) * 0.55}px`,
      })),
    [],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050713] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,#5145ff55,transparent_34%),radial-gradient(circle_at_70%_20%,#00d5ff33,transparent_30%),linear-gradient(135deg,#08091c_0%,#120824_48%,#02030a_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-80">
        {stars.map((star) => (
          <span
            key={star.id}
            className="star absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-14">
        <nav className="flex items-center justify-between text-sm text-slate-300">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl border border-white/15 bg-white/10 text-xl shadow-2xl shadow-indigo-500/20 backdrop-blur">
              ☾
            </span>
            <div>
              <p className="font-semibold uppercase tracking-[0.35em] text-cyan-200">Moon Phases</p>
              <p className="text-xs text-slate-400">A luminous lunar dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setDateString(today)}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 font-medium text-white shadow-lg shadow-black/20 backdrop-blur transition hover:border-cyan-200/60 hover:bg-cyan-200/10"
          >
            Tonight
          </button>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-200/10 px-4 py-2 text-sm text-cyan-100 shadow-lg shadow-cyan-950/30 backdrop-blur">
              {data.emoji} {data.phase.name} · {Math.round(data.illumination * 100)}% illuminated
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
                Track the moon like a tiny mission control.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Pick any date and watch the lunar age, illumination, next major phase, and nightly mood update instantly.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Lunar age" value={`${data.age.toFixed(1)}d`} detail="since new moon" />
              <Stat label="Next full" value={formatDays(data.daysToFull)} detail="until peak glow" />
              <Stat label="Next new" value={formatDays(data.daysToNew)} detail="until sky reset" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-10 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.08] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="moon-stage relative grid aspect-square place-items-center rounded-[1.5rem] border border-white/10 bg-[#02030a]">
                <div className="orbit-ring" />
                <div className="moon relative size-64 overflow-hidden rounded-full border border-white/20 bg-slate-950 shadow-[0_0_90px_rgba(168,224,255,.42)] sm:size-80">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_34%_30%,#ffffff,#dbeafe_33%,#94a3b8_60%,#334155_100%)]" />
                  <div className="absolute inset-0 opacity-35 mix-blend-multiply bg-[radial-gradient(circle_at_32%_28%,transparent_0_5%,#334155_6%_8%,transparent_9%),radial-gradient(circle_at_62%_42%,transparent_0_6%,#475569_7%_10%,transparent_11%),radial-gradient(circle_at_45%_68%,transparent_0_7%,#1e293b_8%_12%,transparent_13%)]" />
                  <div
                    className="absolute inset-y-0 bg-[#02030a]/95 transition-all duration-700"
                    style={
                      data.direction === "waxing"
                        ? { left: 0, width: `${100 - data.moonMask}%` }
                        : { right: 0, width: `${100 - data.moonMask}%` }
                    }
                  />
                  <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/25" />
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Current phase</p>
                    <h2 className="mt-2 text-3xl font-black text-white">{data.phase.name}</h2>
                  </div>
                  <span className="text-5xl">{data.emoji}</span>
                </div>

                <p className="rounded-2xl border border-white/10 bg-white/10 p-4 text-slate-200">
                  {data.phase.vibe}
                </p>

                <label className="block space-y-3">
                  <span className="text-sm font-semibold text-slate-300">Choose a date</span>
                  <input
                    type="date"
                    value={dateString}
                    onChange={(event) => setDateString(event.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-white outline-none transition focus:border-cyan-200 focus:ring-4 focus:ring-cyan-200/10"
                  />
                </label>

                <div className="rounded-2xl border border-fuchsia-200/20 bg-fuchsia-200/10 p-4">
                  <p className="text-sm uppercase tracking-[0.28em] text-fuchsia-100">Tonight&apos;s micro ritual</p>
                  <p className="mt-2 text-lg font-semibold text-white">{data.ritual}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 pb-8 md:grid-cols-4">
          {phases.map((phase, index) => (
            <div
              key={phase.name}
              className={`rounded-3xl border p-4 backdrop-blur ${phase.name === data.phase.name ? "border-cyan-200/60 bg-cyan-200/15" : "border-white/10 bg-white/[0.05]"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"][index]}</span>
                <div>
                  <p className="font-bold text-white">{phase.name}</p>
                  <p className="text-xs text-slate-400">{Math.round(phase.range[0] * 100)}–{Math.round(phase.range[1] * 100)}% cycle</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-xl shadow-black/20 backdrop-blur">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-cyan-100/80">{detail}</p>
    </div>
  );
}
