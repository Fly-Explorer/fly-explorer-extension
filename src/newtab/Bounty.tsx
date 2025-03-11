import React, { useState, useEffect } from 'react';

import { rewardServices } from '../sonic/sonic';
import { BountyType, IPost } from './type';
import { BountyCard } from './components/BountyCard';
import './Bounty.css';

const BountyList: React.FC = () => {
  const [bounties, setBounties] = useState<BountyType[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<IPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState<IPost[]>([]);

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const rewards = await rewardServices.findAll();
      const bountyPromises = await Promise.all(rewards
        .filter(item => item.bountyId.length > 40)
        .map(async item => ({
          ...(await getPinataData(item.bountyId)),
          cid: item.bountyId
        })));

      const finalBounties = bountyPromises.filter(item => !item.tags.includes('Aptos'))

      setPostData(finalBounties);
    } catch (error) {
      console.error("Error fetching bounties:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPinataData = async (cid: string): Promise<IPost> => {
    try {
      const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Data from IPFS:", data);
      return data as IPost;
    } catch (error) {
      console.error("IPFS Error:", error.message);
      throw error;
    }
  };

  const handleOpenModal = (postData: IPost) => {
    setSelectedBounty(postData);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  return (
    <div className="container page-container">
      <div className="header-container">
        <div>
          <h1>Bounties</h1>
          <p className="subtitle">Discover and contribute to exciting projects</p>
        </div>
      </div>

      {loading ? (
        <div className="grid-layout">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-layout">
          {postData.map((bounty) => (
            <BountyCard
              key={bounty.description}
              postData={bounty}
              onClick={handleOpenModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BountyList;
