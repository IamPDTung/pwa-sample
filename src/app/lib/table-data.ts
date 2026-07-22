export interface RowData {
  id: number;
  name: string;
  email: string;
  age: number;
  city: string;
  country: string;
  status: string;
  joinDate: string;
  revenue: number;
}

export interface CursorPayload {
  id: number;
}

export interface TableResponse {
  rows: RowData[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const COLUMN_KEYS = [
  "id",
  "name",
  "email",
  "age",
  "city",
  "country",
  "status",
  "joinDate",
  "revenue",
] as const;

export type ColumnKey = (typeof COLUMN_KEYS)[number];

const FIRST_NAMES = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan",
  "Sophia", "Mason", "Isabella", "James", "Mia", "Lucas",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones",
  "Garcia", "Miller", "Davis", "Martinez", "Anderson",
];

const CITIES = [
  "New York", "London", "Tokyo", "Paris", "Berlin",
  "Sydney", "Dubai", "Singapore", "Toronto", "Seoul",
  "Mumbai", "Amsterdam",
];

const COUNTRIES = [
  "USA", "UK", "Japan", "France", "Germany",
  "Australia", "UAE", "Singapore", "Canada",
  "South Korea", "India", "Netherlands",
];

const STATUSES = ["Active", "Inactive", "Pending"];

export function generateRow(id: number): RowData {
  return {
    id,
    name: `${FIRST_NAMES[id % FIRST_NAMES.length]} ${LAST_NAMES[id % LAST_NAMES.length]}`,
    email: `user${id}@example.com`,
    age: 18 + (id % 55),
    city: CITIES[id % CITIES.length],
    country: COUNTRIES[id % COUNTRIES.length],
    status: STATUSES[id % STATUSES.length],
    joinDate: new Date(Date.UTC(2020, (id * 7) % 12, (id % 28) + 1))
      .toISOString()
      .slice(0, 10),
    revenue: Math.round(((id * 137) % 10000) / 100) * 100,
  };
}
