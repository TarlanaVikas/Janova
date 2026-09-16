import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'

export default function Feedback() {
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')
  const [campaignFilter, setCampaignFilter] = useState('all')
  const [languageFilter, setLanguageFilter] = useState('all')

  useEffect(() => {
    api
      .get('/analytics/feedback')
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('Failed to load feedback:', err)
      })
  }, [])

  const feedback = data?.feedback || []

  // Unique campaigns
  const campaigns = useMemo(() => {
    return [
      ...new Set(
        feedback
          .map((f) => f.campaign_name)
          .filter(Boolean)
      ),
    ]
  }, [feedback])

  // Unique languages
  const languages = useMemo(() => {
    return [
      ...new Set(
        feedback
          .map((f) => f.language)
          .filter(Boolean)
      ),
    ]
  }, [feedback])

  // Filter feedback
  const filteredFeedback = useMemo(() => {
    const query = search.trim().toLowerCase()

    return feedback.filter((f) => {
      const matchesSearch =
        !query ||
        f.comment?.toLowerCase().includes(query) ||
        f.recipient_name?.toLowerCase().includes(query) ||
        f.campaign_name?.toLowerCase().includes(query)

      const matchesCampaign =
        campaignFilter === 'all' ||
        f.campaign_name === campaignFilter

      const matchesLanguage =
        languageFilter === 'all' ||
        f.language === languageFilter

      return (
        matchesSearch &&
        matchesCampaign &&
        matchesLanguage
      )
    })
  }, [
    feedback,
    search,
    campaignFilter,
    languageFilter,
  ])

  // Get sentiment style
  const getSentimentStyle = (sentiment) => {
    const value = sentiment?.toLowerCase()

    if (value === 'positive') {
      return 'text-green-500 bg-green-500/10 border-green-500/20'
    }

    if (value === 'negative') {
      return 'text-red-500 bg-red-500/10 border-red-500/20'
    }

    return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
  }

  // Format sentiment text
  const getSentimentLabel = (sentiment) => {
    if (!sentiment) return 'Neutral'

    const value = sentiment.toLowerCase()

    if (value === 'positive') return 'Positive'
    if (value === 'negative') return 'Negative'

    return 'Neutral'
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div
            className="
              w-12 h-12
              mx-auto mb-3
              rounded-full
              flex items-center justify-center
              bg-violet/10
              border border-violet/20
              text-violet
              text-xl
            "
          >
            ✦
          </div>

          <p className="text-text-dim text-sm">
            Loading recipient feedback…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">

      {/* ================================
          PAGE HEADER
      ================================= */}

      <header className="mb-7">

        <div className="flex items-center gap-3 mb-2">

          <h1 className="font-display text-2xl font-semibold">
            Feedback
          </h1>

          <span className="ai-badge">
            Public Feedback
          </span>

        </div>

        <p className="text-text-dim text-sm">
          Review and manage responses received from recipients across your communication campaigns.
        </p>

      </header>


      {/* ================================
          SUMMARY CARDS
      ================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Total Feedback */}

        <div className="ai-card p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[11px] uppercase tracking-wide text-text-dim">
                Total Feedback
              </p>

              <p className="font-display text-2xl font-semibold mt-1">
                {feedback.length}
              </p>

            </div>

            <div
              className="
                w-10 h-10
                rounded-lg
                flex items-center justify-center
                bg-violet/10
                border border-violet/20
                text-violet
                text-lg
              "
            >
              💬
            </div>

          </div>

          <p className="text-[11px] text-text-dim mt-2">
            Responses received from recipients
          </p>

        </div>


        {/* Campaigns */}

        <div className="ai-card p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[11px] uppercase tracking-wide text-text-dim">
                Campaigns
              </p>

              <p className="font-display text-2xl font-semibold mt-1 text-teal">
                {campaigns.length}
              </p>

            </div>

            <div
              className="
                w-10 h-10
                rounded-lg
                flex items-center justify-center
                bg-teal/10
                border border-teal/20
                text-teal
                text-lg
              "
            >
              ◈
            </div>

          </div>

          <p className="text-[11px] text-text-dim mt-2">
            Campaigns generating recipient responses
          </p>

        </div>


        {/* Languages */}

        <div className="ai-card p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[11px] uppercase tracking-wide text-text-dim">
                Languages
              </p>

              <p className="font-display text-2xl font-semibold mt-1 text-signal">
                {languages.length}
              </p>

            </div>

            <div
              className="
                w-10 h-10
                rounded-lg
                flex items-center justify-center
                bg-signal/10
                border border-signal/20
                text-signal
                text-lg
              "
            >
              文
            </div>

          </div>

          <p className="text-[11px] text-text-dim mt-2">
            Languages represented in feedback
          </p>

        </div>

      </div>


      {/* ================================
          SMART FILTERS
      ================================= */}

      <div className="ai-card p-4 mb-6">

        <div className="flex items-center gap-2 mb-3">

          <span className="ai-badge">
            Smart Feedback Search
          </span>

          <span className="text-[11px] text-text-dim">
            Find recipient responses quickly
          </span>

        </div>


        <div className="flex flex-wrap gap-3">

          {/* Search */}

          <div className="flex-1 min-w-[220px]">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback, recipient, or campaign..."
              className="
                w-full
                bg-surface-alt/70
                border border-border
                rounded-lg
                px-3 py-2
                text-sm
                outline-none
                transition
                focus:border-violet
                focus:ring-1
                focus:ring-violet/30
              "
            />

          </div>


          {/* Campaign Filter */}

          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="
              bg-surface
              border border-violet/30
              text-text
              rounded-lg
              px-3 py-2
              text-xs
              outline-none
              transition
              cursor-pointer
              hover:border-violet/60
              focus:border-violet
              focus:ring-1
              focus:ring-violet/30
            "
          >
            <option value="all">
              All Campaigns
            </option>

            {campaigns.map((campaign) => (
              <option
                key={campaign}
                value={campaign}
              >
                {campaign}
              </option>
            ))}
          </select>


          {/* Language Filter */}

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="
              bg-surface
              border border-teal/30
              text-text
              rounded-lg
              px-3 py-2
              text-xs
              outline-none
              transition
              cursor-pointer
              hover:border-teal/60
              focus:border-teal
              focus:ring-1
              focus:ring-teal/30
            "
          >
            <option value="all">
              All Languages
            </option>

            {languages.map((language) => (
              <option
                key={language}
                value={language}
              >
                {language}
              </option>
            ))}
          </select>


          {/* Clear Filters */}

          {(search ||
            campaignFilter !== 'all' ||
            languageFilter !== 'all') && (

            <button
              onClick={() => {
                setSearch('')
                setCampaignFilter('all')
                setLanguageFilter('all')
              }}
              className="
                text-xs
                text-signal
                px-3 py-2
                rounded-lg
                border border-signal/20
                bg-signal/5
                hover:bg-signal/10
                transition
              "
            >
              Clear Filters
            </button>

          )}

        </div>

      </div>


      {/* ================================
          FEEDBACK HEADER
      ================================= */}

      <div className="
        flex items-center justify-between
        mb-3
      ">

        <div className="flex items-center gap-2">

          <h2 className="font-display text-sm font-semibold">
            Recipient Responses
          </h2>

          <span className="ai-badge !text-[10px] !py-0.5">
            {filteredFeedback.length} Results
          </span>

        </div>

        <span className="text-[11px] text-text-dim">
          Live feedback data
        </span>

      </div>


      {/* ================================
          FEEDBACK LIST
      ================================= */}

      <div className="space-y-3">

        {filteredFeedback.map((f) => (

          <div
            key={f.id}
            className="
              ai-gradient-border
              p-4
              hover:border-violet/40
              transition
            "
          >

            {/* Feedback Header */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
                mb-3
              "
            >

              <div>

                <div className="flex items-center gap-2 flex-wrap">

                  <span className="font-medium text-sm">
                    Public User
                  </span>

                  <span className="text-text-dim text-xs">
                    •
                  </span>

                  <span className="text-signal text-xs">
                    {f.campaign_name || 'Unknown Campaign'}
                  </span>

                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    mt-1
                    text-[11px]
                    text-text-dim
                  "
                >

                  {f.language && (
                    <span>
                      Language: {f.language}
                    </span>
                  )}

                </div>

              </div>

              <span className="ai-badge !text-[10px] !py-0.5">
                Feedback
              </span>

            </div>


            {/* Feedback Content + Sentiment */}

            <div
              className="
                bg-surface-alt/50
                border border-border
                rounded-lg
                px-4 py-3
              "
            >

              <div className="flex items-start justify-between gap-4">

                <p
                  className="
                    text-sm
                    leading-relaxed
                    text-text
                    flex-1
                  "
                >
                  {f.comment || 'No feedback comment provided.'}
                </p>

                {/* Sentiment Label */}

                <span
                  className={`
                    shrink-0
                    text-[10px]
                    font-semibold
                    px-2.5
                    py-1
                    rounded-full
                    border
                    ${getSentimentStyle(f.sentiment)}
                  `}
                >
                  {getSentimentLabel(f.sentiment)}
                </span>

              </div>

            </div>

          </div>

        ))}


        {/* Empty State */}

        {filteredFeedback.length === 0 && (

          <div
            className="
              ai-gradient-border
              px-4 py-12
              text-center
            "
          >

            <div
              className="
                w-12 h-12
                mx-auto
                mb-3
                rounded-full
                flex items-center justify-center
                bg-violet/10
                border border-violet/20
                text-violet
                text-xl
              "
            >
              ✦
            </div>

            <h3 className="font-display font-semibold text-sm">
              No feedback found
            </h3>

            <p className="text-text-dim text-xs mt-1">
              Try changing your search or filter settings.
            </p>

          </div>

        )}

      </div>

    </div>
  )
}