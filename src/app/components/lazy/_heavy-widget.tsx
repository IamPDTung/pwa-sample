const METRIC_NAMES = [
  "throughput", "latency_ms", "error_rate", "cpu_pct", "memory_mb",
  "disk_iops", "network_mbps", "queue_depth", "active_connections",
  "request_count", "cache_hit_ratio", "gc_pause_ms", "thread_count",
  "db_query_ms", "api_response_ms", "p99_latency", "p50_latency",
  "bytes_processed", "events_per_sec", "batch_size",
];

const SERVER_NAMES = [
  "us-east-1a", "us-east-1b", "us-west-2a", "eu-west-1a",
  "ap-southeast-1a", "ap-northeast-1b", "sa-east-1a",
];

interface MetricRow {
  server: string;
  metric: string;
  min: number;
  max: number;
  avg: number;
  p99: number;
  timestamp: string;
}

function generateMetrics(count: number): MetricRow[] {
  const rows: MetricRow[] = [];
  for (let i = 0; i < count; i++) {
    const base =
      SERVER_NAMES[i % SERVER_NAMES.length].charCodeAt(0) * 10 +
      (i % 100);
    const avg = Math.round((base + Math.random() * 50) * 10) / 10;
    rows.push({
      server: SERVER_NAMES[i % SERVER_NAMES.length],
      metric: METRIC_NAMES[i % METRIC_NAMES.length],
      min: Math.round((avg * 0.6 + Math.random() * 10) * 10) / 10,
      max: Math.round((avg * 1.8 + Math.random() * 30) * 10) / 10,
      avg,
      p99: Math.round((avg * 2.2 + Math.random() * 50) * 10) / 10,
      timestamp: new Date(
        Date.now() - (count - i) * 60000
      ).toISOString(),
    });
  }
  return rows;
}

export default function HeavyWidget() {
  const rows = generateMetrics(100);
  const servers = [...new Set(rows.map((r) => r.server))];
  const metrics = [...new Set(rows.map((r) => r.metric))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Infrastructure Metrics Dashboard
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {rows.length} data points across {servers.length} servers ·{" "}
            {metrics.length} metrics
          </p>
        </div>
        <div className="flex gap-2">
          {["1h", "6h", "24h", "7d"].map((range) => (
            <span
              key={range}
              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                range === "1h"
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {range}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {servers.map((server) => {
          const avg =
            Math.round(
              (rows
                .filter((r) => r.server === server)
                .reduce((s, r) => s + r.avg, 0) /
                (rows.length / servers.length)) *
                10
            ) / 10;
          return (
            <div
              key={server}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3"
            >
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {server}
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {avg}
              </p>
              <p className="text-[10px] text-zinc-400">avg across metrics</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Server
              </th>
              <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Metric
              </th>
              <th className="text-right px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Min
              </th>
              <th className="text-right px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Avg
              </th>
              <th className="text-right px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Max
              </th>
              <th className="text-right px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                P99
              </th>
              <th className="text-right px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-t border-zinc-100 dark:border-zinc-800 ${
                  i % 2 === 0
                    ? "bg-white dark:bg-zinc-950"
                    : "bg-zinc-50/50 dark:bg-zinc-900/50"
                }`}
              >
                <td className="px-3 py-1.5 text-zinc-600 dark:text-zinc-400">
                  {row.server}
                </td>
                <td className="px-3 py-1.5 text-zinc-900 dark:text-zinc-100 font-medium">
                  {row.metric}
                </td>
                <td className="px-3 py-1.5 text-right text-zinc-600 dark:text-zinc-400">
                  {row.min}
                </td>
                <td className="px-3 py-1.5 text-right text-zinc-900 dark:text-zinc-100 font-medium">
                  {row.avg}
                </td>
                <td className="px-3 py-1.5 text-right text-zinc-600 dark:text-zinc-400">
                  {row.max}
                </td>
                <td className="px-3 py-1.5 text-right text-amber-600 dark:text-amber-400 font-medium">
                  {row.p99}
                </td>
                <td className="px-3 py-1.5 text-right text-zinc-400">
                  {new Date(row.timestamp).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Uptime", value: "99.97%", color: "emerald" },
          { label: "Alert", value: "0 active", color: "zinc" },
          { label: "Deploy", value: "v2.4.1", color: "violet" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-3 text-center"
          >
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
