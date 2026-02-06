import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Encryption not configured" },
      { status: 500 }
    );
  }

  return NextResponse.json({ key });
}
