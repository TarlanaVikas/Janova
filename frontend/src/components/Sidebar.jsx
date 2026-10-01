import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const items = [
  { to: '/dashboard', label: 'Dashboard', glyph: '◆' },
  { to: '/notifications', label: 'Notifications', glyph: '🔔' },
  { to: '/audience', label: 'Audience', glyph: '◈' },
  { to: '/campaigns', label: 'Campaigns', glyph: '▲' },
  { to: '/templates', label: 'Templates', glyph: '▤' },
  { to: '/live-bulletins', label: 'Live Bulletins', glyph: '◉' },
  { to: '/analytics', label: 'Analytics', glyph: '◫' },
  { to: '/delivery', label: 'Delivery', glyph: '✓' },
{ to: '/engagements', label: 'Engagements', glyph: '↗' },
{ to: '/sentiment-map', label: 'Sentiment Map', glyph: '🗺️' },
  { to: '/feedback', label: 'Feedback', glyph: '✦' },
  { to: '/canvas-studio', label: 'Canvas Studio', glyph: '🎨' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const commsTeamItems = items.filter((item) => ![
    '/audience',
    '/templates',
    '/analytics',
    '/sentiment-map',
    '/canvas-studio',
  ].includes(item.to))
  const campaignManagerItems = items.filter((item) => ![
    '/sentiment-map',
    '/canvas-studio',
  ].includes(item.to))
  const visibleItems = user?.role === 'comms_team'
    ? commsTeamItems
    : user?.role === 'campaign_manager'
      ? campaignManagerItems
      : items

  return (
    <aside className="w-64 shrink-0 bg-surface border-r border-border flex flex-col h-screen sticky top-0">

      {/* Brand Header */}
      <div className="px-5 py-6 border-b border-border">
        <div className="flex items-center gap-3">

          {/* Logo */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-violet/15 border border-violet/30">
            <span className="text-violet text-sm font-bold">
              S
            </span>

            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
          </div>

          {/* Brand */}
          <div>
            <h1 className="font-display font-semibold text-lg tracking-tight text-text">
             Janova
            </h1>

            <p className="text-[10px] text-text-dim">
              Civic Engagement Platform
            </p>
          </div>

        </div>
      </div>


      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">

        <p className="px-3 mb-3 text-[10px] uppercase tracking-widest text-text-dim font-medium">
          Workspace
        </p>

        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet/10 text-violet border border-violet/30 shadow-sm'
                  : 'text-text-dim border border-transparent hover:text-text hover:bg-surface-alt hover:border-border'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet rounded-r-full" />
                )}

                {/* Icon */}
                <span
                  className={`flex items-center justify-center w-6 text-xs transition-colors ${
                    isActive
                      ? 'text-violet'
                      : 'text-text-dim group-hover:text-violet'
                  }`}
                >
                  {item.glyph}
                </span>

                {/* Label */}
                <span className="truncate">
                  {item.label}
                </span>

                {/* Active dot */}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet" />
                )}
              </>
            )}
          </NavLink>
        ))}

      </nav>


      {/* User Section */}
      <div className="px-4 py-4 border-t border-border bg-surface-alt/30">

        <div className="flex items-center gap-3 mb-4">

          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-violet/15 border border-violet/30 flex items-center justify-center shrink-0">
            <span className="text-violet text-xs font-semibold">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>

          {/* User Info */}
          <div className="min-w-0">
            <div className="text-[10px] text-text-dim uppercase tracking-wide">
              Signed in as
            </div>

            <div className="text-sm font-medium truncate text-text">
              {user?.username || 'User'}
            </div>

            <div className="text-[11px] text-violet capitalize truncate">
              {user?.role?.replace('_', ' ') || 'Member'}
            </div>
          </div>

        </div>


        {/* Sign Out */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium px-3 py-2.5 rounded-lg border border-border text-text-dim hover:text-danger hover:border-danger/40 hover:bg-danger/5 transition-all duration-200"
        >
          <span>↪</span>
          Sign out
        </button>

      </div>

    </aside>
  )
}