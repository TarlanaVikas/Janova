
import { useEffect, useState } from "react";
import { submitFeedback } from "../services/feedbackService";
import api from "../services/api";

export default function PublicFeedback() {
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [feedback, setFeedback] = useState("");

  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ================================
  // LOAD PUBLIC CAMPAIGNS
  // ================================

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoadingCampaigns(true);

        const response = await api.get("/campaigns/public");

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        setCampaigns(data);
      } catch (err) {
        console.error("Failed to load campaigns:", err);

        setError("Failed to load campaigns.");
      } finally {
        setLoadingCampaigns(false);
      }
    };

    loadCampaigns();
  }, []);

  // ================================
  // SUBMIT FEEDBACK
  // ================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!campaignId) {
      setError("Please select a campaign.");
      return;
    }

    if (!feedback.trim()) {
      setError("Please enter your feedback.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await submitFeedback({
        campaign_id: campaignId,
        comment: feedback.trim(),
      });

      setFeedback("");

      setSuccess(
        `Thank you! Your feedback was submitted successfully. Sentiment: ${
          result.sentiment || "Neutral"
        }.`
      );
    } catch (err) {
      console.error("Feedback submission error:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to submit feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* ================================
          HEADER
      ================================= */}

      <div className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-8 py-8">

          <h1 className="font-display text-3xl font-semibold">
            Give Feedback
          </h1>

          <p className="text-text-dim mt-2">
            Help us improve Janova by sharing your
            feedback, suggestions or concerns.
          </p>

        </div>
      </div>


      {/* ================================
          FEEDBACK FORM
      ================================= */}

      <div className="max-w-4xl mx-auto px-8 py-12">

        <div className="ai-card p-8">

          <div className="flex items-center gap-3 mb-6">

            <span className="text-3xl">
              💬
            </span>

            <div>
              <h2 className="text-xl font-semibold">
                Share Your Feedback
              </h2>

              <p className="text-text-dim text-sm mt-1">
                Select a campaign and tell us what you think.
              </p>
            </div>

          </div>


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

{/* Campaign */}

<div>
  <label
    className="
      text-[11px]
      text-text-dim
      block
      mb-1
    "
  >
    Select Campaign
  </label>

  <select
    name="campaign_id"
    value={campaignId}
    onChange={(e) => setCampaignId(e.target.value)}
    disabled={loadingCampaigns || submitting}
    className="theme-select"
  >
    <option value="">
      {loadingCampaigns
        ? "Loading campaigns..."
        : "Select a campaign"}
    </option>

    {campaigns.map((campaign) => (
      <option
        key={campaign.id}
        value={campaign.id}
      >
        {campaign.name}
      </option>
    ))}
  </select>
</div>




            {/* ================================
                FEEDBACK
            ================================= */}

            <div>

              <label className="text-sm font-medium block mb-2">
                Your Feedback
              </label>

              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you think..."
                rows={7}
                maxLength={2000}
                disabled={submitting}
                className="
                  w-full
                  bg-surface-alt/70
                  border
                  border-border
                  rounded-lg
                  px-4
                  py-3
                  text-sm
                  text-text
                  placeholder:text-text-dim
                  outline-none
                  resize-none
                  transition
                  focus:border-violet
                  focus:ring-1
                  focus:ring-violet/30
                  disabled:opacity-50
                "
              />

              <div className="text-right text-xs text-text-dim mt-1">
                {feedback.length}/2000
              </div>

            </div>


            {/* ================================
                SUCCESS
            ================================= */}

            {success && (

              <div
                className="
                  rounded-lg
                  border
                  border-teal/30
                  bg-teal/10
                  text-teal
                  px-4
                  py-3
                  text-sm
                "
              >
                {success}
              </div>

            )}


            {/* ================================
                ERROR
            ================================= */}

            {error && (

              <div
                className="
                  rounded-lg
                  border
                  border-danger/30
                  bg-danger/10
                  text-danger
                  px-4
                  py-3
                  text-sm
                "
              >
                {error}
              </div>

            )}


            {/* ================================
                SUBMIT
            ================================= */}

            <div className="flex justify-end">

              <button
                type="submit"
                disabled={
                  submitting ||
                  loadingCampaigns ||
                  campaigns.length === 0
                }
                className="
                  ai-button
                  text-sm
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Feedback"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

