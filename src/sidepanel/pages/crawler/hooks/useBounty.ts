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

  const getPinataData = async (cid: string): Promise<any> => {
    try {
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Data from IPFS:", data);
      return data;
    } catch (error) {
      console.error("IPFS Error:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    const fetchBounties = async () => {
      setLoadingBounties(true)
      try {
        const rewards = await rewardServices.findAll()
        const bounties = await Promise.all(rewards.filter(item => item.bountyId.length > 40).map(async item => ({
          ...(await getPinataData(item.bountyId)),
          cid: item.bountyId
        }
        ))
        );
        const finalBounties = bounties.filter(item => !item.tags.includes('Aptos'))
        console.log('🚀 ~ fetchBounties ~ bounties:', finalBounties)
        setBounties(finalBounties as Bounty[])
        setLoadingBounties(false)
      } catch (error) {
        console.error('Error fetching bounties:', error)
        showToast.error('Not find bounties')
        setLoadingBounties(false)
      }
    }

    fetchBounties()
  }, [])

  useEffect(() => {
    chrome.storage.local.get('selectedBounty').then((result) => {
      setSelectedBounty(result.selectedBounty || null);
    });
  }, []);

  const handleSetSelectedBounty = (bountyId: string | null) => {
    setSelectedBounty(bountyId);
    chrome.storage.local.set({ selectedBounty: bountyId });
  };

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
    setSelectedBounty: handleSetSelectedBounty,
    handleSubmitBounty,
    setActiveTab,
  }
}
