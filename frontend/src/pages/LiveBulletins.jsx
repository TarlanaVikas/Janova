import { useEffect, useState } from "react";
import {
  getBulletins,
  createBulletin,
  publishBulletin,
  stopBulletin,
  deleteBulletin,
} from "../services/bulletinService";

const INITIAL_FORM = {
  title: "",
  content: "",
  category: "Announcement",
  priority: "Medium",
  target_location: "",
  languages: "",
  channels: "",
  expires_at: null,
};

const PRIORITY_STYLES = {
  Low: "text-teal border-teal/30 bg-teal/10",
  Medium: "text-signal border-signal/30 bg-signal/10",
  High: "text-violet border-violet/30 bg-violet/10",
  Critical: "text-danger border-danger/30 bg-danger/10",
};

const STATUS_STYLES = {
  Live: "text-teal border-teal/30 bg-teal/10",
  Stopped: "text-danger border-danger/30 bg-danger/10",
  Draft: "text-signal border-signal/30 bg-signal/10",
};

const CATEGORY_STYLES = {
  Announcement: "text-signal border-signal/30 bg-signal/10",
  Emergency: "text-danger border-danger/30 bg-danger/10",
  Awareness: "text-teal border-teal/30 bg-teal/10",
  Education: "text-violet border-violet/30 bg-violet/10",
};

export default function LiveBulletins() {
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM);

  // ================================
  // LOAD BULLETINS
  // ================================

  const loadBulletins = async () => {
    try {
      setLoading(true);

      const data = await getBulletins();

      setBulletins(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading bulletins:", error);
      setBulletins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBulletins();
  }, []);

  // ================================
  // HANDLE INPUT
  // ================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ================================
  // CREATE BULLETIN
  // ================================

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await createBulletin(formData);

      setShowModal(false);
      setFormData(INITIAL_FORM);

      await loadBulletins();
    } catch (error) {
      console.error("Error creating bulletin:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to create bulletin"
      );
    } finally {
      setSaving(false);
    }
  };

  // ================================
  // PUBLISH BULLETIN
  // ================================

  const handlePublish = async (id) => {
    try {
      await publishBulletin(id);
      await loadBulletins();
    } catch (error) {
      console.error("Error publishing bulletin:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to publish bulletin"
      );
    }
  };

  // ================================
  // STOP BULLETIN
  // ================================

  const handleStop = async (id) => {
    try {
      await stopBulletin(id);
      await loadBulletins();
    } catch (error) {
      console.error("Error stopping bulletin:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to stop bulletin"
      );
    }
  };

  // ================================
  // DELETE BULLETIN
  // ================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bulletin?"
    );

    if (!confirmed) return;

    try {
      await deleteBulletin(id);
      await loadBulletins();
    } catch (error) {
      console.error("Error deleting bulletin:", error);

      alert(
        error.response?.data?.detail ||
          "Failed to delete bulletin"
      );
    }
  };

  return (
    <div className="relative">

      {/* ================================
          PAGE HEADER
      ================================= */}

      <header className="mb-7 flex items-start justify-between">

        <div>
          <div className="flex items-center gap-3 mb-2">

            <h1 className="font-display text-2xl font-semibold">
              Live Bulletins
            </h1>

            <span className="ai-badge">
              Real-Time Alerts
            </span>

          </div>

          <p className="text-text-dim text-sm mt-1">
            Create and manage real-time public awareness bulletins.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="ai-button text-sm"
        >
          + Create Bulletin
        </button>

      </header>


      {/* ================================
          LOADING
      ================================= */}

      {loading && (
        <div className="ai-card p-10 text-center">
          <div className="text-text-dim text-sm">
            Loading bulletins...
          </div>
        </div>
      )}


      {/* ================================
          EMPTY STATE
      ================================= */}

      {!loading && bulletins.length === 0 && (

        <div className="ai-gradient-border p-12 text-center">

          <div
            className="
              w-14 h-14
              mx-auto
              mb-4
              rounded-full
              flex
              items-center
              justify-center
              bg-violet/10
              border
              border-violet/20
              text-violet
              text-2xl
            "
          >
            ✦
          </div>

          <h2 className="font-display text-lg font-semibold">
            No bulletins found
          </h2>

          <p className="text-text-dim text-sm mt-2">
            Create your first public awareness bulletin.
          </p>

          <button
            onClick={() => setShowModal(true)}
            className="ai-button text-sm mt-5"
          >
            + Create Bulletin
          </button>

        </div>

      )}


      {/* ================================
          BULLETIN CARDS
      ================================= */}

      {!loading && bulletins.length > 0 && (

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-5
          "
        >

          {bulletins.map((bulletin) => (

            <div
              key={bulletin.id}
              className="
                ai-gradient-border
                p-5
                hover:border-violet/40
                transition
              "
            >

              {/* ================================
                  CARD HEADER
              ================================= */}

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                  mb-4
                "
              >

                <div className="min-w-0">

                  <h2
                    className="
                      font-display
                      text-lg
                      font-semibold
                      break-words
                    "
                  >
                    {bulletin.title}
                  </h2>

                  <div className="flex flex-wrap gap-2 mt-2">

                    <span
                      className={`
                        text-[10px]
                        px-2
                        py-0.5
                        rounded-full
                        border
                        capitalize
                        ${
                          CATEGORY_STYLES[bulletin.category] ||
                          "text-text-dim border-border bg-surface-alt"
                        }
                      `}
                    >
                      {bulletin.category}
                    </span>

                    <span
                      className={`
                        text-[10px]
                        px-2
                        py-0.5
                        rounded-full
                        border
                        capitalize
                        ${
                          PRIORITY_STYLES[bulletin.priority] ||
                          "text-text-dim border-border bg-surface-alt"
                        }
                      `}
                    >
                      {bulletin.priority} Priority
                    </span>

                  </div>

                </div>


                {/* STATUS */}

                <span
                  className={`
                    shrink-0
                    text-[10px]
                    px-2
                    py-1
                    rounded-full
                    border
                    font-medium
                    ${
                      STATUS_STYLES[bulletin.status] ||
                      "text-text-dim border-border bg-surface-alt"
                    }
                  `}
                >
                  {bulletin.status}
                </span>

              </div>


              {/* ================================
                  CONTENT
              ================================= */}

              <div
                className="
                  bg-surface-alt/50
                  border
                  border-border
                  rounded-lg
                  p-4
                  mb-4
                "
              >

                <p
                  className="
                    text-sm
                    leading-relaxed
                    text-text-dim
                  "
                >
                  {bulletin.content}
                </p>

              </div>


              {/* ================================
                  DETAILS
              ================================= */}

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-3
                  text-xs
                  mb-5
                "
              >

                <div>
                  <span className="text-text-dim">
                    Target Location
                  </span>

                  <p className="text-text mt-1">
                    {bulletin.target_location ||
                      "All locations"}
                  </p>
                </div>


                <div>
                  <span className="text-text-dim">
                    Languages
                  </span>

                  <p className="text-text mt-1">
                    {bulletin.languages ||
                      "Not specified"}
                  </p>
                </div>


                <div>
                  <span className="text-text-dim">
                    Channels
                  </span>

                  <p className="text-text mt-1">
                    {bulletin.channels ||
                      "Not specified"}
                  </p>
                </div>


                <div>
                  <span className="text-text-dim">
                    Bulletin ID
                  </span>

                  <p className="text-teal font-mono mt-1">
                    #{bulletin.id}
                  </p>
                </div>

              </div>


              {/* ================================
                  ACTIONS
              ================================= */}

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  pt-4
                  border-t
                  border-border
                "
              >

                {bulletin.status === "Draft" && (

                  <button
                    onClick={() =>
                      handlePublish(bulletin.id)
                    }
                    className="
                      ai-button
                      text-xs
                    "
                  >
                    Publish
                  </button>

                )}


                {bulletin.status === "Live" && (

                  <button
                    onClick={() =>
                      handleStop(bulletin.id)
                    }
                    className="
                      px-4
                      py-2
                      rounded-lg
                      border
                      border-signal/30
                      bg-signal/10
                      text-signal
                      text-xs
                      font-medium
                      hover:bg-signal/20
                      transition
                    "
                  >
                    Stop Bulletin
                  </button>

                )}


                <button
                  onClick={() =>
                    handleDelete(bulletin.id)
                  }
                  className="
                    px-4
                    py-2
                    rounded-lg
                    border
                    border-danger/30
                    bg-danger/10
                    text-danger
                    text-xs
                    font-medium
                    hover:bg-danger/20
                    transition
                  "
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      )}


      {/* ================================
          CREATE BULLETIN MODAL
      ================================= */}

      {showModal && (

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
            p-4
          "
          onClick={() => setShowModal(false)}
        >

          <div
            className="
              ai-gradient-border
              w-full
              max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              p-6
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div
              className="
                flex
                items-center
                justify-between
                mb-5
              "
            >

              <div>

                <div className="flex items-center gap-2">

                  <h2
                    className="
                      font-display
                      text-xl
                      font-semibold
                    "
                  >
                    Create Live Bulletin
                  </h2>

                  <span className="ai-badge">
                    AI Ready
                  </span>

                </div>

                <p
                  className="
                    text-text-dim
                    text-xs
                    mt-1
                  "
                >
                  Publish real-time public awareness information.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="
                  text-text-dim
                  hover:text-text
                  text-2xl
                  transition
                "
              >
                ×
              </button>

            </div>


            {/* Form */}

            <form
              onSubmit={handleCreate}
              className="space-y-4"
            >

              {/* Title */}

              <div>

                <label
                  className="
                    text-[11px]
                    text-text-dim
                    block
                    mb-1
                  "
                >
                  Bulletin title
                </label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Heavy Rainfall Alert"
                  required
                  className="
                    w-full
                    bg-surface-alt/70
                    border
                    border-border
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    text-text
                    placeholder:text-text-dim
                    outline-none
                    transition
                    focus:border-violet
                    focus:ring-1
                    focus:ring-violet/30
                  "
                />

              </div>


              {/* Content */}

              <div>

                <label
                  className="
                    text-[11px]
                    text-text-dim
                    block
                    mb-1
                  "
                >
                  Bulletin content
                </label>

                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Enter bulletin content..."
                  required
                  rows={4}
                  className="
                    w-full
                    bg-surface-alt/70
                    border
                    border-border
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    text-text
                    placeholder:text-text-dim
                    outline-none
                    transition
                    focus:border-violet
                    focus:ring-1
                    focus:ring-violet/30
                    resize-none
                  "
                />

              </div>


              {/* Category and Priority */}

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-4
                "
              >

                {/* Announcement Type */}

                <div>

                  <label
                    className="
                      text-[11px]
                      text-text-dim
                      block
                      mb-1
                    "
                  >
                    Announcement type
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="theme-select"
                  >
                    <option value="Announcement">
                      Announcement
                    </option>

                    <option value="Emergency">
                      Emergency
                    </option>

                    <option value="Awareness">
                      Awareness
                    </option>

                    <option value="Education">
                      Education
                    </option>
                  </select>

                </div>


                {/* Priority */}

                <div>

                  <label
                    className="
                      text-[11px]
                      text-text-dim
                      block
                      mb-1
                    "
                  >
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="theme-select"
                  >
                    <option value="Low">
                      Low
                    </option>

                    <option value="Medium">
                      Medium
                    </option>

                    <option value="High">
                      High
                    </option>

                    <option value="Critical">
                      Critical
                    </option>
                  </select>

                </div>

              </div>


              {/* Target Location */}

              <div>

                <label
                  className="
                    text-[11px]
                    text-text-dim
                    block
                    mb-1
                  "
                >
                  Target location
                </label>

                <input
                  name="target_location"
                  value={formData.target_location}
                  onChange={handleChange}
                  placeholder="e.g. Andhra Pradesh, East Godavari"
                  className="
                    w-full
                    bg-surface-alt/70
                    border
                    border-border
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    text-text
                    placeholder:text-text-dim
                    outline-none
                    focus:border-violet
                  "
                />

              </div>


              {/* Languages */}

              <div>

                <label
                  className="
                    text-[11px]
                    text-text-dim
                    block
                    mb-1
                  "
                >
                  Languages
                </label>

                <input
                  name="languages"
                  value={formData.languages}
                  onChange={handleChange}
                  placeholder="e.g. English, Telugu, Hindi"
                  className="
                    w-full
                    bg-surface-alt/70
                    border
                    border-border
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    text-text
                    placeholder:text-text-dim
                    outline-none
                    focus:border-violet
                  "
                />

              </div>


              {/* Channels */}

              <div>

                <label
                  className="
                    text-[11px]
                    text-text-dim
                    block
                    mb-1
                  "
                >
                  Communication channels
                </label>

                <input
                  name="channels"
                  value={formData.channels}
                  onChange={handleChange}
                  placeholder="e.g. Website, SMS, WhatsApp"
                  className="
                    w-full
                    bg-surface-alt/70
                    border
                    border-border
                    rounded-lg
                    px-3
                    py-2.5
                    text-sm
                    text-text
                    placeholder:text-text-dim
                    outline-none
                    focus:border-violet
                  "
                />

              </div>


              {/* Buttons */}

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  pt-4
                  border-t
                  border-border
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="
                    px-4
                    py-2
                    rounded-lg
                    border
                    border-border
                    text-text-dim
                    text-sm
                    hover:text-text
                    hover:bg-surface-alt
                    transition
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={saving}
                  className="
                    ai-button
                    text-sm
                    disabled:opacity-50
                  "
                >
                  {saving
                    ? "Creating..."
                    : "Create Bulletin"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}