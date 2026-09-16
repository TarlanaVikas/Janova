
import { Link } from "react-router-dom";

export default function PublicHome() {
  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-8">

          <h1 className="font-display text-3xl font-semibold">
            Janova
          </h1>

          <p className="text-text-dim mt-2">
            Public Awareness Campaign Portal
          </p>

        </div>
      </div>


      {/* Hero */}
      <div className="max-w-7xl mx-auto px-8 py-16">

        <div className="ai-card p-10">

          <h2 className="text-4xl font-bold">
            Stay Informed
          </h2>

          <p className="text-text-dim mt-4 text-lg">
            View government awareness campaigns, public
            announcements and important alerts.
          </p>


          {/* Public Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">


            {/* PUBLIC CAMPAIGNS */}
            <Link
              to="/public/campaigns"
              className="
                ai-card
                p-6
                text-left
                hover:border-violet/50
                transition
                group
              "
            >

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">
                  📢
                </span>

                <h3
                  className="
                    text-xl
                    font-semibold
                    group-hover:text-violet
                    transition
                  "
                >
                  Public Campaigns
                </h3>
              </div>

              <p className="text-text-dim text-sm leading-relaxed">
                Explore public awareness campaigns,
                important information and community initiatives.
              </p>

              <div className="mt-6">
                <span className="ai-button inline-flex items-center gap-2 text-sm">
                  Explore Campaigns →
                </span>
              </div>

            </Link>


            {/* LIVE BULLETINS */}
            <Link
              to="/public/bulletins"
              className="
                ai-card
                p-6
                text-left
                hover:border-violet/50
                transition
                group
              "
            >

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">
                  🔴
                </span>

                <h3
                  className="
                    text-xl
                    font-semibold
                    group-hover:text-violet
                    transition
                  "
                >
                  Live Bulletins
                </h3>
              </div>

              <p className="text-text-dim text-sm leading-relaxed">
                View real-time public alerts, emergency
                announcements and important updates.
              </p>

              <div className="mt-6">
                <span className="ai-button inline-flex items-center gap-2 text-sm">
                  View Live Bulletins →
                </span>
              </div>

            </Link>

          </div>

        </div>

      </div>

      
{/* Public Feedback */}

<div className="mt-6">

  <Link
    to="/public/feedback"
    className="
      ai-card
      p-6
      text-center
      hover:border-violet/50
      transition
      group
      block
    "
  >

    <div className="flex items-center gap-3 mb-4">

      <span className="text-3xl">
        💬
      </span>

      <h3
        className="
          text-xl
          font-semibold
          group-hover:text-violet
          transition
        "
      >
        Give Feedback
      </h3>

    </div>

    <p className="text-text-dim text-sm leading-relaxed">
      Share your feedback, suggestions or concerns
      about public awareness campaigns and bulletins.
    </p>

    <div className="mt-6">
      <span className="ai-button inline-flex items-center gap-2 text-sm">
        Give Feedback →
      </span>
    </div>

  </Link>

</div>



    </div>
  );
}

