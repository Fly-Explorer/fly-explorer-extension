export interface IPost {
  cid: string;
  title: string;
  description: string;
  requirements: string[];
  tags: string[];
  allPostData: {
    [key: string]: string[];
  };
}

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