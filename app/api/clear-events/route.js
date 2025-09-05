import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with the Service Role Key for secure server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    // The service role key bypasses RLS, allowing this query to delete all rows.
    const { error } = await supabase
      .from("events")
      .delete()
      .neq("event_name", "this-will-delete-everything"); // A dummy condition to delete all rows

    if (error) throw error;

    return NextResponse.json(
      { message: "All events cleared successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing events:", error.message);
    return NextResponse.json(
      { error: "Failed to clear events.", details: error.message },
      { status: 500 }
    );
  }
}

