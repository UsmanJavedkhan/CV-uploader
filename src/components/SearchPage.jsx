import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";

const BASE_URL = "https://4d561016c317.ngrok-free.app"; // 🔥 change to backend/ngrok

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(""); // "simple", "semantic", "ai"

  const handleSearch = async (type) => {
    if (!query.trim()) return;

    setLoading(true);
    setMode(type);
    setResults([]);

    try {
      let url;
      if (type === "simple") {
        url = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
      } else if (type === "semantic") {
        url = `${BASE_URL}/semantic-search?q=${encodeURIComponent(query)}`;
      } else {
        url = `${BASE_URL}/ai-job-match?q=${encodeURIComponent(query)}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      console.log("Search result:", data);

      setResults(data.results || []);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Candidate Search</h2>

          {/* Search Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Enter skills, role, or requirement..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
            />
          </div>

          {/* Search Buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleSearch("simple")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Simple Search
            </button>
            <button
              onClick={() => handleSearch("semantic")}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg"
            >
              Semantic Search
            </button>
            <button
              onClick={() => handleSearch("ai")}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              AI Search
            </button>
          </div>

          {/* Loading State */}
          {loading && <p className="text-gray-500">Searching...</p>}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((r, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{r.name}</h3>
                    <p className="text-sm text-gray-600">{r.email}</p>

                    {mode === "simple" && (
                      <>
                        <p className="text-sm">Role: {r.role}</p>
                        <p className="text-sm">
                          Skills: {r.skills?.join(", ")}
                        </p>
                      </>
                    )}

                    {mode === "semantic" && (
                      <>
                        <p className="text-sm">Role: {r.role}</p>
                        <p className="text-sm">
                          Skills: {r.skills?.join(", ")}
                        </p>
                        <p className="text-sm">Similarity: {r.similarity}</p>
                      </>
                    )}

                    {mode === "ai" && (
                      <>
                        <p className="text-sm">Score: {r.score}</p>
                        <p className="text-xs text-gray-500">{r.reason}</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && results.length === 0 && mode && (
            <p className="text-gray-500">No results found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




