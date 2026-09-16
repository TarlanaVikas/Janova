import React, { useEffect, useMemo, useState, useCallback } from 'react'
import api from '../services/api'

const SENTIMENT_META = {
  positive: { label: 'Positive', color: 'text-green-500 bg-green-500/10 border-green-500/20', bar: 'bg-green-500' },
  neutral: { label: 'Neutral', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', bar: 'bg-yellow-500' },
  negative: { label: 'Negative', color: 'text-red-500 bg-red-500/10 border-red-500/20', bar: 'bg-red-500' },
}

const EVENT_GLYPH = {
  open: '👁',
  click: '🖱',
  response: '↩',
  feedback: '💬',
}

const AUTO_REFRESH_MS = 10000

export default function EngagementMonitoring() {
  const [overview, setOverview] = useState(null)
  const [feedbackData, setFeedbackData] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [campaignId, setCampaignId] = useState('')
  const [campaignAnalytics, setCampaignAnalytics] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/campaigns').then((res) => setCampaigns(res.data)).catch(() => {})
  }, [])

  const loadOverview = useCallback(() => {
    setLoading(true)
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/feedback'),
    ])
      .then(([ov, fb]) => {
        setOverview(ov.data)
        setFeedbackData(fb.data)
      })
      .catch((err) => console.error('Failed to load engagement data:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadOverview()
  }, [loadOverview])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(loadOverview, AUTO_REFRESH_MS)
    return () => clearInterval(interval)
  }, [autoRefresh, loadOverview])

  useEffect(() => {
    if (!campaignId) {
      setCampaignAnalytics(null)
      return
    }
    api
      .get(`/analytics/campaign/${campaignId}`)
      .then((res) => setCampaignAnalytics(res.data))
      .catch(() => setCampaignAnalytics(null))
  }, [campaignId])

  const feedback = feedbackData?.feedback || []
  const sentimentTotals = feedbackData?.sentiment_totals || { positive: 0, neutral: 0, negative: 0 }
  const totalSentiment =
    sentimentTotals.positive + sentimentTotals.neutral + sentimentTotals.negative

  // Recent activity feed: opens/clicks come from overview only in aggregate,
  // so the richest per-event stream we have is the feedback/response events.
  const recentEvents = useMemo(
    () => feedback.slice(0, 12),
    [feedback]
  )

  const engagementScore = useMemo(() => {
    if (!overview) return 0
    // Weighted engagement index: opens count for less than clicks
    return Math.round(overview.open_rate * 0.4 + overview.click_rate * 0.6)
  }, [overview])

  if (!overview) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-violet/10 border border-violet/20 text-violet text-xl">
            ✦
          </div>
          <p className="text-text-dim text-sm">Loading engagement data…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* HEADER */}
      <header className="mb-7 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-2xl font-semibold">Engagement Monitoring</h1>
            <span className="ai-badge">Live</span>
          </div>
          <p className="text-text-dim text-sm">
            Opens, clicks, responses and sentiment across every campaign — updated as recipients interact.
          </p>
        </div>

        <label className="flex items-center gap-2 text-xs text-text-dim cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="accent-violet"
          />
          Auto-refresh every {AUTO_REFRESH_MS / 1000}s
        </label>
      </header>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="ai-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-text-dim">Open Rate</p>
          <p className="font-display text-2xl font-semibold mt-1 text-signal">{overview.open_rate}%</p>
          <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden mt-2">
            <div className="h-full bg-signal rounded-full transition-all duration-700" style={{ width: `${Math.min(overview.open_rate, 100)}%` }} />
          </div>
        </div>

        <div className="ai-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-text-dim">Click Rate</p>
          <p className="font-display text-2xl font-semibold mt-1 text-violet">{overview.click_rate}%</p>
          <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden mt-2">
            <div className="h-full bg-violet rounded-full transition-all duration-700" style={{ width: `${Math.min(overview.click_rate, 100)}%` }} />
          </div>
        </div>

        <div className="ai-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-text-dim">Engagement Index</p>
          <p className="font-display text-2xl font-semibold mt-1 text-teal">{engagementScore}</p>
          <p className="text-[11px] text-text-dim mt-2">Weighted score from opens + clicks</p>
        </div>

        <div className="ai-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-text-dim">Recipient Responses</p>
          <p className="font-display text-2xl font-semibold mt-1">{feedbackData?.total ?? 0}</p>
          <p className="text-[11px] text-text-dim mt-2">Feedback events collected</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* SENTIMENT BREAKDOWN */}
        <div className="ai-card p-4">
          <h2 className="font-display text-sm font-semibold mb-3">Sentiment Breakdown</h2>
          {totalSentiment === 0 ? (
            <p className="text-text-dim text-xs">No sentiment data yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(SENTIMENT_META).map(([key, meta]) => {
                const count = sentimentTotals[key] || 0
                const pct = totalSentiment ? Math.round((count / totalSentiment) * 100) : 0
                return (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-text-dim font-mono">{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                      <div className={`h-full ${meta.bar} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CHANNEL REACH */}
        <div className="ai-card p-4">
          <h2 className="font-display text-sm font-semibold mb-3">Reach by Channel</h2>
          {(overview.channel_breakdown || []).length === 0 ? (
            <p className="text-text-dim text-xs">No channel data yet.</p>
          ) : (
            <div className="space-y-3">
              {overview.channel_breakdown.map((c) => {
                const pct = overview.total_messages
                  ? Math.round((c.count / overview.total_messages) * 100)
                  : 0
                return (
                  <div key={c.channel}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs capitalize">{c.channel}</span>
                      <span className="text-[11px] text-text-dim font-mono">{c.count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                      <div className="h-full bg-teal rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* PER-CAMPAIGN DRILL DOWN */}
      <div className="ai-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-[11px] uppercase tracking-wide text-text-dim shrink-0">
            Inspect campaign
          </span>
           <select
  value={campaignId}
  onChange={(e) => setCampaignId(e.target.value)}
  className="flex-1 min-w-[220px] rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text outline-none transition focus:border-violet focus:ring-1 focus:ring-violet/30"
>
  <option value="" className="bg-surface text-text">
    Select a campaign...
  </option>

  {campaigns.map((c) => (
    <option
      key={c.id}
      value={c.id}
      className="bg-surface text-text"
    >
      {c.name} — {c.status}
    </option>
  ))}
</select>
        </div>

        {campaignAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-dim mb-2">Status</p>
              <div className="space-y-1.5">
                {Object.entries(campaignAnalytics.status_breakdown || {}).map(([s, count]) => (
                  <div key={s} className="flex justify-between text-xs">
                    <span className="capitalize text-text-dim">{s}</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
                {Object.keys(campaignAnalytics.status_breakdown || {}).length === 0 && (
                  <p className="text-text-dim text-xs">No messages yet.</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-dim mb-2">Sentiment</p>
              <div className="space-y-1.5">
                {Object.entries(campaignAnalytics.sentiment_breakdown || {}).map(([s, count]) => (
                  <div key={s} className="flex justify-between text-xs">
                    <span className="capitalize text-text-dim">{s}</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-text-dim mb-2">Language Reach</p>
              <div className="space-y-1.5">
                {Object.entries(campaignAnalytics.language_breakdown || {}).map(([lang, count]) => (
                  <div key={lang} className="flex justify-between text-xs">
                    <span className="text-text-dim">{lang}</span>
                    <span className="font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-text-dim text-xs">Pick a campaign to see its engagement breakdown.</p>
        )}
      </div>

      {/* RECENT ACTIVITY FEED */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-sm font-semibold">Recent Engagement Activity</h2>
        <span className="text-[11px] text-text-dim">{loading ? 'Refreshing…' : 'Up to date'}</span>
      </div>

      <div className="space-y-2">
        {recentEvents.map((e) => {
          const sMeta = SENTIMENT_META[e.sentiment] || SENTIMENT_META.neutral
          return (
            <div
              key={e.id}
              className="ai-gradient-border p-3 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-lg shrink-0">{EVENT_GLYPH[e.event_type] || '◆'}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{e.campaign_name}</span>
                    <span className="text-text-dim text-xs">•</span>
                    <span className="text-[11px] text-text-dim capitalize">{e.event_type}</span>
                  </div>
                  {e.comment && (
                    <p className="text-xs text-text-dim mt-1 truncate">{e.comment}</p>
                  )}
                </div>
              </div>
              <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${sMeta.color}`}>
                {sMeta.label}
              </span>
            </div>
          )
        })}

        {recentEvents.length === 0 && (
          <div className="ai-gradient-border px-4 py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-violet/10 border border-violet/20 text-violet text-xl">
              ✦
            </div>
            <h3 className="font-display font-semibold text-sm">No engagement activity yet</h3>
            <p className="text-text-dim text-xs mt-1">
              Activity will appear here once recipients start opening, clicking, or responding.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
