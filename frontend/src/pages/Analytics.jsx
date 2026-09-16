import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const TYPE_COLORS = {
  awareness: 'text-teal border-teal/30 bg-teal/10',
  emergency: 'text-danger border-danger/30 bg-danger/10',
  education: 'text-violet border-violet/30 bg-violet/10',
  announcement: 'text-signal border-signal/30 bg-signal/10',
}

export default function Analytics() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    api.get('/analytics/campaigns-summary').then((res) => setRows(res.data))
  }, [])

  // Calculate overall analytics
  const totalMessages = rows.reduce(
    (sum, r) => sum + (Number(r.total_messages) || 0),
    0
  )

  const average = (key) => {
    if (rows.length === 0) return 0

    const total = rows.reduce(
      (sum, r) => sum + (Number(r[key]) || 0),
      0
    )

    return Math.round(total / rows.length)
  }

  const deliveryRate = average('delivery_rate')
  const openRate = average('open_rate')
  const clickRate = average('click_rate')

  return (
    <div>

      {/* Header */}
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold">
          Campaign Analytics
        </h1>

        <p className="text-text-dim text-sm mt-1">
          Delivery, open, and click performance for every campaign, side by side.
        </p>
      </header>


      {/* Campaign Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-text-dim border-b border-border">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Messages</th>
                <th className="px-4 py-3 font-medium">Delivery</th>
                <th className="px-4 py-3 font-medium">Open</th>
                <th className="px-4 py-3 font-medium">Click</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-0 hover:bg-surface-alt/50 transition"
                >

                  {/* Campaign */}
                  <td className="px-4 py-3">
                    <Link
                      to={`/campaigns/${r.id}`}
                      className="font-medium hover:text-violet transition"
                    >
                      {r.name}
                    </Link>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border capitalize ${
                        TYPE_COLORS[r.type] ||
                        'text-text-dim border-border bg-surface-alt'
                      }`}
                    >
                      {r.type}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-text-dim capitalize">
                    {r.status}
                  </td>

                  {/* Messages */}
                  <td className="px-4 py-3 font-mono">
                    {r.total_messages}
                  </td>

                  {/* Delivery */}
                  <td className="px-4 py-3 font-mono text-teal">
                    {r.delivery_rate}%
                  </td>

                  {/* Open */}
                  <td className="px-4 py-3 font-mono text-signal">
                    {r.open_rate}%
                  </td>

                  {/* Click */}
                  <td className="px-4 py-3 font-mono text-violet">
                    {r.click_rate}%
                  </td>

                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-text-dim text-sm"
                  >
                    No campaigns yet.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>


      {/* Compact Analytics Section */}
      {rows.length > 0 && (
        <div className="mt-5">

          {/* Section Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-display text-sm font-semibold">
                Performance Snapshot
              </h2>

              <p className="text-[11px] text-text-dim mt-1">
                Quick overview of campaign communication performance.
              </p>
            </div>

            <span className="text-[11px] text-text-dim">
              {totalMessages} total messages
            </span>
          </div>


          {/* Small Graph Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Delivery */}
            <div className="bg-surface border border-border rounded-xl p-4">

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-dim">
                  Delivery Rate
                </span>

                <span className="text-lg font-mono text-teal">
                  {deliveryRate}%
                </span>
              </div>

              <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(deliveryRate, 100)}%`,
                  }}
                />
              </div>

              <p className="text-[10px] text-text-dim mt-2">
                Messages successfully delivered
              </p>

            </div>


            {/* Open */}
            <div className="bg-surface border border-border rounded-xl p-4">

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-dim">
                  Open Rate
                </span>

                <span className="text-lg font-mono text-signal">
                  {openRate}%
                </span>
              </div>

              <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
                <div
                  className="h-full bg-signal rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(openRate, 100)}%`,
                  }}
                />
              </div>

              <p className="text-[10px] text-text-dim mt-2">
                Audience engagement with messages
              </p>

            </div>


            {/* Click */}
            <div className="bg-surface border border-border rounded-xl p-4">

              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-dim">
                  Click Rate
                </span>

                <span className="text-lg font-mono text-violet">
                  {clickRate}%
                </span>
              </div>

              <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(clickRate, 100)}%`,
                  }}
                />
              </div>

              <p className="text-[10px] text-text-dim mt-2">
                Audience interaction with campaigns
              </p>

            </div>

          </div>


          {/* Mini Campaign Performance Graph */}
          <div className="bg-surface border border-border rounded-xl p-4 mt-4">

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-sm font-semibold">
                  Campaign Performance
                </h3>

                <p className="text-[10px] text-text-dim mt-1">
                  Delivery, open and click rates by campaign
                </p>
              </div>
            </div>

            <div className="space-y-3">

              {rows.slice(0, 5).map((r) => (
                <div key={r.id}>

                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs truncate max-w-[55%]">
                      {r.name}
                    </span>

                    <span className="text-[10px] text-text-dim">
                      {r.delivery_rate}% delivered
                    </span>
                  </div>

                  <div className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full"
                      style={{
                        width: `${Math.min(
                          Number(r.delivery_rate) || 0,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>
      )}

    </div>
  )
}