export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
}

export const API_KEYS: ApiKey[] = [
  { id: "key-1", name: "Storefront (production)", prefix: "bsk_live_4f2a", scopes: ["read:products", "read:categories"], createdAt: "2026-02-01T09:00:00Z", lastUsedAt: "2026-07-19T13:00:00Z" },
  { id: "key-2", name: "Supplier sync service", prefix: "bsk_live_91c7", scopes: ["write:products", "write:inventory"], createdAt: "2026-01-15T09:00:00Z", lastUsedAt: "2026-07-19T12:40:00Z" },
  { id: "key-3", name: "Analytics export (staging)", prefix: "bsk_test_2e88", scopes: ["read:orders", "read:analytics"], createdAt: "2026-05-10T09:00:00Z", lastUsedAt: "2026-06-30T08:00:00Z" },
];
