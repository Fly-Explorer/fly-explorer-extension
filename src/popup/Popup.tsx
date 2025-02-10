import { useState, useEffect } from 'react'

import './Popup.css'

export const Popup = () => {
  const [rewards, setRewards] = useState(0)
  const link = 'https://sui.io'
  const suiLogoUrl = ''

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
        <img src={suiLogoUrl} alt="Sui Logo" className="sui-logo" />
        <h2>Your Product Name</h2>
      </div>

      <div className="content">
        <p className="description">
          Welcome to our product built on Sui blockchain! Track your rewards and engage with the Sui ecosystem.
        </p>

        <div className="rewards-section">
          <h3>Your Rewards</h3>
          <div className="rewards-display">
            <span className="rewards-amount">{rewards}</span>
            <span className="rewards-unit">SUI</span>
          </div>
        </div>
      </div>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="learn-more-link"
      >
        Learn More About Sui →
      </a>
    </main>
  )
}

export default Popup
