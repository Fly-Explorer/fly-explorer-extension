import { useState, useEffect } from 'react'
import showToast from '../../../../utils/toast'
import { useDataStore } from '../store/useDataStore'
import { useTabStore } from '../store/useTabStore'
import { useUpload } from './useUpload'
import { IBounty, IDetailBounty } from '../../../../newtab/Bounty'
import { useContract } from '../../../../newtab/hook/useContract'

export const useBounty = () => {
  const [bounties, setBounties] = useState<IDetailBounty[]>([])
  const [selectedBounty, setSelectedBounty] = useState<string | null>(null)
  const [loadingBounties, setLoadingBounties] = useState<boolean>(false)
  const [submittingBounty, setSubmittingBounty] = useState<boolean>(false)

  const { activeTab, setActiveTab } = useTabStore()
  const { selectedData, clearItems } = useDataStore()
  const { groupState, handleUploadBounty } = useUpload()
  const [loading, setLoading] = useState<boolean>(false)

  const { getAllBounties } = useContract();

  const fetchBounties = async () => {
    try {
      const data = await getAllBounties<IBounty[]>();

      // Use Promise.all to wait for all async operations
      const temp: IDetailBounty[] = await Promise.all(
        data.map(async (e) => {
          const da = await getPinataData(e.bounty_id);
          console.log(da)
          return {
            ...da,
            cid: e.bounty_id,
          };
        })
      );

      setBounties(temp);
    } catch (error) {
      console.error("Error fetching bounties:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPinataData = async (cid: string): Promise<IDetailBounty> => {
    try {
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Data from IPFS:", data);
      return data as IDetailBounty;
    } catch (error) {
      console.error("IPFS Error:", error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchBounties()
  }, [])

  useEffect(() => {
    chrome.storage.local.get('selectedBounty').then((result) => {
      setSelectedBounty(result.selectedBounty || null);
    });
  }, []);

  const handleSetSelectedBounty = (bountyId: string | null) => {
    console.log('🚀 ~ handleSetSelectedBounty ~ bountyId:', bountyId)
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
