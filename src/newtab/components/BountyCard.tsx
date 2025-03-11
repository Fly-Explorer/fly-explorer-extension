import { X, ArrowRight, Award, Clock, Users, DollarSign } from 'lucide-react';

import { IPost } from "../type";

interface BountyCardProps {
  postData: IPost;
  onClick: (postData: IPost) => void;
}

export const BountyCard: React.FC<BountyCardProps> = ({ postData, onClick }) => {
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