import { createBrowserClient } from "@supabase/ssr";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side Supabase instance (singleton)
export function createClient() {
  return createBrowserClient(url, key);
}

// Types
export type ReadingType = "astrology" | "tarot";

export type Reading = {
  id: string;
  user_id: string;
  type: ReadingType;
  category: string | null;
  topic: string | null;
  birth_date: string | null;
  birth_time: string | null;
  province: string | null;
  answer: string | null;
  chart: Record<string, unknown> | null;
  spread: Record<string, unknown> | null;
  created_at: string;
};
