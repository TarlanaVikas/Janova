import React from 'react'

const AIBackground = () => {
  return (
    <div className="ai-network-background">

      {/* Ambient signal glow */}
      <div className="ai-orb orb-1" />
      <div className="ai-orb orb-2" />

      {/* Network nodes */}
      <span className="ai-node node-1" />
      <span className="ai-node node-2" />
      <span className="ai-node node-3" />
      <span className="ai-node node-4" />
      <span className="ai-node node-5" />
      <span className="ai-node node-6" />
      <span className="ai-node node-7" />

      {/* Network connections */}
      <span className="ai-line line-1" />
      <span className="ai-line line-2" />
      <span className="ai-line line-3" />
      <span className="ai-line line-4" />
      <span className="ai-line line-5" />
      <span className="ai-line line-6" />

      {/* Animated data signals */}
      <span className="ai-signal signal-1" />
      <span className="ai-signal signal-2" />
      <span className="ai-signal signal-3" />
      <span className="ai-signal signal-4" />

    </div>
  )
}

export default AIBackground