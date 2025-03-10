import { useState, useEffect } from 'react'
import showToast from '../../../../utils/toast'
import { useDataStore } from '../store/useDataStore'
import { useTabStore } from '../store/useTabStore'
import { Bounty, rewardServices } from '../../../../sonic/sonic'
import { useUpload } from './useUpload'

export const useBounty = () => {
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [selectedBounty, setSelectedBounty] = useState<string | null>(null)
  const [loadingBounties, setLoadingBounties] = useState<boolean>(false)
  const [submittingBounty, setSubmittingBounty] = useState<boolean>(false)

  const { activeTab, setActiveTab } = useTabStore()
  const { selectedData, clearItems } = useDataStore()
  const { groupState, handleUploadBounty } = useUpload()

  useEffect(() => {
    const fetchBounties = async () => {
      setLoadingBounties(true)
      try {
        const bounties = await rewardServices.findAll()
        console.log('🚀 ~ fetchBounties ~ bounties:', bounties)
        setBounties(bounties as Bounty[])
        setLoadingBounties(false)
      } catch (error) {
        console.error('Error fetching bounties:', error)
        showToast.error('Not find bounties')
        setLoadingBounties(false)
      }
    }

    fetchBounties()
  }, [])

  const handleSubmitBounty = async () => {
    if (!selectedData.length) {
      showToast.warning('Please select at least one item to submit')
      return
    }

    if (!selectedBounty) {
      showToast.warning('Please select a bounty to submit')
      return
    }

    setSubmittingBounty(true)

    console.log('🚀 ~ handleSubmitBounty ~ groupState:', groupState)

    try {
      await handleUploadBounty();
      setSubmittingBounty(false)
      clearItems()
      setSelectedBounty(null)
    } catch (error) {
      console.error('Error submitting to bounty:', error)
      showToast.error('Submit data to bounty failed!')
      setSubmittingBounty(false)
    }
  }

  return {
    bounties,
    selectedBounty,
    loadingBounties,
    submittingBounty,
    activeTab,
    setSelectedBounty,
    handleSubmitBounty,
    setActiveTab,
  }
}
