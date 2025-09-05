import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with the Service Role Key for secure server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const { eventName, properties } = await request.json();

    if (!eventName) {
      return NextResponse.json(
        { error: "Event name is required." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("events")
      .insert([{ event_name: eventName, properties: properties }]);

    if (error) throw error;

    return NextResponse.json(
      { message: "Event tracked successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error tracking event:", error.message);
    return NextResponse.json(
      { error: "Failed to track event.", details: error.message },
      { status: 500 }
    );
  }
}
