import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { initializeOneSignal } from "../services/oneSignalService";

const FEATURES = [
  { title: 'AI Content Generation', desc: 'Turn a one-line brief into polished campaign copy for any audience or tone.', accent: 'violet' },
  { title: 'Multilingual Outreach', desc: 'Reach citizens in English, Hindi, Telugu, Tamil, Bengali, and more.', accent: 'teal' },
  { title: 'Smart Personalization', desc: 'Tailor every message around language, role, region, and community needs.', accent: 'signal' },
  { title: 'Multi-Channel Dispatch', desc: 'Send updates via email, SMS, WhatsApp, web, and push notifications.', accent: 'violet' },
  { title: 'Live Engagement', desc: 'Track campaign results and audience responses in real time.', accent: 'teal' },
  { title: 'Feedback Insights', desc: 'Understand how every community feels about each public update.', accent: 'signal' },
];

const ACCENT_CLASSES = {
  violet: 'text-violet border-violet/30 bg-violet/10',
  teal: 'text-teal border-teal/30 bg-teal/10',
  signal: 'text-signal border-signal/30 bg-signal/10',
};

export default function Landing() {
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [subscriptionId, setSubscriptionId] = useState(null);

  useEffect(() => {
    initializeOneSignal();
  }, []);

  const enableNotifications = async () => {
    console.log('Enable notification button clicked');

    try {
      if (!window.OneSignal) {
        alert('OneSignal is not initialized yet');
        return;
      }

      const permission = await window.OneSignal.Notifications.requestPermission();
      console.log('Permission result:', permission);

      if (!permission) {
        alert('❌ Notification permission denied');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const id = window.OneSignal?.User?.PushSubscription?.id;
      console.log('OneSignal Subscription ID:', id);

      if (!id) {
        alert('Unable to get OneSignal subscription ID. Please try again.');
        return;
      }

      setSubscriptionId(id);
      setShowLanguageSelector(true);
    } catch (error) {
      console.error('Notification Error:', error);
      alert('Unable to enable notifications');
    }
  };

  const saveNotificationLanguage = async () => {
    try {
      const id = subscriptionId || window.OneSignal?.User?.PushSubscription?.id;
      console.log('Saving subscription:', id);
      console.log('Selected language:', selectedLanguage);

      if (!id) {
        alert('OneSignal subscription ID not available');
        return;
      }

      await axios.post('http://localhost:8000/recipients/save-subscription', {
        subscription_id: id,
        language: selectedLanguage,
      });

      setNotificationEnabled(true);
      setShowLanguageSelector(false);
      alert(`✅ Notifications enabled in ${selectedLanguage}`);
    } catch (error) {
      console.error('Subscription save error:', error);
      console.error('Backend error:', error.response?.data);
      alert('Unable to save notification preferences');
    }
  };

  const languageSelector = showLanguageSelector ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-6 w-[90%] max-w-md shadow-2xl">
        <h2 className="text-xl font-semibold mb-2 text-white">Choose Notification Language</h2>
        <p className="text-slate-300 text-sm mb-5">Select the language you want to receive public updates in.</p>

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full bg-slate-950 text-white border border-slate-700 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        >
          <option value="English">English</option>
          <option value="Telugu">Telugu</option>
          <option value="Hindi">Hindi</option>
          <option value="Tamil">Tamil</option>
          <option value="Bengali">Bengali</option>
          <option value="Kannada">Kannada</option>
          <option value="Malayalam">Malayalam</option>
          <option value="Marathi">Marathi</option>
          <option value="Gujarati">Gujarati</option>
        </select>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowLanguageSelector(false)}
            className="flex-1 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveNotificationLanguage}
            className="flex-1 bg-emerald-400 text-slate-950 rounded-xl px-4 py-2.5 font-semibold hover:bg-emerald-300"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen text-text relative">
      {languageSelector}

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
          <span className="font-display text-xl font-semibold tracking-tight text-white">Janova</span>
        </div>

        <button
          onClick={enableNotifications}
          className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-500/20"
        >
          {notificationEnabled ? '✅ Notifications Enabled' : '🔔 Enable Notifications'}
        </button>
      </nav>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-14 md:px-8 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
            AI-powered civic communication
          </div>

          <h1 className="font-display text-4xl font-semibold leading-tight text-white md:text-6xl">
            Reach every community,<br />with clarity and trust.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            Plan campaigns, translate messaging, personalize outreach, and deliver urgent updates through one smart communication hub built for public institutions and community teams.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="ai-button">Create an account</Link>
            <Link to="/login" className="rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800">Sign In</Link>
            <Link to="/public" className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-6 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20">Public Explore</Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="ai-card p-5">
              <span className={`mb-4 inline-block rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${ACCENT_CLASSES[feature.accent]}`}>
                {feature.title}
              </span>
              <p className="text-sm leading-relaxed text-slate-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-800 px-6 py-6 text-center text-[11px] uppercase tracking-[0.18em] text-slate-400 md:px-8">
        Janova — Civic Communication &amp; Public Awareness Platform
      </footer>
    </div>
  );
}