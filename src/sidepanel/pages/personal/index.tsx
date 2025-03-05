import React, { useState, useEffect } from 'react'
import './index.css'
import { BlurText } from '../../components/BlurText'
import { useNavigate } from 'react-router-dom'
import TopicSelector from '../../components/TopicSelector'
import AddressInput from '../../components/AddressInput'
import FinishButton from '../../components/FinishButton'
import useStorage from '../../hooks/useStorage'
import { showToast } from '../../../utils/toast'

export const Chat = () => {
  const [isVisible, setIsVisible] = useState(true)
  const { value: selectedTopic, setValue: setSelectedTopic } = useStorage<string>(
    'selectedTopic',
    '',
  )
  const { value: address, setValue: setAddress } = useStorage<string>('address', '')
  const { value: flyInterests, setValue: setFlyInterests } = useStorage<string>('flyInterests', '')
  const [dropdownHeight, setDropdownHeight] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    // Trigger animations after component mount
    if (address && selectedTopic) {
      setIsVisible(false)
      console.log('🚀 ~ useEffect ~ setIsVisible:', setIsVisible)
    }
  }, [])

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic)
  }

  const handleAddressChange = (address: string) => {
    setAddress(address)
  }

  const handleFinish = () => {
    // Save to Chrome extension storage
    if (String(address).length > 0 && String(selectedTopic).length > 0) {
      navigate('/default')
      return
    }
    showToast.error('Please fill in all fields')
  }

  // Callback function to get dropdown height from TopicSelector
  const handleDropdownHeightChange = (height: number) => {
    setDropdownHeight(height)
  }

  return (
    <div className={`fly-container ${isVisible ? 'visible' : ''}`}>
      <div className="header">
        <div className="logo">{/* Add your logo component here */}</div>
        <h1>
          Welcome to <BlurText text="Fly" className="gradient-text" />
        </h1>
      </div>

      <div className="form-container">
        <div className="input-group animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <label className="input-label text-center">Address</label>
          <AddressInput value={address} onChange={handleAddressChange} />
        </div>

        <div
          className="input-group animate-slide-up"
          style={{ animationDelay: '0.4s', position: 'relative' }}
        >
          <label className="input-label text-center">Topic of Interest</label>
          <TopicSelector
            selectedTopic={selectedTopic}
            onTopicChange={handleTopicChange}
            onDropdownHeightChange={handleDropdownHeightChange}
          />
        </div>

        <FinishButton onClick={handleFinish} disabled={!isVisible} spacerHeight={dropdownHeight} />
      </div>
    </div>
  )
}
