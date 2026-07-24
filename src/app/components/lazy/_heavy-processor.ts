interface ProcessResult {
  itemsProcessed: number;
  groupsFound: number;
  topCategories: { name: string; count: number; pct: string }[];
  summary: string;
}

interface DataRecord {
  id: number;
  category: string;
  value: number;
  region: string;
  status: "active" | "inactive" | "pending";
  tags: string[];
}

function generateRecords(count: number): DataRecord[] {
  const categories = [
    "Infrastructure", "Security", "Compliance", "Performance",
    "Reliability", "Cost", "Developer Experience", "Data Engineering",
    "Machine Learning", "Platform",
  ];
  const regions = [
    "us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1",
    "sa-east-1", "ap-northeast-1", "eu-central-1",
  ];
  const tags = [
    "critical", "high-priority", "low-latency", "batch",
    "real-time", "scheduled", "on-demand", "background",
  ];
  const statuses: Array<DataRecord["status"]> = [
    "active", "inactive", "pending",
  ];

  const records: DataRecord[] = [];
  for (let i = 0; i < count; i++) {
    records.push({
      id: i + 1,
      category: categories[i % categories.length],
      value: Math.round((Math.random() * 9500 + 500) * 100) / 100,
      region: regions[i % regions.length],
      status: statuses[i % statuses.length],
      tags: [tags[i % tags.length], tags[(i + 3) % tags.length]],
    });
  }
  return records;
}

export function processLargeData(): ProcessResult {
  const records = generateRecords(50000);

  const byCategory = new Map<string, { count: number; total: number }>();
  let activeCount = 0;
  let inactiveCount = 0;
  let pendingCount = 0;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const existing = byCategory.get(r.category);
    if (existing) {
      existing.count++;
      existing.total += r.value;
    } else {
      byCategory.set(r.category, { count: 1, total: r.value });
    }

    if (r.status === "active") activeCount++;
    else if (r.status === "inactive") inactiveCount++;
    else pendingCount++;
  }

  const total = records.reduce((sum, r) => sum + r.value, 0);
  const sorted = [...byCategory.entries()]
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  return {
    itemsProcessed: records.length,
    groupsFound: byCategory.size,
    topCategories: sorted.map(([name, { count }]) => ({
      name,
      count,
      pct: ((count / records.length) * 100).toFixed(1) + "%",
    })),
    summary: `Processed ${records.length.toLocaleString()} records across ${
      byCategory.size
    } categories. Active: ${activeCount.toLocaleString()}, Inactive: ${inactiveCount.toLocaleString()}, Pending: ${pendingCount.toLocaleString()}. Total value: ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
  };
}
