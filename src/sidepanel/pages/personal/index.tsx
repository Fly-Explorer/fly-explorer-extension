import React, { useState, useEffect } from 'react'
import './index.css'
import { BlurText } from '../../components/BlurText';
import { useNavigate } from 'react-router-dom';

export const Chat = () => {
  const [flyName, setFlyName] = React.useState('');
  const [flyInterests, setFlyInterests] = React.useState('');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    // Trigger animations after component mount
    setIsVisible(true);

    // Load saved interests from storage
    chrome.storage.local.get(['flyInterests'], (result) => {
      if (result.flyInterests) {
        setFlyInterests(result.flyInterests);
      }
    });
  }, []);

  const handleClick = () => {
    // Save to Chrome extension storage
    chrome.storage.local.set({
      flyInterests: flyInterests
    }, () => {
      console.log('Interests saved:', flyInterests);
      navigate('/default');
    });
  }

  return (
    <div className={`fly-container ${isVisible ? 'visible' : ''}`}>
      <div className="header">
        <div className="logo">
          {/* Add your logo component here */}
        </div>
        <h1>Welcome to <BlurText text="Fly" className="gradient-text" /></h1>
      </div>

      <div className="form-container">
        <div className="input-group">
          <label>What's the short name of your research?</label>
          <input
            type="text"
            value={flyName}
            onChange={(e) => setFlyName(e.target.value)}
            className="text-input"
            placeholder="Enter research name..."
          />
        </div>

        <div className="input-group">
          <label>What do you want to see?</label>
          <textarea
            value={flyInterests}
            onChange={(e) => setFlyInterests(e.target.value)}
            className="text-area"
            placeholder="Describe what content you're interested in..."
            rows={4}
          />
        </div>

        <button onClick={handleClick} className="create-button">
          <span>Finish</span>
        </button>
      </div>
    </div>
  )
}
