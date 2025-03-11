import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, Award, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { IPost } from "../type";

interface BountyModalProps {
  // bounty: BountyType | null;
  isOpen: boolean;
  onClose: () => void;
  postData: IPost;
}

export const BountyModal: React.FC<BountyModalProps> = ({ postData, isOpen, onClose }) => {
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