"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type EvolutionPoint = {
  date: string;
  match: string;
  profit: number;
  cumulative: number;
};

export type MarketPoint = {
  name: string;
  total: number;
  won: number;
  roi: number;
};

export type LeaguePoint = {
  name: string;
  total: number;
  hitRate: number;
  roi: number;
};

type StatisticsChartsProps = {
  evolution: EvolutionPoint[];
  markets: MarketPoint[];
  leagues: LeaguePoint[];
};

const tooltipStyle = {
  background: "rgba(8, 13, 21, .96)",
  border: "1px solid rgba(148, 163, 184, .2)",
  borderRadius: "10px",
  color: "#f3f6fb",
  boxShadow: "0 14px 35px rgba(0, 0, 0, .35)",
  fontSize: "12px",
};

const axisTick = { fill: "#778498", fontSize: 11 };

export default function StatisticsCharts({ evolution, markets, leagues }: StatisticsChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="dashboard-charts" aria-hidden="true">
        <div className="chart-card chart-card--wide chart-placeholder" />
        <div className="chart-card chart-placeholder" />
        <div className="chart-card chart-placeholder" />
      </div>
    );
  }

  return (
    <div className="dashboard-charts">
      <article className="chart-card chart-card--wide">
        <div className="chart-card__heading">
          <div>
            <span className="chart-card__kicker">Bankroll</span>
            <h3>Evolución acumulada</h3>
          </div>
          <span className="chart-legend-dot">Beneficio en unidades</span>
        </div>
        <div className="chart-canvas chart-canvas--line" aria-label="Gráfico de evolución acumulada">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolution} margin={{ top: 12, right: 14, left: -12, bottom: 4 }}>
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#4ade80" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148, 163, 184, .09)" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="date" tick={axisTick} axisLine={false} tickLine={false} minTickGap={30} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}u`} />
              <ReferenceLine y={0} stroke="rgba(148, 163, 184, .3)" strokeDasharray="4 4" />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#8f9bad", marginBottom: 6 }}
                formatter={(value) => [`${Number(value).toFixed(2)} u`, "Acumulado"]}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.match ?? label}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="url(#lineGlow)"
                strokeWidth={3}
                dot={{ r: 2.5, fill: "#070b12", stroke: "#4ade80", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#4ade80", stroke: "#d8ffe5", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="chart-card">
        <div className="chart-card__heading">
          <div>
            <span className="chart-card__kicker">Mercados</span>
            <h3>Volumen y aciertos</h3>
          </div>
        </div>
        <div className="chart-canvas" aria-label="Gráfico de rendimiento por mercado">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={markets} margin={{ top: 12, right: 8, left: -20, bottom: 4 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, .09)" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#f3f6fb", marginBottom: 6, fontWeight: 700 }}
                formatter={(value, name, item) => {
                  if (name === "ROI") return [`${Number(value).toFixed(1)}%`, name];
                  const roi = Number(item.payload.roi).toFixed(1);
                  return [`${value} · ROI ${roi}%`, name];
                }}
              />
              <Legend wrapperStyle={{ color: "#8f9bad", fontSize: 11 }} />
              <Bar dataKey="total" name="Picks" fill="#38bdf8" radius={[5, 5, 0, 0]} maxBarSize={42} />
              <Bar dataKey="won" name="Ganados" fill="#4ade80" radius={[5, 5, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="chart-card">
        <div className="chart-card__heading">
          <div>
            <span className="chart-card__kicker">Ligas</span>
            <h3>ROI por competición</h3>
          </div>
          <span className="chart-card__hint">Mayor ROI primero</span>
        </div>
        <div className="chart-canvas" aria-label="Gráfico de rendimiento por liga">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leagues} layout="vertical" margin={{ top: 8, right: 18, left: 4, bottom: 4 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, .09)" strokeDasharray="3 5" horizontal={false} />
              <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="name" width={88} tick={axisTick} axisLine={false} tickLine={false} />
              <ReferenceLine x={0} stroke="rgba(148, 163, 184, .35)" />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "#f3f6fb", marginBottom: 6, fontWeight: 700 }}
                formatter={(value, _name, item) => [
                  `${Number(value).toFixed(1)}% · ${item.payload.total} picks · ${Number(item.payload.hitRate).toFixed(1)}% acierto`,
                  "ROI",
                ]}
              />
              <Bar dataKey="roi" name="ROI" radius={[0, 5, 5, 0]} maxBarSize={24}>
                {leagues.map((league) => (
                  <Cell key={league.name} fill={league.roi >= 0 ? "#4ade80" : "#f87171"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  );
}
