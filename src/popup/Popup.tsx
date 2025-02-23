import { useState, useEffect } from 'react'

import './Popup.css'

export const Popup = () => {
  const [rewards, setRewards] = useState(0)
  const link = 'https://movementlabs.xyz/'
  const movementLogoUrl = 'https://movementlabs.xyz/wp-content/themes/movement-labs/assets/images/logo.svg'

  const decreaseRewards = () => {
    if (rewards > 0) setRewards(rewards - 1)
  }

  const increaseRewards = () => setRewards(rewards + 1)

  useEffect(() => {
    chrome.storage.sync.get(['rewards'], (result) => {
      setRewards(result.rewards || 0)
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.set({ rewards })
    chrome.runtime.sendMessage({ type: 'REWARDS', rewards })
  }, [rewards])

  return (
    <main className="popup-container">
      <div className="header">
        <div className="logo-section">
          <img src={movementLogoUrl} alt="Movement Logo" className="movement-logo" />
          <span className="labs-tag">LABS</span>
        </div>
        <h2 className="title">Movement Rewards</h2>
      </div>

      <div className="content">
        <p className="description">
          Welcome to <b>FlyFish</b>. The more high-quality data you submit, the more rewards you receive.
        </p>

        <div className="rewards-card">
          <h3 className="rewards-title">Your Rewards</h3>
          <div className="rewards-display">
            <span className="rewards-amount" key={rewards}>
              {rewards}
            </span>
            <span className="rewards-unit">MOVE</span>
          </div>
        </div>
      </div>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="cta-button"
      >
        Start Crawling with Movement →
      </a>
    </main>
  )
}

export default Popup
