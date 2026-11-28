import { cookies } from "next/headers";

export type Locale = "en" | "id";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return cookieStore.get("mw_locale")?.value === "id" ? "id" : "en";
}
