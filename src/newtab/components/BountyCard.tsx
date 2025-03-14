import { X, ArrowRight, Award, Clock, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

import { IDetailBounty } from '../Bounty';

interface BountyCardProps {
  bounty: IDetailBounty;
}

export const BountyCard: React.FC<BountyCardProps> = ({ bounty }) => {
  const calculateTimeLeft = () => {
    const difference =
      new Date(bounty.deadline).getTime() - new Date().getTime();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : "Expired";
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all cursor-pointer w-full"
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => { }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Status Badge */}
      <div className="flex justify-between items-center mb-4">
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"
        >
          OPEN
        </span>
        <span className="text-sm text-gray-500 flex items-center">
          <Clock className="w-4 h-4 mr-1" />
          {calculateTimeLeft()}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-3 line-clamp-2 text-gray-900">{bounty.title}</h3>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{bounty.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {bounty.tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700"
          >
            {tag}
          </span>
        ))}
        {bounty.tags.length > 3 && (
          <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
            +{bounty.tags.length - 3}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center text-blue-600 font-semibold">
          <DollarSign className="w-5 h-5 mr-1" />
          100 Aptos
        </div>
        <div className="flex items-center text-gray-500 text-sm">
          <Users className="w-4 h-4 mr-1" />
          32 participants
        </div>
      </div>
    </motion.div>
  );

};