
import React, { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import {
  MapPin,
  TrendingUp,
  Minus,
  TrendingDown,
  Search,
  X,
} from "lucide-react";

const INDIA_GEO_URL =
  "https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson";

/*
 * Demo sentiment data.
 * These values are currently demo data.
 * They can later be replaced with API/database values.
 */
const sentimentData = [
  { state: "Andhra Pradesh", positive: 72, neutral: 18, negative: 10 },
  { state: "Arunachal Pradesh", positive: 65, neutral: 23, negative: 12 },
  { state: "Assam", positive: 69, neutral: 21, negative: 10 },
  { state: "Bihar", positive: 63, neutral: 25, negative: 12 },
  { state: "Chhattisgarh", positive: 67, neutral: 22, negative: 11 },
  { state: "Goa", positive: 74, neutral: 18, negative: 8 },
  { state: "Gujarat", positive: 70, neutral: 20, negative: 10 },
  { state: "Haryana", positive: 66, neutral: 23, negative: 11 },
  { state: "Himachal Pradesh", positive: 73, neutral: 19, negative: 8 },
  { state: "Jharkhand", positive: 64, neutral: 24, negative: 12 },
  { state: "Karnataka", positive: 70, neutral: 20, negative: 10 },
  { state: "Kerala", positive: 76, neutral: 17, negative: 7 },
  { state: "Madhya Pradesh", positive: 68, neutral: 21, negative: 11 },
  { state: "Maharashtra", positive: 61, neutral: 27, negative: 12 },
  { state: "Odisha", positive: 69, neutral: 21, negative: 10 },
  { state: "Punjab", positive: 68, neutral: 22, negative: 10 },
  { state: "Rajasthan", positive: 65, neutral: 24, negative: 11 },
  { state: "Tamil Nadu", positive: 64, neutral: 25, negative: 11 },
  { state: "Telangana", positive: 68, neutral: 22, negative: 10 },
  { state: "Uttar Pradesh", positive: 62, neutral: 26, negative: 12 },
];

/*
 * Normalize state names so that GeoJSON names
 * and our sentiment data can be compared safely.
 */
const normalize = (value = "") =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ")
    .trim();

/*
 * Some GeoJSON datasets use slightly different names.
 */
const STATE_NAME_ALIASES = {
  orissa: "odisha",
  pondicherry: "puducherry",
  "nct of delhi": "delhi",
  "delhi nct": "delhi",
  "uttaranchal": "uttarakhand",
};

/*
 * Get a consistent state key.
 */
const getStateKey = (name = "") => {
  const normalized = normalize(name);
  return STATE_NAME_ALIASES[normalized] || normalized;
};

export default function SentimentMap() {
  const [selectedState, setSelectedState] = useState(null);
  const [search, setSearch] = useState("");

  /*
   * Convert sentimentData into a lookup map.
   *
   * IMPORTANT:
   * useMemo must be INSIDE the component.
   */
  const dataMap = useMemo(() => {
    const map = {};

    sentimentData.forEach((item) => {
      map[getStateKey(item.state)] = item;
    });

    return map;
  }, []);

  /*
   * Color based on positive sentiment.
   */
  const getStateColor = (data) => {
    if (!data) {
      return "#334155";
    }

    if (data.positive >= 74) {
      return "#16a34a";
    }

    if (data.positive >= 70) {
      return "#22c55e";
    }

    if (data.positive >= 68) {
      return "#84cc16";
    }

    if (data.positive >= 65) {
      return "#eab308";
    }

    if (data.positive >= 63) {
      return "#f97316";
    }

    return "#ef4444";
  };

  /*
   * Search states.
   */
  const filteredStates = sentimentData.filter((item) =>
    item.state.toLowerCase().includes(search.toLowerCase())
  );

  /*
   * Get sentiment data for a GeoJSON state.
   */
  const getGeoState = (geo) => {
    const name =
      geo.properties?.ST_NM ||
      geo.properties?.NAME_1 ||
      geo.properties?.NAME ||
      geo.properties?.name ||
      "";

    return {
      name,
      data: dataMap[getStateKey(name)],
    };
  };

  /*
   * Calculate overall sentiment from the current data.
   */
  const totalPositive = Math.round(
    sentimentData.reduce((sum, item) => sum + item.positive, 0) /
      sentimentData.length
  );

  const totalNeutral = Math.round(
    sentimentData.reduce((sum, item) => sum + item.neutral, 0) /
      sentimentData.length
  );

  const totalNegative = Math.round(
    sentimentData.reduce((sum, item) => sum + item.negative, 0) /
      sentimentData.length
  );

  /*
   * Dynamic insights.
   */
  const strongestPositive = [...sentimentData].sort(
    (a, b) => b.positive - a.positive
  )[0];

  const highestNeutral = [...sentimentData].sort(
    (a, b) => b.neutral - a.neutral
  )[0];

  const highestNegative = [...sentimentData].sort(
    (a, b) => b.negative - a.negative
  )[0];

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="mb-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet/30 bg-violet/15 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <MapPin className="h-5 w-5 text-violet" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-text">
              Sentiment Map
            </h1>

            <p className="mt-1 text-sm text-text-dim">
              Visualize audience sentiment across India.
            </p>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Positive */}
        <div className="rounded-2xl border border-green-500/20 bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-dim">
                Positive
              </p>

              <p className="mt-2 text-3xl font-bold text-green-500">
                {totalPositive}%
              </p>
            </div>

            <div className="rounded-xl bg-green-500/10 p-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </div>

          <p className="mt-2 text-xs text-text-dim">
            Overall positive sentiment
          </p>
        </div>

        {/* Neutral */}
        <div className="rounded-2xl border border-yellow-500/20 bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-dim">
                Neutral
              </p>

              <p className="mt-2 text-3xl font-bold text-yellow-500">
                {totalNeutral}%
              </p>
            </div>

            <div className="rounded-xl bg-yellow-500/10 p-3">
              <Minus className="h-5 w-5 text-yellow-500" />
            </div>
          </div>

          <p className="mt-2 text-xs text-text-dim">
            Neutral audience responses
          </p>
        </div>

        {/* Negative */}
        <div className="rounded-2xl border border-red-500/20 bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-dim">
                Negative
              </p>

              <p className="mt-2 text-3xl font-bold text-red-500">
                {totalNegative}%
              </p>
            </div>

            <div className="rounded-xl bg-red-500/10 p-3">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </div>

          <p className="mt-2 text-xs text-text-dim">
            Negative audience responses
          </p>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* INDIA MAP */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm xl:col-span-2">
          {/* MAP HEADER */}
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text">
                India Sentiment
              </h2>

              <p className="mt-1 text-sm text-text-dim">
                State colors represent positive sentiment intensity.
              </p>
            </div>

            <select className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text outline-none">
              <option>All Campaigns</option>
              <option>Awareness</option>
              <option>Information</option>
              <option>Emergency</option>
            </select>
          </div>

          {/* MAP */}
          <div className="relative min-h-[560px] overflow-hidden bg-gradient-to-br from-violet-500/5 via-surface-alt to-blue-500/5">
            {/* Background glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />

            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: [82.8, 22.5],
                scale: 1050,
              }}
              width={800}
              height={650}
              className="relative z-10 h-full w-full"
            >
              <Geographies geography={INDIA_GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const { name, data } = getGeoState(geo);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => {
                          if (data) {
                            setSelectedState({
                              ...data,
                              state: name,
                            });
                          }
                        }}
                        style={{
                          default: {
                            fill: getStateColor(data),
                            stroke: "#ffffff",
                            strokeWidth: 0.8,
                            outline: "none",
                          },

                          hover: {
                            fill: "#8b5cf6",
                            stroke: "#ffffff",
                            strokeWidth: 2,
                            outline: "none",
                            cursor: "pointer",
                            filter:
                              "drop-shadow(0px 0px 6px rgba(139,92,246,0.7))",
                          },

                          pressed: {
                            fill: "#6d28d9",
                            stroke: "#ffffff",
                            strokeWidth: 2,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>

            {/* STATE POPUP */}
            {selectedState && (
              <div className="absolute bottom-5 left-5 z-20 w-72 rounded-2xl border border-violet/30 bg-surface/95 p-5 shadow-2xl backdrop-blur">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-text-dim">
                      Selected State
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-text">
                      {selectedState.state}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedState(null)}
                    className="rounded-lg p-1 text-text-dim transition hover:bg-surface-alt hover:text-text"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Positive */}
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>Positive</span>

                      <strong className="text-green-500">
                        {selectedState.positive}%
                      </strong>
                    </div>

                    <div className="h-2 rounded-full bg-green-500/10">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{
                          width: `${selectedState.positive}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Neutral */}
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>Neutral</span>

                      <strong className="text-yellow-500">
                        {selectedState.neutral}%
                      </strong>
                    </div>

                    <div className="h-2 rounded-full bg-yellow-500/10">
                      <div
                        className="h-full rounded-full bg-yellow-500"
                        style={{
                          width: `${selectedState.neutral}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Negative */}
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>Negative</span>

                      <strong className="text-red-500">
                        {selectedState.negative}%
                      </strong>
                    </div>

                    <div className="h-2 rounded-full bg-red-500/10">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{
                          width: `${selectedState.negative}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LEGEND */}
          <div className="border-t border-border p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-dim">
              Positive Sentiment Intensity
            </div>

            <div className="flex h-4 overflow-hidden rounded-full">
              <div className="flex-1 bg-red-500" />
              <div className="flex-1 bg-orange-500" />
              <div className="flex-1 bg-yellow-500" />
              <div className="flex-1 bg-lime-500" />
              <div className="flex-1 bg-green-500" />
            </div>

            <div className="mt-2 flex justify-between text-[11px] text-text-dim">
              <span>Lower</span>
              <span>Moderate</span>
              <span>Higher</span>
            </div>
          </div>
        </div>

        {/* STATE LIST */}
        <div className="rounded-2xl border border-border bg-surface shadow-sm">
          <div className="border-b border-border p-5">
            <h2 className="text-lg font-semibold text-text">
              State Breakdown
            </h2>

            <p className="mt-1 text-sm text-text-dim">
              Select a state to inspect sentiment.
            </p>

            {/* Search */}
            <div className="relative mt-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search state..."
                className="w-full rounded-lg border border-border bg-surface-alt py-2 pl-9 pr-3 text-sm text-text outline-none placeholder:text-text-dim focus:border-violet"
              />
            </div>
          </div>

          <div className="max-h-[560px] space-y-2 overflow-y-auto p-4">
            {filteredStates.length > 0 ? (
              filteredStates.map((item) => (
                <button
                  key={item.state}
                  onClick={() =>
                    setSelectedState({
                      ...item,
                      state: item.state,
                    })
                  }
                  className="w-full rounded-xl border border-transparent p-3 text-left transition hover:border-violet/30 hover:bg-surface-alt"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text">
                      {item.state}
                    </span>

                    <span
                      className="text-sm font-bold"
                      style={{
                        color: getStateColor(item),
                      }}
                    >
                      {item.positive}%
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-alt">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${item.positive}%`,
                        backgroundColor: getStateColor(item),
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[11px] text-text-dim">
                    <span>
                      Neutral {item.neutral}%
                    </span>

                    <span>
                      Negative {item.negative}%
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-text-dim">
                No state found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          Sentiment Insights
        </h2>

        <p className="mt-1 text-sm text-text-dim">
          Highlights from the current sentiment distribution.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Strongest Positive */}
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-500">
              Strongest Positive
            </p>

            <p className="mt-2 text-lg font-bold text-text">
              {strongestPositive.state}
            </p>

            <p className="mt-1 text-xs text-text-dim">
              {strongestPositive.positive}% positive sentiment
            </p>
          </div>

          {/* Highest Neutral */}
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-yellow-500">
              Highest Neutral
            </p>

            <p className="mt-2 text-lg font-bold text-text">
              {highestNeutral.state}
            </p>

            <p className="mt-1 text-xs text-text-dim">
              {highestNeutral.neutral}% neutral sentiment
            </p>
          </div>

          {/* Highest Negative */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
              Highest Negative
            </p>

            <p className="mt-2 text-lg font-bold text-text">
              {highestNegative.state}
            </p>

            <p className="mt-1 text-xs text-text-dim">
              {highestNegative.negative}% negative sentiment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

