import React, { useEffect, useRef, useState } from 'react'
import api from '../services/api'
import PosterPreview from '../components/PosterPreview'

export default function CanvasStudio() {
  // ==========================================
  // STATE
  // ==========================================

  const [campaigns, setCampaigns] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  const [campaignType, setCampaignType] = useState('Public Awareness')
  const [language, setLanguage] = useState('English')

  const [posterTitle, setPosterTitle] = useState('')
  const [posterContent, setPosterContent] = useState('')

  const [generatedPoster, setGeneratedPoster] = useState(null)
  const [savedPoster, setSavedPoster] = useState(false)

  const [isTranslating, setIsTranslating] = useState(false)

  const posterRef = useRef(null)

  // ==========================================
  // LOAD CAMPAIGNS
  // ==========================================

  useEffect(() => {
    api
      .get('/campaigns')
      .then((res) => {
        setCampaigns(res.data)
      })
      .catch((err) => {
        console.error('Failed to load campaigns:', err)
      })
  }, [])

  // ==========================================
  // SELECT CAMPAIGN
  // ==========================================

  const handleSelectCampaign = (campaign) => {
    setSelectedCampaign(campaign)

    setGeneratedPoster(null)
    setSavedPoster(false)

    setPosterTitle(
      campaign.name || ''
    )

    setPosterContent(
      campaign.description ||
      'Join us and support this important public awareness campaign.'
    )

    if (campaign.type) {
      setCampaignType(campaign.type)
    }

    // Reset language when selecting a new campaign
    setLanguage('English')
  }

  // ==========================================
  // GENERATE POSTER
  // ==========================================

  const generatePoster = async () => {
    if (!selectedCampaign) {
      alert('Please select a campaign first')
      return
    }

    const originalTitle =
      posterTitle.trim() ||
      selectedCampaign.name ||
      'Public Awareness Campaign'

    const originalContent =
      posterContent.trim() ||
      selectedCampaign.description ||
      'Your campaign message will appear here.'

    setIsTranslating(true)

    try {
      let finalTitle = originalTitle
      let finalContent = originalContent

      // ======================================
      // ENGLISH
      // ======================================

      if (language === 'English') {
        finalTitle = originalTitle
        finalContent = originalContent
      }

      // ======================================
      // OTHER LANGUAGES
      // ======================================

      else {
        const response = await api.post('/ai/translate', {
          campaign_id: selectedCampaign.id,
          source_content: originalContent,
          tone: 'informative',
          target_languages: [language],
        })

        console.log(
          'Translation response:',
          response.data
        )

        if (
          response.data &&
          response.data.length > 0 &&
          response.data[0].content
        ) {
          finalContent =
            response.data[0].content
        } else {
          throw new Error(
            'Translation response did not contain translated content'
          )
        }

        // The backend currently translates
        // source_content only.
        // Keep title as the campaign/poster title.
        finalTitle = originalTitle
      }

      // ======================================
      // STORE GENERATED POSTER
      // ======================================

      setGeneratedPoster({
        campaign:
          selectedCampaign.name,

        title:
          finalTitle,

        language:
          language,

        content:
          finalContent,
      })

      setSavedPoster(false)

    } catch (error) {
      console.error(
        'Poster translation error:',
        error
      )

      console.error(
        'Backend response:',
        error.response?.data
      )

      alert(
        error.response?.data?.detail ||
        error.message ||
        'Failed to translate poster content'
      )

    } finally {
      setIsTranslating(false)
    }
  }

  // ==========================================
  // SAVE POSTER
  // ==========================================

  const savePoster = async () => {
    if (!generatedPoster) {
      alert('Generate a poster first')
      return
    }

    if (!selectedCampaign) {
      alert('Please select a campaign first')
      return
    }

    try {
      const response = await api.post(
        '/posters/',
        {
          campaign_id:
            selectedCampaign.id,

          title:
            generatedPoster.title ||
            selectedCampaign.name,

          language:
            generatedPoster.language,

          content:
            generatedPoster.content,
        }
      )

      console.log(
        'Poster saved:',
        response.data
      )

      setSavedPoster(true)

    } catch (error) {
      console.error(
        'Save poster error:',
        error
      )

      alert(
        error.response?.data?.detail ||
        'Failed to save poster'
      )
    }
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="relative">

      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <header className="mb-7">

        <div className="flex items-center gap-3 mb-2">

          <h1 className="font-display text-2xl font-semibold">
            Canvas Studio
          </h1>

          <span className="ai-badge">
            AI Poster Studio
          </span>

        </div>

        <p className="text-text-dim text-sm">
          Create visual posters for multilingual public awareness campaigns.
        </p>

      </header>


      {/* =====================================
          MAIN GRID
      ====================================== */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-3
        gap-5
      ">


        {/* =====================================
            POSTER GENERATOR
        ====================================== */}

        <div className="ai-gradient-border p-5">

          <div className="
            flex
            items-center
            gap-2
            mb-5
          ">

            <h2 className="
              font-display
              text-sm
              font-semibold
            ">
              Poster Generator
            </h2>

            <span className="
              ai-badge
              !text-[10px]
              !py-0.5
            ">
              Live
            </span>

          </div>


          {/* SELECTED CAMPAIGN */}

          {selectedCampaign && (

            <div className="
              mb-4
              p-3
              rounded-lg
              bg-violet/5
              border
              border-violet/20
            ">

              <p className="
                text-[11px]
                text-text-dim
              ">
                Selected Campaign
              </p>

              <p className="
                text-sm
                font-medium
                mt-1
                text-violet
              ">
                {selectedCampaign.name}
              </p>

            </div>

          )}


          {/* CAMPAIGN TYPE */}

<label className="
  text-[11px]
  text-text-dim
  block
  mb-1
">
  Campaign Type
</label>

<select
  value={campaignType}
  onChange={(e) =>
    setCampaignType(e.target.value)
  }
  className="theme-select"
>
  <option>Public Awareness</option>
  <option>Agriculture</option>
  <option>Health</option>
  <option>Education</option>
  <option>Emergency</option>
</select>


{/* LANGUAGE */}

<label className="
  text-[11px]
  text-text-dim
  block
  mt-4
  mb-1
">
  Language
</label>

<select
  value={language}
  onChange={(e) =>
    setLanguage(e.target.value)
  }
  className="theme-select"
>
  <option>English</option>
  <option>Telugu</option>
  <option>Hindi</option>
  <option>Tamil</option>
  <option>Malayalam</option>
</select>


          {/* POSTER TITLE */}

          <label className="
            text-[11px]
            text-text-dim
            block
            mt-4
            mb-1
          ">
            Poster Title
          </label>

          <input
            type="text"
            value={posterTitle}
            onChange={(e) =>
              setPosterTitle(e.target.value)
            }
            placeholder="Enter poster title..."
            className="
              w-full
              bg-surface-alt/70
              border
              border-border
              rounded-lg
              px-3
              py-2
              text-sm
              outline-none
              transition
              focus:border-violet
            "
          />


          {/* POSTER CONTENT */}

          <label className="
            text-[11px]
            text-text-dim
            block
            mt-4
            mb-1
          ">
            Poster Content
          </label>

          <textarea
            value={posterContent}
            onChange={(e) =>
              setPosterContent(e.target.value)
            }
            placeholder="Enter announcement details..."
            className="
              w-full
              h-28
              bg-surface-alt/70
              border
              border-border
              rounded-lg
              px-3
              py-3
              text-sm
              resize-none
              outline-none
              transition
              focus:border-violet
            "
          />


          {/* GENERATE BUTTON */}

          <button
            type="button"
            onClick={generatePoster}
            disabled={isTranslating}
            className="
              ai-button
              w-full
              mt-5
              text-sm
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {isTranslating
              ? '⏳ Translating & Generating...'
              : '✨ Generate Real Poster'}
          </button>


          {/* SAVE BUTTON */}

          {generatedPoster && (

            <button
              type="button"
              onClick={savePoster}
              disabled={savedPoster}
              className={`
                w-full
                mt-3
                rounded-lg
                py-2.5
                text-sm
                font-medium
                transition
                border

                ${
                  savedPoster
                    ? `
                      bg-teal/10
                      border-teal/30
                      text-teal
                      cursor-default
                    `
                    : `
                      border-border
                      hover:bg-surface-alt
                    `
                }
              `}
            >
              {savedPoster
                ? '✓ Saved to Campaign'
                : 'Save Poster'}
            </button>

          )}

        </div>


        {/* =====================================
            CAMPAIGN TEMPLATES
        ====================================== */}

        <div className="ai-gradient-border p-5">

          <div className="
            flex
            items-center
            gap-2
            mb-5
          ">

            <h2 className="
              font-display
              text-sm
              font-semibold
            ">
              Campaign Templates
            </h2>

            <span className="
              ai-badge
              !text-[10px]
              !py-0.5
            ">
              {campaigns.length}
            </span>

          </div>


          <div className="
            grid
            grid-cols-1
            gap-3
            max-h-[500px]
            overflow-y-auto
            pr-1
          ">

            {campaigns.length > 0 ? (

              campaigns.map((campaign) => (

                <div
                  key={campaign.id}
                  onClick={() =>
                    handleSelectCampaign(campaign)
                  }
                  className={`
                    p-4
                    rounded-xl
                    cursor-pointer
                    border
                    transition

                    ${
                      selectedCampaign?.id ===
                      campaign.id

                        ? `
                          border-violet
                          bg-violet/10
                        `

                        : `
                          border-border
                          bg-surface-alt/40
                          hover:border-violet/50
                          hover:bg-violet/5
                        `
                    }
                  `}
                >

                  <div className="
                    flex
                    items-start
                    justify-between
                    gap-3
                  ">

                    <div>

                      <h3 className="
                        text-sm
                        font-medium
                      ">
                        {campaign.name}
                      </h3>

                      <p className="
                        text-xs
                        text-text-dim
                        mt-1
                        line-clamp-2
                      ">
                        {campaign.description ||
                          'Create a poster for this campaign.'}
                      </p>

                    </div>

                    {selectedCampaign?.id ===
                      campaign.id && (

                      <span className="
                        text-[10px]
                        px-2
                        py-0.5
                        rounded-full
                        bg-violet/10
                        border
                        border-violet/20
                        text-violet
                      ">
                        Selected
                      </span>

                    )}

                  </div>


                  <div className="
                    mt-3
                    flex
                    items-center
                    gap-2
                  ">

                    <span className="
                      ai-badge
                      !text-[10px]
                      !py-0.5
                    ">
                      {campaign.type ||
                        'Campaign'}
                    </span>

                    <span className="
                      text-[10px]
                      text-text-dim
                    ">
                      {campaign.status ||
                        'Active'}
                    </span>

                  </div>

                </div>

              ))

            ) : (

              <div className="
                text-center
                py-10
                border
                border-dashed
                border-border
                rounded-xl
              ">

                <div className="
                  text-3xl
                  mb-2
                ">
                  ✦
                </div>

                <p className="
                  text-sm
                  text-text-dim
                ">
                  No campaigns available
                </p>

                <p className="
                  text-[11px]
                  text-text-dim
                  mt-1
                ">
                  Create a campaign to generate a poster.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* =====================================
            LIVE POSTER PREVIEW
        ====================================== */}

        <div className="
          ai-gradient-border
          p-5
        ">

          <div className="
            flex
            items-center
            gap-2
            mb-5
          ">

            <h2 className="
              font-display
              text-sm
              font-semibold
            ">
              Live Poster Preview
            </h2>

            <span className="
              ai-badge
              !text-[10px]
              !py-0.5
            ">
              Real-time
            </span>

          </div>


          {/* ACTUAL POSTER */}

          <div className="
  bg-surface-alt/50
  border
  border-border
  rounded-xl
  p-4
  flex
  justify-center
  items-center
  overflow-hidden
">
            <PosterPreview
              ref={posterRef}

              title={
                generatedPoster?.title ||
                posterTitle ||
                selectedCampaign?.name ||
                'Public Awareness Campaign'
              }

              content={
                generatedPoster?.content ||
                posterContent ||
                selectedCampaign?.description ||
                'Your campaign message will appear here.'
              }

              language={
                generatedPoster?.language ||
                language
              }

              campaignType={
                campaignType
              }

              campaignName={
                selectedCampaign?.name
              }
            />

          </div>


          {/* GENERATED STATUS */}

          {generatedPoster && (

            <div className="
              mt-4
              p-3
              rounded-lg
              bg-teal/10
              border
              border-teal/30
              text-teal
              text-xs
              text-center
            ">
              ✓ Poster generated successfully in {generatedPoster.language}
            </div>

          )}

        </div>

      </div>

    </div>
  )
}