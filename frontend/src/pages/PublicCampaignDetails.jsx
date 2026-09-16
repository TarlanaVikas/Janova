import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PublicCampaignDetails() {
  const { id } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/campaigns/public/${id}`
        );

        setCampaign(response.data);
      } catch (error) {
        console.error("Failed to load campaign:", error);
      }
    };

    fetchCampaign();
  }, [id]);

  useEffect(() => {
    if (window.location.hash === "#feedback") {
      setTimeout(() => {
        document.getElementById("feedback")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 500);
    }
  }, []);

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      setMessage("Please write your feedback first.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/public/feedback", {
        campaign_id: id,
        comment: feedback,
      });

      setMessage("Thank you for your feedback!");
      setFeedback("");
    } catch (error) {
      console.error("Feedback error:", error);
      setMessage("Failed to submit feedback");
    }
  };

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-dim">Loading campaign...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Campaign Details */}
        <div className="ai-card p-8">
          <span className="ai-badge">{campaign.type}</span>

          <h1 className="text-3xl font-semibold mt-5">
            {campaign.name}
          </h1>

          <p className="text-text-dim mt-4 leading-relaxed">
            {campaign.description}
          </p>

          <div className="mt-6 space-y-2 text-sm">
            <p>
              <span className="font-semibold">Status:</span>
              <span className="ml-2">{campaign.status}</span>
            </p>

            <p>
              <span className="font-semibold">Channels:</span>
              <span className="ml-2">{campaign.channels}</span>
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div
          id="feedback"
          className="ai-card p-8 mt-8"
        >
          <div className="flex items-center gap-4">
            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-blue-500/10
                flex
                items-center
                justify-center
                text-xl
              "
            >
              💬
            </div>

            <div>
              <h2 className="text-2xl font-semibold">
                Share Your Feedback
              </h2>

              <p className="text-text-dim mt-1">
                Help us improve this awareness campaign.
              </p>
            </div>
          </div>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write your feedback here..."
            rows={5}
            className="
              w-full
              mt-6
              p-5
              rounded-xl
              bg-surface
              border
              border-border
              text-text
              placeholder:text-text-dim
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
              transition
            "
          />

          <div className="flex justify-between items-center mt-5">
            <p className="text-sm text-text-dim">
              Your response helps improve future campaigns.
            </p>

            <button
              onClick={submitFeedback}
              className="ai-button px-6 py-3 rounded-xl"
            >
              Submit Feedback
            </button>
          </div>

          {message && (
            <div
              className="
                mt-5
                p-3
                rounded-lg
                bg-blue-500/10
                text-sm
              "
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}