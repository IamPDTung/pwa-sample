export interface LazyItem {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

const adjectives = [
  "Smart", "Fast", "Secure", "Scalable", "Robust", "Flexible", "Modern",
  "Elegant", "Powerful", "Intuitive", "Dynamic", "Reliable", "Advanced",
  "Efficient", "Innovative", "Streamlined", "Optimized", "Responsive",
  "Adaptive", "Lightweight",
];

const nouns = [
  "Dashboard", "Analytics", "Pipeline", "Workflow", "Engine", "Service",
  "Module", "Connector", "Gateway", "Platform", "Framework", "System",
  "Component", "Interface", "Repository", "Controller", "Middleware",
  "Resolver", "Validator", "Transformer",
];

const descriptions = [
  "Handles real-time data processing with low latency and high throughput.",
  "Provides seamless integration between distributed services.",
  "Monitors system health and sends alerts on anomaly detection.",
  "Manages user authentication and role-based access control.",
  "Optimizes resource allocation across cloud infrastructure.",
  "Transforms raw data into actionable business intelligence.",
  "Coordinates multi-step workflows with retry and rollback support.",
  "Aggregates metrics from multiple sources for unified reporting.",
  "Enforces data validation rules at the API gateway level.",
  "Caches frequently accessed data to reduce database load.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateLazyItems(count: number): LazyItem[] {
  const items: LazyItem[] = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      id: i,
      title: `${pick(adjectives)} ${pick(nouns)}`,
      description: pick(descriptions),
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)
      )
        .toISOString()
        .split("T")[0],
    });
  }
  return items;
}

export const TOTAL_ITEMS = 200;
