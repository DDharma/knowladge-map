'use client'

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import type { TrackWithStats, SectionStat } from '@/lib/queries/tracks'

// ── Radar: overall mastery per track ──────────────────────────────────────────

type RadarProps = { tracks: TrackWithStats[] }

export function TrackRadarChart({ tracks }: RadarProps) {
  const data = tracks
    .filter((t) => t.totalTopics > 0)
    .map((t) => ({ subject: t.icon ? `${t.icon} ${t.name}` : t.name, pct: t.pct }))

  if (data.length === 0) return null

  return (
    <div className="bg-[#14171F] border border-white/8 p-5">
      <div className="text-[11px] font-semibold tracking-widest uppercase text-white/40 mb-4">
        Mastery Radar
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 600 }}
          />
          <Radar
            name="Mastery %"
            dataKey="pct"
            stroke="#6EA8FE"
            fill="#6EA8FE"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ r: 3, fill: '#6EA8FE', strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Bar: stages done per track ─────────────────────────────────────────────────

const TRACK_COLORS = [
  '#6EA8FE', '#66D19E', '#F48FB1', '#FFD479',
  '#CE93D8', '#80DEEA', '#FFAB91', '#A5D6A7', '#EF9A9A', '#B39DDB',
]

export function TrackBarChart({ tracks }: RadarProps) {
  const data = tracks
    .filter((t) => t.totalTopics > 0)
    .map((t) => ({
      name: t.icon ? `${t.icon}` : t.name.slice(0, 3),
      label: t.name,
      pct: t.pct,
      done: t.stagesDone,
      total: t.totalStages,
    }))

  if (data.length === 0) return null

  return (
    <div className="bg-[#14171F] border border-white/8 p-5">
      <div className="text-[11px] font-semibold tracking-widest uppercase text-white/40 mb-4">
        Progress by Track
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }} barSize={28}>
          <XAxis
            dataKey="name"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="bg-[#1C2030] border border-white/10 px-3 py-2 text-xs">
                  <div className="font-bold text-white mb-1">{d.label}</div>
                  <div className="text-white/50">{d.pct}% mastery</div>
                  <div className="text-white/40">{d.done} / {d.total} stages</div>
                </div>
              )
            }}
          />
          <Bar dataKey="pct" radius={0}>
            {data.map((_, i) => (
              <Cell key={i} fill={TRACK_COLORS[i % TRACK_COLORS.length]} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Section breakdown bar chart (used on track page) ──────────────────────────

type SectionProps = { sections: SectionStat[]; trackName: string }

export function SectionBarChart({ sections, trackName }: SectionProps) {
  const data = sections.map((s) => ({
    name: s.name.replace(/Phase \d+ — /, '').replace(/Section \w+ — /, ''),
    pct: s.pct,
    done: s.stagesDone,
    total: s.totalStages,
  }))

  if (data.length === 0) return null

  return (
    <div className="bg-[#14171F] border border-white/8 p-5 mb-5">
      <div className="text-[11px] font-semibold tracking-widest uppercase text-white/40 mb-4">
        Section Breakdown — {trackName}
      </div>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 60, bottom: 4, left: 4 }}
          barSize={14}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={180}
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="bg-[#1C2030] border border-white/10 px-3 py-2 text-xs">
                  <div className="font-bold text-white mb-1">{d.name}</div>
                  <div className="text-white/50">{d.pct}% mastery</div>
                  <div className="text-white/40">{d.done} / {d.total} stages done</div>
                </div>
              )
            }}
          />
          <Bar dataKey="pct" radius={0} background={{ fill: 'rgba(255,255,255,0.04)' }}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={d.pct === 100 ? '#66D19E' : d.pct >= 60 ? '#6EA8FE' : d.pct >= 30 ? '#FFD479' : '#F48FB1'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-3 text-[10px] text-white/30 font-medium">
        <span><span className="text-[#66D19E]">■</span> 100%</span>
        <span><span className="text-[#6EA8FE]">■</span> 60–99%</span>
        <span><span className="text-[#FFD479]">■</span> 30–59%</span>
        <span><span className="text-[#F48FB1]">■</span> 0–29%</span>
      </div>
    </div>
  )
}
