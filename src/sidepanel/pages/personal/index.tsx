import React, { useState, useEffect } from 'react'
import './index.css'
import { BlurText } from '../../components/BlurText';
import { useNavigate } from 'react-router-dom';

export const Chat = () => {
  const [flyName, setFlyName] = React.useState('');
  const [flyInterests, setFlyInterests] = React.useState('');
  const [suiAddress, setSuiAddress] = React.useState('');
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

    chrome.storage.local.get(['suiAddress'], (result) => {
      if (result.suiAddress) {
        setSuiAddress(result.suiAddress);
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

    chrome.storage.local.set({
      suiAddress: suiAddress
    }, () => {
      console.log('Sui address saved:', suiAddress);
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
        <div className="input-group animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <label className="input-label text-center">Sui Address</label>
          <input
            type="text"
            value={suiAddress}
            onChange={(e) => setSuiAddress(e.target.value)}
            className="text-input"
            placeholder="Enter sui address"
          />
        </div>

        {/* <div className="input-group animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <label className="input-label text-center">Interest Name</label>
          <input
            type="text"
            value={flyName}
            onChange={(e) => setFlyName(e.target.value)}
            className="text-input"
            placeholder="Enter research name..."
          />
        </div> */}

        <div className="input-group animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <label className="input-label text-center">Topics of Interest</label>
          <textarea
            value={flyInterests}
            onChange={(e) => setFlyInterests(e.target.value)}
            className="text-area"
            placeholder="Describe what content you're interested in..."
            rows={4}
          />
        </div>

        <button onClick={handleClick} className="create-button animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <span>Finish</span>
        </button>
      </div>
    </div>
  )
}
