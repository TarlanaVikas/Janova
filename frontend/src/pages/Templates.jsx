import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const TYPE_COLORS = {
  awareness: 'text-teal border-teal/30 bg-teal/10',
  emergency: 'text-danger border-danger/30 bg-danger/10',
  education: 'text-violet border-violet/30 bg-violet/10',
  announcement: 'text-signal border-signal/30 bg-signal/10',
}

const LANGUAGES = [
  'English',
  'Hindi',
  'Telugu',
  'Tamil',
  'Bengali',
  'Marathi',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Punjabi',
  'Odia',
]

export default function Templates() {
  const navigate = useNavigate()

  const [templates, setTemplates] = useState([])
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    category: 'awareness',
    content: '',
    language: 'English',
  })

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // ========================================
  // OPEN TEMPLATE DETAILS
  // ========================================

  async function openTemplate(id) {
    try {
      const res = await api.get(`/templates/${id}`)
      setSelectedTemplate(res.data)
    } catch (error) {
      console.error('Failed to open template:', error)
    }
  }

  // ========================================
  // LOAD TEMPLATES
  // ========================================

  async function load() {
    try {
      setLoading(true)
      setError('')

      const res = await api.get('/templates')

      setTemplates(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError('Failed to load templates')
      console.error('Template loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    load()
  }, [])

  // ========================================
  // CREATE TEMPLATE
  // ========================================

  async function handleCreate(e) {
    e.preventDefault()

    if (!form.name.trim() || !form.content.trim()) {
      return
    }

    try {
      setSaving(true)
      setError('')

      await api.post('/templates/', form)

      setForm({
        name: '',
        category: 'awareness',
        content: '',
        language: 'English',
      })

      setShowForm(false)

      await load()
    } catch (error) {
      console.error('Create template failed:', error)

      setError(
        error.response?.data?.detail ||
          'Failed to create template'
      )
    } finally {
      setSaving(false)
    }
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
              Templates
            </h1>

            <span className="ai-badge">
              AI Content Library
            </span>
          </div>

          <p className="text-text-dim text-sm mt-1">
            Reusable content library for common communication scenarios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="ai-button text-sm"
        >
          {showForm ? 'Cancel' : '+ New Template'}
        </button>
      </header>


      {/* ========================================
          CREATE TEMPLATE FORM
      ======================================== */}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="ai-gradient-border p-5 mb-6 space-y-4 ai-processing"
        >

          {/* Form Header */}

          <div className="flex items-center gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-semibold">
                  Create New Template
                </h2>

                <span className="ai-badge">
                  AI Ready
                </span>
              </div>

              <p className="text-text-dim text-[11px] mt-1">
                Create reusable communication content for future campaigns.
              </p>
            </div>
          </div>


          {/* ========================================
              NAME + CATEGORY
          ======================================== */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Template Name */}

            <div>
              <label className="text-[11px] text-text-dim block mb-1">
                Template name
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
                placeholder="e.g. Public Health Advisory"
              />
            </div>


            {/* Category Dropdown */}

            <div>
              <label className="text-[11px] text-text-dim block mb-1">
                Category
              </label>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category: e.target.value,
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

          </div>


          {/* ========================================
              CONTENT
          ======================================== */}

          <div>
            <label className="text-[11px] text-text-dim block mb-1">
              Content
            </label>

            <textarea
              required
              rows={4}
              value={form.content}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  content: e.target.value,
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
                resize-none
              "
              placeholder="Reusable message text…"
            />
          </div>


          {/* ========================================
              LANGUAGE DROPDOWN
          ======================================== */}

          <div>
            <label className="text-[11px] text-text-dim block mb-1">
              Language
            </label>

            <select
              value={form.language}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  language: e.target.value,
                }))
              }
              className="theme-select"
            >
              {LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>


          {/* ========================================
              SAVE BUTTON
          ======================================== */}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="
                ai-button
                text-sm
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {saving ? 'Saving…' : 'Save template'}
            </button>
          </div>

        </form>
      )}


      {/* ========================================
          LOADING
      ======================================== */}

      {loading && (
        <div className="ai-card px-5 py-4 mb-5 text-text-dim text-sm">
          <span className="ai-badge mr-2">
            AI
          </span>

          Loading templates...
        </div>
      )}


      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div
          className="
            text-danger
            text-sm
            bg-danger/10
            border
            border-danger/20
            rounded-lg
            px-4
            py-3
            mb-5
          "
        >
          {error}
        </div>
      )}


      {/* ========================================
          TEMPLATE LIBRARY
      ======================================== */}

      <div className="flex items-center gap-2 mb-4">
        <span className="ai-badge">
          Communication Library
        </span>

        <span className="text-[11px] text-text-dim">
          Select a template to view details and use it in a campaign
        </span>
      </div>


      {/* ========================================
          TEMPLATE CARDS
      ======================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => openTemplate(template.id)}
            className="
              ai-card
              p-5
              cursor-pointer
              hover:border-violet/40
              transition
            "
          >

            {/* Category + Language */}

            <div className="flex items-center justify-between mb-3">

              <span
                className={`
                  text-[11px]
                  px-2
                  py-0.5
                  rounded-full
                  border
                  capitalize
                  ${
                    TYPE_COLORS[template.category] ||
                    'text-text-dim border-border bg-surface-alt/30'
                  }
                `}
              >
                {template.category || 'Template'}
              </span>

              <span className="text-[11px] text-text-dim">
                {template.language || 'English'}
              </span>

            </div>


            {/* Template Name */}

            <h3 className="font-display font-semibold mb-2">
              {template.name}
            </h3>


            {/* Template Content */}

            <p className="text-text-dim text-sm leading-relaxed line-clamp-3">
              {template.content || 'No content provided.'}
            </p>


            {/* Network Indicator */}

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">

              <span
                className="
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-signal
                  animate-pulse
                  shadow-[0_0_8px_rgba(45,212,191,0.7)]
                "
              />

              <span className="text-[10px] text-text-dim">
                AI communication template
              </span>

            </div>

          </div>
        ))}


        {/* ========================================
            EMPTY STATE
        ======================================== */}

        {templates.length === 0 && !loading && (
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
                No templates yet. Create your first one above.
              </span>

            </div>

          </div>
        )}

      </div>


      {/* ========================================
          TEMPLATE DETAILS MODAL
      ======================================== */}

      {selectedTemplate && (
        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/60
            backdrop-blur-sm
            flex
            items-center
            justify-center
            px-4
          "
          onClick={() => setSelectedTemplate(null)}
        >

          <div
            className="
              ai-gradient-border
              p-6
              w-full
              max-w-lg
              relative
            "
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="flex items-center gap-2 mb-4">

              <span className="ai-badge">
                Template
              </span>

              <span className="text-[11px] text-text-dim">
                AI Communication Library
              </span>

            </div>


            {/* Template Name */}

            <h2 className="font-display text-xl font-semibold mb-4">
              {selectedTemplate.name}
            </h2>


            {/* Category */}

            <div className="flex items-center gap-2 mb-3">

              <span className="text-xs text-text-dim">
                Category:
              </span>

              <span
                className={`
                  text-[11px]
                  px-2
                  py-0.5
                  rounded-full
                  border
                  capitalize
                  ${
                    TYPE_COLORS[selectedTemplate.category] ||
                    'text-text-dim border-border bg-surface-alt/30'
                  }
                `}
              >
                {selectedTemplate.category || 'Template'}
              </span>

            </div>


            {/* Language */}

            <p className="text-sm text-text-dim mb-4">
              Language:{' '}
              <span className="text-text">
                {selectedTemplate.language || 'English'}
              </span>
            </p>


            {/* Content */}

            <div
              className="
                bg-surface-alt/50
                border border-border
                rounded-lg
                p-4
                mb-5
              "
            >
              <p className="text-text-dim text-sm leading-relaxed whitespace-pre-wrap">
                {selectedTemplate.content || 'No content provided.'}
              </p>
            </div>


            {/* Modal Buttons */}

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  navigate(
                    `/campaigns/create?template=${selectedTemplate.id}`
                  )
                }}
                className="ai-button text-sm"
              >
                Use Template
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  font-medium
                  text-text-dim
                  border border-border
                  bg-surface-alt/70
                  hover:border-violet/40
                  hover:text-text
                  transition
                "
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}