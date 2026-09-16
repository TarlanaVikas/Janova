
import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../services/api";

const STATUS_META = {
  pending: {
    label: "Pending",
    color: "text-text-dim bg-surface-alt border-border",
  },
  sent: {
    label: "Sent",
    color: "text-signal bg-signal/10 border-signal/20",
  },
  delivered: {
    label: "Delivered",
    color: "text-teal bg-teal/10 border-teal/20",
  },
  opened: {
    label: "Opened",
    color: "text-violet bg-violet/10 border-violet/20",
  },
  clicked: {
    label: "Clicked",
    color: "text-green-500 bg-green-500/10 border-green-500/20",
  },
  failed: {
    label: "Failed",
    color: "text-danger bg-danger/10 border-danger/20",
  },
};

const CHANNEL_GLYPH = {
  email: "✉",
  sms: "💬",
  whatsapp: "☎",
  push: "🔔",
  web: "◫",
};

const AUTO_REFRESH_MS = 8000;

export default function DeliveryTracking() {
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState("");
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryMsg, setRetryMsg] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ---------------- LOAD CAMPAIGNS ---------------- */

  useEffect(() => {
    api
      .get("/campaigns")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];

        setCampaigns(data);

        if (data.length > 0) {
          setCampaignId(data[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load campaigns:", err);
      });
  }, []);

  /* ---------------- LOAD DELIVERY DATA ---------------- */

  const loadDelivery = useCallback(() => {
    if (!campaignId) return;

    setLoading(true);

    Promise.all([
      api.get(`/distribution/status/${campaignId}`),
      api.get(`/distribution/messages/${campaignId}?limit=100`),
    ])
      .then(([statusRes, messagesRes]) => {
        setStatus(statusRes.data);
        setMessages(
          Array.isArray(messagesRes.data) ? messagesRes.data : []
        );
      })
      .catch((err) => {
        console.error("Failed to load delivery data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [campaignId]);

  useEffect(() => {
    loadDelivery();
  }, [loadDelivery]);

  /* ---------------- AUTO REFRESH ---------------- */

  useEffect(() => {
    if (!autoRefresh || !campaignId) return;

    const interval = setInterval(() => {
      loadDelivery();
    }, AUTO_REFRESH_MS);

    return () => clearInterval(interval);
  }, [autoRefresh, campaignId, loadDelivery]);

  /* ---------------- RETRY FAILED ---------------- */

  const handleRetry = async () => {
    if (!campaignId) return;

    setRetrying(true);
    setRetryMsg("");

    try {
      const res = await api.post(
        `/distribution/retry-failed/${campaignId}`
      );

      setRetryMsg(
        `${res.data.failed_messages || 0} failed message(s) flagged for retry.`
      );

      loadDelivery();
    } catch (err) {
      setRetryMsg(
        err?.response?.data?.detail ||
          "No failed messages to retry."
      );
    } finally {
      setRetrying(false);
    }
  };

  /* ---------------- FILTER MESSAGES ---------------- */

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const matchesChannel =
        channelFilter === "all" ||
        message.channel === channelFilter;

      const matchesStatus =
        statusFilter === "all" ||
        message.status === statusFilter;

      return matchesChannel && matchesStatus;
    });
  }, [messages, channelFilter, statusFilter]);

  /* ---------------- SUMMARY DATA ---------------- */

  const total = status?.total || 0;
  const byStatus = status?.by_status || {};
  const byChannel = status?.by_channel || {};

  const failedCount = byStatus.failed || 0;

  const deliveredLike =
    (byStatus.delivered || 0) +
    (byStatus.opened || 0) +
    (byStatus.clicked || 0);

  const deliveryRate = total
    ? Math.round((deliveredLike / total) * 100)
    : 0;

  const selectedCampaign = campaigns.find(
    (campaign) => campaign.id === campaignId
  );

  return (
    <div className="min-h-full">

      {/* ================= HEADER ================= */}

      <div className="mb-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet/15 border border-violet/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                <span className="text-lg text-violet">
                  ✓
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">

                  <h1 className="text-2xl font-bold">
                    Delivery Tracking
                  </h1>

                  <span className="rounded-full border border-teal/30 bg-teal/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal">
                    Live
                  </span>

                </div>

                <p className="mt-1 text-sm text-text-dim">
                  Real-time delivery status for every message sent
                  across Email, SMS, WhatsApp, Push and Web.
                </p>
              </div>

            </div>
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-text-dim">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-violet"
            />

            Auto-refresh every {AUTO_REFRESH_MS / 1000}s
          </label>

        </div>
      </div>

      {/* ================= CAMPAIGN PICKER ================= */}

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">

        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Campaign Delivery
          </h2>

          <p className="mt-1 text-sm text-text-dim">
            Select a campaign to monitor its delivery performance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">

          {/* Campaign Dropdown */}

          <div>
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-text-dim">
              Campaign
            </label>

            <select
              value={campaignId}
              onChange={(e) => {
                setCampaignId(e.target.value);
                setStatus(null);
                setMessages([]);
                setRetryMsg("");
              }}
              className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2.5 text-sm text-text outline-none transition focus:border-violet focus:ring-1 focus:ring-violet/30"
            >
              {campaigns.length === 0 && (
                <option value="">
                  No campaigns yet
                </option>
              )}

              {campaigns.map((campaign) => (
                <option
                  key={campaign.id}
                  value={campaign.id}
                >
                  {campaign.name} — {campaign.status}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh */}

          <div className="flex items-end">
            <button
              onClick={loadDelivery}
              disabled={!campaignId || loading}
              className="w-full rounded-lg border border-violet/30 bg-violet/5 px-4 py-2.5 text-xs font-medium text-violet transition hover:bg-violet/10 disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
            >
              {loading ? "Refreshing…" : "Refresh now"}
            </button>
          </div>

          {/* Retry */}

          <div className="flex items-end">
            <button
              onClick={handleRetry}
              disabled={
                !campaignId ||
                retrying ||
                failedCount === 0
              }
              className="w-full rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5 text-xs font-medium text-danger transition hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
            >
              {retrying
                ? "Retrying…"
                : `Retry failed (${failedCount})`}
            </button>
          </div>

        </div>

        {retryMsg && (
          <p className="mt-3 text-[11px] text-text-dim">
            {retryMsg}
          </p>
        )}

      </div>

      {/* ================= EMPTY STATE ================= */}

      {!campaignId ? (
        <div className="rounded-2xl border border-violet/20 bg-surface p-12 text-center shadow-sm">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet/10 text-violet">
            ✓
          </div>

          <h2 className="font-display text-sm font-semibold">
            No campaign selected
          </h2>

          <p className="mt-2 text-sm text-text-dim">
            Create and send a campaign first to see
            delivery tracking data here.
          </p>

        </div>
      ) : (
        <>

          {/* ================= SUMMARY CARDS ================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                Total Messages
              </p>

              <p className="mt-2 font-display text-3xl font-semibold">
                {total}
              </p>

              <p className="mt-2 truncate text-xs text-text-dim">
                {selectedCampaign?.name || "Selected campaign"}
              </p>

            </div>

            <div className="rounded-2xl border border-teal/20 bg-surface p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                Delivery Rate
              </p>

              <p className="mt-2 font-display text-3xl font-semibold text-teal">
                {deliveryRate}%
              </p>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-alt">
                <div
                  className="h-full rounded-full bg-teal transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      deliveryRate,
                      100
                    )}%`,
                  }}
                />
              </div>

            </div>

            <div className="rounded-2xl border border-danger/20 bg-surface p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                Failed
              </p>

              <p className="mt-2 font-display text-3xl font-semibold text-danger">
                {failedCount}
              </p>

              <p className="mt-2 text-xs text-text-dim">
                Messages that could not be delivered
              </p>

            </div>

            <div className="rounded-2xl border border-violet/20 bg-surface p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-dim">
                Channels Used
              </p>

              <p className="mt-2 font-display text-3xl font-semibold text-violet">
                {Object.keys(byChannel).length}
              </p>

              <p className="mt-2 text-xs text-text-dim">
                Active distribution channels
              </p>

            </div>

          </div>

          {/* ================= BREAKDOWNS ================= */}

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

            {/* STATUS */}

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">

              <div className="mb-5">
                <h2 className="font-display text-sm font-semibold">
                  Status Breakdown
                </h2>

                <p className="mt-1 text-xs text-text-dim">
                  Current message delivery lifecycle.
                </p>
              </div>

              <div className="space-y-4">

                {Object.entries(STATUS_META).map(
                  ([key, meta]) => {

                    const count = byStatus[key] || 0;

                    const pct = total
                      ? Math.round(
                          (count / total) * 100
                        )
                      : 0;

                    return (
                      <div key={key}>

                        <div className="mb-1.5 flex items-center justify-between">

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] ${meta.color}`}
                          >
                            {meta.label}
                          </span>

                          <span className="font-mono text-[11px] text-text-dim">
                            {count} · {pct}%
                          </span>

                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">

                          <div
                            className="h-full rounded-full bg-violet transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* CHANNEL */}

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">

              <div className="mb-5">
                <h2 className="font-display text-sm font-semibold">
                  Channel Breakdown
                </h2>

                <p className="mt-1 text-xs text-text-dim">
                  Distribution across communication channels.
                </p>
              </div>

              {Object.keys(byChannel).length === 0 ? (
                <p className="text-xs text-text-dim">
                  No channel data yet.
                </p>
              ) : (
                <div className="space-y-4">

                  {Object.entries(byChannel).map(
                    ([channel, count]) => {

                      const pct = total
                        ? Math.round(
                            (count / total) * 100
                          )
                        : 0;

                      return (
                        <div key={channel}>

                          <div className="mb-1.5 flex items-center justify-between">

                            <span className="flex items-center gap-2 text-xs capitalize">

                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet/10 text-violet">
                                {CHANNEL_GLYPH[channel] ||
                                  "◆"}
                              </span>

                              {channel}

                            </span>

                            <span className="font-mono text-[11px] text-text-dim">
                              {count} · {pct}%
                            </span>

                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-surface-alt">

                            <div
                              className="h-full rounded-full bg-teal transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                              }}
                            />

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

          </div>

          {/* ================= MESSAGE LOG ================= */}

          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-display text-sm font-semibold">
                Message Log
              </h2>

              <p className="mt-1 text-xs text-text-dim">
                Individual delivery records for the selected campaign.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <select
                value={channelFilter}
                onChange={(e) =>
                  setChannelFilter(e.target.value)
                }
                className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-xs text-text outline-none transition focus:border-teal"
              >
                <option value="all">
                  All Channels
                </option>

                {Object.keys(CHANNEL_GLYPH).map(
                  (channel) => (
                    <option
                      key={channel}
                      value={channel}
                    >
                      {channel}
                    </option>
                  )
                )}

              </select>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-xs text-text outline-none transition focus:border-violet"
              >
                <option value="all">
                  All Statuses
                </option>

                {Object.keys(STATUS_META).map(
                  (key) => (
                    <option
                      key={key}
                      value={key}
                    >
                      {STATUS_META[key].label}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">

            <div className="max-h-[440px] overflow-x-auto overflow-y-auto">

              <table className="w-full min-w-[900px] text-sm">

                <thead className="sticky top-0 z-10 bg-surface">

                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-text-dim">

                    <th className="px-4 py-3 font-semibold">
                      Recipient
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Channel
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Status
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Provider
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Sent
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Delivered
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Error
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredMessages.map((message) => {

                    const meta =
                      STATUS_META[message.status] ||
                      STATUS_META.pending;

                    return (
                      <tr
                        key={message.id}
                        className="border-b border-border last:border-0 transition hover:bg-surface-alt/50"
                      >

                        <td className="max-w-[220px] truncate px-4 py-3 font-mono text-xs text-text-dim">
                          {message.recipient_address ||
                            message.recipient_id?.slice(
                              0,
                              8
                            ) ||
                            "—"}
                        </td>

                        <td className="px-4 py-3 text-xs capitalize">

                          <span className="mr-1.5 text-violet">
                            {CHANNEL_GLYPH[
                              message.channel
                            ] || "◆"}
                          </span>

                          {message.channel || "—"}

                        </td>

                        <td className="px-4 py-3">

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] ${meta.color}`}
                          >
                            {meta.label}
                          </span>

                        </td>

                        <td className="px-4 py-3 text-xs text-text-dim">
                          {message.provider || "—"}
                        </td>

                        <td className="px-4 py-3 text-xs text-text-dim">
                          {message.sent_at
                            ? new Date(
                                message.sent_at
                              ).toLocaleString()
                            : "—"}
                        </td>

                        <td className="px-4 py-3 text-xs text-text-dim">
                          {message.delivered_at
                            ? new Date(
                                message.delivered_at
                              ).toLocaleString()
                            : "—"}
                        </td>

                        <td className="max-w-[180px] truncate px-4 py-3 text-xs text-danger">
                          {message.error_message || "—"}
                        </td>

                      </tr>
                    );
                  })}

                  {filteredMessages.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-sm text-text-dim"
                      >
                        No messages match these filters.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </>
      )}
    </div>
  );
}

