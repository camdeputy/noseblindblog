import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const rateLimitResponse = await enforceRateLimit(request, "public_read");
  if (rateLimitResponse) return rateLimitResponse;

  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("fragrances")
    .select("id,name,rating,price_cents,currency")
    .order("name", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(data ?? []);
}
