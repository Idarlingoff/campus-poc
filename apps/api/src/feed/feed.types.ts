export type FeedFilter = 'following' | 'my_campus' | 'all_campuses' | 'public';

export type FeedResponse = {
  institutionalNews: Array<{
    id: string;
    title: string;
    summary: string | null;
    imageUrl: string | null;
    category: string | null;
    publishedAt: string;
    isImportant: boolean;
  }>;
  memberPosts: Array<{
    id: string;
    author: {
      id: string;
      displayName: string;
      avatarUrl: string | null;
      isFollowed: boolean;
    };
    content: string;
    imageUrl: string | null;
    likesCount: number;
    commentsCount: number;
    publishedAt: string;
    isLiked: boolean;
  }>;
  cityNews: Array<{
    id: string;
    title: string;
    summary: string | null;
    source: string | null;
    city: string;
    publishedAt: string;
    category: string | null;
    imageUrl: string | null;
    url: string | null;
  }>;
};
