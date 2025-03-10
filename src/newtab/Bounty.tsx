import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Award, Clock, Users, DollarSign, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
// import BountySubmissionForm, { BountyFormData } from './bounty-submission-form';
import { rewardServices } from './sonic';
import { pinata } from './pinata';
import { IPost } from './type';
import './Bounty.css';

// Định nghĩa kiểu dữ liệu cho Bounty
export interface BountyType {
  id: string;
  title: string;
  description: string;
  reward: number;
  deadline: string;
  participants: number;
  status: 'open' | 'closed' | 'in-progress';
  tags: string[];
  createdBy: string;
  requirements: string[];
  submissionLink?: string;
}

interface BountyCardProps {
  postData: IPost;
  onClick: (postData: IPost) => void;
}

interface BountyModalProps {
  // bounty: BountyType | null;
  isOpen: boolean;
  onClose: () => void;
  postData: IPost;
}

// Component Card hiển thị thông tin ngắn gọn của Bounty
const BountyCard: React.FC<BountyCardProps> = ({ postData, onClick }) => {
  // Tính toán thời gian còn lại
  // const calculateTimeLeft = () => {
  //   const difference = new Date(bounty.deadline).getTime() - new Date().getTime();
  //   const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  //   return days > 0 ? `${days} days left` : 'Expired';
  // };
  const calculateTimeLeft = () => {
    const oneWeek = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    const deadline = new Date(Date.now() + oneWeek).getTime();
    const difference = deadline - new Date().getTime();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  };
  return (
    <div className="bounty-card" onClick={() => onClick(postData)}>
      <div className="card-header">
        <span className={`status-badge status-open`}>open</span>
        <span className="expired-tag">
          <Clock className="w-4 h-4 mr-1" />
          {calculateTimeLeft()}
        </span>
      </div>

      <h3 className="card-title">{postData.title}</h3>
      <p className="card-description">{postData.description}</p>

      <div className="tags-container">
        {postData.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
        {postData.tags.length > 3 && (
          <span className="tag">+{postData.tags.length - 3}</span>
        )}
      </div>

      <div className="card-footer">
        <div className="reward">
          <DollarSign className="w-5 h-5 mr-1" />
          1000 USDC
        </div>
        <div className="participants">
          <Users className="w-4 h-4 mr-1" />
          47 participants
        </div>
      </div>
    </div>
  );
};

// Component Modal hiển thị thông tin chi tiết của Bounty
const BountyModal: React.FC<BountyModalProps> = ({ postData, isOpen, onClose }) => {
  if (!postData) return null;

  // Animation variants
  const modalVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 500
      }
    },
    exit: { y: '100%', opacity: 0 }
  };

  // Border animation
  const borderVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-end justify-center">
          <motion.div
            className="relative bg-white rounded-t-3xl w-full max-w-4xl mx-4 mt-[200px] shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Animated Border */}
            <div className="absolute -top-1 left-0 w-full h-full pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  d="M0,0 L100,0 L100,100 L0,100 L0,0"
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.5)"
                  strokeWidth="0.5"
                  variants={borderVariants}
                  initial="hidden"
                  animate="visible"
                />
              </svg>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${'bg-green-100 text-green-800'
                    }`}>
                    "open"
                  </span>
                  {/* <span className="text-sm text-gray-500">
                    Created by {postData.}
                  </span> */}
                </div>
                <h2 className="text-3xl font-bold">{postData.title}</h2>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  {/* Description */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">{postData.description}</p>
                  </div>

                  {/* Requirements */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      {postData.requirements.map((req, index) => (
                        <li key={index} className="text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Tags */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {postData.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Reward */}
                  <div className="bg-blue-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-blue-600" />
                      Reward
                    </h3>
                    <p className="text-3xl font-bold text-blue-600">
                      1000 USDC
                    </p>
                  </div>

                  {/* Deadline */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-600" />
                      Deadline
                    </h3>
                    <p className="text-lg font-medium">
                      {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Participants */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-gray-600" />
                      Participants
                    </h3>
                    <p className="text-lg font-medium">47</p>
                  </div>

                  {/* Apply Button */}
                  {(
                    <Link
                      to={`/app/bounty/submit/${postData.cid}`}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
                    >
                      Apply for Bounty
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Component chính quản lý danh sách Bounty
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

      const bountyData = await Promise.all(finalBounties);
      setPostData(finalBounties);
    } catch (error) {
      console.error("Error fetching bounties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);
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

  // Giả lập dữ liệu
  useEffect(() => {
    // Trong thực tế, bạn sẽ gọi API để lấy dữ liệu
    // const mockBounties: BountyType[] = [
    //   {
    //     id: '1',
    //     title: 'Develop a Smart Contract for Decentralized Voting',
    //     description: 'We are looking for a developer to create a secure and efficient smart contract for decentralized voting. The contract should allow users to create proposals, vote on them, and automatically execute the winning proposal.',
    //     reward: 5000,
    //     deadline: '2024-12-31',
    //     participants: 12,
    //     status: 'open',
    //     tags: ['Smart Contract', 'Solidity', 'Voting', 'Blockchain'],
    //     createdBy: 'FlyExplorer Team',
    //     requirements: [
    //       'Experience with Solidity and EVM',
    //       'Knowledge of secure smart contract development practices',
    //       'Ability to write clean, well-documented code',
    //       'Experience with testing frameworks like Hardhat or Truffle'
    //     ],
    //     submissionLink: '/submit/1'
    //   },
    //   {
    //     id: '2',
    //     title: 'Design a User Interface for DeFi Dashboard',
    //     description: 'We need a modern, intuitive UI design for our DeFi dashboard. The design should be clean, user-friendly, and optimized for both desktop and mobile devices.',
    //     reward: 3000,
    //     deadline: '2024-11-15',
    //     participants: 8,
    //     status: 'in-progress',
    //     tags: ['UI/UX', 'Design', 'DeFi', 'Dashboard'],
    //     createdBy: 'FlyExplorer Team',
    //     requirements: [
    //       'Experience with UI/UX design for web applications',
    //       'Knowledge of DeFi concepts and user needs',
    //       'Ability to create responsive designs',
    //       'Proficiency with design tools like Figma or Adobe XD'
    //     ]
    //   },
    //   {
    //     id: '3',
    //     title: 'Implement Zero-Knowledge Proof for Privacy-Preserving Transactions',
    //     description: 'Develop a zero-knowledge proof system that allows users to conduct private transactions on our platform while maintaining the security and integrity of the blockchain.',
    //     reward: 8000,
    //     deadline: '2025-01-20',
    //     participants: 5,
    //     status: 'open',
    //     tags: ['ZK-Proofs', 'Privacy', 'Cryptography', 'Blockchain'],
    //     createdBy: 'FlyExplorer Team',
    //     requirements: [
    //       'Strong background in cryptography and zero-knowledge proofs',
    //       'Experience implementing privacy-preserving protocols',
    //       'Knowledge of blockchain technology and smart contracts',
    //       'Ability to optimize for gas efficiency'
    //     ],
    //     submissionLink: '/submit/3'
    //   },
    //   {
    //     id: '4',
    //     title: 'Create Documentation for API Integration',
    //     description: 'We need comprehensive documentation for our API to help developers integrate with our platform. The documentation should include examples, tutorials, and best practices.',
    //     reward: 1500,
    //     deadline: '2024-10-30',
    //     participants: 3,
    //     status: 'closed',
    //     tags: ['Documentation', 'API', 'Technical Writing'],
    //     createdBy: 'FlyExplorer Team',
    //     requirements: [
    //       'Experience with technical writing and documentation',
    //       'Understanding of API concepts and integration patterns',
    //       'Ability to explain complex concepts in simple terms',
    //       'Knowledge of documentation tools and formats'
    //     ]
    //   }
    // ];

    // setTimeout(() => {
    //   setBounties(mockBounties);
    //   setLoading(false);
    // }, 1000); // Giả lập thời gian tải
  }, []);

  const handleOpenModal = (postData: IPost) => {
    setSelectedBounty(postData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

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
