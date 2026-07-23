export interface Item {
  id: string;
  title: string;
  status: "active" | "inactive" | "draft";
  createdAt: string;
}

const store: Item[] = [
  { id: "1", title: "Design new landing page", status: "active", createdAt: "2026-07-20" },
  { id: "2", title: "Fix login redirect bug", status: "inactive", createdAt: "2026-07-19" },
  { id: "3", title: "Write API documentation", status: "draft", createdAt: "2026-07-18" },
  { id: "4", title: "Add dark mode toggle", status: "active", createdAt: "2026-07-21" },
  { id: "5", title: "Optimize image loading", status: "draft", createdAt: "2026-07-17" },
  { id: "6", title: "Set up CI/CD pipeline", status: "inactive", createdAt: "2026-07-16" },
  { id: "7", title: "Implement search autocomplete", status: "active", createdAt: "2026-07-22" },
  { id: "8", title: "Review PR #42", status: "draft", createdAt: "2026-07-15" },
];

let nextId = 9;

export function getItems(): Item[] {
  return [...store].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addItem(data: { title: string; status: Item["status"] }): Item {
  const item: Item = {
    id: String(nextId++),
    title: data.title,
    status: data.status,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  store.push(item);
  return item;
}

export function updateItem(id: string, data: Partial<Pick<Item, "title" | "status">>): Item | null {
  const idx = store.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  store[idx] = { ...store[idx], ...data };
  return store[idx];
}

export function deleteItem(id: string): boolean {
  const idx = store.findIndex((i) => i.id === id);
  if (idx === -1) return false;
  store.splice(idx, 1);
  return true;
}
