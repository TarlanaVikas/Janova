import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import PublicHome from "./pages/PublicHome";
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Audience from './pages/Audience'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import Templates from './pages/Templates'
import Analytics from './pages/Analytics'
import Feedback from './pages/Feedback'
import CanvasStudio from './pages/CanvasStudio'
import LiveBulletins from './pages/LiveBulletins'
import AIBackground from './components/AIBackground'
import PublicCampaigns from "./pages/PublicCampaigns";
import PublicBulletins from "./pages/PublicBulletins";
import PublicFeedback from "./pages/PublicFeedback";
import PublicCampaignDetails from "./pages/PublicCampaignDetails";
import Notifications from './pages/Notifications'
import DeliveryTracking from './pages/DeliveryTracking'
import EngagementMonitoring from './pages/EngagementMonitoring'
import SentimentMap from './pages/SentimentMap'


export default function App() {
  return (
    <AuthProvider>
      {/* Global AI visual background */}
      <div className="ai-platform-bg">
      <AIBackground />
       <div className="relative z-10">
      <Routes>

        {/* Public Routes */}
        <Route
          path="/"
          element={<Landing />}
        />

        <Route
  path="/public/campaigns"
  element={<PublicCampaigns />}
/>


<Route
  path="/public/campaign/:id"
  element={<PublicCampaignDetails />}
/>

<Route
  path="/public/bulletins"
  element={<PublicBulletins />}
/>
      
        <Route
    path="/public"
    element={<PublicHome />}
/>

<Route
  path="/public/feedback"
  element={<PublicFeedback />}
/>


        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* Protected Routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/audience"
          element={
            <ProtectedRoute>
              <Audience />
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaigns/create"
          element={
            <ProtectedRoute>
              <Campaigns />
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaigns/:id"
          element={
            <ProtectedRoute>
              <CampaignDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/canvas-studio"
          element={
            <ProtectedRoute>
              <CanvasStudio />
            </ProtectedRoute>
          }
        />

        {/* Live Bulletins */}
        <Route
          path="/live-bulletins"
          element={
            <ProtectedRoute>
              <LiveBulletins />
            </ProtectedRoute>
          }
        />

<Route
    path="/notifications"
    element={
      <ProtectedRoute>
    <Notifications />
    </ProtectedRoute>
    }
  />

  <Route
  path="/delivery"
  element={
    <ProtectedRoute>
      <DeliveryTracking />
    </ProtectedRoute>
  }
/>

<Route
  path="/engagements"
  element={
    <ProtectedRoute>
      <EngagementMonitoring />
    </ProtectedRoute>
  }
/>

<Route
  path="/sentiment-map"
  element={
    <ProtectedRoute>
      <SentimentMap />
    </ProtectedRoute>
  }
/>

      </Routes>
      </div>
      </div>
    </AuthProvider>
  )
}