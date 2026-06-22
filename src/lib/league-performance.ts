import resultsData from "../../public/data/public_results.json";

type HistoricalResult = {
  liga: string;
  cuota: number;
  estado: string;
};

export type LeaguePerformance = {
  league: string;
  slug: string;
  resolved: number;
  won: number;
  lost: number;
  hitRate: number | null;
  roi: number;
  profit: number;
};

const historicalResults = resultsData as HistoricalResult[];

export function leagueToSlug(league: string) {
  return league
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeStatus(status: string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "acertado") return "won";
  if (normalized === "fallado") return "lost";
  return normalized;
}

export function getLeaguePerformances(): LeaguePerformance[] {
  const groups = new Map<string, HistoricalResult[]>();

  for (const result of historicalResults) {
    const group = groups.get(result.liga) ?? [];
    group.push(result);
    groups.set(result.liga, group);
  }

  return Array.from(groups, ([league, results]) => {
    const won = results.filter((result) => normalizeStatus(result.estado) === "won").length;
    const lost = results.filter((result) => normalizeStatus(result.estado) === "lost").length;
    const decided = won + lost;
    const profit = results.reduce((total, result) => {
      const status = normalizeStatus(result.estado);
      if (status === "won") return total + result.cuota - 1;
      if (status === "lost") return total - 1;
      return total;
    }, 0);

    return {
      league,
      slug: leagueToSlug(league),
      resolved: results.length,
      won,
      lost,
      hitRate: decided > 0 ? (won / decided) * 100 : null,
      roi: results.length > 0 ? (profit / results.length) * 100 : 0,
      profit,
    };
  }).sort((a, b) => b.resolved - a.resolved || a.league.localeCompare(b.league, "es"));
}

export function getLeaguePerformance(slug: string) {
  return getLeaguePerformances().find((league) => league.slug === slug);
}
