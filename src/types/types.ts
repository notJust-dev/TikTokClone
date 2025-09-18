export type User = {
  id: string;
  email: string;
  username: string;
};

export type Post = {
  id: string;
  video_url: string;
  description: string;
  user: User;
  nrOfLikes: { count: number }[];
  nrOfComments: { count: number }[];
  nrOfShares: { count: number }[];
};

export type PostInput = {
  video_url: string;
  description: string;
  user_id: string;
};

export type Comment = {
  id: string
  post_id: string
  user_id: string
  comment: string
  created_at: string
}

export type NewCommentInput = {
  post_id: string
  user_id: string
  comment: string
}