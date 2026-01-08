
export enum PageView {
  HOME = 'HOME',
  BEGINNERS = 'BEGINNERS',
  IDEA_UNIVERSE = 'IDEA_UNIVERSE',
  IDEA_DETAIL = 'IDEA_DETAIL',
  BOUNTY_HUNTERS = 'BOUNTY_HUNTERS',
  CHAT = 'CHAT',
  FEATURED = 'FEATURED',
  PROMPT_VINYLS = 'PROMPT_VINYLS'
}

export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  role: 'Viber' | 'Admin' | 'Guest';
  bio?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
  isBot?: boolean;
}

export interface ChatChannel {
    id: string;
    name: string;
    type: 'public' | 'group' | 'dm' | 'ai';
    description?: string;
    unreadCount?: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  replies?: Comment[];
}

export interface Idea {
  id: string;
  title: string;
  author: string;
  collaborators: string[]; // List of collaborator names
  description: string;
  tags: string[];
  likes: number;
  commentsCount?: number; // 评论总数(从数据库获取)
  hasPrototype: boolean;
  demoUrl?: string;
  status: 'concept' | 'in-progress' | 'live';
  comments: Comment[];
}

export interface Bounty {
  id: string;
  title: string;
  type: 'Coding' | 'Marketing' | 'Design' | 'Coffee Chat';
  reward: string;
  requester: string;
  description: string;
}

export interface Tutorial {
  id: string;
  title: string;
  level: 'Novice' | 'Apprentice' | 'Viber';
  duration: string;
  description: string;
  imageUrl: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  image: string;
  url: string;
  author: string;
}

export interface Vinyl {
  id: string;
  title: string;
  artist: string;
  mood: string; // e.g., "Aggressive", "Chill", "Focus"
  bpm: number; // Metaphor for complexity/token count
  genre: 'Frontend' | 'Backend' | 'Architecture' | 'Creative';
  promptContent: string;
  price: string;
  coverColor: string;
}
