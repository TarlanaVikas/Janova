import React, { useEffect, useState } from 'react'
import api from '../services/api'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  language: 'English',
  state: '',
  city: '',
  occupation: '',
  organization: '',

}

export default function Audience() {
  const [recipients, setRecipients] = useState([])
  const [options, setOptions] = useState({
    languages: [],
    states: [],
    cities: [],
    occupations: [],
    organizations: [],
  })
  const [filters, setFilters] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function load() {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v)
    )

    const res = await api.get('/recipients', { params })
    setRecipients(res.data)
  }

  useEffect(() => {
    api.get('/recipients/segments/options').then((res) => {
      setOptions(res.data)
    })
  }, [])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)

    try {
      await api.post('/recipients', form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    await api.delete(`/recipients/${id}`)
    load()
  }

  return (
    <div className="relative">

      {/* ================================
          PAGE HEADER
      ================================= */}

      <header className="mb-7 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-2xl font-semibold">
              Audience
            </h1>

            <span className="ai-badge">
              AI Segmentation
            </span>
          </div>

          <p className="text-text-dim text-sm mt-1">
            Segment recipients by language, geography, occupation, and organization.
          </p>
        </div>

        {/* AI Gradient Button - Same Theme as Landing Page */}
        <button
          onClick={() => setShowForm((s) => !s)}
          className="ai-button text-sm"
        >
          {showForm ? 'Cancel' : '+ Add Recipient'}
        </button>
      </header>


      {/* ================================
          ADD RECIPIENT FORM
      ================================= */}

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="ai-gradient-border p-5 mb-6 grid grid-cols-3 gap-3 ai-processing"
        >

          {/* Form Header */}
          <div className="col-span-3 flex items-center justify-between mb-1">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-semibold">
                  Add Audience Member
                </h2>

                <span className="ai-badge">
                  AI Ready
                </span>
              </div>

              <p className="text-text-dim text-[11px] mt-1">
                Add recipient information for intelligent audience segmentation.
              </p>
            </div>
          </div>


          {/* Input Fields */}
          {[
            ['name', 'Full name'],
            ['email', 'Email'],
            ['phone', 'Phone (with country code)'],
            ['state', 'State'],
            ['city', 'City'],
            ['occupation', 'Occupation'],
            ['organization', 'Organization'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="text-[11px] text-text-dim block mb-1">
                {label}
              </label>

              <input
                type={key === 'phone' ? 'tel' : 'text'}
                placeholder={key === 'phone' ? '+919876543210' : undefined}
                value={form[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [key]: e.target.value,
                  })
                }
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
                required={key === 'name'}
              />
              {key === 'phone' && (
                <p className="mt-1 text-[10px] text-text-dim">
                  Include +country code. Twilio trial accounts require the destination to be verified.
                </p>
              )}
            </div>
          ))}


          {/* Preferred Language */}
          <div>
            <label className="text-[11px] text-text-dim block mb-1">
              Preferred language
            </label>

            <select
  value={form.language}
  onChange={(e) =>
    setForm({
      ...form,
      language: e.target.value,
    })
  }
  className="
    theme-select
    w-full
    bg-surface-alt/70
    border
    border-border
    rounded-lg
    px-3
    py-2
    text-sm
    text-text
    outline-none
    transition
    focus:border-violet
    focus:ring-1
    focus:ring-violet/30
    cursor-pointer
  "
>
  {[
    'English',
    'Hindi',
    'Tamil',
    'Bengali',
    'Telugu',
    'Marathi',
    'Gujarati',
    'Kannada',
    'Malayalam',
    'Punjabi',
    'Odia',
  ].map((language) => (
    <option key={language} value={language}>
      {language}
    </option>
  ))}
</select>
          </div>


          {/* Save Recipient */}
          <div className="col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="ai-button text-sm disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save recipient'}
            </button>
          </div>

        </form>
      )}


      {/* ================================
          SMART FILTERS
      ================================= */}

      <div className="ai-card p-4 mb-5">

        <div className="flex items-center gap-2 mb-3">
          <span className="ai-badge">
            Smart Filters
          </span>

          <span className="text-[11px] text-text-dim">
            Refine your communication audience
          </span>
        </div>

        <div className="flex flex-wrap gap-2">

          {[
            ['language', 'Language', options.languages],
            ['state', 'State', options.states],
            ['occupation', 'Occupation', options.occupations],
            ['organization', 'Organization', options.organizations],
          ].map(([key, label, values]) => (
            <select
  key={key}
  value={filters[key] || ''}
  onChange={(e) =>
    setFilters({
      ...filters,
      [key]: e.target.value,
    })
  }
  className="
    theme-select
    bg-surface-alt/70
    border
    border-border
    rounded-lg
    px-3
    py-1.5
    text-xs
    text-text
    outline-none
    transition
    focus:border-violet
    focus:ring-1
    focus:ring-violet/30
    cursor-pointer
  "
>
  <option value="">
    All {label}
  </option>

  {values.map((value) => (
    <option key={value} value={value}>
      {value}
    </option>
  ))}
</select>
          ))}

          {Object.values(filters).some(Boolean) && (
            <button
              onClick={() => setFilters({})}
              className="
                text-xs
                text-signal
                px-3 py-1.5
                rounded-lg
                border border-signal/20
                bg-signal/5
                hover:bg-signal/10
                transition
              "
            >
              Clear filters
            </button>
          )}

        </div>
      </div>


      {/* ================================
          AUDIENCE NETWORK TABLE
      ================================= */}

      <div className="ai-gradient-border overflow-hidden">

        {/* Table Header */}
        <div className="
          px-5 py-4
          border-b border-border
          flex items-center justify-between
        ">

          <div className="flex items-center gap-2">
            <h2 className="font-display text-sm font-semibold">
              Audience Network
            </h2>

            <span className="ai-badge">
              Live Data
            </span>
          </div>

          <span className="text-[11px] text-text-dim">
            {recipients.length} recipient
            {recipients.length !== 1 ? 's' : ''}
          </span>
        </div>


        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead>
              <tr className="
                text-left
                text-[11px]
                uppercase
                tracking-wide
                text-text-dim
                border-b border-border
                bg-surface-alt/30
              ">
                <th className="px-4 py-3 font-medium">
                  Name
                </th>

                <th className="px-4 py-3 font-medium">
                  Language
                </th>

                <th className="px-4 py-3 font-medium">
                  Location
                </th>

                <th className="px-4 py-3 font-medium">
                  Occupation
                </th>

                <th className="px-4 py-3 font-medium">
                  Organization
                </th>

                <th className="px-4 py-3 font-medium">
                  Engagement
                </th>

                <th className="px-4 py-3" />
              </tr>
            </thead>


            <tbody>

              {recipients.map((r) => (
                <tr
                  key={r.id}
                  className="
                    border-b border-border
                    last:border-0
                    hover:bg-surface-alt/40
                    transition
                  "
                >

                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {r.name}
                    </div>

                    <div className="text-text-dim text-xs">
                      {r.email}
                    </div>
                  </td>


                  {/* Language */}
                  <td className="px-4 py-3">
                    <span className="
                      ai-badge
                      !text-[10px]
                      !py-0.5
                    ">
                      {r.language}
                    </span>
                  </td>


                  {/* Location */}
                  <td className="px-4 py-3 text-text-dim">
                    {r.city}
                    {r.city && r.state ? ', ' : ''}
                    {r.state}
                  </td>


                  {/* Occupation */}
                  <td className="px-4 py-3 text-text-dim">
                    {r.occupation}
                  </td>


                  {/* Organization */}
                  <td className="px-4 py-3 text-text-dim">
                    {r.organization}
                  </td>


                  {/* Engagement */}
                  <td className="px-4 py-3">
                    <span className="
                      font-mono
                      text-teal
                      drop-shadow-[0_0_6px_rgba(45,212,191,0.4)]
                    ">
                      {r.engagement_score}
                    </span>
                  </td>


                  {/* Remove */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="
                        text-xs
                        text-text-dim
                        hover:text-danger
                        transition
                      "
                    >
                      Remove
                    </button>
                  </td>

                </tr>
              ))}


              {/* Empty State */}
              {recipients.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="
                      px-4 py-12
                      text-center
                      text-text-dim
                      text-sm
                    "
                  >
                    <div className="flex flex-col items-center gap-3">

                      <div className="
                        w-12 h-12
                        rounded-full
                        flex items-center justify-center
                        bg-violet/10
                        border border-violet/20
                        text-violet
                        text-xl
                      ">
                        ✦
                      </div>

                      <span>
                        No recipients match these filters.
                      </span>

                    </div>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}