import React, { forwardRef } from 'react'

const PosterPreview = forwardRef(
  (
    {
      title,
      content,
      language,
      campaignType,
      campaignName,
    },
    ref
  ) => {
    return (
      <div
  ref={ref}
  className="
    relative
    w-full
    h-full
    min-h-[520px]
    overflow-hidden
    rounded-xl
    border
    border-violet-400/20
    bg-gradient-to-br
    from-[#17122b]
    via-[#15152b]
    to-[#0d2929]
    shadow-xl
    text-white
  "
>
        {/* =====================================
            BACKGROUND DECORATIONS
        ====================================== */}

        <div
          className="
            absolute
            -top-24
            -right-24
            h-56
            w-56
            rounded-full
            bg-violet-600/20
            blur-3xl
          "
        />

        <div
          className="
            absolute
            -bottom-24
            -left-24
            h-56
            w-56
            rounded-full
            bg-teal-500/15
            blur-3xl
          "
        />

        <div
          className="
            absolute
            top-1/2
            left-1/2
            h-64
            w-64
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-violet-500/5
            blur-3xl
          "
        />


        {/* =====================================
            POSTER INNER CONTENT
        ====================================== */}

        <div
          className="
            relative
            z-10
            flex
            h-full
            flex-col
            p-5
            sm:p-6
          "
        >


          {/* =====================================
              HEADER / PLATFORM BRANDING
          ====================================== */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
              border-b
              border-white/10
              pb-3
            "
          >

            <div className="min-w-0">

              <p
                className="
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-teal-300
                "
              >
                Public Awareness
              </p>

              <p
                className="
                  mt-1
                  truncate
                  text-[9px]
                  text-white/50
                "
              >
                Multilingual Communication Platform
              </p>

            </div>


            {/* Platform Icon */}

            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-violet-400/20
                bg-violet-500/10
                text-sm
                text-violet-300
              "
            >
              ✦
            </div>

          </div>


          {/* =====================================
              CAMPAIGN TYPE
          ====================================== */}

          <div className="mt-4">

            <span
              className="
                inline-flex
                max-w-full
                rounded-full
                border
                border-violet-400/25
                bg-violet-500/10
                px-2.5
                py-1
                text-[8px]
                font-semibold
                uppercase
                tracking-wide
                text-violet-200
              "
            >
              {campaignType || 'Public Awareness'}
            </span>

          </div>


          {/* =====================================
              CAMPAIGN TITLE
          ====================================== */}

          <div
            className="
              mt-3
              text-center
            "
          >

            <h1
              className="
                mx-auto
                max-w-[95%]
                break-words
                text-lg
                font-bold
                leading-tight
                text-white
                sm:text-xl
              "
            >
              {title || 'Public Awareness Campaign'}
            </h1>


            {/* Campaign Name */}

            {campaignName &&
              campaignName !== title && (

                <p
                  className="
                    mx-auto
                    mt-1
                    max-w-[90%]
                    truncate
                    text-[9px]
                    text-white/50
                  "
                >
                  {campaignName}
                </p>

              )}

          </div>


          {/* =====================================
              LANGUAGE
          ====================================== */}

          <div
            className="
              mt-3
              flex
              justify-center
            "
          >

            <span
              className="
                rounded-full
                border
                border-teal-400/20
                bg-teal-400/10
                px-3
                py-1
                text-[9px]
                font-semibold
                text-teal-200
              "
            >
              🌐 {language || 'English'}
            </span>

          </div>


          {/* =====================================
              CENTER MESSAGE
          ====================================== */}

          <div
            className="
              flex
              min-h-0
              flex-1
              items-center
              justify-center
              px-2
              py-5
            "
          >

            <div
              className="
                w-full
                max-w-[94%]
                text-center
              "
            >

              {/* Important Message Heading */}

              <p
                className="
                  mb-2
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-teal-300
                "
              >
                Important Message
              </p>


              {/* Small Decorative Line */}

              <div
                className="
                  mx-auto
                  mb-3
                  h-px
                  w-10
                  bg-gradient-to-r
                  from-violet-400
                  to-teal-400
                "
              />


              {/* Campaign Description / Content */}

              <p
                className="
                  break-words
                  whitespace-pre-wrap
                  text-xs
                  font-medium
                  leading-relaxed
                  text-white/85
                  sm:text-sm
                "
              >
                {content ||
                  'Your campaign message will appear here.'}
              </p>

            </div>

          </div>


          {/* =====================================
              FOOTER / CALL TO ACTION
          ====================================== */}

          <div
            className="
              border-t
              border-white/10
              pt-3
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              {/* Left Footer */}

              <div className="min-w-0">

                <p
                  className="
                    text-[8px]
                    text-white/40
                  "
                >
                  Stay informed. Stay safe.
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[9px]
                    font-semibold
                    text-white/70
                  "
                >
                  Together for a better community
                </p>

              </div>


              {/* Right Footer */}

              <div
                className="
                  shrink-0
                  text-right
                "
              >

                <p
                  className="
                    text-[7px]
                    uppercase
                    tracking-wider
                    text-white/35
                  "
                >
                  Language
                </p>

                <p
                  className="
                    mt-0.5
                    text-[9px]
                    font-semibold
                    text-teal-300
                  "
                >
                  {language || 'English'}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>
    )
  }
)

PosterPreview.displayName = 'PosterPreview'

export default PosterPreview