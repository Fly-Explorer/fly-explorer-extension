import React, { useState, useEffect } from 'react';

import { BountyType, IPost } from './type';
import { BountyCard } from './components/BountyCard';
import './Bounty.css';
import { useContract } from './hook/useContract';

export interface IBounty {
  bounty_id: string; // Unique identifier for the bounty
  cancelled: boolean; // Indicates if the bounty is cancelled
  creator: string; // Address of the bounty creator
  dataRef: string; // Reference to external data (IPFS hash or other)
  distributed: boolean; // Indicates if the reward has been distributed
  expiredAt: string; // Expiration time (in seconds or timestamp)
  minOfParticipants: string; // Minimum number of participants required
  participants: string[]; // List of participant addresses
  rewardAmount: string; // Total reward amount (in smallest denomination)
}

export interface IDetailBounty {
  title: string;
  description: string;
  requirements: string[];
  tags: string[];
  allPostData: {
    [key: string]: string[];
  };
  cid: string;
}

const BountyList: React.FC = () => {
  const [bounties, setBounties] = useState<IDetailBounty[]>([]);
  const [selectedBounty, setSelectedBounty] = useState<IDetailBounty | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState<IPost[]>([]);
  const { getAllBounties } = useContract();

  const fetchBounties = async () => {
    try {
      const data = await getAllBounties<IBounty[]>();

      // Use Promise.all to wait for all async operations
      const temp: IDetailBounty[] = await Promise.all(
        data.map(async (e) => {
          const da = await getPinataData(e.bounty_id);
          console.log(da)
          return da;
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

  const handleOpenModal = (postData: IPost) => {
    setSelectedBounty(postData);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  return (
    <div className="container page-container">
      <h1 className="text-3xl font-bold mb-2">Explore Bounties</h1>
      <p className="text-gray-600 mb-6">Discover and contribute to exciting projects</p>

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
          {bounties.map((bounty) => (
            <BountyCard
              key={bounty.description}
              bounty={bounty}
            // onClick={handleOpenModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BountyList;
