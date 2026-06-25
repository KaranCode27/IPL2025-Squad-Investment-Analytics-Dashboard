import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, Legend, ZAxis,
} from "recharts";
import { Search, Trophy, Users, TrendingUp, Star, Target, Zap, Award, DollarSign, BarChart2 } from "lucide-react";

// ── Palette ────────────────────────────────────────────────
const C = {
  cyan:   "#00D4FF",
  gold:   "#FFD700",
  purple: "#8B5CF6",
  green:  "#00FF88",
  pink:   "#FF6B9D",
  red:    "#FF4757",
  bg:     "#0B1020",
  card:   "rgba(14,22,50,0.75)",
  panel:  "rgba(10,15,32,0.85)",
};

const TEAM_COLORS: Record<string, string> = {
  MI:   "#004BA0", CSK: "#F9CD05", RCB: "#EC1C24",
  KKR:  "#6B21A8", DC:  "#0078BC", PBKS: "#AA4545",
  RR:   "#2D4EA2", SRH: "#FF822A", GT:  "#1BBEAF",
  LSG:  "#00A4D3",
};

const ROLE_COLORS: Record<string, string> = {
  "Batter": C.cyan, "Bowler": C.purple,
  "All-rounder": C.green, "WK-Batter": C.gold,
};

const TIER_COLORS: Record<string, string> = {
  Elite: C.cyan, Premium: C.gold, Value: C.green, Budget: C.purple,
};

// ── Types ──────────────────────────────────────────────────
type AcqType = "Retained" | "Auction" | "RTM";
type Role    = "Batter" | "Bowler" | "All-rounder" | "WK-Batter";
type Tier    = "Elite" | "Premium" | "Value" | "Budget";
type Page    = 1 | 2 | 3 | 4;

interface Player {
  name: string; team: string; role: Role; price: number;
  matches: number; runs: number; wickets: number; avg: number;
  economy: number; strikeRate: number; acqType: AcqType;
  tier: Tier; valuationScore: number; roiScore: number;
}

// ── Data ───────────────────────────────────────────────────
const PLAYERS: Player[] = [
  { name: "Rishabh Pant",        team: "DC",   role: "WK-Batter",    price: 27,    matches: 14, runs: 446, wickets: 0,  avg: 37.2, economy: 0,   strikeRate: 148.7, acqType: "Retained", tier: "Elite",   valuationScore: 94, roiScore: 412 },
  { name: "Virat Kohli",         team: "RCB",  role: "Batter",       price: 21,    matches: 16, runs: 741, wickets: 0,  avg: 61.8, economy: 0,   strikeRate: 154.3, acqType: "Retained", tier: "Elite",   valuationScore: 97, roiScore: 389 },
  { name: "Jasprit Bumrah",      team: "MI",   role: "Bowler",       price: 18,    matches: 13, runs: 0,   wickets: 20, avg: 18.4, economy: 6.2, strikeRate: 0,     acqType: "Retained", tier: "Elite",   valuationScore: 96, roiScore: 445 },
  { name: "KL Rahul",            team: "LSG",  role: "WK-Batter",    price: 18,    matches: 14, runs: 520, wickets: 0,  avg: 43.3, economy: 0,   strikeRate: 142.5, acqType: "Retained", tier: "Elite",   valuationScore: 89, roiScore: 356 },
  { name: "Ravindra Jadeja",     team: "CSK",  role: "All-rounder",  price: 18,    matches: 14, runs: 185, wickets: 14, avg: 25.4, economy: 7.8, strikeRate: 145.2, acqType: "Retained", tier: "Elite",   valuationScore: 91, roiScore: 378 },
  { name: "Pat Cummins",         team: "SRH",  role: "Bowler",       price: 18,    matches: 14, runs: 48,  wickets: 19, avg: 22.1, economy: 7.4, strikeRate: 0,     acqType: "Retained", tier: "Elite",   valuationScore: 88, roiScore: 422 },
  { name: "Rohit Sharma",        team: "MI",   role: "Batter",       price: 16.35, matches: 14, runs: 487, wickets: 0,  avg: 37.5, economy: 0,   strikeRate: 139.4, acqType: "Retained", tier: "Elite",   valuationScore: 85, roiScore: 298 },
  { name: "Hardik Pandya",       team: "MI",   role: "All-rounder",  price: 16.35, matches: 14, runs: 264, wickets: 11, avg: 26.4, economy: 8.9, strikeRate: 158.7, acqType: "RTM",      tier: "Elite",   valuationScore: 83, roiScore: 312 },
  { name: "Suryakumar Yadav",    team: "MI",   role: "Batter",       price: 16.35, matches: 14, runs: 612, wickets: 0,  avg: 51.0, economy: 0,   strikeRate: 178.2, acqType: "Retained", tier: "Elite",   valuationScore: 95, roiScore: 467 },
  { name: "Jos Buttler",         team: "RR",   role: "WK-Batter",    price: 15,    matches: 14, runs: 554, wickets: 0,  avg: 46.2, economy: 0,   strikeRate: 152.6, acqType: "Retained", tier: "Elite",   valuationScore: 87, roiScore: 334 },
  { name: "MS Dhoni",            team: "CSK",  role: "WK-Batter",    price: 4,     matches: 14, runs: 128, wickets: 0,  avg: 42.7, economy: 0,   strikeRate: 188.2, acqType: "Retained", tier: "Premium", valuationScore: 82, roiScore: 780 },
  { name: "Shubman Gill",        team: "GT",   role: "Batter",       price: 12.5,  matches: 14, runs: 596, wickets: 0,  avg: 49.7, economy: 0,   strikeRate: 143.2, acqType: "Retained", tier: "Elite",   valuationScore: 86, roiScore: 344 },
  { name: "Mitchell Starc",      team: "KKR",  role: "Bowler",       price: 24.75, matches: 14, runs: 22,  wickets: 17, avg: 28.4, economy: 8.1, strikeRate: 0,     acqType: "Auction",  tier: "Elite",   valuationScore: 78, roiScore: 198 },
  { name: "David Warner",        team: "DC",   role: "Batter",       price: 6.25,  matches: 14, runs: 432, wickets: 0,  avg: 36.0, economy: 0,   strikeRate: 147.8, acqType: "Auction",  tier: "Premium", valuationScore: 79, roiScore: 521 },
  { name: "Rashid Khan",         team: "GT",   role: "Bowler",       price: 18,    matches: 14, runs: 56,  wickets: 24, avg: 16.8, economy: 6.7, strikeRate: 0,     acqType: "Retained", tier: "Elite",   valuationScore: 94, roiScore: 534 },
  { name: "Travis Head",         team: "SRH",  role: "Batter",       price: 6.8,   matches: 14, runs: 567, wickets: 0,  avg: 47.3, economy: 0,   strikeRate: 189.1, acqType: "RTM",      tier: "Premium", valuationScore: 88, roiScore: 687 },
  { name: "Nicholas Pooran",     team: "LSG",  role: "WK-Batter",    price: 21,    matches: 14, runs: 478, wickets: 0,  avg: 39.8, economy: 0,   strikeRate: 165.4, acqType: "Auction",  tier: "Elite",   valuationScore: 81, roiScore: 267 },
  { name: "Yuzvendra Chahal",    team: "PBKS", role: "Bowler",       price: 18,    matches: 14, runs: 4,   wickets: 21, avg: 19.6, economy: 7.2, strikeRate: 0,     acqType: "Auction",  tier: "Elite",   valuationScore: 87, roiScore: 348 },
  { name: "Sanju Samson",        team: "RR",   role: "WK-Batter",    price: 14,    matches: 14, runs: 503, wickets: 0,  avg: 41.9, economy: 0,   strikeRate: 152.8, acqType: "Retained", tier: "Elite",   valuationScore: 84, roiScore: 315 },
  { name: "Axar Patel",          team: "DC",   role: "All-rounder",  price: 16.5,  matches: 14, runs: 212, wickets: 16, avg: 21.8, economy: 7.5, strikeRate: 152.3, acqType: "Retained", tier: "Elite",   valuationScore: 86, roiScore: 298 },
  { name: "Rinku Singh",         team: "KKR",  role: "Batter",       price: 13,    matches: 14, runs: 376, wickets: 0,  avg: 47.0, economy: 0,   strikeRate: 163.5, acqType: "Retained", tier: "Premium", valuationScore: 80, roiScore: 421 },
  { name: "Arshdeep Singh",      team: "PBKS", role: "Bowler",       price: 18,    matches: 14, runs: 8,   wickets: 19, avg: 22.4, economy: 8.3, strikeRate: 0,     acqType: "Retained", tier: "Elite",   valuationScore: 82, roiScore: 298 },
  { name: "Tilak Varma",         team: "MI",   role: "Batter",       price: 8.75,  matches: 14, runs: 424, wickets: 0,  avg: 35.3, economy: 0,   strikeRate: 154.7, acqType: "Retained", tier: "Premium", valuationScore: 78, roiScore: 456 },
  { name: "Abhishek Sharma",     team: "SRH",  role: "Batter",       price: 14,    matches: 14, runs: 484, wickets: 3,  avg: 40.3, economy: 9.6, strikeRate: 204.2, acqType: "Retained", tier: "Premium", valuationScore: 83, roiScore: 342 },
  { name: "Yashasvi Jaiswal",    team: "RR",   role: "Batter",       price: 14,    matches: 14, runs: 628, wickets: 0,  avg: 52.3, economy: 0,   strikeRate: 161.4, acqType: "Retained", tier: "Elite",   valuationScore: 91, roiScore: 489 },
  { name: "Heinrich Klaasen",    team: "SRH",  role: "WK-Batter",    price: 23,    matches: 14, runs: 512, wickets: 0,  avg: 42.7, economy: 0,   strikeRate: 178.9, acqType: "Auction",  tier: "Elite",   valuationScore: 85, roiScore: 289 },
  { name: "Jake Fraser-McGurk",  team: "DC",   role: "Batter",       price: 9,     matches: 14, runs: 357, wickets: 0,  avg: 29.8, economy: 0,   strikeRate: 218.4, acqType: "Auction",  tier: "Premium", valuationScore: 77, roiScore: 398 },
  { name: "Riyan Parag",         team: "RR",   role: "Batter",       price: 14,    matches: 14, runs: 388, wickets: 4,  avg: 32.3, economy: 9.2, strikeRate: 151.2, acqType: "Retained", tier: "Premium", valuationScore: 76, roiScore: 298 },
  { name: "Nitish Kumar Reddy",  team: "SRH",  role: "All-rounder",  price: 6,     matches: 14, runs: 312, wickets: 6,  avg: 31.2, economy: 9.8, strikeRate: 158.4, acqType: "Retained", tier: "Value",   valuationScore: 74, roiScore: 623 },
  { name: "Phil Salt",           team: "KKR",  role: "WK-Batter",    price: 11.5,  matches: 14, runs: 436, wickets: 0,  avg: 36.3, economy: 0,   strikeRate: 167.2, acqType: "Auction",  tier: "Premium", valuationScore: 80, roiScore: 378 },
];

const TEAM_TOTALS = [
  { team: "MI",   totalSpend: 113.15 },
  { team: "CSK",  totalSpend: 98.50  },
  { team: "RCB",  totalSpend: 104.25 },
  { team: "KKR",  totalSpend: 99.80  },
  { team: "DC",   totalSpend: 106.70 },
  { team: "PBKS", totalSpend: 110.45 },
  { team: "RR",   totalSpend: 97.30  },
  { team: "SRH",  totalSpend: 102.60 },
  { team: "GT",   totalSpend: 95.40  },
  { team: "LSG",  totalSpend: 108.20 },
];

const ALL_TEAMS = ["MI", "CSK", "RCB", "KKR", "DC", "PBKS", "RR", "SRH", "GT", "LSG"];
const ALL_TIERS: Tier[] = ["Elite", "Premium", "Value", "Budget"];

// ── Helpers ────────────────────────────────────────────────
function getCategory(p: Player): string {
  if (p.roiScore > 500 && p.price < 10) return "Hidden Gem";
  if (p.valuationScore >= 90)           return "Elite Player";
  if (p.valuationScore >= 80)           return "High Performer";
  return "Regular";
}

function fmt(n: number, d = 2) { return n.toFixed(d); }
function fmtCr(n: number) { return `₹${n.toFixed(2)}Cr`; }

// ── Style helpers ──────────────────────────────────────────
const glass = (border = C.cyan, opacity = 0.12): React.CSSProperties => ({
  background: C.card,
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: `1px solid ${border}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
  borderRadius: 12,
});

const monoFont: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const condensedFont: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif" };

// ── Sub-components ─────────────────────────────────────────
function GlowLabel({ text, color = C.cyan }: { text: string; color?: string }) {
  return (
    <span
      style={{
        ...condensedFont,
        color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        textShadow: `0 0 8px ${color}80`,
      }}
    >
      {text}
    </span>
  );
}

function KPICard({
  label, value, sub, icon: Icon, color = C.cyan,
}: {
  label: string; value: string; sub?: string; icon: any; color?: string;
}) {
  return (
    <div
      style={{
        ...glass(color),
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        flex: 1,
        minWidth: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute", top: 0, right: 0,
          width: 80, height: 80,
          background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <GlowLabel text={label} color={color} />
        <Icon size={14} color={color} style={{ opacity: 0.7 }} />
      </div>
      <div style={{ ...monoFont, fontSize: 28, fontWeight: 600, color: "#F1F5F9", lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#94A3B8" }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children, accent = C.cyan }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
      <div style={{ width: 3, height: 16, background: accent, borderRadius: 2, boxShadow: `0 0 6px ${accent}` }} />
      <span style={{ ...condensedFont, fontSize: 14, fontWeight: 700, color: "#CBD5E1", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {children}
      </span>
    </div>
  );
}

function CategoryBadge({ cat }: { cat: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    "Elite Player":   { color: C.cyan,   bg: `${C.cyan}20`   },
    "High Performer": { color: C.gold,   bg: `${C.gold}20`   },
    "Hidden Gem":     { color: C.green,  bg: `${C.green}20`  },
    "Regular":        { color: "#64748B", bg: "#1E3A5F30"    },
  };
  const s = map[cat] ?? map["Regular"];
  return (
    <span style={{
      ...condensedFont,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
      padding: "2px 8px", borderRadius: 4,
      color: s.color, background: s.bg,
      border: `1px solid ${s.color}40`,
      whiteSpace: "nowrap",
    }}>
      {cat}
    </span>
  );
}

function AcqBadge({ type }: { type: AcqType }) {
  const map: Record<AcqType, string> = { Retained: C.green, Auction: C.cyan, RTM: C.gold };
  const col = map[type];
  return (
    <span style={{
      ...monoFont, fontSize: 9, fontWeight: 600, padding: "1px 6px",
      borderRadius: 3, color: col, background: `${col}18`,
      border: `1px solid ${col}40`,
    }}>
      {type}
    </span>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(10,15,32,0.97)", border: `1px solid ${C.cyan}40`,
      borderRadius: 8, padding: "8px 12px", fontSize: 12,
    }}>
      {label !== undefined && <p style={{ color: "#64748B", marginBottom: 4, fontSize: 11 }}>{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? C.cyan, fontWeight: 600, ...monoFont }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Filter Panel ───────────────────────────────────────────
function FilterPanel({
  selectedTeams, setSelectedTeams,
  selectedTiers, setSelectedTiers,
  filteredCount, filteredSpend, totalCount,
}: {
  selectedTeams: string[]; setSelectedTeams: (t: string[]) => void;
  selectedTiers: Tier[];   setSelectedTiers: (t: Tier[]) => void;
  filteredCount: number;   filteredSpend: number; totalCount: number;
}) {
  const toggle = <T extends string>(arr: T[], val: T, set: (v: T[]) => void) => {
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  return (
    <div style={{ ...glass(C.purple, 0.15), padding: 16, display: "flex", flexDirection: "column", gap: 20, minWidth: 180, width: 180, flex: 1, minHeight: 0, overflowY: "auto" }}>
      {/* Team Filter */}
      <div>
        <SectionTitle accent={C.purple}>Team Filter</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 4 }}>
          <button
            onClick={() => setSelectedTeams(selectedTeams.length === ALL_TEAMS.length ? [] : [...ALL_TEAMS])}
            style={{
              ...condensedFont, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
              padding: "5px 8px", borderRadius: 4, cursor: "pointer",
              color: C.purple, background: `${C.purple}18`, border: `1px solid ${C.purple}40`,
              textAlign: "center", gridColumn: "span 2", marginBottom: 4,
            }}
          >
            {selectedTeams.length === ALL_TEAMS.length ? "DESELECT ALL" : "SELECT ALL"}
          </button>
          {ALL_TEAMS.map(team => {
            const on = selectedTeams.includes(team);
            const tc = TEAM_COLORS[team];
            return (
              <button
                key={team}
                onClick={() => toggle(selectedTeams, team, setSelectedTeams)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 6px", borderRadius: 6, cursor: "pointer",
                  background: on ? `${tc}18` : "transparent",
                  border: `1px solid ${on ? tc + "60" : "#1E3A5F"}`,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: 1.5, background: on ? tc : "#1E3A5F", flexShrink: 0 }} />
                <span style={{ ...condensedFont, fontSize: 11, fontWeight: 700, color: on ? "#E2E8F0" : "#94A3B8", letterSpacing: "0.02em" }}>
                  {team}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tier Filter */}
      <div>
        <SectionTitle accent={C.gold}>Player Tier</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 4 }}>
          {ALL_TIERS.map(tier => {
            const on = selectedTiers.includes(tier);
            const tc = TIER_COLORS[tier];
            return (
              <button
                key={tier}
                onClick={() => toggle(selectedTiers, tier, setSelectedTiers)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 6px", borderRadius: 6, cursor: "pointer",
                  background: on ? `${tc}18` : "transparent",
                  border: `1px solid ${on ? tc + "60" : "#1E3A5F"}`,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: on ? tc : "#1E3A5F", flexShrink: 0 }} />
                <span style={{ ...condensedFont, fontSize: 11, fontWeight: 700, color: on ? "#E2E8F0" : "#94A3B8" }}>
                  {tier}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mini Stats Panel */}
      <div style={{ marginTop: "auto", borderTop: "1px solid rgba(0,212,255,0.15)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        <SectionTitle accent={C.cyan}>Active View Stats</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>Filtered Roster</span>
            <span style={{ ...monoFont, fontSize: 12, fontWeight: 700, color: C.cyan }}>{filteredCount} / {totalCount}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>Subtotal Spend</span>
            <span style={{ ...monoFont, fontSize: 12, fontWeight: 700, color: C.gold }}>₹{filteredSpend.toFixed(2)}Cr</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94A3B8" }}>Avg Cost</span>
            <span style={{ ...monoFont, fontSize: 12, fontWeight: 700, color: C.green }}>₹{(filteredCount ? filteredSpend / filteredCount : 0).toFixed(2)}Cr</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page 1: Mega Auction Overview ──────────────────────────
function Page1({ players, teamTotals }: { players: Player[]; teamTotals: typeof TEAM_TOTALS }) {
  const totalSpend    = teamTotals.reduce((s, t) => s + t.totalSpend, 0);
  const totalPlayers  = players.length;
  const avgCost       = totalPlayers ? players.reduce((s, p) => s + p.price, 0) / totalPlayers : 0;
  const retained      = players.filter(p => p.acqType === "Retained").length;
  const auction       = players.filter(p => p.acqType === "Auction").length;
  const rtm           = players.filter(p => p.acqType === "RTM").length;
  const mostExpensive = [...players].sort((a, b) => b.price - a.price)[0];
  const initials = mostExpensive
    ? mostExpensive.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "";

  const donutData = [
    { name: "Auction",  value: auction,  color: C.cyan   },
    { name: "Retained", value: retained, color: C.green  },
    { name: "RTM",      value: rtm,      color: C.gold   },
  ];

  const barData = teamTotals.map(t => ({ ...t, fill: TEAM_COLORS[t.team] }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", minHeight: 0 }}>
      {/* KPI row */}
      <div style={{ display: "flex", gap: 12 }}>
        <KPICard label="Total Spend" value={`₹${totalSpend.toFixed(2)}Cr`} sub="Across all franchises" icon={DollarSign} color={C.cyan} />
        <KPICard label="Avg Player Cost" value={`₹${avgCost.toFixed(2)}Cr`} sub="Per player auction price" icon={TrendingUp} color={C.gold} />
        <KPICard label="Total Players" value={`${totalPlayers}`} sub="In filtered view" icon={Users} color={C.purple} />
        <KPICard label="Retained Players" value={`${retained}`} sub={`${rtm} via RTM`} icon={Star} color={C.green} />
      </div>

      {/* Charts row */}
      <div style={{ display: "flex", gap: 12, flex: 1, minHeight: 0 }}>
        {/* Bar chart: team spend */}
        <div style={{ ...glass(), padding: 20, flex: 2, minWidth: 0 }}>
          <SectionTitle>Total Spend by Team</SectionTitle>
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={22} margin={{ left: -10, right: 10, bottom: 10 }}>
                <defs>
                  {barData.map((d) => (
                    <linearGradient key={`bar-grad-${d.team}`} id={`bg${d.team}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={d.fill} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={d.fill} stopOpacity={0.3} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" vertical={false} />
                <XAxis dataKey="team" tick={{ fill: "#94A3B8", fontSize: 12, fontFamily: "'Barlow Condensed'" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,212,255,0.04)" }} />
                <Bar dataKey="totalSpend" name="Spend (Cr)" radius={[4, 4, 0, 0]}>
                  {barData.map((d) => (
                    <Cell key={`bar-cell-${d.team}`} fill={`url(#bg${d.team})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut: squad composition */}
        <div style={{ ...glass(C.gold), padding: 20, width: 240, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <SectionTitle accent={C.gold}>Squad Composition</SectionTitle>
          <div style={{ position: "relative", height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" cx="50%" cy="50%" innerRadius="52%" outerRadius="78%" paddingAngle={3} strokeWidth={0}>
                  {donutData.map((d) => (
                    <Cell key={`pie-cell-${d.name}`} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <div style={{ ...monoFont, fontSize: 22, fontWeight: 700, color: "#F1F5F9" }}>{totalPlayers}</div>
              <div style={{ fontSize: 9, color: "#64748B", letterSpacing: "0.08em" }}>PLAYERS</div>
            </div>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {donutData.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  <span style={{ ...condensedFont, fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>{d.name}</span>
                </div>
                <span style={{ ...monoFont, fontSize: 12, color: d.color, fontWeight: 700 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most expensive player */}
        {mostExpensive && (
          <div style={{
            ...glass(C.gold, 0.25), padding: 20, width: 190, flexShrink: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(145deg, rgba(14,22,50,0.9) 0%, rgba(30,20,60,0.8) 100%)",
          }}>
            <GlowLabel text="Most Expensive" color={C.gold} />
            {/* Avatar placeholder */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: `linear-gradient(135deg, ${TEAM_COLORS[mostExpensive.team]}40, ${C.gold}30)`,
              border: `2px solid ${C.gold}60`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 20px ${C.gold}40`,
            }}>
              <span style={{ ...condensedFont, fontSize: 26, fontWeight: 800, color: C.gold, letterSpacing: "0.05em" }}>
                {initials}
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ ...condensedFont, fontSize: 16, fontWeight: 800, color: "#F1F5F9", letterSpacing: "0.02em", marginBottom: 4 }}>
                {mostExpensive.name}
              </div>
              <div style={{ ...monoFont, fontSize: 22, fontWeight: 700, color: C.gold, marginBottom: 6 }}>
                ₹{mostExpensive.price}Cr
              </div>
              <div style={{
                ...condensedFont, fontSize: 11, fontWeight: 700,
                color: TEAM_COLORS[mostExpensive.team] || C.cyan,
                background: `${(TEAM_COLORS[mostExpensive.team] || C.cyan)}20`,
                padding: "3px 10px", borderRadius: 4,
                border: `1px solid ${(TEAM_COLORS[mostExpensive.team] || C.cyan)}50`,
                display: "inline-block",
              }}>
                {mostExpensive.team} · {mostExpensive.role}
              </div>
            </div>
            <AcqBadge type={mostExpensive.acqType} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page 2: Value & ROI Analysis ───────────────────────────
function Page2({ players }: { players: Player[] }) {
  const batters  = players.filter(p => p.runs > 0);
  const bowlers  = players.filter(p => p.wickets > 0);

  const renderDot = (props: any) => {
    const { cx, cy, payload } = props;
    const col = ROLE_COLORS[payload.role as Role] ?? C.cyan;
    return (
      <circle cx={cx} cy={cy} r={6} fill={col} fillOpacity={0.8}
        stroke={col} strokeWidth={1.5} strokeOpacity={0.5} />
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", minHeight: 0 }}>
      {/* Scatter 1: Price vs Batting */}
      <div style={{ ...glass(), padding: "16px 20px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <SectionTitle>Price vs Batting Performance</SectionTitle>
        <div style={{ width: "100%", flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
            <XAxis type="number" dataKey="runs" name="Runs" tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} label={{ value: "Runs", position: "insideBottomRight", offset: -5, fill: "#94A3B8", fontSize: 12 }} />
            <YAxis type="number" dataKey="price" name="Price (Cr)" tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
            <ZAxis range={[40, 40]} />
            <Tooltip cursor={{ strokeDasharray: "3 3", stroke: C.cyan + "40" }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as Player;
              return (
                <div style={{ background: "rgba(10,15,32,0.97)", border: `1px solid ${C.cyan}40`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                  <p style={{ ...condensedFont, fontSize: 13, fontWeight: 800, color: "#F1F5F9", marginBottom: 4 }}>{d.name}</p>
                  <p style={{ color: "#64748B", fontSize: 11 }}>{d.team} · {d.role}</p>
                  <p style={{ color: C.gold, ...monoFont }}>₹{d.price}Cr</p>
                  <p style={{ color: C.cyan, ...monoFont }}>Runs: {d.runs} · SR: {d.strikeRate}</p>
                </div>
              );
            }} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Barlow Condensed'", paddingTop: 10 }} />
            {(["Batter", "WK-Batter", "All-rounder"] as Role[]).map(role => (
              <Scatter
                key={`bat-${role}`}
                name={role}
                data={batters.filter(p => p.role === role).map(p => ({ ...p, x: p.runs, y: p.price }))}
                fill={ROLE_COLORS[role]}
                shape={renderDot}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Scatter 2: Price vs Bowling */}
      <div style={{ ...glass(C.purple), padding: "16px 20px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <SectionTitle accent={C.purple}>Price vs Bowling Performance</SectionTitle>
        <div style={{ width: "100%", flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ left: 0, right: 20, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" />
            <XAxis type="number" dataKey="wickets" name="Wickets" tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} label={{ value: "Wickets", position: "insideBottomRight", offset: -5, fill: "#94A3B8", fontSize: 12 }} />
            <YAxis type="number" dataKey="price" name="Price (Cr)" tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
            <ZAxis range={[40, 40]} />
            <Tooltip cursor={{ strokeDasharray: "3 3", stroke: C.purple + "40" }} content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as Player;
              return (
                <div style={{ background: "rgba(10,15,32,0.97)", border: `1px solid ${C.purple}40`, borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
                  <p style={{ ...condensedFont, fontSize: 13, fontWeight: 800, color: "#F1F5F9", marginBottom: 4 }}>{d.name}</p>
                  <p style={{ color: "#64748B", fontSize: 11 }}>{d.team} · {d.role}</p>
                  <p style={{ color: C.gold, ...monoFont }}>₹{d.price}Cr</p>
                  <p style={{ color: C.purple, ...monoFont }}>Wkts: {d.wickets} · Eco: {d.economy}</p>
                </div>
              );
            }} />
            <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Barlow Condensed'", paddingTop: 10 }} />
            {(["Bowler", "All-rounder"] as Role[]).map(role => (
              <Scatter
                key={`bowl-${role}`}
                name={role}
                data={bowlers.filter(p => p.role === role).map(p => ({ ...p, x: p.wickets, y: p.price }))}
                fill={ROLE_COLORS[role]}
                shape={renderDot}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── Page 3: Roster Details ─────────────────────────────────
function Page3({ players }: { players: Player[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return players.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.team.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q)
    );
  }, [players, search]);

  const totalRuns    = players.reduce((s, p) => s + p.runs, 0);
  const totalWickets = players.reduce((s, p) => s + p.wickets, 0);
  const totalSpend   = players.reduce((s, p) => s + p.price, 0);
  const avgVal       = players.length ? players.reduce((s, p) => s + p.valuationScore, 0) / players.length : 0;

  const cols = [
    { label: "Player",     w: "14%" },
    { label: "Team",       w: "6%"  },
    { label: "Role",       w: "10%" },
    { label: "Price",      w: "7%"  },
    { label: "M",          w: "4%"  },
    { label: "Runs",       w: "6%"  },
    { label: "Wkts",       w: "5%"  },
    { label: "Avg",        w: "6%"  },
    { label: "Eco",        w: "6%"  },
    { label: "SR",         w: "6%"  },
    { label: "Val.",       w: "5%"  },
    { label: "Category",   w: "12%" },
    { label: "Acq.",       w: "8%"  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", minHeight: 0 }}>
      {/* KPIs */}
      <div style={{ display: "flex", gap: 12 }}>
        <KPICard label="Total Players"   value={`${players.length}`}            sub="In filtered view"     icon={Users}     color={C.cyan}   />
        <KPICard label="Total Spend"     value={`₹${totalSpend.toFixed(2)}Cr`}  sub="Aggregate investment" icon={DollarSign} color={C.gold}   />
        <KPICard label="Total Runs"      value={totalRuns.toLocaleString()}      sub="Combined run tally"   icon={TrendingUp} color={C.purple} />
        <KPICard label="Total Wickets"   value={`${totalWickets}`}              sub="Combined wickets"     icon={Target}    color={C.green}  />
        <KPICard label="Avg. Valuation"  value={`${avgVal.toFixed(1)}`}         sub="Composite score /100" icon={Star}      color={C.pink}   />
      </div>

      {/* Table */}
      <div style={{ ...glass(), padding: 16, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {/* Search bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
            <Search size={13} color="#64748B" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search player, team, role…"
              style={{
                width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
                background: "#152040", border: "1px solid #1E3A5F", borderRadius: 8,
                color: "#CBD5E1", fontSize: 12, fontFamily: "inherit", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <span style={{ ...monoFont, fontSize: 10, color: "#64748B" }}>{filtered.length} records</span>
        </div>

        {/* Table header */}
        <div style={{ display: "flex", borderBottom: `1px solid #1E3A5F`, paddingBottom: 8, marginBottom: 4, flexShrink: 0 }}>
          {cols.map(c => (
            <div key={c.label} style={{ width: c.w, ...condensedFont, fontSize: 10, fontWeight: 700, color: C.cyan, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
              {c.label}
            </div>
          ))}
        </div>

        {/* Table body */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
          {filtered.map((p, i) => {
            const cat = getCategory(p);
            const tc  = TEAM_COLORS[p.team] || C.cyan;
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center",
                  padding: "6px 0",
                  borderBottom: "1px solid rgba(30,58,95,0.4)",
                  background: i % 2 === 0 ? "rgba(0,212,255,0.02)" : "transparent",
                  borderRadius: 4,
                  transition: "background 0.1s",
                }}
              >
                <div style={{ width: "14%", flexShrink: 0 }}>
                  <span style={{ ...condensedFont, fontSize: 13, fontWeight: 700, color: "#E2E8F0", letterSpacing: "0.01em" }}>
                    {p.name}
                  </span>
                </div>
                <div style={{ width: "6%", flexShrink: 0 }}>
                  <span style={{ ...condensedFont, fontSize: 11, fontWeight: 800, color: tc }}>{p.team}</span>
                </div>
                <div style={{ width: "10%", flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: ROLE_COLORS[p.role], ...condensedFont, fontWeight: 600 }}>{p.role}</span>
                </div>
                <div style={{ width: "7%", flexShrink: 0 }}>
                  <span style={{ ...monoFont, fontSize: 12, color: C.gold, fontWeight: 600 }}>₹{p.price}</span>
                </div>
                <div style={{ width: "4%",  ...monoFont, fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>{p.matches}</div>
                <div style={{ width: "6%",  ...monoFont, fontSize: 11, color: C.cyan,   flexShrink: 0 }}>{p.runs}</div>
                <div style={{ width: "5%",  ...monoFont, fontSize: 11, color: C.purple, flexShrink: 0 }}>{p.wickets}</div>
                <div style={{ width: "6%",  ...monoFont, fontSize: 11, color: "#CBD5E1", flexShrink: 0 }}>{fmt(p.avg)}</div>
                <div style={{ width: "6%",  ...monoFont, fontSize: 11, color: "#CBD5E1", flexShrink: 0 }}>{p.economy > 0 ? fmt(p.economy) : "—"}</div>
                <div style={{ width: "6%",  ...monoFont, fontSize: 11, color: "#CBD5E1", flexShrink: 0 }}>{p.strikeRate > 0 ? fmt(p.strikeRate, 1) : "—"}</div>
                <div style={{ width: "5%",  flexShrink: 0 }}>
                  <span style={{ ...monoFont, fontSize: 12, fontWeight: 700, color: p.valuationScore >= 90 ? C.green : p.valuationScore >= 80 ? C.cyan : "#94A3B8" }}>
                    {p.valuationScore}
                  </span>
                </div>
                <div style={{ width: "12%", flexShrink: 0 }}><CategoryBadge cat={cat} /></div>
                <div style={{ width: "8%",  flexShrink: 0 }}><AcqBadge type={p.acqType} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Page 4: Value Leaderboard ──────────────────────────────
function Page4({ players }: { players: Player[] }) {
  const sorted   = useMemo(() => [...players].sort((a, b) => b.roiScore - a.roiScore), [players]);
  const top10    = sorted.slice(0, 10);
  const bestROI  = sorted[0];
  const hiddenGems  = players.filter(p => getCategory(p) === "Hidden Gem").length;
  const avgROI   = players.length ? players.reduce((s, p) => s + p.roiScore, 0) / players.length : 0;
  const roi300   = players.filter(p => p.roiScore > 300).length;
  const totalVal = players.reduce((s, p) => s + p.valuationScore, 0);

  const barData = top10.map(p => ({
    name: p.name,
    fullName: p.name,
    roiScore: p.roiScore,
    team: p.team,
    fill: TEAM_COLORS[p.team] || C.cyan,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%", minHeight: 0 }}>
      {/* KPIs */}
      <div style={{ display: "flex", gap: 12 }}>
        <KPICard label="Best ROI Score"    value={bestROI ? `${bestROI.roiScore}` : "—"}  sub={bestROI?.name}         icon={Trophy}    color={C.gold}   />
        <KPICard label="Hidden Gems"       value={`${hiddenGems}`}                         sub="High ROI, low price"   icon={Zap}       color={C.green}  />
        <KPICard label="Avg. ROI Score"    value={avgROI.toFixed(0)}                       sub="Across filtered roster" icon={BarChart2} color={C.cyan}   />
        <KPICard label="Players ROI > 300" value={`${roi300}`}                             sub="Above threshold"       icon={Target}    color={C.purple} />
        <KPICard label="Total Valuation"   value={`${totalVal}`}                           sub="Sum of val. scores"    icon={Award}     color={C.pink}   />
      </div>

      {/* Main row */}
      <div style={{ display: "flex", gap: 12, flex: 1, minHeight: 0 }}>
        {/* Horizontal bar chart */}
        <div style={{ ...glass(), padding: 20, flex: 1, minWidth: 0 }}>
          <SectionTitle>Top 10 ROI Score by Player</SectionTitle>
          <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" barSize={14} margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
              <defs>
                {barData.map((d, i) => (
                  <linearGradient key={`roi-grad-${d.team}-${i}`} id={`roi${i}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={d.fill} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={C.cyan} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748B", fontSize: 10, fontFamily: "'JetBrains Mono'" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={115} tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'Barlow Condensed'", fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: "rgba(10,15,32,0.97)", border: `1px solid ${C.cyan}40`, borderRadius: 8, padding: "8px 12px" }}>
                      <p style={{ ...condensedFont, fontSize: 13, fontWeight: 800, color: "#F1F5F9" }}>{d.fullName}</p>
                      <p style={{ ...monoFont, fontSize: 12, color: C.gold }}>ROI: {d.roiScore}</p>
                      <p style={{ ...condensedFont, fontSize: 11, color: TEAM_COLORS[d.team] }}>{d.team}</p>
                    </div>
                  );
                }}
                cursor={{ fill: "rgba(0,212,255,0.04)" }}
              />
              <Bar dataKey="roiScore" name="ROI Score" radius={[0, 4, 4, 0]}>
                {barData.map((d, i) => <Cell key={`roi-cell-${d.team}-${i}`} fill={`url(#roi${i})`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Leaderboard table */}
        <div style={{ ...glass(C.gold, 0.15), padding: 20, flex: 1.2, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <SectionTitle accent={C.gold}>Value Leaderboard</SectionTitle>

          {/* Header */}
          <div style={{ display: "flex", borderBottom: `1px solid #1E3A5F`, paddingBottom: 8, marginBottom: 4 }}>
            {[["#", "4%"], ["Player", "24%"], ["Price", "11%"], ["Runs", "9%"], ["Wkts", "9%"], ["Val.", "9%"], ["ROI", "11%"], ["Category", "23%"]].map(([l, w]) => (
              <div key={l} style={{ width: w, ...condensedFont, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: "0.08em", textTransform: "uppercase", flexShrink: 0 }}>
                {l}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {sorted.map((p, i) => {
              const cat = getCategory(p);
              const isTop3 = i < 3;
              const rankColors = [C.gold, "#C0C0C0", "#CD7F32"];
              return (
                <div
                  key={`lb-${p.name}`}
                  style={{
                    display: "flex", alignItems: "center",
                    padding: "7px 0",
                    borderBottom: "1px solid rgba(30,58,95,0.4)",
                    background: isTop3 ? `${rankColors[i]}06` : "transparent",
                  }}
                >
                  <div style={{ width: "4%", flexShrink: 0 }}>
                    <span style={{ ...monoFont, fontSize: 11, fontWeight: 700, color: isTop3 ? rankColors[i] : "#475569" }}>
                      {i + 1}
                    </span>
                  </div>
                  <div style={{ width: "24%", flexShrink: 0 }}>
                    <div style={{ ...condensedFont, fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: TEAM_COLORS[p.team] || C.cyan, ...condensedFont, fontWeight: 600 }}>{p.team}</div>
                  </div>
                  <div style={{ width: "11%", ...monoFont, fontSize: 11, color: C.gold, flexShrink: 0 }}>₹{p.price}</div>
                  <div style={{ width: "9%",  ...monoFont, fontSize: 11, color: C.cyan,   flexShrink: 0 }}>{p.runs}</div>
                  <div style={{ width: "9%",  ...monoFont, fontSize: 11, color: C.purple, flexShrink: 0 }}>{p.wickets}</div>
                  <div style={{ width: "9%",  ...monoFont, fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>{p.valuationScore}</div>
                  <div style={{ width: "11%", flexShrink: 0 }}>
                    <span style={{ ...monoFont, fontSize: 12, fontWeight: 700, color: p.roiScore > 500 ? C.green : p.roiScore > 300 ? C.cyan : "#94A3B8" }}>
                      {p.roiScore.toFixed(0)}
                    </span>
                  </div>
                  <div style={{ width: "23%", flexShrink: 0 }}><CategoryBadge cat={cat} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────
const NAV_TABS = [
  { id: 1, label: "Mega Auction Overview" },
  { id: 2, label: "Value & ROI Analysis"  },
  { id: 3, label: "Roster Details"        },
  { id: 4, label: "Value Leaderboard"     },
] as const;

export default function App({ players: propPlayers }: { players?: Player[] }) {
  const [page, setPage]                 = useState<Page>(1);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([...ALL_TEAMS]);
  const [selectedTiers, setSelectedTiers] = useState<Tier[]>([...ALL_TIERS]);

  const dataset = useMemo(() => {
    return propPlayers && propPlayers.length > 0 ? propPlayers : PLAYERS;
  }, [propPlayers]);

  const filteredPlayers = useMemo(() =>
    dataset.filter(p => selectedTeams.includes(p.team) && selectedTiers.includes(p.tier)),
    [dataset, selectedTeams, selectedTiers]
  );

  const filteredTeamTotals = useMemo(() => {
    const spendMap: Record<string, number> = {};
    dataset.forEach(p => {
      spendMap[p.team] = (spendMap[p.team] || 0) + p.price;
    });
    return ALL_TEAMS.map(team => ({
      team,
      totalSpend: spendMap[team] || 0
    })).filter(t => selectedTeams.includes(t.team));
  }, [dataset, selectedTeams]);

  return (
    <div
      style={{
        height: "100%",
        background: C.bg,
        fontFamily: "'Inter', sans-serif",
        color: "#CBD5E1",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          ...glass(C.cyan, 0.1),
          borderRadius: 0,
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          borderBottom: `1px solid rgba(0,212,255,0.15)`,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 32,
          height: 56,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(10,15,30,0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        {/* Logo / Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${C.cyan}30, ${C.gold}30)`,
            border: `1px solid ${C.cyan}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>🏏</div>
          <div>
            <div style={{ ...condensedFont, fontSize: 14, fontWeight: 800, color: "#F1F5F9", letterSpacing: "0.04em", lineHeight: 1.1 }}>
              IPL 2025 Squad Analytics
            </div>
            <div style={{ fontSize: 9, color: "#64748B", letterSpacing: "0.1em" }}>INVESTMENT ANALYTICS DASHBOARD</div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav style={{ display: "flex", gap: 4, flex: 1 }}>
          {NAV_TABS.map(tab => {
            const active = page === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setPage(tab.id as Page)}
                style={{
                  ...condensedFont,
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
                  padding: "6px 16px", borderRadius: 6, cursor: "pointer",
                  border: active ? `1px solid ${C.cyan}60` : "1px solid transparent",
                  background: active ? `${C.cyan}18` : "transparent",
                  color: active ? C.cyan : "#64748B",
                  transition: "all 0.15s",
                  textShadow: active ? `0 0 12px ${C.cyan}80` : "none",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Live badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          <span style={{ ...monoFont, fontSize: 10, color: C.green }}>LIVE DATA</span>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", gap: 16, padding: 16, minHeight: 0, overflow: "hidden" }}>
        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {page === 1 && <Page1 players={filteredPlayers} teamTotals={filteredTeamTotals} />}
          {page === 2 && <Page2 players={filteredPlayers} />}
          {page === 3 && <Page3 players={filteredPlayers} />}
          {page === 4 && <Page4 players={filteredPlayers} />}
        </main>

        {/* Filter sidebar */}
        <aside style={{ flexShrink: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <FilterPanel
            selectedTeams={selectedTeams}
            setSelectedTeams={setSelectedTeams}
            selectedTiers={selectedTiers}
            setSelectedTiers={setSelectedTiers}
            filteredCount={filteredPlayers.length}
            filteredSpend={filteredPlayers.reduce((s, p) => s + p.price, 0)}
            totalCount={dataset.length}
          />
        </aside>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid rgba(0,212,255,0.08)",
        padding: "8px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ ...monoFont, fontSize: 10, color: "#94A3B8" }}>
          IPL 2025 · Squad Investment Analytics · Data reflects auction season results
        </span>
        <span style={{ ...monoFont, fontSize: 10, color: "#94A3B8" }}>
          {filteredPlayers.length} players · {filteredPlayers.reduce((s, p) => s + p.price, 0).toFixed(1)} Cr total
        </span>
      </footer>
    </div>
  );
}
