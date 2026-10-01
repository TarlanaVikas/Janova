
import React, { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import api from '../services/api'
import StatCard from '../components/StatCard'
import Chatbot from '../components/Chatbot'
import { useAuth } from '../context/AuthContext'

const CHANNEL_COLORS = {
  email: '#9B8CFF',
  sms: '#FFA94D',
  whatsapp: '#2DD4BF',
  push: '#60A5FA',
  web: '#F472B6',
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const unreadCount = 3
  const roleDashboard = {
    admin: {
      title: 'Admin Dashboard',
      subtitle: 'Organization-wide campaign, audience, and delivery overview.',
      badge: 'Full Access',
      actions: [
        { label: 'Campaigns', path: '/campaigns' },
        { label: 'Audience', path: '/audience' },
        { label: 'Analytics', path: '/analytics' },
      ],
    },
    campaign_manager: {
      title: 'Campaign Manager Dashboard',
      subtitle: 'Plan campaigns and monitor audience reach and delivery.',
      badge: 'Campaign Management',
      actions: [
        { label: 'Create campaign', path: '/campaigns/create' },
        { label: 'Manage audience', path: '/audience' },
        { label: 'Templates', path: '/templates' },
      ],
    },
    comms_team: {
      title: 'Communications Operations',
      subtitle: 'Track message delivery, incoming feedback, and active channel health.',
      badge: 'Comms Team',
      actions: [
        { label: 'Delivery tracking', path: '/delivery' },
        { label: 'Review feedback', path: '/feedback' },
        { label: 'Notifications', path: '/notifications' },
      ],
    },
  }[user?.role] || {
    title: 'Dashboard',
    subtitle: 'Live reach and engagement across active campaigns and channels.',
    badge: 'AI Powered',
  }

  const [data, setData] = useState(null)
  const [campaignPerformance, setCampaignPerformance] = useState([])
  const [sentimentData, setSentimentData] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/campaign-performance'),
      api.get('/analytics/feedback'),
    ])
      .then(([overviewRes, performanceRes, feedbackRes]) => {
        setData(overviewRes.data)
        setCampaignPerformance(performanceRes.data)
        setSentimentData(feedbackRes.data)
      })
      .catch((error) => {
        console.error('Failed to load dashboard analytics:', error)
      })
  }, [])

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-text-dim text-sm">
          AI Loading dashboard…
        </div>
      </div>
    )
  }

  const maxLangCount = Math.max(
    1,
    ...data.language_breakdown.map((l) => l.count)
  )

  const sentimentChartData = sentimentData?.sentiment_totals
    ? [
        {
          sentiment: 'Positive',
          count: sentimentData.sentiment_totals.positive || 0,
        },
        {
          sentiment: 'Neutral',
          count: sentimentData.sentiment_totals.neutral || 0,
        },
        {
          sentiment: 'Negative',
          count: sentimentData.sentiment_totals.negative || 0,
        },
      ]
    : []

  const roleMetrics = {
    admin: [
      { label: 'Campaigns', value: data.total_campaigns, accent: 'text' },
      { label: 'Audience Members', value: data.total_recipients, accent: 'violet' },
      { label: 'Delivery Rate', value: data.delivery_rate, suffix: '%', accent: 'teal' },
      { label: 'Failure Rate', value: data.failure_rate, suffix: '%', accent: 'danger' },
    ],
    campaign_manager: [
      { label: 'Campaigns to Manage', value: data.total_campaigns, accent: 'text' },
      { label: 'Potential Reach', value: data.total_recipients, accent: 'violet' },
      { label: 'Open Rate', value: data.open_rate, suffix: '%', accent: 'signal' },
      { label: 'Click Rate', value: data.click_rate, suffix: '%', accent: 'teal' },
    ],
    comms_team: [
      { label: 'Messages Processed', value: data.total_messages, accent: 'text' },
      { label: 'Delivery Rate', value: data.delivery_rate, suffix: '%', accent: 'teal' },
      { label: 'Failure Rate', value: data.failure_rate, suffix: '%', accent: 'danger' },
      { label: 'Feedback Received', value: sentimentData?.total ?? 0, accent: 'violet' },
    ],
  }
  const metrics = roleMetrics[user?.role] || roleMetrics.admin
  const actions = roleDashboard.actions || roleDashboard.admin?.actions || []

  return (
    <div>
      {/* Dashboard Header */}
      <header className="mb-7 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-semibold">
              {roleDashboard.title}
            </h1>

            <span className="ai-badge">
              {roleDashboard.badge}
            </span>
          </div>

          <p className="text-text-dim text-sm mt-1">
            {roleDashboard.subtitle}
          </p>
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="
            relative
            p-2.5
            rounded-xl
            border
            border-border
            bg-surface-alt/70
            hover:border-violet
            hover:bg-surface-alt
            transition
          "
          aria-label="Notifications"
        >
          <Bell size={20} className="text-text" />

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -top-1
                -right-1
                min-w-[18px]
                h-[18px]
                px-1
                rounded-full
                bg-red-500
                text-white
                text-[10px]
                font-semibold
                flex
                items-center
                justify-center
              "
            >
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      <div className="flex flex-wrap gap-2 mb-6">
        {actions.map((action) => (
          <button
            key={action.path}
            type="button"
            onClick={() => navigate(action.path)}
            className="px-3 py-2 rounded-lg border border-border bg-surface-alt/70 text-xs font-medium text-text hover:border-violet/50 hover:text-violet transition"
          >
            {action.label}
            <span className="ml-2 text-text-dim" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <div className="ai-card" key={metric.label}>
            <StatCard {...metric} />
          </div>
        ))}
      </div>

      {/* Language + Channel Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Language Broadcast Pulse */}
        {user?.role !== 'comms_team' && (
        <div className="lg:col-span-3 ai-gradient-border p-4">

          <div className="flex items-baseline justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-semibold">
                  Language Broadcast Pulse
                </h2>

                <span className="ai-badge">
                  AI Network
                </span>
              </div>

              <span className="text-[11px] text-text-dim">
                messages sent, by recipient language
              </span>
            </div>
          </div>

          <div className="flex items-end gap-3 h-36 px-1">

            {data.language_breakdown.map((l, i) => {
              const heightPct = Math.max(
                8,
                (l.count / maxLangCount) * 100
              )

              return (
                <div
                  key={l.language}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                >
                  <div className="text-[10px] font-mono text-text-dim">
                    {l.count}
                  </div>

                  <div
                    className="signal-bar w-full rounded-t-sm"
                    style={{
                      height: `${heightPct}%`,
                      background:
                        'linear-gradient(180deg, #2DD4BF, #60A5FA, #9B8CFF)',
                      animationDelay: `${i * 0.12}s`,
                      boxShadow:
                        '0 0 12px rgba(96, 165, 250, 0.15)',
                    }}
                  />

                  <div className="text-[10px] text-text-dim text-center leading-tight">
                    {l.language}
                  </div>
                </div>
              )
            })}

            {data.language_breakdown.length === 0 && (
              <div className="text-text-dim text-sm w-full text-center pb-6">
                No campaigns sent yet — send one to see language reach here.
              </div>
            )}

          </div>
        </div>
        )}

        {/* Channel Mix */}
        <div className={`${user?.role === 'comms_team' ? 'lg:col-span-5' : 'lg:col-span-2'} ai-card p-4`}>

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold">
              Channel Mix
            </h2>

            <span className="ai-badge">
              Live Data
            </span>
          </div>

          {data.channel_breakdown.length > 0 ? (

            <div className="flex items-center gap-4">

              <ResponsiveContainer width="60%" height={140}>
                <PieChart>

                  <Pie
                    data={data.channel_breakdown}
                    dataKey="count"
                    nameKey="channel"
                    innerRadius={40}
                    outerRadius={68}
                    paddingAngle={3}
                  >
                    {data.channel_breakdown.map((c, i) => (
                      <Cell
                        key={i}
                        fill={
                          CHANNEL_COLORS[c.channel] || '#8D96AC'
                        }
                        stroke="none"
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: '#1A2540',
                      border:
                        '1px solid rgba(155, 140, 255, 0.2)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />

                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2 flex-1">

                {data.channel_breakdown.map((c) => (
                  <div
                    key={c.channel}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background:
                          CHANNEL_COLORS[c.channel] || '#8D96AC',
                        boxShadow:
                          `0 0 8px ${
                            CHANNEL_COLORS[c.channel] || '#8D96AC'
                          }`,
                      }}
                    />

                    <span className="capitalize text-text-dim">
                      {c.channel}
                    </span>

                    <span className="font-mono ml-auto">
                      {c.count}
                    </span>
                  </div>
                ))}

              </div>

            </div>

          ) : (
            <div className="text-text-dim text-sm py-10 text-center">
              No channel data yet.
            </div>
          )}

        </div>
      </div>

{user?.role !== 'comms_team' && <div className="ai-gradient-border p-4 mt-4">
  <div className="flex items-center justify-between mb-3">
    <div>
      <h2 className="font-display text-sm font-semibold">
        Campaign Performance
      </h2>

      <span className="text-[10px] text-text-dim">
        Delivery, opens and clicks by campaign
      </span>
    </div>

    <span className="ai-badge">
      Performance
    </span>
  </div>

  {campaignPerformance.length > 0 ? (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={campaignPerformance}
        margin={{
          top: 5,
          right: 5,
          left: -15,
          bottom: 45,
        }}
        barCategoryGap="18%"
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
        />

        <XAxis
          dataKey="campaign"
          interval={0}
          tick={{
            fontSize: 9,
            fill: '#8D96AC',
          }}
          angle={-20}
          textAnchor="end"
          height={55}
        />

        <YAxis
          tick={{
            fontSize: 9,
            fill: '#8D96AC',
          }}
          width={35}
        />

        <Tooltip
          contentStyle={{
            background: '#1A2540',
            border: '1px solid rgba(155, 140, 255, 0.2)',
            borderRadius: 8,
            fontSize: 11,
          }}
        />

      

        <Bar
          dataKey="delivered"
          name="Delivered"
          fill="#2DD4BF"
          radius={[3, 3, 0, 0]}
        />

        <Bar
          dataKey="opened"
          name="Opened"
          fill="#60A5FA"
          radius={[3, 3, 0, 0]}
        />

        <Bar
          dataKey="clicked"
          name="Clicked"
          fill="#9B8CFF"
          radius={[3, 3, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  ) : (
    <div className="text-text-dim text-sm py-16 text-center">
      No campaign performance data yet.
    </div>
  )}
</div>}


      {/* Audience Sentiment */}
  {user?.role !== 'campaign_manager' && <>
      <div className="ai-card p-5 mt-5">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-sm font-semibold">
              Audience Sentiment
            </h2>

            <span className="text-[11px] text-text-dim">
              Feedback sentiment across public engagement
            </span>
          </div>

          <span className="ai-badge">
            AI Insights
          </span>
        </div>

        {sentimentData?.sentiment_totals ? (

          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={sentimentChartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)"
              />

              <XAxis
  dataKey="sentiment"
  interval={0}
  height={65}
  tick={({ x, y, payload }) => {
    const campaign = campaignPerformance.find(
      (item) => item.campaign === payload.value
    )

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={12}
          textAnchor="middle"
          fill="#E5E7EB"
          fontSize={9}
          fontWeight={600}
        >
          {payload.value.length > 16
            ? `${payload.value.slice(0, 16)}…`
            : payload.value}
        </text>

        {campaign && (
          <text
            x={0}
            y={0}
            dy={29}
            textAnchor="middle"
            fill="#8D96AC"
            fontSize={7}
          >
            D {campaign.delivered} • O {campaign.opened} • C {campaign.clicked}
          </text>
        )}
      </g>
    )
  }}
/>
              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 10,
                  fill: '#8D96AC',
                }}
              />

              <Tooltip
                contentStyle={{
                  background: '#1A2540',
                  border:
                    '1px solid rgba(155, 140, 255, 0.2)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />

              <Bar
                dataKey="count"
                name="Feedback"
                fill="#9B8CFF"
                radius={[5, 5, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>

        ) : (
          <div className="text-text-dim text-sm py-20 text-center">
            No audience sentiment data yet.
          </div>
        )}

      </div>
      </>}

      {/* AI Assistant */}
      <Chatbot />

    </div>
  )
}

