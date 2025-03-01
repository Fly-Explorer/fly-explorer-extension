import React, { useState, useEffect } from 'react'
import './index.css'
import { BlurText } from '../../components/BlurText';
import { useNavigate } from 'react-router-dom';
import TopicSelector from '../../components/TopicSelector';
import MovementAddressInput from '../../components/MovementAddressInput';
import FinishButton from '../../components/FinishButton';
import useStorage from '../../hooks/useStorage';

export const Chat = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { value: selectedTopic, setValue: setSelectedTopic } = useStorage<string>('selectedTopic', '');
  const { value: movementAddress, setValue: setMovementAddress } = useStorage<string>('movementAddress', '');
  const { value: flyInterests, setValue: setFlyInterests } = useStorage<string>('flyInterests', '');
  const [dropdownHeight, setDropdownHeight] = useState(0);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Trigger animations after component mount
    setIsVisible(true);
  }, []);

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleAddressChange = (address: string) => {
    setMovementAddress(address);
  };

  const handleFinish = () => {
    // Save to Chrome extension storage
    chrome.storage.local.set({
      flyInterests: flyInterests
    }, () => {
      console.log('Interests saved:', flyInterests);
    });

    chrome.storage.local.set({
      movementAddress: movementAddress
    }, () => {
      console.log('Movement address saved:', movementAddress);
    });
    
    chrome.storage.local.set({
      selectedTopic: selectedTopic
    }, () => {
      console.log('Selected topic saved:', selectedTopic);
      navigate('/default');
    });
    navigate('/default');
  };

  // Callback function to get dropdown height from TopicSelector
  const handleDropdownHeightChange = (height: number) => {
    setDropdownHeight(height);
  };

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
          <MovementAddressInput 
            value={movementAddress} 
            onChange={handleAddressChange} 
          />
        </div>

        <div className="input-group animate-slide-up" style={{ animationDelay: '0.4s', position: 'relative' }}>
          <label className="input-label text-center">Topic of Interest</label>
          <TopicSelector 
            selectedTopic={selectedTopic} 
            onTopicChange={handleTopicChange}
            onDropdownHeightChange={handleDropdownHeightChange}
          />
        </div>

        <FinishButton 
          onClick={handleFinish} 
          disabled={!selectedTopic || !movementAddress}
          spacerHeight={dropdownHeight}
        />
      </div>
    </div>
  )
}
