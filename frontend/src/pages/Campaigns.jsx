import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"

const TYPE_COLORS = {
  awareness: 'text-teal border-teal/30 bg-teal/10',
  emergency: 'text-danger border-danger/30 bg-danger/10',
  education: 'text-violet border-violet/30 bg-violet/10',
  announcement: 'text-signal border-signal/30 bg-signal/10',
}

const STATUS_LABEL = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sending: 'Sending',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

export default function Campaigns() {
  const { user } = useAuth()
  const canManageCampaigns = ['admin', 'campaign_manager'].includes(user?.role)
  const canDeleteCampaigns = user?.role === 'admin'
  const [searchParams] = useSearchParams()
  const templateId = searchParams.get('template')

  const [campaigns, setCampaigns] = useState([])
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
  name: '',
  description: '',
  type: 'awareness',
  status: 'draft',
  scheduled_at: '',
})

  const [saving, setSaving] = useState(false)
  const [tone, setTone] = useState("informative")
  const [selectedDate, setSelectedDate] = useState(null)

const [selectedHour, setSelectedHour] = useState("10")
const [selectedMinute, setSelectedMinute] = useState("00")
const [selectedPeriod, setSelectedPeriod] = useState("AM")

  const navigate = useNavigate()

// Recipient Selection
const [recipients, setRecipients] = useState([])
const [selectedRecipients, setSelectedRecipients] = useState([])
const [segmentFilter, setSegmentFilter] = useState({
  language: '', state: '', city: '', occupation: '', organization: '',
  min_engagement_score: '', max_engagement_score: ''
})
const [segmentOptions, setSegmentOptions] = useState({
  languages: [], states: [], cities: [], occupations: [], organizations: []
})
const [segmentPreviewCount, setSegmentPreviewCount] = useState(null)

const [search, setSearch] = useState("")
const [languageFilter, setLanguageFilter] = useState("")
const [stateFilter, setStateFilter] = useState("")
const [cityFilter, setCityFilter] = useState("")
const [organizationFilter, setOrganizationFilter] = useState("")
const [occupationFilter, setOccupationFilter] = useState("")

function toggleRecipient(id) {
  setSelectedRecipients((prev) => {
    if (prev.includes(id)) {
      return prev.filter((item) => item !== id)
    }

    return [...prev, id]
  })
}


  // Load campaigns
  async function load() {
  try {
    const campaignRes = await api.get('/campaigns')
    setCampaigns(campaignRes.data)

    if (!canManageCampaigns) return

    const [recipientRes, optionsRes] = await Promise.all([
      api.get('/recipients'),
      api.get('/recipients/segments/options'),
    ])
    setRecipients(recipientRes.data)
    setSegmentOptions(optionsRes.data)
  } catch (error) {
    console.error(error)
  }
}


  async function handleDelete(id) {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this campaign?"
  )

  if (!confirmDelete) return

  try {
    await api.delete(`/campaigns/${id}`)

    // Remove from UI immediately
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  } catch (error) {
    console.error("Delete failed:", error)
    alert("Failed to delete campaign.")
  }
}

  // Load campaigns and open form when template is selected
  useEffect(() => {
    load()

    if (templateId && canManageCampaigns) {
      setShowForm(true)
    }
  }, [templateId, canManageCampaigns])

  // Load selected template
  useEffect(() => {
    async function loadTemplate() {
      if (!templateId || !canManageCampaigns) return

      try {
        const res = await api.get(`/templates/${templateId}`)

        setForm({
          name: res.data.name || '',
          description: res.data.content || '',
          type: res.data.category || 'awareness',
        })
      } catch (error) {
        console.error('Template loading failed:', error)
      }
    }

    loadTemplate()
  }, [templateId, canManageCampaigns])

  // Create campaign
  async function previewSegment() {
    try {
      const payload = Object.fromEntries(
        Object.entries(segmentFilter).filter(([, value]) => value !== '')
      )
      const res = await api.post('/recipients/segments/preview', payload)
      setSegmentPreviewCount(res.data.length)
    } catch (error) {
      console.error('Segment preview failed:', error)
      alert(error.response?.data?.detail || 'Unable to preview segment.')
    }
  }

  async function handleCreate(e) {
    e.preventDefault()

    if (!form.name.trim()) {
      return
    }

    setSaving(true)

    try {
      const res = await api.post('/campaigns', {

  ...form,

  scheduled_at:
    form.scheduled_at
      ? new Date(form.scheduled_at).toISOString()
      : null,

  recipient_ids: selectedRecipients,

  channels: [],
  segment_filter: Object.fromEntries(
    Object.entries(segmentFilter).filter(([, value]) => value !== '')
  ),
})

      navigate(`/campaigns/${res.data.id}`)
    } catch (error) {
      console.error('Campaign creation failed:', error)

      alert(
        error.response?.data?.detail ||
          'Failed to create campaign. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }


function getCampaignsForDate(date) {
  return campaigns.filter((campaign) => {
    if (!campaign.scheduled_at) return false

    return (
      new Date(campaign.scheduled_at)
        .toISOString()
        .slice(0,10)
        === date
    )
  })
}

function get24HourTime() {

  let hour = parseInt(selectedHour)

  if (selectedPeriod === "PM" && hour !== 12) {
    hour += 12
  }

  if (selectedPeriod === "AM" && hour === 12) {
    hour = 0
  }

  return `${String(hour).padStart(2,'0')}:${selectedMinute}`

}

  return (
    <div className="relative">

      {/* ========================================
          PAGE HEADER
      ======================================== */}

      <header className="mb-7 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-2xl font-semibold">
              Campaigns
            </h1>

            <span className="ai-badge">
              AI Campaign Network
            </span>
          </div>

          <p className="text-text-dim text-sm mt-1">
            {canManageCampaigns
              ? 'Plan, generate, translate, and dispatch communication campaigns.'
              : 'Review existing campaigns, prepare content, and monitor dispatch.'}
          </p>
        </div>

        {canManageCampaigns && <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="ai-button text-sm"
        >
          {showForm ? 'Cancel' : '+ New Campaign'}
        </button>}
      </header>


      {/* ========================================
          CREATE CAMPAIGN FORM
      ======================================== */}

      {showForm && canManageCampaigns && (
       <form
  onSubmit={handleCreate}
  className="ai-gradient-border p-3 mb-4 space-y-3 ai-processing"
>

          {/* Form Header */}

          <div className="flex items-center gap-2 mb-1">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-semibold">
                  Create New Campaign
                </h2>

                <span className="ai-badge">
                  AI Ready
                </span>
              </div>

              <p className="text-text-dim text-[11px] mt-0.5">
                Define your campaign and continue to AI-powered communication generation.
              </p>
            </div>
          </div>


          {/* ========================================
              CAMPAIGN NAME
          ======================================== */}

          <div>
            <label className="text-[11px] text-text-dim block mb-1">
              Campaign name
            </label>

            <input
              type="text"
              required
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="
                w-full
                bg-surface-alt/70
                border border-border
                rounded-lg
                px-3 py-2
                text-sm
                text-text
                outline-none
                transition
                focus:border-violet
                focus:ring-1
                focus:ring-violet/30
              "
              placeholder="e.g. Monsoon Health Awareness Drive"
            />
          </div>


          {/* ========================================
              DESCRIPTION
          ======================================== */}

          <div>
            <label className="text-[11px] text-text-dim block mb-1">
              Description / brief
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="
                w-full
                bg-surface-alt/70
                border border-border
                rounded-lg
                px-3 py-2
                text-sm
                text-text
                outline-none
                transition
                focus:border-violet
                focus:ring-1
                focus:ring-violet/30
                resize-none
              "
              placeholder="What is this campaign about? This will seed AI content generation."
            />
          </div>


          {/* ========================================
              CAMPAIGN TYPE
          ======================================== */}

          <div>
            <label className="text-[11px] text-text-dim block mb-1">
              Type
            </label>

            <select
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
              className="theme-select"
            >
              {Object.keys(TYPE_COLORS).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>



{/* ========================================
    CAMPAIGN SCHEDULING
======================================== */}

<div className="ai-card ai-gradient-border rounded-xl p-4">

  {/* Header */}

  <div className="flex items-center gap-3 mb-3">

    <div
      className="
        w-10
        h-10
        rounded-xl
        flex
        items-center
        justify-center
        bg-violet/10
        border
        border-violet/30
        text-xl
      "
    >
      📅
    </div>

    <div>
      <h3 className="font-display text-sm font-semibold">
        Campaign Scheduling
      </h3>

      <p className="text-[11px] text-text-dim">
        Schedule automatic campaign execution
      </p>
    </div>

  </div>

  <label className="text-[11px] text-text-dim block mb-4">
    Select Date & Time
  </label>

  <div className="flex flex-col lg:flex-row items-start gap-4 w-full">
    {/* ========================================
        LEFT : CALENDAR
    ======================================== */}

    <div>
      <div className="w-full lg:flex-[8.5] min-w-0"></div>
      

      <Calendar

        value={selectedDate}

        onChange={(date) => {

          setSelectedDate(date)

          const formatted =
            `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`

          setForm(prev => ({
            ...prev,
            scheduled_at:
`${formatted}T${get24HourTime()}`,
            status: "scheduled"
          }))

        }}

      />

    </div>
    


    {/* ========================================
        RIGHT : TIME + SUMMARY
    ======================================== */}

   <div className="w-full lg:flex[2.5] max-w-[420px] space-y-4 -ml-2 -mt-2">

      {/* TIME */}

      <div className="ai-card rounded-xl p-4 w-full">

        <p className="text-xs font-semibold mb-6">
          Select Time
        </p>

        <div className="flex gap-2">

  <select
    value={selectedHour}
    onChange={(e)=>{

      setSelectedHour(e.target.value)

      if(selectedDate){

        const formatted =
          `${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`

        setForm(prev=>({
          ...prev,
          scheduled_at:
          `${formatted}T${get24HourTime()}`,
          status:"scheduled"
        }))
      }

    }}
    className="theme-select"
  >

    {
      Array.from({length:12},(_,i)=>{

        const h = String(i+1).padStart(2,'0')

        return (
          <option key={h}>
            {h}
          </option>
        )

      })
    }

  </select>


  <select
    value={selectedMinute}
    onChange={(e)=>setSelectedMinute(e.target.value)}
    className="theme-select"
  >

    {
      ["00","15","30","45"].map(m=>(
        <option key={m}>
          {m}
        </option>
      ))
    }

  </select>


  <select
    value={selectedPeriod}
    onChange={(e)=>setSelectedPeriod(e.target.value)}
    className="theme-select"
  >

    <option>AM</option>
    <option>PM</option>

  </select>


</div>

      </div>


      {/* DATE CARD */}

      <div className="ai-card rounded-xl p-4">

        <p className="text-xs font-semibold mb-3">
          Selected Schedule
        </p>

        {selectedDate ? (

          <div className="space-y-2">

            <div className="flex justify-between">

              <span className="text-text-dim text-xs">
                Date
              </span>

              <span className="text-sm">
                {selectedDate.toLocaleDateString()}
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-text-dim text-xs">
                Time
              </span>

              <span className="text-sm">
                {selectedHour}:{selectedMinute} {selectedPeriod}
              </span>

            </div>

          </div>

        ) : (

          <p className="text-xs text-text-dim">
            No date selected.
          </p>

        )}

      </div>


      {/* STATUS */}

      {form.scheduled_at && (

        <div
          className="
            rounded-xl
            border
            border-teal/30
            bg-teal/10
            p-4
          "
        >

          <div className="flex items-center gap-2 mb-1">

            <span className="text-teal text-lg">
              ✓
            </span>

            <span className="font-semibold text-sm text-teal">
              Campaign Scheduled
            </span>

          </div>

          <p className="text-xs text-text-dim">
            This campaign will automatically start on:
          </p>

          <p className="mt-2 font-medium">

            {new Date(form.scheduled_at).toLocaleString()}

          </p>

        </div>

      )}

    </div>

  </div>

</div>

{/* ========================================
    AUDIENCE SEGMENTATION
======================================== */}

<div className="ai-card ai-gradient-border rounded-xl p-4">
  <div className="flex items-center justify-between mb-3">
    <div>
      <h3 className="font-display text-sm font-semibold">Audience Segmentation</h3>
      <p className="text-[11px] text-text-dim mt-1">
        Target recipients by language, geography, occupation, organization, and engagement history.
      </p>
    </div>
    <button type="button" onClick={previewSegment} className="ai-button text-xs">
      Preview Audience
    </button>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
    {[
      ['language', 'Language', segmentOptions.languages],
      ['state', 'State', segmentOptions.states],
      ['city', 'City', segmentOptions.cities],
      ['occupation', 'Occupation', segmentOptions.occupations],
      ['organization', 'Organization', segmentOptions.organizations],
    ].map(([key, label, options]) => (
      <select
        key={key}
        value={segmentFilter[key]}
        onChange={(e) => {
          setSegmentFilter((prev) => ({ ...prev, [key]: e.target.value }))
          setSegmentPreviewCount(null)
        }}
        className="theme-select"
      >
        <option value="">All {label}s</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    ))}

    <input
      type="number"
      min="0"
      step="0.1"
      placeholder="Minimum engagement score"
      value={segmentFilter.min_engagement_score}
      onChange={(e) => setSegmentFilter((prev) => ({ ...prev, min_engagement_score: e.target.value }))}
      className="theme-select"
    />
    <input
      type="number"
      min="0"
      step="0.1"
      placeholder="Maximum engagement score"
      value={segmentFilter.max_engagement_score}
      onChange={(e) => setSegmentFilter((prev) => ({ ...prev, max_engagement_score: e.target.value }))}
      className="theme-select"
    />
  </div>

  {segmentPreviewCount !== null && (
    <p className="text-xs text-teal mt-3">
      {segmentPreviewCount} recipient{segmentPreviewCount === 1 ? '' : 's'} match this segment.
    </p>
  )}
</div>

{/* ========================================
    RECIPIENT SELECTION
======================================== */}

<div className="ai-card ai-gradient-border rounded-xl p-4">

  <div className="flex items-center justify-between mb-3">

    <h3 className="font-display text-sm font-semibold">
      Select Recipients
    </h3>

    <span className="ai-badge text-[10px]">
      {selectedRecipients.length} Selected
    </span>

  </div>


  <input
    type="text"
    placeholder="Search recipients..."
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
    className="
      w-full
      bg-surface-alt/70
      border border-border
      rounded-lg
      px-3 py-2
      text-xs
      text-text
      outline-none
      focus:border-violet
      mb-3
    "
  />


  <div className="
    max-h-44
    overflow-y-auto
    space-y-2
  ">

    {recipients
      .filter((recipient)=>
        recipient.name
        .toLowerCase()
        .includes(search.toLowerCase())
      )
      .map((recipient)=>(

      <div
        key={recipient.id}
        onClick={() =>
          toggleRecipient(recipient.id)
        }
        className={`
          flex items-center justify-between
          px-3 py-2
          rounded-lg
          cursor-pointer
          transition

          ${
            selectedRecipients.includes(recipient.id)

            ? 
            "bg-teal/10 border border-teal/30"

            :
            "bg-surface-alt/50 border border-border hover:border-violet/40"
          }
        `}
      >

        <div>

          <p className="
            text-xs
            font-medium
            text-text
          ">
            {recipient.name}
          </p>

          <p className="
            text-[10px]
            text-text-dim
          ">
            {recipient.language}
            {recipient.city && ` • ${recipient.city}`}
          </p>

        </div>


        <input
          type="checkbox"
          checked={
            selectedRecipients.includes(
              recipient.id
            )
          }
          onChange={() =>
            toggleRecipient(recipient.id)
          }
          onClick={(e)=>
            e.stopPropagation()
          }
          className="
            w-4
            h-4
            accent-teal
            cursor-pointer
          "
        />

      </div>

    ))}

  </div>


  {selectedRecipients.length > 0 && (

    <div className="
      flex
      flex-wrap
      gap-2
      mt-3
    ">

      {selectedRecipients.map((id)=>{

        const recipient =
          recipients.find(
            r=>r.id===id
          )

        return (

          <span
            key={id}
            className="
              text-[10px]
              px-2
              py-1
              rounded-full
              bg-violet/10
              text-violet
              border
              border-violet/30
            "
          >
            {recipient?.name}
          </span>

        )

      })}

    </div>

  )}

</div>



          {/* ========================================
              CREATE BUTTON
          ======================================== */}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="ai-button text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating…' : 'Create & continue →'}
            </button>
          </div>

        </form>
      )}


      {/* ========================================
          CAMPAIGN NETWORK
      ======================================== */}

      <div className="flex items-center gap-2 mb-4">
        <span className="ai-badge">
          Campaign Network
        </span>

        <span className="text-[11px] text-text-dim">
          Manage active communication workflows
        </span>
      </div>


      {/* ========================================
          CAMPAIGN CARDS
      ======================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            to={`/campaigns/${campaign.id}`}
            className="
              ai-card
              p-5
              hover:border-violet/40
              transition
              block
            "
          >

            {/* Type + Status */}

            <div className="flex items-center justify-between mb-3">

              <span
                className={`
                  text-[11px]
                  px-2
                  py-0.5
                  rounded-full
                  border
                  capitalize
                  ${TYPE_COLORS[campaign.type] || 'text-text-dim border-border bg-surface-alt/30'}
                `}
              >
                {campaign.type || 'Campaign'}
              </span>

              <span className="text-[11px] text-text-dim">
                {STATUS_LABEL[campaign.status] || campaign.status || 'Draft'}
              </span>

            </div>


            {/* Campaign Name */}

            <h3 className="font-display font-semibold mb-1">
              {campaign.name}
            </h3>


            {/* Description */}

            <p className="text-text-dim text-xs line-clamp-2">
              {campaign.description || 'No description provided.'}
            </p>


            {/* AI Network Indicator */}

           <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">

  <div className="flex items-center gap-2">
    <span
      className="
        w-1.5
        h-1.5
        rounded-full
        bg-signal
        animate-pulse
      "
    />
    <span className="text-[10px] text-text-dim">
      Communication network active
    </span>
  </div>

  {canDeleteCampaigns && <button
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      handleDelete(campaign.id)
    }}
    className="text-red-500 hover:text-red-600 text-xs"
  >
    Delete
  </button>}

</div>

          </Link>
        ))}


        {/* ========================================
            EMPTY STATE
        ======================================== */}

        {campaigns.length === 0 && (
          <div
            className="
              col-span-full
              text-center
              text-text-dim
              text-sm
              py-12
              border
              border-dashed
              border-border
              rounded-xl
              bg-surface/40
            "
          >
            <div className="flex flex-col items-center gap-3">

              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-violet/10
                  border
                  border-violet/20
                  text-violet
                  text-xl
                  shadow-[0_0_20px_rgba(155,140,255,0.12)]
                "
              >
                ✦
              </div>

              <span>
                No campaigns yet. Create your first one above.
              </span>

            </div>
          </div>
        )}

      </div>

    </div>
  )
}