"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// --- BUG FIX: Add checks to ensure environment variables are loaded correctly ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only initialize Supabase if the keys are provided
let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If Supabase isn't initialized, we can't fetch data.
    if (!supabase) {
      setError(
        "Supabase URL or Anon Key is missing. Please check your .env.local file."
      );
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        setError(error.message);
      } else {
        setEvents(data);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const metrics = useMemo(() => {
    if (events.length === 0) return {};
    const coreActions = events.filter(
      (e) => e.event_name === "core_action_taken"
    );
    const sessionEnds = events.filter(
      (e) =>
        e.event_name === "session_end" && e.properties.session_length_seconds
    );
    const sessionStarts = events.filter(
      (e) => e.event_name === "session_start"
    ).length;
    const totalSessionTime = sessionEnds.reduce(
      (sum, e) => sum + e.properties.session_length_seconds,
      0
    );

    return {
      sessionStarts,
      gameStarts: coreActions.filter((e) => e.properties.action === "game")
        .length,
      solutionRequests: coreActions.filter(
        (e) => e.properties.action === "solution"
      ).length,
      imageUploads: coreActions.filter(
        (e) => e.properties.input_type === "image"
      ).length,
      textInputs: coreActions.filter((e) => e.properties.input_type === "text")
        .length,
      avgSessionTimeSeconds:
        sessionStarts > 0 ? (totalSessionTime / sessionStarts).toFixed(2) : 0,
    };
  }, [events]);

  // Add a specific error message if the client failed to initialize
  if (!supabase) {
    return (
      <div className="p-8 font-sans text-red-500">
        <h1 className="text-xl font-bold">Configuration Error</h1>
        <p>
          Supabase URL or Anon Key is missing. Please check your{" "}
          <strong>.env.local</strong> file and ensure NEXT_PUBLIC_SUPABASE_URL
          and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly.
        </p>
      </div>
    );
  }

  if (loading) return <div className="p-8 font-sans">Loading Dashboard...</div>;
  if (error)
    return <div className="p-8 font-sans text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">
          The GOAT AI - Admin Dashboard
        </h1>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Total Sessions
            </h3>
            <p className="mt-2 text-3xl font-bold">{metrics.sessionStarts}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Game vs Solution
            </h3>
            <p className="mt-2 text-3xl font-bold">
              {metrics.gameStarts} / {metrics.solutionRequests}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Image vs Text</h3>
            <p className="mt-2 text-3xl font-bold">
              {metrics.imageUploads} / {metrics.textInputs}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Avg. Session (sec)
            </h3>
            <p className="mt-2 text-3xl font-bold">
              {metrics.avgSessionTimeSeconds}
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-700">
            Recent Events Log
          </h2>
          <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Event Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Properties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.event_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <pre className="bg-gray-100 p-2 rounded text-xs">
                          {JSON.stringify(event.properties, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
