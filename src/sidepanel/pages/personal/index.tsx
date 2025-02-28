import React, { useState, useEffect } from 'react'
import './index.css'
import { BlurText } from '../../components/BlurText';
import { useNavigate } from 'react-router-dom';

export const Chat = () => {
  const [flyName, setFlyName] = React.useState('');
  const [flyInterests, setFlyInterests] = React.useState('');
  const [movementAddress, setMovementAddress] = React.useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const predefinedTopics = ["Aptos", "Sui", "Movement"];
  
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

    chrome.storage.local.get(['movementAddress'], (result) => {
      if (result.movementAddress) {
        setMovementAddress(result.movementAddress);
      }
    });
    
    chrome.storage.local.get(['selectedTopics'], (result) => {
      if (result.selectedTopics) {
        setSelectedTopics(result.selectedTopics);
      }
    });
  }, []);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic) 
        : [...prev, topic]
    );
  };
  
  const handleAddCustomTopic = () => {
    if (customTopic.trim() !== '' && !selectedTopics.includes(customTopic.trim())) {
      setSelectedTopics(prev => [...prev, customTopic.trim()]);
      setCustomTopic('');
      setShowCustomInput(false);
    }
  };

  const handleClick = () => {
    // Save to Chrome extension storage
    chrome.storage.local.set({
      flyInterests: flyInterests
    }, () => {
      console.log('Interests saved:', flyInterests);
      navigate('/default');
    });

    chrome.storage.local.set({
      movementAddress: movementAddress
    }, () => {
      console.log('Movement address saved:', movementAddress);
    });
    
    chrome.storage.local.set({
      selectedTopics: selectedTopics
    }, () => {
      console.log('Selected topics saved:', selectedTopics);
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
        <div className="input-group animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <label className="input-label text-center">Movement Address</label>
          <input
            type="text"
            value={movementAddress}
            onChange={(e) => setMovementAddress(e.target.value)}
            className="text-input"
            placeholder="Enter movement address"
          />
        </div>

        <div className="input-group animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <label className="input-label text-center">Topics of Interest</label>
          <div className="topics-container">
            {predefinedTopics.map((topic) => (
              <div 
                key={topic}
                className={`topic-chip ${selectedTopics.includes(topic) ? 'selected' : ''}`}
                onClick={() => handleTopicToggle(topic)}
              >
                {topic}
              </div>
            ))}
            
            {selectedTopics
              .filter(topic => !predefinedTopics.includes(topic))
              .map((topic) => (
                <div 
                  key={topic}
                  className="topic-chip selected custom"
                  onClick={() => handleTopicToggle(topic)}
                >
                  {topic}
                  <span className="remove-topic" onClick={(e) => {
                    e.stopPropagation();
                    handleTopicToggle(topic);
                  }}>×</span>
                </div>
              ))}
              
            {!showCustomInput ? (
              <div 
                className="topic-chip add-new"
                onClick={() => setShowCustomInput(true)}
              >
                + Add Topic
              </div>
            ) : (
              <div className="custom-topic-input">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Enter new topic"
                  className="text-input custom-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCustomTopic();
                    if (e.key === 'Escape') {
                      setShowCustomInput(false);
                      setCustomTopic('');
                    }
                  }}
                  autoFocus
                />
                <div className="custom-topic-actions">
                  <button 
                    className="custom-topic-button add"
                    onClick={handleAddCustomTopic}
                  >
                    Add
                  </button>
                  <button 
                    className="custom-topic-button cancel"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomTopic('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <button onClick={handleClick} className="create-button animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <span>Finish</span>
        </button>
      </div>
    </div>
  )
}
