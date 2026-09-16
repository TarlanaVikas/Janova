import React, { useMemo, useState } from 'react'
import {
  Bell,
  Sparkles,
  Megaphone,
  Cpu,
  Search,
  RefreshCw,
  CheckCheck,
  Eye,
  ArrowRight,
} from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Flood Awareness Campaign Published',
    message:
      'Your multilingual campaign has been successfully published across all selected channels.',
    category: 'Campaigns',
    priority: 'High',
    time: '5 min ago',
    section: 'Today',
    read: false,
  },
  {
    id: 2,
    title: 'AI Generated Telugu Content',
    message:
      'Poster and announcement content were translated successfully.',
    category: 'AI',
    priority: 'Medium',
    time: '20 min ago',
    section: 'Today',
    read: false,
  },
  {
    id: 3,
    title: 'Poster Saved',
    message:
      'Poster has been attached to Health Awareness campaign.',
    category: 'Campaigns',
    priority: 'Low',
    time: '1 hour ago',
    section: 'Today',
    read: true,
  },
  {
    id: 4,
    title: 'System Maintenance Completed',
    message:
      'Platform optimization finished successfully.',
    category: 'System',
    priority: 'Low',
    time: 'Yesterday',
    section: 'Yesterday',
    read: false,
  },
  {
    id: 5,
    title: 'Emergency Broadcast Ready',
    message:
      'Emergency response template is available for publishing.',
    category: 'Campaigns',
    priority: 'High',
    time: 'Yesterday',
    section: 'Yesterday',
    read: true,
  },
  {
    id: 6,
    title: 'AI Sentiment Analysis Complete',
    message:
      'Campaign responses were analyzed successfully.',
    category: 'AI',
    priority: 'Medium',
    time: '2 days ago',
    section: 'Earlier',
    read: true,
  },
]

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const unreadCount = notifications.filter((n) => !n.read).length

  const aiCount = notifications.filter(
    (n) => n.category === 'AI'
  ).length

  const filtered = useMemo(() => {
    let data = notifications

    if (filter === 'Unread') {
      data = data.filter((n) => !n.read)
    } else if (filter !== 'All') {
      data = data.filter(
        (n) => n.category === filter
      )
    }

    if (search.trim()) {
      data = data.filter(
        (n) =>
          n.title
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          n.message
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    }

    return data
  }, [notifications, filter, search])

  function markAllRead() {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        read: true,
      }))
    )
  }

  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              read: true,
            }
          : n
      )
    )
  }

  function refreshNotifications() {
    // Backend API can be connected later
    console.log('Refreshing notifications...')
  }

  function categoryIcon(category) {
    switch (category) {
      case 'Campaigns':
        return <Megaphone size={18} />

      case 'AI':
        return <Sparkles size={18} />

      default:
        return <Cpu size={18} />
    }
  }

  function borderColor(category) {
    switch (category) {
      case 'Campaigns':
        return 'border-blue-500/30'

      case 'AI':
        return 'border-violet/30'

      default:
        return 'border-teal/30'
    }
  }
    return (
    <div className="relative">

      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="mb-7">

        <div className="flex items-start justify-between gap-5">

          <div>

            <div className="flex items-center gap-3">

              <h1 className="font-display text-2xl font-semibold">
                Notifications
              </h1>

              <span className="ai-badge">
                LIVE
              </span>

            </div>

            <p className="text-text-dim text-sm mt-2">
              Stay informed about campaigns, AI activities and system updates
              across Janova.
            </p>

          </div>

        </div>

      </header>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="ai-card p-4">

          <p className="text-xs text-text-dim">
            Total Notifications
          </p>

          <div className="flex items-center justify-between mt-3">

            <h2 className="text-3xl font-display font-semibold">
              {notifications.length}
            </h2>

            <Bell
              size={26}
              className="text-violet"
            />

          </div>

        </div>

        <div className="ai-card p-5">

          <p className="text-xs text-text-dim">
            Unread
          </p>

          <div className="flex items-center justify-between mt-3">

            <h2 className="text-3xl font-display font-semibold text-danger">
              {unreadCount}
            </h2>

            <span className="w-3 h-3 rounded-full bg-danger animate-pulse" />

          </div>

        </div>

        <div className="ai-card p-5">

          <p className="text-xs text-text-dim">
            AI Alerts
          </p>

          <div className="flex items-center justify-between mt-3">

            <h2 className="text-3xl font-display font-semibold text-violet">
              {aiCount}
            </h2>

            <Sparkles
              size={24}
              className="text-violet"
            />

          </div>

        </div>

      </div>

      {/* ==========================================
          SEARCH + ACTIONS
      ========================================== */}

      <div className="ai-gradient-border p-4 mb-6">

        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-text-dim
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search notifications..."
              className="
                w-full
                bg-surface-alt/70
                border
                border-border
                rounded-lg
                pl-10
                pr-3
                py-2.5
                text-sm
                outline-none
                transition
                focus:border-violet
              "
            />

          </div>

          {/* Buttons */}

          <div className="flex items-center gap-3">

            <button
              onClick={markAllRead}
              className="
                ai-button
                text-sm
                flex
                items-center
                gap-2
              "
            >
              <CheckCheck size={16} />
              Mark all as read
            </button>

          </div>

        </div>

        {/* ==========================================
            FILTER CHIPS
        ========================================== */}

        <div className="flex flex-wrap gap-3 mt-5">

          {[
            'All',
            'Unread',
            'Campaigns',
            'AI',
            'System',
          ].map((item) => (

            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`
                px-4
                py-2
                rounded-full
                text-sm
                transition
                border

                ${
                  filter === item
                    ? `
                      bg-violet
                      text-white
                      border-violet
                    `
                    : `
                      bg-surface-alt/60
                      border-border
                      hover:border-violet
                    `
                }
              `}
            >
              {item}
            </button>

          ))}

        </div>

      </div>
            {/* ==========================================
          NOTIFICATIONS TIMELINE
      ========================================== */}

      {['Today', 'Yesterday', 'Earlier'].map((section) => {
        const items = filtered.filter(
          (n) => n.section === section
        )

        if (items.length === 0) return null

        return (
          <div key={section} className="mb-8">

            <div className="flex items-center gap-3 mb-4">

              <h2 className="font-display text-lg font-semibold">
                {section}
              </h2>

              <div className="flex-1 h-px bg-border" />

            </div>

            <div className="space-y-4">

              {items.map((item) => (

                <div
                  key={item.id}
                  className={`
                    ai-card
                    p-5
                    border-l-4
                    transition
                    hover:scale-[1.01]
                    ${borderColor(item.category)}
                  `}
                >

                  <div className="flex items-start justify-between gap-4">

                    {/* Left */}

                    <div className="flex gap-4 flex-1">

                      <div
                        className="
                          w-11
                          h-11
                          rounded-xl
                          bg-violet/10
                          border
                          border-violet/20
                          flex
                          items-center
                          justify-center
                          text-violet
                          shrink-0
                        "
                      >
                        {categoryIcon(item.category)}
                      </div>

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold">
                            {item.title}
                          </h3>

                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          )}

                          <span className="ai-badge">
                            {item.category}
                          </span>

                          <span
                            className={`
                              text-[10px]
                              px-2
                              py-1
                              rounded-full

                              ${
                                item.priority === 'High'
                                  ? 'bg-danger/10 text-danger border border-danger/20'
                                  : item.priority === 'Medium'
                                  ? 'bg-signal/10 text-signal border border-signal/20'
                                  : 'bg-teal/10 text-teal border border-teal/20'
                              }
                            `}
                          >
                            {item.priority}
                          </span>

                        </div>

                        <p className="text-sm text-text-dim mt-3 leading-relaxed">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-5 mt-4">

                          <span className="text-xs text-text-dim">
                            {item.time}
                          </span>

                          <button
                            className="flex items-center gap-1 text-violet text-xs hover:underline"
                          >
                            <Eye size={14} />
                            View
                          </button>

                          <button
                            className="flex items-center gap-1 text-violet text-xs hover:underline"
                          >
                            <ArrowRight size={14} />
                            Open
                          </button>

                        </div>

                      </div>

                    </div>

                    {/* Right */}

                    {!item.read && (

                      <button
                        onClick={() => markRead(item.id)}
                        className="
                          ai-button
                          text-xs
                          whitespace-nowrap
                        "
                      >
                        Mark Read
                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          </div>
        )
      })}

      {/* ==========================================
          EMPTY STATE
      ========================================== */}

      {filtered.length === 0 && (

        <div
          className="
            ai-gradient-border
            p-12
            text-center
          "
        >

          <div
            className="
              w-20
              h-20
              rounded-full
              bg-violet/10
              border
              border-violet/20
              mx-auto
              flex
              items-center
              justify-center
              text-violet
              mb-5
            "
          >
            <Bell size={36} />
          </div>

          <h2 className="font-display text-xl font-semibold">
            You're all caught up
          </h2>

          <p className="text-text-dim mt-3 max-w-md mx-auto">
            No notifications match your current filter.
            Campaign updates, AI activities and system alerts
            will appear here in real time.
          </p>

        </div>

      )}

    </div>
  )
}