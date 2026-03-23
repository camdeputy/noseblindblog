import { NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { enforceRateLimit } from "@/lib/rateLimit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await enforceRateLimit(request, "admin_write");
  if (rateLimitResponse) return rateLimitResponse;

  const { id } = await params;
  const supabase = createAdminSupabase();

  const { error } = await supabase
    .from("fragrance_concentrations")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
