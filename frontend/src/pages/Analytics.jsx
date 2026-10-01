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
    <div className="w-full">
      <header className="mb-6">
        <h1 className="font-display text-[32px] font-semibold tracking-tight text-text">
          Campaign Analytics
        </h1>
        <p className="mt-2 text-sm text-text-dim">
          Delivery, open, and click performance for every campaign, side by side.
        </p>
      </header>

      <div className="overflow-hidden rounded-[22px] border border-border bg-surface shadow-[0_18px_60px_rgba(2,6,23,0.35)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-medium uppercase tracking-[0.18em] text-text-dim">
                <th className="px-5 py-4">Campaign</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Messages</th>
                <th className="px-5 py-4">Delivery</th>
                <th className="px-5 py-4">Open</th>
                <th className="px-5 py-4">Click</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-0 transition hover:bg-surface-alt/40"
                >
                  <td className="px-5 py-4">
                    <Link
                      to={`/campaigns/${r.id}`}
                      className="font-semibold text-text transition hover:text-violet"
                    >
                      {r.name}
                    </Link>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${
                        TYPE_COLORS[r.type] || 'border-border bg-surface-alt text-text-dim'
                      }`}
                    >
                      {r.type}
                    </span>
                  </td>

                  <td className="px-5 py-4 capitalize text-text-dim">{r.status}</td>
                  <td className="px-5 py-4 font-mono text-text">{r.total_messages}</td>
                  <td className="px-5 py-4 font-mono text-teal">{r.delivery_rate}%</td>
                  <td className="px-5 py-4 font-mono text-signal">{r.open_rate}%</td>
                  <td className="px-5 py-4 font-mono text-violet">{r.click_rate}%</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-text-dim">
                    No campaigns yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="mt-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-dim">
                Quick Overview
              </h2>
            </div>
            <span className="text-[11px] text-text-dim">{totalMessages} total messages</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-border bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-text-dim">Delivery Rate</span>
                <span className="text-2xl font-mono font-semibold text-teal">{deliveryRate}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt">
                <div
                  className="h-full rounded-full bg-teal transition-all duration-700"
                  style={{ width: `${Math.min(deliveryRate, 100)}%` }}
                />
              </div>
              <p className="mt-3 text-[11px] text-text-dim">Messages successfully delivered</p>
            </div>

            <div className="rounded-[20px] border border-border bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-text-dim">Open Rate</span>
                <span className="text-2xl font-mono font-semibold text-signal">{openRate}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt">
                <div
                  className="h-full rounded-full bg-signal transition-all duration-700"
                  style={{ width: `${Math.min(openRate, 100)}%` }}
                />
              </div>
              <p className="mt-3 text-[11px] text-text-dim">Audience engagement with messages</p>
            </div>

            <div className="rounded-[20px] border border-border bg-surface p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-text-dim">Click Rate</span>
                <span className="text-2xl font-mono font-semibold text-violet">{clickRate}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt">
                <div
                  className="h-full rounded-full bg-violet transition-all duration-700"
                  style={{ width: `${Math.min(clickRate, 100)}%` }}
                />
              </div>
              <p className="mt-3 text-[11px] text-text-dim">Audience interaction with campaigns</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}