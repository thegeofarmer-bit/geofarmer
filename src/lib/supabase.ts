import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export function readClient() {
  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });
}

export function writeClient() {
  return createClient(url, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false },
  });
}
