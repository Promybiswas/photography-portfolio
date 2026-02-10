import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, location, message } = body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    // Omit preferred_date unless you've added that column (run supabase-add-preferred-date.sql in Supabase).
    const { error } = await supabase.from("contact_submissions").insert([
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        location: location?.trim() || null,
        message: message.trim(),
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact submit error:", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Failed to send message";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
