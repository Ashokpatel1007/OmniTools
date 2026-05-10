import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

export function createSupabaseServerClient() {
  // next/headers cookies() in Next App Router can be sync, but Supabase SSR expects cookie API
  // We defensively support both shapes via awaiting when needed.
  const cookieStore = cookies();
  const getCookieApi = async () => {
    const resolved = await cookieStore;
    return resolved;
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        async get(name: string) {
          const api = await getCookieApi();
          return api.get(name)?.value;
        },
        async set(name: string, value: string, options: CookieOptions) {
          const api = await getCookieApi();
          api.set({ name, value, ...options });
        },
        async remove(name: string, options: CookieOptions) {
          const api = await getCookieApi();
          api.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );
}


