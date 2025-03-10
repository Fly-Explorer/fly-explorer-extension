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
