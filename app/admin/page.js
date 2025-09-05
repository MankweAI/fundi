"use client";
import { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;
let initializationError = null;
try {
  if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
    throw new Error(
      "Supabase URL is missing or invalid. Please check your environment variables."
    );
  }
  if (!supabaseAnonKey) {
    throw new Error(
      "Supabase Anon Key is missing. Please check your environment variables."
    );
  }
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  initializationError = error.message;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(initializationError);
  const [clearing, setClearing] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) setError(error.message);
    else setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!initializationError) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, []);

  const handleClearEvents = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL event data? This action cannot be undone."
      )
    ) {
      setClearing(true);
      try {
        const response = await fetch("/api/clear-events", { method: "POST" });
        if (!response.ok) throw new Error("Failed to clear events.");
        await fetchEvents(); // Refresh data after clearing
      } catch (err) {
        setError(err.message);
      } finally {
        setClearing(false);
      }
    }
  };

  const metrics = useMemo(() => {
    if (events.length === 0) return {};
    const coreActions = events.filter(
      (e) => e.event_name === "core_action_taken"
    );
    const sessionStarts = events.filter(
      (e) => e.event_name === "session_start"
    ).length;
    const gameStarts = coreActions.filter(
      (e) => e.properties.action === "game"
    ).length;
    const gameCompletions = events.filter(
      (e) => e.event_name === "game_complete"
    );
    const playAgainClicks = events.filter(
      (e) => e.event_name === "play_again_clicked"
    ).length;

    const topQuestions = gameCompletions.reduce((acc, event) => {
      const id = event.properties?.question_id || "unknown";
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    return {
      sessionStarts,
      gameStarts,
      solutionRequests: coreActions.filter(
        (e) => e.properties.action === "solution"
      ).length,
      imageUploads: coreActions.filter(
        (e) => e.properties.input_type === "image"
      ).length,
      textInputs: coreActions.filter((e) => e.properties.input_type === "text")
        .length,
      conversionRate:
        sessionStarts > 0 ? ((gameStarts / sessionStarts) * 100).toFixed(1) : 0,
      packPlays: gameCompletions.filter((e) => e.properties?.pack_id).length,
      playAgainRate:
        gameCompletions.length > 0
          ? ((playAgainClicks / gameCompletions.length) * 100).toFixed(1)
          : 0,
      topPlayedQuestions: Object.entries(topQuestions)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }, [events]);

  if (error) {
    /* Error UI remains the same */
  }
  if (loading) return <div className="p-8 font-sans">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            The GOAT AI - Admin Dashboard
          </h1>
          <button
            onClick={handleClearEvents}
            disabled={clearing}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {clearing ? "Clearing..." : "Clear All Events"}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Total Sessions
            </h3>
            <p className="mt-2 text-3xl font-bold">
              {metrics.sessionStarts || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Game Starts</h3>
            <p className="mt-2 text-3xl font-bold">{metrics.gameStarts || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Solution Requests
            </h3>
            <p className="mt-2 text-3xl font-bold">
              {metrics.solutionRequests || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Conversion Rate
            </h3>
            <p className="mt-2 text-3xl font-bold">
              {metrics.conversionRate || 0}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Image vs Text</h3>
            <p className="mt-2 text-3xl font-bold">
              {metrics.imageUploads || 0} / {metrics.textInputs || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pack Plays</h3>
            <p className="mt-2 text-3xl font-bold">{metrics.packPlays || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">
              &ldquo;Play Again&rdquo; Rate
            </h3>
            <p className="mt-2 text-3xl font-bold">
              {metrics.playAgainRate || 0}%
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-700">
              Recent Events Log
            </h2>
            <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {/* Table remains the same */}
                </table>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-700">
              Top Played Questions
            </h2>
            <div className="mt-4 bg-white shadow rounded-lg p-4">
              <ul className="divide-y divide-gray-200">
                {metrics.topPlayedQuestions &&
                  metrics.topPlayedQuestions.map(([id, count]) => (
                    <li key={id} className="py-3">
                      <p className="text-sm font-medium text-gray-800 break-all">
                        {id}
                      </p>
                      <p className="text-sm text-gray-500">{count} plays</p>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
