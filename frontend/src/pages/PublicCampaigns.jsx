import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function PublicCampaigns() {

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchCampaigns = async () => {
      try {

        const response = await axios.get(
          "http://127.0.0.1:8000/campaigns/public"
        );

        setCampaigns(response.data);

      } catch (err) {

        console.error(err);
        setError("Failed to load campaigns.");

      } finally {

        setLoading(false);

      }
    };

    fetchCampaigns();

  }, []);


  return (
    <div className="min-h-screen">

      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-8 py-6">

          <h1 className="font-display text-3xl font-semibold">
            Public Awareness Campaigns
          </h1>

          <p className="text-text-dim mt-2">
            View the latest campaigns and announcements published by Janova.
          </p>

        </div>
      </div>


      {/* Campaign Cards */}
      <div className="max-w-7xl mx-auto px-8 py-10">


        {loading && (
          <p className="text-text-dim">
            Loading campaigns...
          </p>
        )}


        {error && (
          <p className="text-red-500">
            {error}
          </p>
        )}


        {!loading && campaigns.length === 0 && (
          <p className="text-text-dim">
            No campaigns available.
          </p>
        )}


        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {campaigns.map((campaign) => (

            <div
              key={campaign.id}
              className="ai-card p-6"
            >

              <span className="ai-badge">
                {campaign.type}
              </span>


              <h2 className="text-xl font-semibold mt-4">
                {campaign.name}
              </h2>


              <p className="text-text-dim mt-3">
                {campaign.description}
              </p>


              <div className="mt-4 text-sm text-text-dim">
                Status: {campaign.status}
              </div>


              <div className="mt-2 text-sm text-text-dim">
                Channels: {campaign.channels}
              </div>



            </div>

          ))}

        </div>

      </div>

    </div>
  );
}