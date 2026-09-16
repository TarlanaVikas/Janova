

import { useEffect, useState } from "react";
import { getBulletins } from "../services/bulletinService";

const PRIORITY_STYLES = {
  Low: "text-teal border-teal/30 bg-teal/10",
  Medium: "text-signal border-signal/30 bg-signal/10",
  High: "text-violet border-violet/30 bg-violet/10",
  Critical: "text-danger border-danger/30 bg-danger/10",
};

const CATEGORY_STYLES = {
  Announcement: "text-signal border-signal/30 bg-signal/10",
  Emergency: "text-danger border-danger/30 bg-danger/10",
  Awareness: "text-teal border-teal/30 bg-teal/10",
  Education: "text-violet border-violet/30 bg-violet/10",
};

export default function PublicBulletins() {
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBulletins = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBulletins();

        const liveBulletins = Array.isArray(data)
          ? data.filter((bulletin) => bulletin.status === "Live")
          : [];

        setBulletins(liveBulletins);
      } catch (err) {
        console.error("Error loading public bulletins:", err);
        setError("Unable to load live bulletins.");
      } finally {
        setLoading(false);
      }
    };

    loadBulletins();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text">

      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-8">

          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold">
              Live Bulletins
            </h1>

            <span className="ai-badge">
              Real-Time Alerts
            </span>
          </div>

          <p className="text-text-dim mt-2">
            Latest public announcements, alerts and important
            awareness updates from Janova.
          </p>

        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-8 py-10">

        {loading && (
          <div className="ai-card p-10 text-center">
            <p className="text-text-dim">
              Loading live bulletins...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="ai-card p-8 text-center">
            <p className="text-danger">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && bulletins.length === 0 && (
          <div className="ai-gradient-border p-12 text-center">

            <div className="text-4xl mb-4">
              📢
            </div>

            <h2 className="font-display text-xl font-semibold">
              No Live Bulletins
            </h2>

            <p className="text-text-dim text-sm mt-2">
              There are currently no active public bulletins.
              Please check again later.
            </p>

          </div>
        )}

        {!loading && !error && bulletins.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {bulletins.map((bulletin) => (
              <article
                key={bulletin.id}
                className="ai-gradient-border p-6 hover:border-violet/40 transition"
              >

                {/* Header */}
                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <h2 className="font-display text-xl font-semibold break-words">
                      {bulletin.title}
                    </h2>

                    <div className="flex flex-wrap gap-2 mt-3">

                      <span
                        className={`
                          text-[10px]
                          px-2
                          py-1
                          rounded-full
                          border
                          ${
                            CATEGORY_STYLES[bulletin.category] ||
                            "text-text-dim border-border bg-surface-alt"
                          }
                        `}
                      >
                        {bulletin.category}
                      </span>

                      <span
                        className={`
                          text-[10px]
                          px-2
                          py-1
                          rounded-full
                          border
                          ${
                            PRIORITY_STYLES[bulletin.priority] ||
                            "text-text-dim border-border bg-surface-alt"
                          }
                        `}
                      >
                        {bulletin.priority} Priority
                      </span>

                    </div>

                  </div>

                  {/* LIVE STATUS */}
                  <span
                    className="
                      shrink-0
                      text-[10px]
                      px-2
                      py-1
                      rounded-full
                      border
                      text-teal
                      border-teal/30
                      bg-teal/10
                      font-medium
                    "
                  >
                    ● LIVE
                  </span>

                </div>

                {/* Content */}
                <div
                  className="
                    bg-surface-alt/50
                    border
                    border-border
                    rounded-lg
                    p-4
                    mt-5
                  "
                >
                  <p className="text-sm leading-relaxed text-text-dim">
                    {bulletin.content}
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 text-xs">

                  <div>
                    <span className="text-text-dim">
                      Target Location
                    </span>

                    <p className="text-text mt-1">
                      {bulletin.target_location || "All locations"}
                    </p>
                  </div>

                  <div>
                    <span className="text-text-dim">
                      Languages
                    </span>

                    <p className="text-text mt-1">
                      {bulletin.languages || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <span className="text-text-dim">
                      Channels
                    </span>

                    <p className="text-text mt-1">
                      {bulletin.channels || "Not specified"}
                    </p>
                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}

